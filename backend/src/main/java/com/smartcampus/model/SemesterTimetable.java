package com.smartcampus.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
    name = "semester_timetables",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_timetable_dept_year_sem_section",
        columnNames = {"department_id", "academic_year", "semester", "section"}
    )
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SemesterTimetable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "department_id", foreignKey = @ForeignKey(name = "fk_tt_department"))
    private Department department;

    @Column(name = "academic_year", nullable = false, length = 9)
    private String academicYear;      // e.g. 2024-2025

    @Column(nullable = false)
    private Integer semester;         // 1–8

    @Column(length = 10)
    private String section;           // e.g. A, B, null = whole year

    @Column(name = "year_of_study", nullable = false)
    private Integer yearOfStudy;      // 1–4

    @Column(name = "effective_from", nullable = false)
    private LocalDate effectiveFrom;

    @Column(name = "effective_to", nullable = false)
    private LocalDate effectiveTo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by", foreignKey = @ForeignKey(name = "fk_tt_created_by"))
    private User createdBy;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @OneToMany(mappedBy = "timetable", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TimetableSlot> slots = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
