package com.smartcampus.service;

import com.smartcampus.dto.approval.ValidationReport;
import com.smartcampus.dto.approval.ValidationReport.RuleResult;
import com.smartcampus.model.Booking;
import com.smartcampus.model.Resource;
import com.smartcampus.model.TimetableSlot;
import com.smartcampus.model.User;
import com.smartcampus.model.enums.Role;
import com.smartcampus.model.enums.ValidationRule;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.TimetableSlotRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingValidationService {

    private final BookingRepository        bookingRepository;
    private final TimetableSlotRepository  timetableSlotRepository;

    private static final int STUDENT_MIN_ADVANCE_DAYS = 3;

    // ─────────────────────────────────────────────────────────────────────────
    //  Run all validations and return a full report
    // ─────────────────────────────────────────────────────────────────────────

    public ValidationReport validateAll(Booking booking, Resource resource, User organizer) {
        ValidationReport report = ValidationReport.builder().passed(true).build();

        report.addResult(validateMaintenanceCheck(resource));
        report.addResult(validateThreeDayRule(booking.getBookingDate(), organizer));
        report.addResult(validateAdvanceWindow(booking.getBookingDate(), resource));
        report.addResult(validateAvailabilityTime(booking.getStartTime(), booking.getEndTime(), resource));
        report.addResult(validateCapacityCheck(booking.getParticipantsCount(), resource));
        report.addResult(validateResourceConflict(booking, resource));
        report.addResult(validateBufferDayRule(booking, resource));
        report.addResult(validateTimetableClash(booking, resource));
        report.addResult(validatePriorityConflict(booking, resource));

        long failCount = report.getResults().stream()
                .filter(r -> !r.isPassed() && r.isMandatory()).count();

        report.setPassed(failCount == 0);
        report.setSummary(failCount == 0
                ? "All " + report.getResults().size() + " validation checks passed."
                : failCount + " validation check(s) failed. Booking cannot proceed.");

        return report;
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Rule 1 — Maintenance Check
    // ─────────────────────────────────────────────────────────────────────────

    public RuleResult validateMaintenanceCheck(Resource resource) {
        if (!resource.getIsActive()) {
            return RuleResult.fail(
                    ValidationRule.MAINTENANCE_CHECK,
                    "Resource Status",
                    "Resource \"" + resource.getName() + "\" is currently inactive.",
                    "Contact the administrator to activate this resource.",
                    true);
        }
        if (resource.getIsUnderMaintenance()) {
            return RuleResult.fail(
                    ValidationRule.MAINTENANCE_CHECK,
                    "Resource Status",
                    "Resource \"" + resource.getName() + "\" is currently under maintenance.",
                    "Choose a different resource or wait until maintenance is complete.",
                    true);
        }
        return RuleResult.pass(
                ValidationRule.MAINTENANCE_CHECK,
                "Resource Status",
                "Resource is active and not under maintenance.");
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Rule 2 — 3-Day Advance Rule (students)
    // ─────────────────────────────────────────────────────────────────────────

    public RuleResult validateThreeDayRule(LocalDate bookingDate, User organizer) {
        if (organizer.getRole() != Role.STUDENT) {
            return RuleResult.pass(
                    ValidationRule.THREE_DAY_ADVANCE,
                    "3-Day Advance Rule",
                    "Rule not applicable — organizer is " + organizer.getRole().name() + ".");
        }

        LocalDate earliest = LocalDate.now().plusDays(STUDENT_MIN_ADVANCE_DAYS);
        if (bookingDate.isBefore(earliest)) {
            return RuleResult.fail(
                    ValidationRule.THREE_DAY_ADVANCE,
                    "3-Day Advance Rule",
                    "Students must book at least " + STUDENT_MIN_ADVANCE_DAYS +
                    " days in advance. Requested date: " + bookingDate +
                    " — earliest allowed: " + earliest + ".",
                    "Move the booking date to " + earliest + " or later.",
                    true);
        }
        return RuleResult.pass(
                ValidationRule.THREE_DAY_ADVANCE,
                "3-Day Advance Rule",
                "Booking date satisfies the 3-day advance requirement (" +
                bookingDate + " ≥ " + earliest + ").");
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Rule 3 — Advance Window (resource's min/max advance days)
    // ─────────────────────────────────────────────────────────────────────────

    public RuleResult validateAdvanceWindow(LocalDate bookingDate, Resource resource) {
        LocalDate minDate = LocalDate.now().plusDays(resource.getMinAdvanceDays());
        LocalDate maxDate = LocalDate.now().plusDays(resource.getMaxAdvanceDays());

        if (bookingDate.isBefore(minDate)) {
            return RuleResult.fail(
                    ValidationRule.ADVANCE_WINDOW,
                    "Advance Booking Window",
                    "Resource requires at least " + resource.getMinAdvanceDays() +
                    " day(s) advance notice. Earliest: " + minDate + ".",
                    "Move booking to " + minDate + " or later.",
                    true);
        }
        if (bookingDate.isAfter(maxDate)) {
            return RuleResult.fail(
                    ValidationRule.ADVANCE_WINDOW,
                    "Advance Booking Window",
                    "Booking cannot be made more than " + resource.getMaxAdvanceDays() +
                    " days in advance. Latest: " + maxDate + ".",
                    "Move booking to " + maxDate + " or earlier.",
                    true);
        }
        return RuleResult.pass(
                ValidationRule.ADVANCE_WINDOW,
                "Advance Booking Window",
                "Booking date is within the allowed advance window.");
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Rule 4 — Availability Time Window
    // ─────────────────────────────────────────────────────────────────────────

    public RuleResult validateAvailabilityTime(LocalTime startTime, LocalTime endTime,
                                               Resource resource) {
        LocalTime from = resource.getAvailableFrom();
        LocalTime to   = resource.getAvailableTo();

        if (from != null && startTime.isBefore(from)) {
            return RuleResult.fail(
                    ValidationRule.AVAILABILITY_TIME,
                    "Availability Hours",
                    "Resource is not available before " + from +
                    ". Requested start: " + startTime + ".",
                    "Adjust start time to " + from + " or later.",
                    true);
        }
        if (to != null && endTime.isAfter(to)) {
            return RuleResult.fail(
                    ValidationRule.AVAILABILITY_TIME,
                    "Availability Hours",
                    "Resource is not available after " + to +
                    ". Requested end: " + endTime + ".",
                    "Adjust end time to " + to + " or earlier.",
                    true);
        }

        long durationMins = java.time.Duration.between(startTime, endTime).toMinutes();
        long maxMins      = resource.getMaxBookingHours() * 60L;
        if (durationMins > maxMins) {
            return RuleResult.fail(
                    ValidationRule.AVAILABILITY_TIME,
                    "Availability Hours",
                    "Requested duration (" + (durationMins / 60) + "h " + (durationMins % 60) +
                    "m) exceeds maximum of " + resource.getMaxBookingHours() + " hours.",
                    "Reduce booking duration to " + resource.getMaxBookingHours() + " hours or less.",
                    true);
        }
        return RuleResult.pass(
                ValidationRule.AVAILABILITY_TIME,
                "Availability Hours",
                "Time window is within the resource's operational hours.");
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Rule 5 — Capacity Check
    // ─────────────────────────────────────────────────────────────────────────

    public RuleResult validateCapacityCheck(Integer participantsCount, Resource resource) {
        if (resource.getCapacity() == null) {
            return RuleResult.pass(
                    ValidationRule.CAPACITY_CHECK,
                    "Capacity Check",
                    "Resource has no defined capacity limit.");
        }
        if (participantsCount > resource.getCapacity()) {
            return RuleResult.fail(
                    ValidationRule.CAPACITY_CHECK,
                    "Capacity Check",
                    "Participants (" + participantsCount + ") exceeds resource capacity (" +
                    resource.getCapacity() + "). Overflow: " +
                    (participantsCount - resource.getCapacity()) + " persons.",
                    "Reduce participant count or choose a larger venue.",
                    true);
        }
        double utilisation = (participantsCount * 100.0) / resource.getCapacity();
        String note = utilisation > 90
                ? " (High utilisation: " + String.format("%.0f", utilisation) + "%)"
                : "";
        return RuleResult.pass(
                ValidationRule.CAPACITY_CHECK,
                "Capacity Check",
                participantsCount + " / " + resource.getCapacity() + " seats" + note + ".");
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Rule 6 — Resource Conflict (same resource, overlapping slot)
    // ─────────────────────────────────────────────────────────────────────────

    public RuleResult validateResourceConflict(Booking booking, Resource resource) {
        long conflicts = bookingRepository.countConflicts(
                resource.getId(),
                booking.getBookingDate(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getId());

        if (conflicts > 0) {
            List<Booking> clashing = bookingRepository
                    .findBookedSlots(resource.getId(), booking.getBookingDate())
                    .stream()
                    .filter(b -> !b.getId().equals(booking.getId())
                            && b.getStartTime().isBefore(booking.getEndTime())
                            && b.getEndTime().isAfter(booking.getStartTime()))
                    .collect(Collectors.toList());

            String clashInfo = clashing.stream()
                    .map(b -> b.getBookingReference() + " [" + b.getStartTime() +
                              "–" + b.getEndTime() + "] (" + b.getPriority() + ")")
                    .collect(Collectors.joining(", "));

            RuleResult result = RuleResult.fail(
                    ValidationRule.RESOURCE_CONFLICT,
                    "Resource Conflict",
                    conflicts + " overlapping booking(s) exist on " + booking.getBookingDate() +
                    " for this resource. Conflicting: " + clashInfo + ".",
                    "Choose a different time slot or a different date.",
                    true);
            result.setMetadata(clashing.stream()
                    .map(b -> new Object[]{ b.getBookingReference(), b.getStartTime(),
                                            b.getEndTime(), b.getPriority() })
                    .collect(Collectors.toList()));
            return result;
        }
        return RuleResult.pass(
                ValidationRule.RESOURCE_CONFLICT,
                "Resource Conflict",
                "No conflicting bookings found on " + booking.getBookingDate() + ".");
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Rule 7 — Buffer Day Rule
    // ─────────────────────────────────────────────────────────────────────────

    public RuleResult validateBufferDayRule(Booking booking, Resource resource) {
        int before = resource.getBufferDaysBefore();
        int after  = resource.getBufferDaysAfter();

        if (before == 0 && after == 0) {
            return RuleResult.pass(
                    ValidationRule.BUFFER_DAY,
                    "Buffer Day Rule",
                    "No buffer days configured for this resource.");
        }

        LocalDate bufferFrom = booking.getBookingDate().minusDays(after);
        LocalDate bufferTo   = booking.getBookingDate().plusDays(before);

        List<Booking> bufferConflicts = bookingRepository
                .findInDateRange(resource.getId(), bufferFrom, bufferTo, booking.getId());

        if (!bufferConflicts.isEmpty()) {
            String refs = bufferConflicts.stream()
                    .map(b -> b.getBookingReference() + " (" + b.getBookingDate() + ")")
                    .collect(Collectors.joining(", "));

            return RuleResult.fail(
                    ValidationRule.BUFFER_DAY,
                    "Buffer Day Rule",
                    "A buffer of " + before + " day(s) before and " + after +
                    " day(s) after must be maintained between bookings. " +
                    "Conflicting bookings within buffer: " + refs + ".",
                    "Move the booking date to avoid the buffer period.",
                    true);
        }
        return RuleResult.pass(
                ValidationRule.BUFFER_DAY,
                "Buffer Day Rule",
                "Buffer period of " + before + "d before / " + after +
                "d after is clear.");
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Rule 8 — Timetable Clash
    // ─────────────────────────────────────────────────────────────────────────

    public RuleResult validateTimetableClash(Booking booking, Resource resource) {
        // Derive day-of-week abbreviation from booking date
        DayOfWeek dow    = booking.getBookingDate().getDayOfWeek();
        String    dayAbb = dow.getDisplayName(TextStyle.SHORT, Locale.ENGLISH).toUpperCase();
        // e.g. "MONDAY" → "MON"
        String dayCode = dayAbb.length() >= 3 ? dayAbb.substring(0, 3) : dayAbb;

        List<TimetableSlot> clashes = timetableSlotRepository.findClashingSlots(
                resource.getId(),
                dayCode,
                booking.getBookingDate(),
                booking.getStartTime(),
                booking.getEndTime());

        if (!clashes.isEmpty()) {
            String detail = clashes.stream()
                    .map(ts -> ts.getSubjectCode() + " — " + ts.getSubjectName() +
                               " [" + ts.getStartTime() + "–" + ts.getEndTime() + "]")
                    .collect(Collectors.joining(", "));

            return RuleResult.fail(
                    ValidationRule.TIMETABLE_CLASH,
                    "Timetable Clash",
                    "The requested slot clashes with " + clashes.size() +
                    " active timetable entry(ies) on " + dayCode + ": " + detail + ".",
                    "Choose a time outside the timetable schedule or coordinate with the HOD.",
                    true);
        }
        return RuleResult.pass(
                ValidationRule.TIMETABLE_CLASH,
                "Timetable Clash",
                "No timetable conflicts found on " + dayCode +
                " for this resource.");
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Rule 9 — Priority Conflict (Faculty overrides Student)
    // ─────────────────────────────────────────────────────────────────────────

    public RuleResult validatePriorityConflict(Booking booking, Resource resource) {
        boolean isHigh = "HIGH".equalsIgnoreCase(booking.getPriority());

        if (!isHigh) {
            // Normal priority — check if any HIGH priority pending booking occupies this slot
            List<Booking> highConflicts = bookingRepository
                    .findBookedSlots(resource.getId(), booking.getBookingDate())
                    .stream()
                    .filter(b -> "HIGH".equalsIgnoreCase(b.getPriority())
                            && !b.getId().equals(booking.getId())
                            && b.getStartTime().isBefore(booking.getEndTime())
                            && b.getEndTime().isAfter(booking.getStartTime()))
                    .collect(Collectors.toList());

            if (!highConflicts.isEmpty()) {
                String refs = highConflicts.stream()
                        .map(b -> b.getBookingReference() + " by " + b.getBookedBy().getFullName() +
                                  " [Faculty/HOD]")
                        .collect(Collectors.joining(", "));

                return RuleResult.warn(
                        ValidationRule.PRIORITY_CONFLICT,
                        "Priority Conflict",
                        "A HIGH priority booking exists in the same slot: " + refs +
                        ". This booking may be superseded.",
                        "Consider a different time to avoid priority conflict.");
            }
        }

        if (isHigh) {
            // Faculty booking — warn if it displaces a normal pending booking
            List<Booking> normalConflicts = bookingRepository
                    .findBookedSlots(resource.getId(), booking.getBookingDate())
                    .stream()
                    .filter(b -> "NORMAL".equalsIgnoreCase(b.getPriority())
                            && !b.getId().equals(booking.getId())
                            && b.getStartTime().isBefore(booking.getEndTime())
                            && b.getEndTime().isAfter(booking.getStartTime()))
                    .collect(Collectors.toList());

            if (!normalConflicts.isEmpty()) {
                String refs = normalConflicts.stream()
                        .map(b -> b.getBookingReference() + " (" + b.getBookedBy().getFullName() + ")")
                        .collect(Collectors.joining(", "));

                return RuleResult.warn(
                        ValidationRule.PRIORITY_CONFLICT,
                        "Priority Conflict",
                        "This HIGH priority booking overlaps with " + normalConflicts.size() +
                        " lower-priority booking(s): " + refs +
                        ". Approver should review and may cancel lower-priority requests.",
                        "Notifying existing bookers is recommended.");
            }
        }

        return RuleResult.pass(
                ValidationRule.PRIORITY_CONFLICT,
                "Priority Conflict",
                "No priority conflicts found for this slot.");
    }
}
