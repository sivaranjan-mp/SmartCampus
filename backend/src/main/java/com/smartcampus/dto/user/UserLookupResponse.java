package com.smartcampus.dto.user;

import com.smartcampus.model.User;
import com.smartcampus.model.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Minimal, non-sensitive projection of a {@link User} for use in
 * people-pickers (e.g. selecting a coordinator or supporting faculty
 * member while creating a booking).
 *
 * Deliberately excludes phone number, register number, verification/active
 * flags, and timestamps — fields that are fine for {@code UserProfileResponse}
 * (admin-only) but should not be broadcast to every authenticated user
 * just to populate a dropdown.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserLookupResponse {

    private Long   id;
    private String fullName;
    private String email;
    private Role   role;
    private String departmentName;

    public static UserLookupResponse from(User u) {
        return UserLookupResponse.builder()
                .id(u.getId())
                .fullName(u.getFullName())
                .email(u.getEmail())
                .role(u.getRole())
                .departmentName(u.getDepartmentName())
                .build();
    }
}
