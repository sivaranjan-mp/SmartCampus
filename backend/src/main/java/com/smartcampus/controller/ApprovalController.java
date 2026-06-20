package com.smartcampus.controller;

import com.smartcampus.dto.approval.*;
import com.smartcampus.dto.common.ApiResponse;
import com.smartcampus.model.enums.ApprovalStatus;
import com.smartcampus.service.ApprovalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/approvals")
@RequiredArgsConstructor
public class ApprovalController {

    private final ApprovalService approvalService;

    /* ── Stats ──────────────────────────────────────────────────────────── */

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('HOD','ADMIN')")
    public ResponseEntity<ApiResponse<ApprovalStatsResponse>> getStats(
            @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(ApiResponse.success(
                "Approval statistics.", approvalService.getStats(ud.getUsername())));
    }

    /* ── HOD queue ──────────────────────────────────────────────────────── */

    @GetMapping("/hod/queue")
    @PreAuthorize("hasAnyRole('HOD','ADMIN')")
    public ResponseEntity<ApiResponse<Page<ApprovalQueueItem>>> hodQueue(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(ApiResponse.success(
                "HOD approval queue.", approvalService.getHodQueue(ud.getUsername(), page, size)));
    }

    /* ── Admin queue ────────────────────────────────────────────────────── */

    @GetMapping("/admin/queue")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<ApprovalQueueItem>>> adminQueue(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                "Admin approval queue.", approvalService.getAdminQueue(page, size)));
    }

    /* ── Validation report for a booking ───────────────────────────────── */

    @GetMapping("/validate/{bookingId}")
    @PreAuthorize("hasAnyRole('HOD','ADMIN')")
    public ResponseEntity<ApiResponse<ValidationReport>> validate(
            @PathVariable Long bookingId,
            @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(ApiResponse.success(
                "Validation report generated.",
                approvalService.getValidationReport(bookingId, ud.getUsername())));
    }

    /* ── Process decision (approve / reject / revise) ───────────────────── */

    @PostMapping("/{approvalId}/decision")
    @PreAuthorize("hasAnyRole('HOD','ADMIN')")
    public ResponseEntity<ApiResponse<ApprovalQueueItem>> decide(
            @PathVariable Long approvalId,
            @Valid @RequestBody ApprovalRequest request,
            @AuthenticationPrincipal UserDetails ud) {
        ApprovalQueueItem result =
                approvalService.processDecision(approvalId, request, ud.getUsername());
        String msg = switch (request.getAction()) {
            case APPROVE           -> "Booking approved successfully.";
            case REJECT            -> "Booking rejected.";
            case REQUEST_REVISION  -> "Revision request sent to the organizer.";
        };
        return ResponseEntity.ok(ApiResponse.success(msg, result));
    }

    /* ── Review history ─────────────────────────────────────────────────── */

    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('HOD','ADMIN')")
    public ResponseEntity<ApiResponse<Page<ApprovalQueueItem>>> history(
            @RequestParam(required = false)    ApprovalStatus status,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(ApiResponse.success(
                "Review history.",
                approvalService.getReviewHistory(ud.getUsername(), status, page, size)));
    }
}
