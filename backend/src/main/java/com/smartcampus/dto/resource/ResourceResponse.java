package com.smartcampus.dto.resource;

import com.smartcampus.model.Resource;
import com.smartcampus.model.enums.ApprovalAuthority;
import com.smartcampus.model.enums.ResourceCategory;
import com.smartcampus.model.enums.ResourceScope;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResourceResponse {

    private Long              id;
    private String            name;
    private String            resourceCode;
    private ResourceCategory  category;
    private ResourceScope     scope;

    /* Ownership */
    private Long              departmentOwnerId;
    private String            departmentOwnerName;
    private ApprovalAuthority approvalAuthority;

    /* Physical */
    private Integer           capacity;
    private String            location;
    private String            floorNumber;
    private String            buildingName;
    private String            description;
    private String            amenities;
    private String            imageUrl;

    /* Availability */
    private LocalTime         availableFrom;
    private LocalTime         availableTo;
    private String            availableDays;

    /* Booking policy */
    private Integer           minAdvanceDays;
    private Integer           maxAdvanceDays;
    private Integer           maxBookingHours;
    private Integer           bufferDaysBefore;
    private Integer           bufferDaysAfter;

    /* Status */
    private Boolean           isActive;
    private Boolean           isUnderMaintenance;

    /* Audit */
    private String            createdByName;
    private LocalDateTime     createdAt;
    private LocalDateTime     updatedAt;

    // ─────────────────────────────────────────────────────────────────────
    //  Static factory
    // ─────────────────────────────────────────────────────────────────────

    public static ResourceResponse from(Resource r) {
        return ResourceResponse.builder()
                .id(r.getId())
                .name(r.getName())
                .resourceCode(r.getResourceCode())
                .category(r.getCategory())
                .scope(r.getScope())
                .departmentOwnerId(r.getDepartmentOwner() != null ? r.getDepartmentOwner().getId() : null)
                .departmentOwnerName(r.getDepartmentOwner() != null ? r.getDepartmentOwner().getName() : null)
                .approvalAuthority(r.getApprovalAuthority())
                .capacity(r.getCapacity())
                .location(r.getLocation())
                .floorNumber(r.getFloorNumber())
                .buildingName(r.getBuildingName())
                .description(r.getDescription())
                .amenities(r.getAmenities())
                .imageUrl(r.getImageUrl())
                .availableFrom(r.getAvailableFrom())
                .availableTo(r.getAvailableTo())
                .availableDays(r.getAvailableDays())
                .minAdvanceDays(r.getMinAdvanceDays())
                .maxAdvanceDays(r.getMaxAdvanceDays())
                .maxBookingHours(r.getMaxBookingHours())
                .bufferDaysBefore(r.getBufferDaysBefore())
                .bufferDaysAfter(r.getBufferDaysAfter())
                .isActive(r.getIsActive())
                .isUnderMaintenance(r.getIsUnderMaintenance())
                .createdByName(r.getCreatedBy() != null ? r.getCreatedBy().getFullName() : null)
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }
}
