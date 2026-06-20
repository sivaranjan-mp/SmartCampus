package com.smartcampus.model;

import com.smartcampus.model.enums.ApprovalLevel;
import com.smartcampus.model.enums.ApprovalStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "booking_approvals",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_booking_approval_level",
        columnNames = {"booking_id", "approval_level"}
    )
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BookingApproval {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "booking_id", foreignKey = @ForeignKey(name = "fk_approval_booking"))
    private Booking booking;

    @Enumerated(EnumType.STRING)
    @Column(name = "approval_level", nullable = false, length = 10)
    private ApprovalLevel approvalLevel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 25)
    @Builder.Default
    private ApprovalStatus status = ApprovalStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by", foreignKey = @ForeignKey(name = "fk_approval_reviewer"))
    private User reviewedBy;

    @Column(length = 1000)
    private String remarks;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    /** Sequence: 1 = first level to review, 2 = second level */
    @Column(name = "sequence_order", nullable = false)
    @Builder.Default
    private Integer sequenceOrder = 1;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
