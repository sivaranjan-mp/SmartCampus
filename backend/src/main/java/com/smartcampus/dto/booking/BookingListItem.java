package com.smartcampus.dto.booking;

import com.smartcampus.model.Booking;
import com.smartcampus.model.enums.BookingStatus;
import com.smartcampus.model.enums.EventDomain;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class BookingListItem {

    private Long          id;
    private String        bookingReference;
    private BookingStatus status;
    private String        priority;

    private String        resourceName;
    private String        resourceCode;
    private String        resourceCategory;

    private String        eventName;
    private EventDomain   eventDomain;
    private Integer       participantsCount;

    private String        organizerName;
    private String        organizerRole;
    private String        organizerDepartment;

    private LocalDate     bookingDate;
    private LocalTime     startTime;
    private LocalTime     endTime;

    private int           coordinatorCount;
    private int           facultySupportCount;
    private int           documentCount;

    private LocalDateTime createdAt;

    public static BookingListItem from(Booking b) {
        return BookingListItem.builder()
                .id(b.getId())
                .bookingReference(b.getBookingReference())
                .status(b.getStatus())
                .priority(b.getPriority())
                .resourceName(b.getResource().getName())
                .resourceCode(b.getResource().getResourceCode())
                .resourceCategory(b.getResource().getCategory() != null
                        ? b.getResource().getCategory().name() : null)
                .eventName(b.getEventName())
                .eventDomain(b.getEventDomain())
                .participantsCount(b.getParticipantsCount())
                .organizerName(b.getBookedBy().getFullName())
                .organizerRole(b.getBookedBy().getRole().name())
                .organizerDepartment(b.getBookedBy().getDepartmentName())
                .bookingDate(b.getBookingDate())
                .startTime(b.getStartTime())
                .endTime(b.getEndTime())
                .coordinatorCount(b.getCoordinators().size())
                .facultySupportCount(b.getFacultySupports().size())
                .documentCount(b.getDocuments().size())
                .createdAt(b.getCreatedAt())
                .build();
    }
}
