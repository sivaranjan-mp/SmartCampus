package com.smartcampus.util;

import org.springframework.stereotype.Component;

import java.time.Year;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Validates and parses student register numbers.
 *
 * Expected format:  YY[DEPT][SEQ]
 * Examples:
 *   22CSE001  — joined 2022, CSE department, sequence 001
 *   23AIDS045 — joined 2023, AIDS department, sequence 045
 *   21IT010   — joined 2021, IT department, sequence 010
 *
 * Rules:
 *  - First 2 digits = last two digits of the joining year (e.g. 22 = 2022)
 *  - Followed by 2–6 uppercase alphabetic characters (dept code)
 *  - Followed by 2–4 numeric digits (sequence)
 *  - Total length: 7–12 characters
 */
@Component
public class RegisterNumberValidator {

    // YY (2 digits) + DEPT (2-6 uppercase letters) + SEQ (2-4 digits)
    private static final Pattern REGISTER_PATTERN =
            Pattern.compile("^(\\d{2})([A-Z]{2,6})(\\d{2,4})$");

    private static final int MIN_JOIN_YEAR = 2000;
    private static final int MAX_JOIN_YEAR_OFFSET = 1; // allow next year registrations

    public record ValidationResult(boolean valid, String message, Integer joinYear) {}

    public ValidationResult validate(String registerNumber) {
        if (registerNumber == null || registerNumber.isBlank()) {
            return new ValidationResult(false, "Register number is required.", null);
        }

        String normalized = registerNumber.trim().toUpperCase();

        if (normalized.length() < 7 || normalized.length() > 12) {
            return new ValidationResult(false,
                    "Register number must be 7–12 characters (e.g. 22CSE001).", null);
        }

        Matcher matcher = REGISTER_PATTERN.matcher(normalized);
        if (!matcher.matches()) {
            return new ValidationResult(false,
                    "Invalid format. Expected: YY + DEPT + SEQ (e.g. 22CSE001, 23AIDS045).", null);
        }

        String yyPart    = matcher.group(1);
        String deptPart  = matcher.group(2);
        int    shortYear = Integer.parseInt(yyPart);

        // Resolve 2-digit year to 4-digit year
        int century   = (shortYear >= 90) ? 1900 : 2000;
        int joinYear  = century + shortYear;
        int thisYear  = Year.now().getValue();

        if (joinYear < MIN_JOIN_YEAR || joinYear > thisYear + MAX_JOIN_YEAR_OFFSET) {
            return new ValidationResult(false,
                    "Joining year " + joinYear + " is out of the valid range.", null);
        }

        return new ValidationResult(true, "Valid register number.", joinYear);
    }

    /**
     * Extracts the normalized (uppercase) register number or returns as-is if invalid.
     */
    public String normalize(String registerNumber) {
        if (registerNumber == null) return null;
        return registerNumber.trim().toUpperCase();
    }

    /**
     * Extracts the department code portion from the register number.
     * Returns null if the format doesn't match.
     */
    public String extractDeptCode(String registerNumber) {
        if (registerNumber == null) return null;
        Matcher m = REGISTER_PATTERN.matcher(registerNumber.trim().toUpperCase());
        return m.matches() ? m.group(2) : null;
    }

    /**
     * Extracts the joining year from a valid register number.
     * Returns null if invalid.
     */
    public Integer extractJoinYear(String registerNumber) {
        if (registerNumber == null) return null;
        Matcher m = REGISTER_PATTERN.matcher(registerNumber.trim().toUpperCase());
        if (!m.matches()) return null;
        int shortYear = Integer.parseInt(m.group(1));
        int century   = (shortYear >= 90) ? 1900 : 2000;
        return century + shortYear;
    }
}
