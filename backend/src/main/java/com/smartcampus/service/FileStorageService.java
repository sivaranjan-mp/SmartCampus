package com.smartcampus.service;

import com.smartcampus.dto.booking.FileUploadResponse;
import com.smartcampus.exception.SmartCampusException;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageService {

    @Value("${app.upload.base-dir:uploads}")
    private String baseUploadDir;

    @Value("${app.upload.max-file-size-mb:10}")
    private int maxFileSizeMb;

    private static final List<String> ALLOWED_TYPES = Arrays.asList(
            "application/pdf",
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
            ".pdf", ".jpg", ".jpeg", ".png", ".webp", ".doc", ".docx"
    );

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(Paths.get(baseUploadDir, "temp"));
            Files.createDirectories(Paths.get(baseUploadDir, "bookings"));
            log.info("Upload directories initialized at: {}", Paths.get(baseUploadDir).toAbsolutePath());
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize upload directories", e);
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    //  Upload to temp area (before booking is confirmed)
    // ─────────────────────────────────────────────────────────────────────

    public FileUploadResponse uploadTemp(MultipartFile file) {
        validateFile(file);

        String original  = StringUtils.cleanPath(file.getOriginalFilename());
        String ext       = getExtension(original);
        String stored    = UUID.randomUUID().toString() + ext;
        Path   targetDir = Paths.get(baseUploadDir, "temp");
        Path   target    = targetDir.resolve(stored);

        try (InputStream in = file.getInputStream()) {
            Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            log.info("Temp upload: {} → {}", original, stored);
        } catch (IOException e) {
            throw new SmartCampusException.BadRequestException("Failed to store file: " + e.getMessage());
        }

        return FileUploadResponse.builder()
                .fileId(stored)
                .originalFileName(original)
                .contentType(file.getContentType())
                .fileSizeBytes(file.getSize())
                .message("File uploaded successfully")
                .build();
    }

    // ─────────────────────────────────────────────────────────────────────
    //  Promote from temp to booking-specific folder
    // ─────────────────────────────────────────────────────────────────────

    public Path promoteToBooking(String tempFileId, Long bookingId) {
        if (tempFileId == null || tempFileId.isBlank()) return null;

        Path src     = Paths.get(baseUploadDir, "temp", tempFileId);
        Path destDir = Paths.get(baseUploadDir, "bookings", bookingId.toString());

        try {
            Files.createDirectories(destDir);
            Path dest = destDir.resolve(tempFileId);
            if (Files.exists(src)) {
                Files.move(src, dest, StandardCopyOption.REPLACE_EXISTING);
                return dest;
            }
        } catch (IOException e) {
            log.error("Failed to promote temp file {} for booking {}: {}", tempFileId, bookingId, e.getMessage());
        }
        return null;
    }

    // ─────────────────────────────────────────────────────────────────────
    //  Read file bytes for download
    // ─────────────────────────────────────────────────────────────────────

    public byte[] loadFile(Long bookingId, String storedFileName) {
        Path file = Paths.get(baseUploadDir, "bookings", bookingId.toString(), storedFileName);
        try {
            return Files.readAllBytes(file);
        } catch (IOException e) {
            throw new SmartCampusException.NotFoundException("File not found: " + storedFileName);
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    //  Delete booking folder
    // ─────────────────────────────────────────────────────────────────────

    public void deleteBookingFiles(Long bookingId) {
        Path dir = Paths.get(baseUploadDir, "bookings", bookingId.toString());
        try {
            if (Files.exists(dir)) {
                Files.walk(dir)
                        .sorted(java.util.Comparator.reverseOrder())
                        .map(Path::toFile)
                        .forEach(java.io.File::delete);
                log.info("Deleted booking files for bookingId={}", bookingId);
            }
        } catch (IOException e) {
            log.warn("Could not delete files for booking {}: {}", bookingId, e.getMessage());
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    //  Helpers
    // ─────────────────────────────────────────────────────────────────────

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty())
            throw new SmartCampusException.BadRequestException("No file provided.");

        long maxBytes = (long) maxFileSizeMb * 1024 * 1024;
        if (file.getSize() > maxBytes)
            throw new SmartCampusException.BadRequestException(
                    "File exceeds maximum size of " + maxFileSizeMb + " MB.");

        String contentType = file.getContentType();
        String ext = getExtension(StringUtils.cleanPath(
                file.getOriginalFilename() != null ? file.getOriginalFilename() : ""));

        boolean validType = (contentType != null && ALLOWED_TYPES.contains(contentType.toLowerCase()))
                || ALLOWED_EXTENSIONS.stream().anyMatch(e -> e.equalsIgnoreCase(ext));

        if (!validType)
            throw new SmartCampusException.BadRequestException(
                    "File type not allowed. Accepted: PDF, JPG, PNG, WEBP, DOC, DOCX.");
    }

    private String getExtension(String filename) {
        int dot = filename.lastIndexOf('.');
        return (dot >= 0) ? filename.substring(dot).toLowerCase() : "";
    }

    public String getOriginalExtension(String filename) {
        return getExtension(filename);
    }
}
