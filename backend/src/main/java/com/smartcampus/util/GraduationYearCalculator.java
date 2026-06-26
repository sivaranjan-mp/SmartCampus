package com.smartcampus.util;

import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.Month;

/**
 * Calculates expected graduation year for a student.
 *
 * Rules:
 *  - Engineering programs are 4 years.
 *  - Academic year starts in July (Month 7).
 *  - A student in Year 1 has 3 more years remaining → graduates in (current academic year + 3).
 *  - A student in Year 4 has 0 more years remaining → graduates in (current academic year + 0).
 *  - "Current academic year" = this calendar year if month >= July, else last calendar year.
 *
 * Example (called in August 2024):
 *   Year 1 → 2024 + 3 = 2027
 *   Year 2 → 2024 + 2 = 2026
 *   Year 3 → 2024 + 1 = 2025
 *   Year 4 → 2024 + 0 = 2024
 *
 * Example (called in February 2025, mid-year):
 *   Current academic year start = 2024 (since Feb < July)
 *   Year 1 → 2024 + 3 = 2027
 *   Year 2 → 2024 + 2 = 2026
 *   Year 3 → 2024 + 1 = 2025
 *   Year 4 → 2024 + 0 = 2024
 */
@Component
public class GraduationYearCalculator {

    private static final int PROGRAM_DURATION_YEARS = 4;
    private static final int ACADEMIC_YEAR_START_MONTH = Month.JULY.getValue();

    /**
     * Calculates graduation year based on current year of study (1–4).
     *
     * @param yearOfStudy  Current year of study (1 = first year, 4 = final year)
     * @return             Expected graduation calendar year
     */
    public int calculate(int yearOfStudy) {
        validateYearOfStudy(yearOfStudy);

        int currentAcademicYearStart = resolveAcademicYearStart();
        int yearsRemaining = PROGRAM_DURATION_YEARS - yearOfStudy;

        return currentAcademicYearStart + yearsRemaining;
    }

    /**
     * Calculates graduation year from register number join year and current year of study.
     * Uses the join year as the academic start reference for consistency.
     *
     * @param joinYear     The calendar year the student joined (e.g. 2022)
     * @param yearOfStudy  Current year of study (1–4)
     * @return             Expected graduation calendar year
     */
    public int calculateFromJoinYear(int joinYear, int yearOfStudy) {
        validateYearOfStudy(yearOfStudy);
        return joinYear + (PROGRAM_DURATION_YEARS - 1);
    }

    /**
     * Returns the "join year" for a student currently in a given study year.
     * Useful for cross-checking register number join year vs declared year of study.
     *
     * @param yearOfStudy  Current year of study
     * @return             Expected join year
     */
    public int expectedJoinYear(int yearOfStudy) {
        validateYearOfStudy(yearOfStudy);
        int currentAcademicYearStart = resolveAcademicYearStart();
        return currentAcademicYearStart - (yearOfStudy - 1);
    }

    /**
     * Validates that the register number join year is consistent with the declared
     * year of study, allowing ±1 year tolerance for edge cases.
     */
    public boolean isConsistent(int registerJoinYear, int yearOfStudy) {
        int expectedJoin = expectedJoinYear(yearOfStudy);
        return Math.abs(registerJoinYear - expectedJoin) <= 1;
    }

    // ─────────────────────────────────────────
    //  Private helpers
    // ─────────────────────────────────────────

    private int resolveAcademicYearStart() {
        LocalDate today = LocalDate.now();
        return (today.getMonthValue() >= ACADEMIC_YEAR_START_MONTH)
                ? today.getYear()
                : today.getYear() - 1;
    }

    private void validateYearOfStudy(int yearOfStudy) {
        if (yearOfStudy < 1 || yearOfStudy > PROGRAM_DURATION_YEARS) {
            throw new IllegalArgumentException(
                    "Year of study must be between 1 and " + PROGRAM_DURATION_YEARS
                            + ", got: " + yearOfStudy);
        }
    }
}
