package com.smartcampus.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class DepartmentRequest {

    @NotBlank(message = "Department name is required")
    @Size(min = 3, max = 150)
    private String name;

    @NotBlank(message = "Department code is required")
    @Size(min = 2, max = 20)
    @Pattern(regexp = "^[A-Z0-9_-]+$", message = "Code must be uppercase alphanumeric")
    private String code;

    @Size(max = 500)
    private String description;

    private String hodName;

    private String hodEmail;
}
