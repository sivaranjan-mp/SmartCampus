package com.smartcampus.dto.approval;

import com.smartcampus.model.enums.ValidationRule;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ValidationReport {

    private boolean passed;            // true only if ALL blocking checks pass
    private String  summary;

    @Builder.Default
    private List<RuleResult> results = new ArrayList<>();

    public void addResult(RuleResult result) {
        results.add(result);
        if (!result.isPassed() && result.isMandatory()) passed = false;
    }

    public static ValidationReport passing() {
        return ValidationReport.builder().passed(true).summary("All validation checks passed.").build();
    }

    // ─────────────────────────────────────────────────────────────────────
    //  Nested: one entry per validation rule
    // ─────────────────────────────────────────────────────────────────────

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class RuleResult {

        private ValidationRule rule;
        private String         label;       // Human-readable rule name
        private boolean        passed;
        private boolean        mandatory;   // false = warning only
        private String         message;     // Detail message shown to approver
        private String         suggestion;  // Optional remediation hint
        private Object         metadata;    // Extra data (conflicting bookings, etc.)

        public static RuleResult pass(ValidationRule rule, String label, String message) {
            return RuleResult.builder()
                    .rule(rule).label(label).passed(true)
                    .mandatory(true).message(message).build();
        }

        public static RuleResult fail(ValidationRule rule, String label,
                                      String message, String suggestion, boolean mandatory) {
            return RuleResult.builder()
                    .rule(rule).label(label).passed(false)
                    .mandatory(mandatory).message(message).suggestion(suggestion).build();
        }

        public static RuleResult warn(ValidationRule rule, String label,
                                      String message, String suggestion) {
            return fail(rule, label, message, suggestion, false);
        }
    }
}
