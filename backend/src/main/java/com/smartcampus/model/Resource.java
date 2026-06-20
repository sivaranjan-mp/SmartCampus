package com.smartcampus.model;

import com.smartcampus.model.enums.ApprovalAuthority;
import com.smartcampus.model.enums.ResourceCategory;
import com.smartcampus.model.enums.ResourceScope;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "resources",
    uniqueConstraints = @UniqueConstraint(name = "uq_resource_code", columnNames = "resource_code"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Resource {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "resource_code", nullable = false, length = 30)
    private String resourceCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ResourceCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    @Builder.Default
    private ResourceScope scope = ResourceScope.COMMON;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", foreignKey = @ForeignKey(name = "fk_resource_department"))
    private Department departmentOwner;

    @Enumerated(EnumType.STRING)
    @Column(name = "approval_authority", nullable = false, length = 10)
    @Builder.Default
    private ApprovalAuthority approvalAuthority = ApprovalAuthority.ADMIN;

    @Column private Integer capacity;
    @Column(name = "location",      length = 150) private String location;
    @Column(name = "floor_number",  length = 10)  private String floorNumber;
    @Column(name = "building_name", length = 100) private String buildingName;
    @Column(columnDefinition = "TEXT") private String description;
    @Column(columnDefinition = "TEXT") private String amenities;
    @Column(name = "image_url", length = 500)     private String imageUrl;

    @Column(name = "available_from") @Builder.Default private LocalTime availableFrom = LocalTime.of(8, 0);
    @Column(name = "available_to")   @Builder.Default private LocalTime availableTo   = LocalTime.of(18, 0);
    @Column(name = "available_days", length = 40) @Builder.Default private String availableDays = "MON,TUE,WED,THU,FRI";

    @Column(name = "min_advance_days",  nullable = false) @Builder.Default private Integer minAdvanceDays  = 1;
    @Column(name = "max_advance_days",  nullable = false) @Builder.Default private Integer maxAdvanceDays  = 30;
    @Column(name = "max_booking_hours", nullable = false) @Builder.Default private Integer maxBookingHours = 4;
    @Column(name = "buffer_days_before",nullable = false) @Builder.Default private Integer bufferDaysBefore = 0;
    @Column(name = "buffer_days_after", nullable = false) @Builder.Default private Integer bufferDaysAfter  = 0;

    @Column(name = "is_active",            nullable = false) @Builder.Default private Boolean isActive           = true;
    @Column(name = "is_under_maintenance",  nullable = false) @Builder.Default private Boolean isUnderMaintenance = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", foreignKey = @ForeignKey(name = "fk_resource_created_by"))
    private User createdBy;

    @CreationTimestamp @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @UpdateTimestamp   @Column(name = "updated_at")                    private LocalDateTime updatedAt;
}
