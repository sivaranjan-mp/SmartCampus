package com.smartcampus.service;

import com.smartcampus.dto.booking.*;
import com.smartcampus.exception.SmartCampusException;
import com.smartcampus.model.*;
import com.smartcampus.model.enums.*;
import com.smartcampus.repository.*;
import com.smartcampus.event.BookingCreatedEvent;
import com.smartcampus.util.BookingReferenceGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.Path;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final BookingRepository         bookingRepository;
    private final BookingDocumentRepository documentRepository;
    private final ResourceRepository        resourceRepository;
    private final UserRepository            userRepository;
    private final FileStorageService        fileStorageService;
    private final BookingReferenceGenerator   referenceGenerator;
    private final ApplicationEventPublisher    eventPublisher;

    @Value("${app.api-base-url:http://localhost:8080/api}")
    private String apiBaseUrl;

    // ─────────────────────────────────────────────────────────────────────
    //  Check availability
    // ─────────────────────────────────────────────────────────────────────

    public AvailabilityResponse checkAvailability(Long resourceId, LocalDate date) {
        Resource resource = findResourceOrThrow(resourceId);

        List<AvailabilityResponse.TimeSlot> slots = bookingRepository
                .findBookedSlots(resourceId, date)
                .stream()
                .map(b -> AvailabilityResponse.TimeSlot.builder()
                        .startTime(b.getStartTime())
                        .endTime(b.getEndTime())
                        .bookingReference(b.getBookingReference())
                        .status(b.getStatus().name())
                        .build())
                .toList();

        LocalDate earliest = LocalDate.now().plusDays(resource.getMinAdvanceDays()
                + resource.getBufferDaysAfter());

        boolean resourceAvailable = resource.getIsActive() && !resource.getIsUnderMaintenance();
        String unavailableReason  = null;

        if (!resource.getIsActive())            unavailableReason = "Resource is inactive.";
        else if (resource.getIsUnderMaintenance()) unavailableReason = "Resource is under maintenance.";
        else if (date.isBefore(earliest))       unavailableReason = "Date is before the earliest bookable date (" + earliest + ").";

        return AvailabilityResponse.builder()
                .resourceId(resourceId)
                .resourceName(resource.getName())
                .date(date)
                .available(resourceAvailable && unavailableReason == null)
                .unavailableReason(unavailableReason)
                .bookedSlots(slots)
                .earliestBookableDate(earliest)
                .build();
    }

    // ─────────────────────────────────────────────────────────────────────
    //  Create booking
    // ─────────────────────────────────────────────────────────────────────

    @Transactional
    public BookingResponse create(BookingRequest req, String organizerEmail) {
        User organizer = findUserOrThrow(organizerEmail);
        Resource resource = findResourceOrThrow(req.getResourceId());

        validateBookingRequest(req, resource, organizer, null);

        // Determine initial status and priority based on organizer role + resource approval authority
        BookingStatus initialStatus = resolveInitialStatus(resource, organizer);
        String        priority      = organizer.getRole() == Role.STUDENT ? "NORMAL" : "HIGH";

        Booking booking = Booking.builder()
                .bookingReference(referenceGenerator.generate())
                .resource(resource)
                .bookedBy(organizer)
                .department(null)
                .eventName(req.getEventName().trim())
                .eventDomain(req.getEventDomain())
                .participantsCount(req.getParticipantsCount())
                .remarks(req.getRemarks())
                .bookingDate(req.getBookingDate())
                .startTime(req.getStartTime())
                .endTime(req.getEndTime())
                .status(initialStatus)
                .priority(priority)
                .build();

        bookingRepository.save(booking);

        // Objectives
        List<BookingObjective> objectives = new ArrayList<>();
        for (int i = 0; i < req.getObjectives().size(); i++) {
            objectives.add(BookingObjective.builder()
                    .booking(booking).sequenceNumber(i + 1)
                    .description(req.getObjectives().get(i).getDescription().trim())
                    .build());
        }
        booking.setObjectives(objectives);

        // Outcomes
        List<BookingOutcome> outcomes = new ArrayList<>();
        for (int i = 0; i < req.getOutcomes().size(); i++) {
            outcomes.add(BookingOutcome.builder()
                    .booking(booking).sequenceNumber(i + 1)
                    .description(req.getOutcomes().get(i).getDescription().trim())
                    .build());
        }
        booking.setOutcomes(outcomes);

        // Coordinators
        List<BookingCoordinator> coordinators = new ArrayList<>();
        for (BookingRequest.CoordinatorEntry c : req.getCoordinators()) {
            User linked = (c.getUserId() != null)
                    ? userRepository.findById(c.getUserId()).orElse(null) : null;
            coordinators.add(BookingCoordinator.builder()
                    .booking(booking).user(linked)
                    .name(c.getName().trim()).email(c.getEmail().trim().toLowerCase())
                    .registerNumber(c.getRegisterNumber()).department(c.getDepartment())
                    .yearOfStudy(c.getYearOfStudy()).phoneNumber(c.getPhoneNumber())
                    .build());
        }
        booking.setCoordinators(coordinators);

        // Supporting faculty
        List<BookingFacultySupport> faculty = new ArrayList<>();
        for (BookingRequest.FacultyEntry f : req.getSupportingFaculty()) {
            User linked = (f.getUserId() != null)
                    ? userRepository.findById(f.getUserId()).orElse(null) : null;
            faculty.add(BookingFacultySupport.builder()
                    .booking(booking).user(linked)
                    .name(f.getName().trim()).email(f.getEmail().trim().toLowerCase())
                    .department(f.getDepartment()).phoneNumber(f.getPhoneNumber())
                    .build());
        }
        booking.setFacultySupports(faculty);

        // Documents: promote temp files to booking folder
        List<BookingDocument> documents = new ArrayList<>();
        promoteDocument(booking, req.getPermissionLetterFileId(),      DocumentType.PERMISSION_LETTER,       documents);
        promoteDocument(booking, req.getFacultySupportLetterFileId(),   DocumentType.FACULTY_SUPPORT_LETTER,  documents);
        promoteDocument(booking, req.getPosterFileId(),                 DocumentType.POSTER,                  documents);
        booking.setDocuments(documents);

        Booking saved = bookingRepository.save(booking);
        log.info("Booking created: {} [{}] by {} | status={}",
                saved.getBookingReference(), saved.getEventName(), organizerEmail, saved.getStatus());

        // Notify listeners (after commit) to create approval record(s) and dispatch
        // approver notifications. Without this, bookings requiring HOD/Admin sign-off
        // would never get an associated BookingApproval row and would sit unreviewable.
        eventPublisher.publishEvent(new BookingCreatedEvent(this, saved));

        return BookingResponse.from(saved, apiBaseUrl);
    }

    // ─────────────────────────────────────────────────────────────────────
    //  Get one (with ownership check)
    // ─────────────────────────────────────────────────────────────────────

    public BookingResponse getById(Long id, String requesterEmail) {
        Booking booking = findBookingOrThrow(id);
        User    requester = findUserOrThrow(requesterEmail);

        // Students and faculty can only see their own bookings
        if (requester.getRole() == Role.STUDENT || requester.getRole() == Role.FACULTY) {
            if (!booking.getBookedBy().getId().equals(requester.getId())) {
                throw new SmartCampusException.ForbiddenException(
                        "You are not authorised to view this booking.");
            }
        }
        return BookingResponse.from(booking, apiBaseUrl);
    }

    // ─────────────────────────────────────────────────────────────────────
    //  My bookings
    // ─────────────────────────────────────────────────────────────────────

    public Page<BookingListItem> getMyBookings(
            String email, BookingStatus status, int page, int size) {
        User user    = findUserOrThrow(email);
        Pageable pg  = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return bookingRepository.findByUserId(user.getId(), status, pg)
                .map(BookingListItem::from);
    }

    // ─────────────────────────────────────────────────────────────────────
    //  Cancel
    // ─────────────────────────────────────────────────────────────────────

    @Transactional
    public BookingResponse cancel(Long id, String reason, String requesterEmail) {
        Booking booking  = findBookingOrThrow(id);
        User    requester = findUserOrThrow(requesterEmail);

        if (!booking.getBookedBy().getId().equals(requester.getId())
                && requester.getRole() != Role.ADMIN) {
            throw new SmartCampusException.ForbiddenException(
                    "You are not authorised to cancel this booking.");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED
                || booking.getStatus() == BookingStatus.COMPLETED) {
            throw new SmartCampusException.BadRequestException(
                    "Booking cannot be cancelled in its current state.");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancellationReason(reason);
        booking.setCancelledAt(LocalDateTime.now());
        booking.setCancelledBy(requester);

        Booking saved = bookingRepository.save(booking);
        log.info("Booking cancelled: {} by {}", saved.getBookingReference(), requesterEmail);
        return BookingResponse.from(saved, apiBaseUrl);
    }

    // ─────────────────────────────────────────────────────────────────────
    //  Download document
    // ─────────────────────────────────────────────────────────────────────

    public byte[] downloadDocument(Long bookingId, Long documentId, String requesterEmail) {
        Booking booking  = findBookingOrThrow(bookingId);
        User    requester = findUserOrThrow(requesterEmail);

        // Students and faculty can only download documents from their own bookings
        // (matches the ownership rule used by getById/cancel).
        if ((requester.getRole() == Role.STUDENT || requester.getRole() == Role.FACULTY)
                && !booking.getBookedBy().getId().equals(requester.getId())) {
            throw new SmartCampusException.ForbiddenException("Access denied.");
        }

        BookingDocument doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new SmartCampusException.NotFoundException("Document not found."));

        // Guard against IDOR: documentId is caller-supplied, so confirm it actually
        // belongs to the bookingId in the URL rather than trusting it implicitly —
        // otherwise a caller authorised for booking A could read booking B's files
        // by swapping documentId while keeping their own bookingId in the path.
        if (!doc.getBooking().getId().equals(bookingId)) {
            throw new SmartCampusException.NotFoundException("Document not found.");
        }

        return fileStorageService.loadFile(bookingId, doc.getStoredFileName());
    }

    // ─────────────────────────────────────────────────────────────────────
    //  Private helpers
    // ─────────────────────────────────────────────────────────────────────

    private void validateBookingRequest(BookingRequest req, Resource resource,
                                         User organizer, Long excludeBookingId) {
        // Time ordering
        if (!req.getStartTime().isBefore(req.getEndTime()))
            throw new SmartCampusException.BadRequestException("Start time must be before end time.");

        // Duration check
        long durationMinutes = java.time.Duration.between(req.getStartTime(), req.getEndTime()).toMinutes();
        long maxMinutes      = resource.getMaxBookingHours() * 60L;
        if (durationMinutes > maxMinutes)
            throw new SmartCampusException.BadRequestException(
                    "Booking duration exceeds the maximum of " + resource.getMaxBookingHours() + " hours.");

        // Within availability window
        if (resource.getAvailableFrom() != null && req.getStartTime().isBefore(resource.getAvailableFrom()))
            throw new SmartCampusException.BadRequestException(
                    "Resource is not available before " + resource.getAvailableFrom() + ".");
        if (resource.getAvailableTo() != null && req.getEndTime().isAfter(resource.getAvailableTo()))
            throw new SmartCampusException.BadRequestException(
                    "Resource is not available after " + resource.getAvailableTo() + ".");

        // Min advance days (students: also check configured min, with extra rule of 3 days)
        int minAdvance = resource.getMinAdvanceDays();
        if (organizer.getRole() == Role.STUDENT) {
            minAdvance = Math.max(minAdvance, 3);
        }
        LocalDate earliest = LocalDate.now().plusDays(minAdvance);
        if (req.getBookingDate().isBefore(earliest))
            throw new SmartCampusException.BadRequestException(
                    "Booking must be made at least " + minAdvance + " day(s) in advance. "
                    + "Earliest allowed date: " + earliest + ".");

        // Max advance days
        LocalDate latest = LocalDate.now().plusDays(resource.getMaxAdvanceDays());
        if (req.getBookingDate().isAfter(latest))
            throw new SmartCampusException.BadRequestException(
                    "Booking cannot be made more than " + resource.getMaxAdvanceDays() + " days in advance.");

        // Resource active
        if (!resource.getIsActive())
            throw new SmartCampusException.BadRequestException("Resource is not available for booking.");
        if (resource.getIsUnderMaintenance())
            throw new SmartCampusException.BadRequestException("Resource is currently under maintenance.");

        // Time-slot conflict
        long conflicts = bookingRepository.countConflicts(
                resource.getId(), req.getBookingDate(),
                req.getStartTime(), req.getEndTime(), excludeBookingId);
        if (conflicts > 0)
            throw new SmartCampusException.ConflictException(
                    "The selected time slot is already booked. Please choose a different time.");

        // Buffer-day conflict
        if (resource.getBufferDaysBefore() > 0 || resource.getBufferDaysAfter() > 0) {
            LocalDate bufferFrom = req.getBookingDate().minusDays(resource.getBufferDaysAfter());
            LocalDate bufferTo   = req.getBookingDate().plusDays(resource.getBufferDaysBefore());
            List<Booking> bufferConflicts = bookingRepository
                    .findInDateRange(resource.getId(), bufferFrom, bufferTo, excludeBookingId);
            if (!bufferConflicts.isEmpty())
                throw new SmartCampusException.ConflictException(
                        "A buffer period of " + resource.getBufferDaysBefore() + " day(s) before and "
                        + resource.getBufferDaysAfter() + " day(s) after each booking must be observed.");
        }

        // Participants vs capacity
        if (resource.getCapacity() != null && req.getParticipantsCount() > resource.getCapacity())
            throw new SmartCampusException.BadRequestException(
                    "Participants count (" + req.getParticipantsCount()
                    + ") exceeds resource capacity (" + resource.getCapacity() + ").");

        // Duplicate coordinator emails
        long distinctCoordEmails = req.getCoordinators().stream()
                .map(c -> c.getEmail().toLowerCase()).distinct().count();
        if (distinctCoordEmails < req.getCoordinators().size())
            throw new SmartCampusException.BadRequestException(
                    "Coordinator list contains duplicate email addresses.");

        // Duplicate faculty emails
        long distinctFacEmails = req.getSupportingFaculty().stream()
                .map(f -> f.getEmail().toLowerCase()).distinct().count();
        if (distinctFacEmails < req.getSupportingFaculty().size())
            throw new SmartCampusException.BadRequestException(
                    "Supporting faculty list contains duplicate email addresses.");
    }

    private BookingStatus resolveInitialStatus(Resource resource, User organizer) {
        ApprovalAuthority authority = resource.getApprovalAuthority();
        if (authority == ApprovalAuthority.AUTO)  return BookingStatus.APPROVED;
        if (authority == ApprovalAuthority.HOD)   return BookingStatus.PENDING_HOD;
        return BookingStatus.PENDING_ADMIN;
    }

    private void promoteDocument(Booking booking, String tempFileId,
                                  DocumentType type, List<BookingDocument> docs) {
        if (tempFileId == null || tempFileId.isBlank()) return;
        Path promoted = fileStorageService.promoteToBooking(tempFileId, booking.getId());
        if (promoted != null) {
            docs.add(BookingDocument.builder()
                    .booking(booking)
                    .documentType(type)
                    .originalFileName(tempFileId)
                    .storedFileName(promoted.getFileName().toString())
                    .filePath(promoted.toString())
                    .contentType(guessMime(tempFileId))
                    .fileSizeBytes(promoted.toFile().length())
                    .build());
        }
    }

    private String guessMime(String fileName) {
        String lower = fileName.toLowerCase();
        if (lower.endsWith(".pdf"))  return "application/pdf";
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        if (lower.endsWith(".png"))  return "image/png";
        if (lower.endsWith(".webp")) return "image/webp";
        return "application/octet-stream";
    }

    private Booking  findBookingOrThrow(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new SmartCampusException.NotFoundException("Booking not found."));
    }

    private Resource findResourceOrThrow(Long id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new SmartCampusException.NotFoundException("Resource not found."));
    }

    private User findUserOrThrow(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new SmartCampusException.NotFoundException("User not found."));
    }
}
