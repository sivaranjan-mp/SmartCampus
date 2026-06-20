package com.smartcampus.dto.auth;

import com.smartcampus.model.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String  accessToken;

    @Builder.Default
    private String  tokenType      = "Bearer";

    private Long    userId;
    private String  fullName;
    private String  email;
    private Role    role;
    private String  departmentName;
    private Integer yearOfStudy;
    private Integer graduationYear;
    private String  registerNumber;
    private Boolean isVerified;
}
