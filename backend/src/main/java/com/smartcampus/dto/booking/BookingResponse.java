package com.smartcampus.dto.booking;

import com.smartcampus.model.Booking;
import com.smartcampus.model.enums.BookingStatus;
import com.smartcampus.model.enums.DocumentType;
import com.smartcampus.model.enums.EventDomain;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class BookingResponse {

    private Long            id;
    private String          bookingReference;
    private BookingStatus   status;
    private String          priority;

    /* Resource */
    private Long            resourceId;
    private String          resourceName;
    private String          resourceCode;
    private String          resourceCategory;

    /* Organizer */
    private Long            organizerId;
    private String          organizerName;
    private String          organizerEmail;
    private String          organizerRegisterNumber;
    private String          organizerRole;
    private String          organizerDepartment;

    /* Event */
    private String          eventName;
    private EventDomain     eventDomain;
    private Integer         participantsCount;
    private String          remarks;

    /* Schedule */
    private LocalDate       bookingDate;
    private LocalTime       startTime;
    private LocalTime       endTime;

    /* Objectives & outcomes */
    private List<String>    objectives;
    private List<String>    outcomes;

    /* Coordinators */
    private List<CoordinatorInfo>  coordinators;

    /* Supporting faculty */
    private List<FacultyInfo>      supportingFaculty;

    /* Documents */
    private List<DocumentInfo>     documents;

    /* Rejection / cancellation */
    private String          rejectionReason;
    private String          cancellationReason;
    private LocalDateTime   cancelledAt;
    private LocalDateTime   approvedAt;

    /* Audit */
    private LocalDateTime   createdAt;
    private LocalDateTime   updatedAt;

    // ─────────────────────────────────────────────────────────────────────
    //  Nested DTOs
    // ─────────────────────────────────────────────────────────────────────

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CoordinatorInfo {
        private Long    userId;
        private String  name;
        private String  email;
        private String  registerNumber;
        private String  department;
        private Integer yearOfStudy;
        private String  phoneNumber;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class FacultyInfo {
        private Long   userId;
        private String name;
        private String email;
        private String department;
        private String phoneNumber;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class DocumentInfo {
        private Long         id;
        private DocumentType documentType;
        private String       originalFileName;
        private String       downloadUrl;
        private Long         fileSizeBytes;
    }

    // ─────────────────────────────────────────────────────────────────────
    //  Static factory
    // ─────────────────────────────────────────────────────────────────────

    public static BookingResponse from(Booking b, String baseUrl) {
        return BookingResponse.builder()
                .id(b.getId())
                .bookingReference(b.getBookingReference())
                .status(b.getStatus())
                .priority(b.getPriority())

                .resourceId(b.getResource().getId())
                .resourceName(b.getResource().getName())
                .resourceCode(b.getResource().getResourceCode())
                .resourceCategory(b.getResource().getCategory() != null ? b.getResource().getCategory().name() : null)

                .organizerId(b.getBookedBy().getId())
                .organizerName(b.getBookedBy().getFullName())
                .organizerEmail(b.getBookedBy().getEmail())
                .organizerRegisterNumber(b.getBookedBy().getRegisterNumber())
                .organizerRole(b.getBookedBy().getRole().name())
                .organizerDepartment(b.getBookedBy().getDepartmentName())

                .eventName(b.getEventName())
                .eventDomain(b.getEventDomain())
                .participantsCount(b.getParticipantsCount())
                .remarks(b.getRemarks())

                .bookingDate(b.getBookingDate())
                .startTime(b.getStartTime())
                .endTime(b.getEndTime())

                .objectives(b.getObjectives().stream()
                        .map(o -> o.getDescription()).collect(Collectors.toList()))
                .outcomes(b.getOutcomes().stream()
                        .map(o -> o.getDescription()).collect(Collectors.toList()))

                .coordinators(b.getCoordinators().stream().map(c ->
                        CoordinatorInfo.builder()
                                .userId(c.getUser() != null ? c.getUser().getId() : null)
                                .name(c.getName()).email(c.getEmail())
                                .registerNumber(c.getRegisterNumber())
                                .department(c.getDepartment())
                                .yearOfStudy(c.getYearOfStudy())
                                .phoneNumber(c.getPhoneNumber())
                                .build()).collect(Collectors.toList()))

                .supportingFaculty(b.getFacultySupports().stream().map(f ->
                        FacultyInfo.builder()
                                .userId(f.getUser() != null ? f.getUser().getId() : null)
                                .name(f.getName()).email(f.getEmail())
                                .department(f.getDepartment())
                                .phoneNumber(f.getPhoneNumber())
                                .build()).collect(Collectors.toList()))

                .documents(b.getDocuments().stream().map(d ->
                        DocumentInfo.builder()
                                .id(d.getId())
                                .documentType(d.getDocumentType())
                                .originalFileName(d.getOriginalFileName())
                                .downloadUrl(baseUrl + "/bookings/" + b.getId() + "/documents/" + d.getId())
                                .fileSizeBytes(d.getFileSizeBytes())
                                .build()).collect(Collectors.toList()))

                .rejectionReason(b.getRejectionReason())
                .cancellationReason(b.getCancellationReason())
                .cancelledAt(b.getCancelledAt())
                .approvedAt(b.getApprovedAt())
                .createdAt(b.getCreatedAt())
                .updatedAt(b.getUpdatedAt())
                .build();
    }
}
