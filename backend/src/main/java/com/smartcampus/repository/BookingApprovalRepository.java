package com.smartcampus.repository;

import com.smartcampus.model.BookingApproval;
import com.smartcampus.model.enums.ApprovalLevel;
import com.smartcampus.model.enums.ApprovalStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingApprovalRepository extends JpaRepository<BookingApproval, Long> {

    Optional<BookingApproval> findByBookingIdAndApprovalLevel(
            Long bookingId, ApprovalLevel level);

    List<BookingApproval> findAllByBookingId(Long bookingId);

    // ── HOD queue: pending department-resource bookings for a specific department ──

    @Query("""
           SELECT a FROM BookingApproval a
           JOIN FETCH a.booking b
           JOIN FETCH b.resource r
           JOIN FETCH b.bookedBy u
           WHERE a.approvalLevel = 'HOD'
             AND a.status        = 'PENDING'
             AND r.departmentOwner.id = :departmentId
           ORDER BY b.priority DESC, b.createdAt ASC
           """)
    Page<BookingApproval> findPendingHodQueue(
            @Param("departmentId") Long departmentId, Pageable pageable);

    // ── Admin queue: pending common-resource bookings ─────────────────────

    @Query("""
           SELECT a FROM BookingApproval a
           JOIN FETCH a.booking b
           JOIN FETCH b.resource r
           JOIN FETCH b.bookedBy u
           WHERE a.approvalLevel = 'ADMIN'
             AND a.status        = 'PENDING'
           ORDER BY b.priority DESC, b.createdAt ASC
           """)
    Page<BookingApproval> findPendingAdminQueue(Pageable pageable);

    // ── History ───────────────────────────────────────────────────────────

    @Query("""
           SELECT a FROM BookingApproval a
           JOIN FETCH a.booking b
           JOIN FETCH b.resource r
           JOIN FETCH b.bookedBy u
           WHERE a.reviewedBy.id = :reviewerId
             AND (:status IS NULL OR a.status = :status)
           ORDER BY a.reviewedAt DESC
           """)
    Page<BookingApproval> findReviewedBy(
            @Param("reviewerId") Long reviewerId,
            @Param("status")     ApprovalStatus status,
            Pageable             pageable);

    // ── Stats ─────────────────────────────────────────────────────────────

    long countByApprovalLevelAndStatus(ApprovalLevel level, ApprovalStatus status);

    @Query("""
           SELECT COUNT(a) FROM BookingApproval a
           JOIN a.booking b
           JOIN b.resource r
           WHERE a.approvalLevel = 'HOD'
             AND a.status        = 'PENDING'
             AND r.departmentOwner.id = :departmentId
           """)
    long countPendingForDepartment(@Param("departmentId") Long departmentId);
}
