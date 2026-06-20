package com.smartcampus.dto;

import com.smartcampus.model.enums.Role;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CreateManagedUserRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100)
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotNull(message = "Role is required")
    private Role role;   // Only HOD or FACULTY allowed here

    @NotBlank(message = "Department is required")
    private String department;

    @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be 10 digits")
    private String phoneNumber;
}
