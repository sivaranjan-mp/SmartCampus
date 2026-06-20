package com.smartcampus.repository;

import com.smartcampus.model.TimetableSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface TimetableSlotRepository extends JpaRepository<TimetableSlot, Long> {

    /**
     * Find active timetable slots for a given resource on a specific day of week
     * whose time range overlaps with [startTime, endTime].
     *
     * Used for timetable clash validation during booking.
     */
    @Query("""
           SELECT ts FROM TimetableSlot ts
           JOIN  ts.timetable tt
           WHERE ts.resource.id = :resourceId
             AND ts.dayOfWeek   = :dayOfWeek
             AND ts.isActive    = true
             AND tt.isActive    = true
             AND tt.effectiveFrom <= :bookingDate
             AND tt.effectiveTo   >= :bookingDate
             AND ts.startTime  < :endTime
             AND ts.endTime    > :startTime
           """)
    List<TimetableSlot> findClashingSlots(
            @Param("resourceId")   Long      resourceId,
            @Param("dayOfWeek")    String    dayOfWeek,
            @Param("bookingDate")  LocalDate bookingDate,
            @Param("startTime")    LocalTime startTime,
            @Param("endTime")      LocalTime endTime);

    /**
     * All active slots for a resource – used for building the availability grid.
     */
    @Query("""
           SELECT ts FROM TimetableSlot ts
           JOIN  ts.timetable tt
           WHERE ts.resource.id = :resourceId
             AND ts.isActive    = true
             AND tt.isActive    = true
             AND tt.effectiveFrom <= :date
             AND tt.effectiveTo   >= :date
           ORDER BY ts.dayOfWeek, ts.startTime
           """)
    List<TimetableSlot> findActiveForResource(
            @Param("resourceId") Long      resourceId,
            @Param("date")       LocalDate date);

    /**
     * Slots for a department's timetables – used by HOD timetable management.
     */
    @Query("""
           SELECT ts FROM TimetableSlot ts
           JOIN  ts.timetable tt
           WHERE tt.department.id = :departmentId
             AND tt.isActive      = true
             AND ts.isActive      = true
           ORDER BY ts.dayOfWeek, ts.startTime
           """)
    List<TimetableSlot> findByDepartment(@Param("departmentId") Long departmentId);
}
