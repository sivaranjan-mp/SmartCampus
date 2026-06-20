package com.smartcampus.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "booking_faculty_supports",
    uniqueConstraints = @UniqueConstraint(name = "uq_booking_faculty", columnNames = {"booking_id","email"})
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BookingFacultySupport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "booking_id", foreignKey = @ForeignKey(name = "fk_faculty_booking"))
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", foreignKey = @ForeignKey(name = "fk_faculty_user"))
    private User user;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 150)
    private String email;

    @Column(length = 150)
    private String department;

    @Column(name = "phone_number", length = 15)
    private String phoneNumber;
}
