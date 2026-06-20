package com.smartcampus.dto.booking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AvailabilityResponse {

    private Long      resourceId;
    private String    resourceName;
    private LocalDate date;
    private boolean   available;
    private String    unavailableReason;

    /** Existing booked time slots on the requested date */
    private List<TimeSlot> bookedSlots;

    /** Earliest allowed booking date (respects min advance days + buffer) */
    private LocalDate earliestBookableDate;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class TimeSlot {
        private LocalTime startTime;
        private LocalTime endTime;
        private String    bookingReference;
        private String    status;
    }
}
