package com.smartcampus.repository;

import com.smartcampus.model.Booking;
import com.smartcampus.model.enums.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByBookingReference(String reference);

    // ── My bookings ───────────────────────────────────────────────────────

    @Query("""
           SELECT b FROM Booking b
           JOIN FETCH b.resource r
           JOIN FETCH b.bookedBy u
           WHERE b.bookedBy.id = :userId
             AND (:status IS NULL OR b.status = :status)
           ORDER BY b.createdAt DESC
           """)
    Page<Booking> findByUserId(
            @Param("userId")  Long          userId,
            @Param("status")  BookingStatus status,
            Pageable          pageable);

    // ── Conflict detection ────────────────────────────────────────────────

    @Query("""
           SELECT COUNT(b) FROM Booking b
           WHERE b.resource.id  = :resourceId
             AND b.bookingDate  = :date
             AND b.status NOT IN ('CANCELLED','REJECTED','DRAFT')
             AND (:excludeId IS NULL OR b.id != :excludeId)
             AND b.startTime  < :endTime
             AND b.endTime    > :startTime
           """)
    long countConflicts(
            @Param("resourceId") Long      resourceId,
            @Param("date")       LocalDate date,
            @Param("startTime")  LocalTime startTime,
            @Param("endTime")    LocalTime endTime,
            @Param("excludeId")  Long      excludeId);

    // ── Buffer-day check: any booking within ±N days of the requested date ──

    @Query("""
           SELECT b FROM Booking b
           WHERE b.resource.id = :resourceId
             AND b.bookingDate BETWEEN :fromDate AND :toDate
             AND b.status NOT IN ('CANCELLED','REJECTED','DRAFT')
             AND (:excludeId IS NULL OR b.id != :excludeId)
           """)
    List<Booking> findInDateRange(
            @Param("resourceId") Long      resourceId,
            @Param("fromDate")   LocalDate fromDate,
            @Param("toDate")     LocalDate toDate,
            @Param("excludeId")  Long      excludeId);

    // ── Booked slots for a date (availability view) ───────────────────────

    @Query("""
           SELECT b FROM Booking b
           WHERE b.resource.id = :resourceId
             AND b.bookingDate = :date
             AND b.status NOT IN ('CANCELLED','REJECTED','DRAFT')
           ORDER BY b.startTime ASC
           """)
    List<Booking> findBookedSlots(
            @Param("resourceId") Long      resourceId,
            @Param("date")       LocalDate date);

    // ── Admin / HOD search ────────────────────────────────────────────────

    @Query("""
           SELECT b FROM Booking b
           JOIN FETCH b.resource r
           JOIN FETCH b.bookedBy u
           WHERE (:search IS NULL
                   OR LOWER(b.eventName)        LIKE LOWER(CONCAT('%',:search,'%'))
                   OR LOWER(b.bookingReference) LIKE LOWER(CONCAT('%',:search,'%'))
                   OR LOWER(u.fullName)         LIKE LOWER(CONCAT('%',:search,'%')))
             AND (:status   IS NULL OR b.status      = :status)
             AND (:fromDate IS NULL OR b.bookingDate >= :fromDate)
             AND (:toDate   IS NULL OR b.bookingDate <= :toDate)
           """)
    Page<Booking> searchAll(
            @Param("search")   String        search,
            @Param("status")   BookingStatus status,
            @Param("fromDate") LocalDate     fromDate,
            @Param("toDate")   LocalDate     toDate,
            Pageable           pageable);

    // ── Pending approvals for HOD (department resources) ──────────────────

    @Query("""
           SELECT b FROM Booking b
           JOIN FETCH b.resource r
           JOIN FETCH b.bookedBy u
           WHERE b.status IN ('PENDING','PENDING_HOD')
             AND r.departmentOwner.id = :departmentId
           ORDER BY b.createdAt ASC
           """)
    List<Booking> findPendingForDepartment(@Param("departmentId") Long departmentId);

    // ── Stats ─────────────────────────────────────────────────────────────

    long countByStatus(BookingStatus status);

    long countByBookedByIdAndStatus(Long userId, BookingStatus status);
}
