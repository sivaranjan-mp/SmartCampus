package com.smartcampus.dto.user;

import com.smartcampus.model.User;
import com.smartcampus.model.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {

    private Long          id;
    private String        fullName;
    private String        email;
    private String        registerNumber;
    private Role          role;
    private String        departmentName;
    private Integer       yearOfStudy;
    private Integer       graduationYear;
    private String        phoneNumber;
    private String        profileImageUrl;
    private Boolean       isVerified;
    private Boolean       isActive;
    private LocalDateTime lastLoginAt;
    private LocalDateTime createdAt;

    public static UserProfileResponse from(User u) {
        return UserProfileResponse.builder()
                .id(u.getId())
                .fullName(u.getFullName())
                .email(u.getEmail())
                .registerNumber(u.getRegisterNumber())
                .role(u.getRole())
                .departmentName(u.getDepartmentName())
                .yearOfStudy(u.getYearOfStudy())
                .graduationYear(u.getGraduationYear())
                .phoneNumber(u.getPhoneNumber())
                .profileImageUrl(u.getProfileImageUrl())
                .isVerified(u.getIsVerified())
                .isActive(u.getIsActive())
                .lastLoginAt(u.getLastLoginAt())
                .createdAt(u.getCreatedAt())
                .build();
    }
}
