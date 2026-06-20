package com.smartcampus.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "booking_objectives")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BookingObjective {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "booking_id", foreignKey = @ForeignKey(name = "fk_obj_booking"))
    private Booking booking;

    @Column(name = "sequence_number", nullable = false)
    private Integer sequenceNumber;

    @Column(nullable = false, length = 500)
    private String description;
}
