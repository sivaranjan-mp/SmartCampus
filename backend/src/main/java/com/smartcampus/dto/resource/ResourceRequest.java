package com.smartcampus.dto.resource;

import com.smartcampus.model.enums.ApprovalAuthority;
import com.smartcampus.model.enums.ResourceCategory;
import com.smartcampus.model.enums.ResourceScope;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalTime;

@Data
public class ResourceRequest {

    /* ── Core identity ─────────────────────────────────────────────────── */

    @NotBlank(message = "Resource name is required")
    @Size(min = 2, max = 150, message = "Name must be 2–150 characters")
    private String name;

    @NotBlank(message = "Resource code is required")
    @Size(min = 2, max = 30, message = "Code must be 2–30 characters")
    @Pattern(
        regexp  = "^[A-Z0-9][A-Z0-9_-]{1,29}$",
        message = "Code must start with a letter/digit and contain only A-Z, 0-9, - or _"
    )
    private String resourceCode;

    @NotNull(message = "Category is required")
    private ResourceCategory category;

    @NotNull(message = "Scope is required")
    private ResourceScope scope;

    /* ── Ownership & approval ──────────────────────────────────────────── */

    /**
     * Required when scope == DEPARTMENT.
     * Must reference an active department ID.
     */
    private Long departmentOwnerId;

    @NotNull(message = "Approval authority is required")
    private ApprovalAuthority approvalAuthority;

    /* ── Physical details ─────────────────────────────────────────────── */

    @Min(value = 1, message = "Capacity must be at least 1")
    @Max(value = 5000, message = "Capacity cannot exceed 5000")
    private Integer capacity;

    @Size(max = 150, message = "Location must be under 150 characters")
    private String location;

    @Size(max = 10, message = "Floor must be under 10 characters")
    private String floorNumber;

    @Size(max = 100, message = "Building name must be under 100 characters")
    private String buildingName;

    @Size(max = 1000, message = "Description must be under 1000 characters")
    private String description;

    @Size(max = 500, message = "Amenities must be under 500 characters")
    private String amenities;

    @Size(max = 500, message = "Image URL must be under 500 characters")
    private String imageUrl;

    /* ── Availability schedule ────────────────────────────────────────── */

    private LocalTime availableFrom;
    private LocalTime availableTo;

    /**
     * Comma-separated day codes e.g. "MON,TUE,WED,THU,FRI".
     */
    @Size(max = 40)
    private String availableDays;

    /* ── Booking policy ───────────────────────────────────────────────── */

    @NotNull(message = "Minimum advance days is required")
    @Min(value = 0, message = "Minimum advance days cannot be negative")
    @Max(value = 90, message = "Minimum advance days cannot exceed 90")
    private Integer minAdvanceDays = 1;

    @NotNull(message = "Maximum advance days is required")
    @Min(value = 1, message = "Maximum advance days must be at least 1")
    @Max(value = 365, message = "Maximum advance days cannot exceed 365")
    private Integer maxAdvanceDays = 30;

    @NotNull(message = "Maximum booking hours is required")
    @Min(value = 1,  message = "Maximum booking hours must be at least 1")
    @Max(value = 24, message = "Maximum booking hours cannot exceed 24")
    private Integer maxBookingHours = 4;

    @NotNull(message = "Buffer days before is required")
    @Min(value = 0, message = "Buffer days before cannot be negative")
    @Max(value = 30, message = "Buffer days before cannot exceed 30")
    private Integer bufferDaysBefore = 0;

    @NotNull(message = "Buffer days after is required")
    @Min(value = 0, message = "Buffer days after cannot be negative")
    @Max(value = 30, message = "Buffer days after cannot exceed 30")
    private Integer bufferDaysAfter = 0;
}
