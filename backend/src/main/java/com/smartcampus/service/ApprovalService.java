package com.smartcampus.service;

import com.smartcampus.dto.approval.*;
import com.smartcampus.exception.SmartCampusException;
import com.smartcampus.model.*;
import com.smartcampus.model.enums.*;
import com.smartcampus.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApprovalService {

    private final BookingRepository              bookingRepository;
    private final BookingApprovalRepository      approvalRepository;
    private final UserRepository                 userRepository;
    private final ResourceRepository             resourceRepository;
    private final BookingValidationService       validationService;
    private final ApprovalNotificationService    notificationService;

    // ─────────────────────────────────────────────────────────────────────────
    //  Stats
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public ApprovalStatsResponse getStats(String reviewerEmail) {
        User reviewer = findUserOrThrow(reviewerEmail);

        long pendingHod   = approvalRepository
                .countByApprovalLevelAndStatus(ApprovalLevel.HOD,   ApprovalStatus.PENDING);
        long pendingAdmin = approvalRepository
                .countByApprovalLevelAndStatus(ApprovalLevel.ADMIN, ApprovalStatus.PENDING);

        // Filter HOD stats to their own department if they are HOD role
        if (reviewer.getRole() == Role.HOD && reviewer.getDepartmentName() != null) {
            Department dept = findDepartmentByName(reviewer.getDepartmentName());
            if (dept != null) {
                pendingHod = approvalRepository.countPendingForDepartment(dept.getId());
            }
        }

        long highPriorityPending = bookingRepository.countByStatus(BookingStatus.PENDING_HOD)
                + bookingRepository.countByStatus(BookingStatus.PENDING_ADMIN);

        return ApprovalStatsResponse.builder()
                .pendingHod(pendingHod)
                .pendingAdmin(pendingAdmin)
                .totalPending(pendingHod + pendingAdmin)
                .highPriorityPending(highPriorityPending)
                .approvedToday(0L)
                .rejectedToday(0L)
                .build();
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Queue — HOD
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<ApprovalQueueItem> getHodQueue(String hodEmail, int page, int size) {
        User hod = findUserOrThrow(hodEmail);
        if (hod.getRole() != Role.HOD && hod.getRole() != Role.ADMIN)
            throw new SmartCampusException.ForbiddenException("Only HOD or Admin can access this queue.");

        Department dept = findDepartmentByName(hod.getDepartmentName());
        if (dept == null)
            throw new SmartCampusException.BadRequestException(
                    "No department associated with your account.");

        Pageable pageable = PageRequest.of(page, size);
        return approvalRepository.findPendingHodQueue(dept.getId(), pageable)
                .map(ApprovalQueueItem::from);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Queue — Admin
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<ApprovalQueueItem> getAdminQueue(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return approvalRepository.findPendingAdminQueue(pageable)
                .map(ApprovalQueueItem::from);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Run validation report on a pending booking
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public ValidationReport getValidationReport(Long bookingId, String reviewerEmail) {
        Booking  booking  = findBookingOrThrow(bookingId);
        Resource resource = booking.getResource();
        User     organizer = booking.getBookedBy();

        assertCanReview(reviewerEmail, booking);

        return validationService.validateAll(booking, resource, organizer);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Approve
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional
    public ApprovalQueueItem processDecision(Long approvalId, ApprovalRequest req,
                                             String reviewerEmail) {
        BookingApproval approval  = findApprovalOrThrow(approvalId);
        Booking         booking   = approval.getBooking();
        User            reviewer  = findUserOrThrow(reviewerEmail);

        // Permission check
        assertCanProcessApproval(reviewer, approval);

        // Must still be pending
        if (approval.getStatus() != ApprovalStatus.PENDING)
            throw new SmartCampusException.BadRequestException(
                    "This approval record is no longer pending (current status: "
                    + approval.getStatus() + ").");

        // Record the decision
        approval.setStatus(mapAction(req.getAction()));
        approval.setReviewedBy(reviewer);
        approval.setRemarks(req.getRemarks());
        approval.setReviewedAt(LocalDateTime.now());
        approvalRepository.save(approval);

        // Update the booking's status
        switch (req.getAction()) {
            case APPROVE -> handleApprove(booking, approval, reviewer);
            case REJECT  -> handleReject(booking, req.getRemarks(), reviewer);
            case REQUEST_REVISION -> handleRevision(booking, req.getRemarks(), reviewer);
        }

        log.info("Approval {} on booking {} by {} [{}]",
                req.getAction(), booking.getBookingReference(), reviewerEmail, approval.getApprovalLevel());

        return ApprovalQueueItem.from(approval);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  History
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<ApprovalQueueItem> getReviewHistory(String reviewerEmail,
                                                     ApprovalStatus status, int page, int size) {
        User     reviewer = findUserOrThrow(reviewerEmail);
        Pageable pageable = PageRequest.of(page, size);
        return approvalRepository.findReviewedBy(reviewer.getId(), status, pageable)
                .map(ApprovalQueueItem::from);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Internal: create approval records when a booking is submitted
    // ─────────────────────────────────────────────────────────────────────────

    @org.springframework.transaction.annotation.Transactional(
            propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public void createApprovalRecords(Booking bookingRef) {
        // Reload fresh within new transaction to avoid detached-entity issues
        Booking           booking   = findBookingOrThrow(bookingRef.getId());
        Resource          resource  = booking.getResource();
        ApprovalAuthority authority = resource.getApprovalAuthority();

        if (authority == ApprovalAuthority.AUTO) {
            // Instantly approve — no record needed
            booking.setStatus(BookingStatus.APPROVED);
            booking.setApprovedAt(LocalDateTime.now());
            bookingRepository.save(booking);
            notificationService.notifyOrganizerApproved(booking);
            return;
        }

        ApprovalLevel level = (authority == ApprovalAuthority.HOD)
                ? ApprovalLevel.HOD : ApprovalLevel.ADMIN;

        BookingApproval record = BookingApproval.builder()
                .booking(booking)
                .approvalLevel(level)
                .status(ApprovalStatus.PENDING)
                .sequenceOrder(1)
                .build();

        approvalRepository.save(record);

        // Notify the relevant approver(s)
        dispatchApproverNotification(booking, level);

        // Priority conflict: notify lower-priority organizers
        handlePriorityNotifications(booking, resource);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Private helpers
    // ─────────────────────────────────────────────────────────────────────────

    private void handleApprove(Booking booking, BookingApproval approval, User reviewer) {
        // Check whether further approval levels are needed (currently single-level)
        booking.setStatus(BookingStatus.APPROVED);
        booking.setApprovedAt(LocalDateTime.now());
        bookingRepository.save(booking);
        notificationService.notifyOrganizerApproved(booking);
    }

    private void handleReject(Booking booking, String reason, User reviewer) {
        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(reason);
        bookingRepository.save(booking);
        notificationService.notifyOrganizerRejected(booking, reason != null ? reason : "No reason provided.");
    }

    private void handleRevision(Booking booking, String remarks, User reviewer) {
        booking.setStatus(BookingStatus.PENDING);
        bookingRepository.save(booking);
        notificationService.notifyOrganizerRevisionRequested(booking, remarks != null
                ? remarks : "Please revise and resubmit.");
    }

    private void dispatchApproverNotification(Booking booking, ApprovalLevel level) {
        if (level == ApprovalLevel.HOD) {
            // Find HOD users for this department
            Resource resource = booking.getResource();
            if (resource.getDepartmentOwner() != null) {
                userRepository.searchUsers(null, Role.HOD, PageRequest.of(0, 10))
                        .stream()
                        .filter(u -> resource.getDepartmentOwner().getName()
                                .equalsIgnoreCase(u.getDepartmentName()))
                        .forEach(hod -> notificationService.notifyApproverPendingReview(booking, hod));
            }
        } else {
            // Notify all admins
            userRepository.searchUsers(null, Role.ADMIN, PageRequest.of(0, 10))
                    .forEach(admin -> notificationService.notifyApproverPendingReview(booking, admin));
        }
    }

    private void handlePriorityNotifications(Booking newBooking, Resource resource) {
        if (!"HIGH".equalsIgnoreCase(newBooking.getPriority())) return;

        bookingRepository.findBookedSlots(resource.getId(), newBooking.getBookingDate())
                .stream()
                .filter(b -> !"HIGH".equalsIgnoreCase(b.getPriority())
                        && !b.getId().equals(newBooking.getId())
                        && b.getStartTime().isBefore(newBooking.getEndTime())
                        && b.getEndTime().isAfter(newBooking.getStartTime()))
                .forEach(low -> notificationService.notifyPriorityPreemption(low, newBooking));
    }

    private void assertCanReview(String reviewerEmail, Booking booking) {
        User reviewer = findUserOrThrow(reviewerEmail);
        if (reviewer.getRole() == Role.ADMIN) return;
        if (reviewer.getRole() == Role.HOD) {
            Resource r = booking.getResource();
            if (r.getApprovalAuthority() == ApprovalAuthority.HOD
                    && r.getDepartmentOwner() != null
                    && r.getDepartmentOwner().getName().equalsIgnoreCase(reviewer.getDepartmentName())) {
                return;
            }
        }
        throw new SmartCampusException.ForbiddenException(
                "You are not authorised to review this booking.");
    }

    private void assertCanProcessApproval(User reviewer, BookingApproval approval) {
        if (reviewer.getRole() == Role.ADMIN) return;
        if (reviewer.getRole() == Role.HOD
                && approval.getApprovalLevel() == ApprovalLevel.HOD) {
            // Ensure HOD belongs to the right department
            Resource r = approval.getBooking().getResource();
            if (r.getDepartmentOwner() == null
                    || !r.getDepartmentOwner().getName().equalsIgnoreCase(reviewer.getDepartmentName()))
                throw new SmartCampusException.ForbiddenException(
                        "You can only approve bookings for your own department's resources.");
            return;
        }
        throw new SmartCampusException.ForbiddenException(
                "You do not have permission to process this approval.");
    }

    private ApprovalStatus mapAction(ApprovalRequest.Action action) {
        return switch (action) {
            case APPROVE           -> ApprovalStatus.APPROVED;
            case REJECT            -> ApprovalStatus.REJECTED;
            case REQUEST_REVISION  -> ApprovalStatus.REVISION_REQUESTED;
        };
    }

    private Department findDepartmentByName(String name) {
        if (name == null) return null;
        return deptRepo.findByNameIgnoreCase(name).orElse(null);
    }

    private final DepartmentRepository deptRepo;

    private Booking         findBookingOrThrow(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new SmartCampusException.NotFoundException("Booking not found."));
    }

    private BookingApproval findApprovalOrThrow(Long id) {
        return approvalRepository.findById(id)
                .orElseThrow(() -> new SmartCampusException.NotFoundException("Approval record not found."));
    }

    private User findUserOrThrow(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new SmartCampusException.NotFoundException("User not found."));
    }
}
