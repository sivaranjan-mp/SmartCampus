package com.smartcampus.dto.booking;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.smartcampus.model.enums.EventDomain;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
public class BookingRequest {

    /* ── Resource & schedule ─────────────────────────────────────────── */

    @NotNull(message = "Resource is required")
    private Long resourceId;

    @NotNull(message = "Booking date is required")
    @Future(message = "Booking date must be in the future")
    private LocalDate bookingDate;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    /* ── Event details ───────────────────────────────────────────────── */

    @NotBlank(message = "Event name is required")
    @Size(min = 3, max = 200, message = "Event name must be 3–200 characters")
    private String eventName;

    @NotNull(message = "Event domain is required")
    private EventDomain eventDomain;

    @NotNull(message = "Participants count is required")
    @Min(value = 1,    message = "Participants count must be at least 1")
    @Max(value = 5000, message = "Participants count cannot exceed 5000")
    private Integer participantsCount;

    @Size(max = 1000, message = "Remarks cannot exceed 1000 characters")
    private String remarks;

    /* ── Objectives: 3–5 items ───────────────────────────────────────── */

    @NotNull(message = "Objectives are required")
    @Size(min = 3, max = 5, message = "Please provide 3 to 5 objectives")
    @Valid
    private List<ItemEntry> objectives;

    /* ── Outcomes: 3–5 items ─────────────────────────────────────────── */

    @NotNull(message = "Outcomes are required")
    @Size(min = 3, max = 5, message = "Please provide 3 to 5 outcomes")
    @Valid
    private List<ItemEntry> outcomes;

    /* ── Coordinators: 2–8 ───────────────────────────────────────────── */

    @NotNull(message = "Coordinators are required")
    @Size(min = 2, max = 8, message = "Please add 2 to 8 coordinators")
    @Valid
    private List<CoordinatorEntry> coordinators;

    /* ── Supporting faculty: 1–4 ─────────────────────────────────────── */

    @NotNull(message = "Supporting faculty is required")
    @Size(min = 1, max = 4, message = "Please add 1 to 4 supporting faculty members")
    @Valid
    private List<FacultyEntry> supportingFaculty;

    /* ── Uploaded document file IDs ──────────────────────────────────── */

    private String permissionLetterFileId;
    private String facultySupportLetterFileId;
    private String posterFileId;

    // ─────────────────────────────────────────────────────────────────────
    //  Inner records
    // ─────────────────────────────────────────────────────────────────────

    @Data
    public static class ItemEntry {
        @NotBlank(message = "Item description cannot be blank")
        @Size(min = 10, max = 500, message = "Each item must be 10–500 characters")
        private String description;
    }

    @Data
    public static class CoordinatorEntry {
        /** Optional: registered user picked from dropdown */
        private Long userId;

        @NotBlank(message = "Coordinator name is required")
        @Size(min = 2, max = 100)
        private String name;

        @NotBlank(message = "Coordinator email is required")
        @Email(message = "Invalid email address")
        private String email;

        private String registerNumber;
        private String department;
        private Integer yearOfStudy;
        private String phoneNumber;
    }

    @Data
    public static class FacultyEntry {
        /** Optional: pick from registered faculty */
        private Long userId;

        @NotBlank(message = "Faculty name is required")
        @Size(min = 2, max = 100)
        private String name;

        @NotBlank(message = "Faculty email is required")
        @Email(message = "Invalid email address")
        private String email;

        private String department;
        private String phoneNumber;
    }

    // ─────────────────────────────────────────────────────────────────────
    //  Cross-field validation
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Validated by Bean Validation as part of the normal @Valid pass on the
     * controller method (Jakarta treats any boolean-returning isXxx()/getXxx()
     * method annotated with @AssertTrue as a constraint). This mirrors the
     * check BookingService.validateBookingRequest already performs, but
     * surfaces it as a standard 400 field-validation error instead of a
     * generic business-rule exception thrown deeper in the call stack.
     */
    @AssertTrue(message = "Start time must be before end time")
    @JsonIgnore
    public boolean isTimeRangeValid() {
        // Let @NotNull report missing fields; don't double-report here.
        if (startTime == null || endTime == null) return true;
        return startTime.isBefore(endTime);
    }
}
