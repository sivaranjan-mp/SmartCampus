package com.smartcampus.dto.auth;

import com.smartcampus.model.enums.Role;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {

    /* ── Personal info ─────────────────────────────────────── */

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Name must be 2–100 characters")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email address")
    private String email;

    @Pattern(
        regexp = "^[0-9]{10}$",
        message = "Phone number must be exactly 10 digits"
    )
    private String phoneNumber;

    /* ── Academic info ─────────────────────────────────────── */

    @NotNull(message = "Role is required")
    private Role role;

    @NotBlank(message = "Department is required")
    @Size(max = 150, message = "Department name too long")
    private String departmentName;

    /** Required only when role == STUDENT */
    private String registerNumber;

    /**
     * Year of study 1–4.  Required only when role == STUDENT.
     */
    @Min(value = 1, message = "Year of study must be between 1 and 4")
    @Max(value = 4, message = "Year of study must be between 1 and 4")
    private Integer yearOfStudy;

    /* ── Security ──────────────────────────────────────────── */

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
        message = "Password must contain uppercase, lowercase, digit and special character"
    )
    private String password;
}
