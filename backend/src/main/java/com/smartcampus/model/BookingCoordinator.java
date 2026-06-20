package com.smartcampus.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "booking_coordinators",
    uniqueConstraints = @UniqueConstraint(name = "uq_booking_coordinator", columnNames = {"booking_id","email"})
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BookingCoordinator {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "booking_id", foreignKey = @ForeignKey(name = "fk_coord_booking"))
    private Booking booking;

    /**
     * If the coordinator is a registered user, link them.
     * Nullable to support unregistered / external coordinators.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", foreignKey = @ForeignKey(name = "fk_coord_user"))
    private User user;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 150)
    private String email;

    @Column(name = "register_number", length = 30)
    private String registerNumber;

    @Column(length = 150)
    private String department;

    @Column(name = "year_of_study")
    private Integer yearOfStudy;

    @Column(name = "phone_number", length = 15)
    private String phoneNumber;
}
