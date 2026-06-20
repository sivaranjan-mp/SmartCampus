package com.smartcampus.dto.approval;

import com.smartcampus.model.BookingApproval;
import com.smartcampus.model.enums.ApprovalLevel;
import com.smartcampus.model.enums.ApprovalStatus;
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
public class ApprovalQueueItem {

    /* Approval record */
    private Long           approvalId;
    private ApprovalLevel  approvalLevel;
    private ApprovalStatus approvalStatus;
    private LocalDateTime  createdAt;
    private LocalDateTime  reviewedAt;
    private String         reviewedByName;
    private String         remarks;

    /* Booking summary */
    private Long          bookingId;
    private String        bookingReference;
    private BookingStatus bookingStatus;
    private String        priority;

    /* Event */
    private String        eventName;
    private EventDomain   eventDomain;
    private Integer       participantsCount;
    private LocalDate     bookingDate;
    private LocalTime     startTime;
    private LocalTime     endTime;

    /* Resource */
    private Long          resourceId;
    private String        resourceName;
    private String        resourceCode;
    private String        resourceCategory;
    private Integer       resourceCapacity;
    private String        approvalAuthority;

    /* Organizer */
    private Long          organizerId;
    private String        organizerName;
    private String        organizerEmail;
    private String        organizerRole;
    private String        organizerDepartment;
    private String        organizerRegisterNumber;

    /* Team counts */
    private int           coordinatorCount;
    private int           facultySupportCount;
    private int           documentCount;

    public static ApprovalQueueItem from(BookingApproval a) {
        var b = a.getBooking();
        var r = b.getResource();
        var u = b.getBookedBy();

        return ApprovalQueueItem.builder()
                .approvalId(a.getId())
                .approvalLevel(a.getApprovalLevel())
                .approvalStatus(a.getStatus())
                .createdAt(a.getCreatedAt())
                .reviewedAt(a.getReviewedAt())
                .reviewedByName(a.getReviewedBy() != null ? a.getReviewedBy().getFullName() : null)
                .remarks(a.getRemarks())

                .bookingId(b.getId())
                .bookingReference(b.getBookingReference())
                .bookingStatus(b.getStatus())
                .priority(b.getPriority())

                .eventName(b.getEventName())
                .eventDomain(b.getEventDomain())
                .participantsCount(b.getParticipantsCount())
                .bookingDate(b.getBookingDate())
                .startTime(b.getStartTime())
                .endTime(b.getEndTime())

                .resourceId(r.getId())
                .resourceName(r.getName())
                .resourceCode(r.getResourceCode())
                .resourceCategory(r.getCategory() != null ? r.getCategory().name() : null)
                .resourceCapacity(r.getCapacity())
                .approvalAuthority(r.getApprovalAuthority() != null
                        ? r.getApprovalAuthority().name() : null)

                .organizerId(u.getId())
                .organizerName(u.getFullName())
                .organizerEmail(u.getEmail())
                .organizerRole(u.getRole().name())
                .organizerDepartment(u.getDepartmentName())
                .organizerRegisterNumber(u.getRegisterNumber())

                .coordinatorCount(b.getCoordinators().size())
                .facultySupportCount(b.getFacultySupports().size())
                .documentCount(b.getDocuments().size())
                .build();
    }
}
