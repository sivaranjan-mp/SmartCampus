package com.smartcampus.controller;

import com.smartcampus.dto.booking.*;
import com.smartcampus.dto.common.ApiResponse;
import com.smartcampus.model.enums.BookingStatus;
import com.smartcampus.service.BookingService;
import com.smartcampus.service.FileStorageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService     bookingService;
    private final FileStorageService fileStorageService;

    /* ── File upload ────────────────────────────────────────────────────── */

    @PostMapping("/upload")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<FileUploadResponse>> uploadDocument(
            @RequestParam("file") MultipartFile file) {

        FileUploadResponse response = fileStorageService.uploadTemp(file);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("File uploaded. Use the fileId when submitting your booking.", response));
    }

    /* ── Check availability ─────────────────────────────────────────────── */

    @GetMapping("/availability")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<AvailabilityResponse>> checkAvailability(
            @RequestParam Long       resourceId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        return ResponseEntity.ok(ApiResponse.success(
                "Availability checked.", bookingService.checkAvailability(resourceId, date)));
    }

    /* ── Create booking ─────────────────────────────────────────────────── */

    @PostMapping
    @PreAuthorize("hasAnyRole('STUDENT','FACULTY','HOD','ADMIN')")
    public ResponseEntity<ApiResponse<BookingResponse>> create(
            @Valid @RequestBody BookingRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        BookingResponse booking = bookingService.create(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Booking submitted successfully.", booking));
    }

    /* ── My bookings ────────────────────────────────────────────────────── */

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Page<BookingListItem>>> myBookings(
            @RequestParam(required = false)  BookingStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.ok(ApiResponse.success(
                "Bookings fetched.",
                bookingService.getMyBookings(userDetails.getUsername(), status, page, size)));
    }

    /* ── Get single booking ─────────────────────────────────────────────── */

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<BookingResponse>> getById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.ok(ApiResponse.success(
                "Booking fetched.", bookingService.getById(id, userDetails.getUsername())));
    }

    /* ── Cancel ─────────────────────────────────────────────────────────── */

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<BookingResponse>> cancel(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {

        String reason = body.getOrDefault("reason", "Cancelled by requester");
        return ResponseEntity.ok(ApiResponse.success(
                "Booking cancelled.", bookingService.cancel(id, reason, userDetails.getUsername())));
    }

    /* ── Download document ──────────────────────────────────────────────── */

    @GetMapping("/{bookingId}/documents/{documentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> downloadDocument(
            @PathVariable Long bookingId,
            @PathVariable Long documentId,
            @AuthenticationPrincipal UserDetails userDetails) {

        byte[] bytes = bookingService.downloadDocument(bookingId, documentId, userDetails.getUsername());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"document\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(bytes);
    }
}
