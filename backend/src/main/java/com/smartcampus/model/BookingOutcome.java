package com.smartcampus.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "booking_outcomes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BookingOutcome {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "booking_id", foreignKey = @ForeignKey(name = "fk_outcome_booking"))
    private Booking booking;

    @Column(name = "sequence_number", nullable = false)
    private Integer sequenceNumber;

    @Column(nullable = false, length = 500)
    private String description;
}
