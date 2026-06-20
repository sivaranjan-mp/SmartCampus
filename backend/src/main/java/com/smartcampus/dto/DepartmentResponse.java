package com.smartcampus.dto;

import com.smartcampus.model.Department;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentResponse {

    private Long id;
    private String name;
    private String code;
    private String description;
    private String hodName;
    private String hodEmail;
    private Boolean isActive;
    private long resourceCount;
    private long userCount;
    private LocalDateTime createdAt;

    public static DepartmentResponse from(Department dept) {
        return DepartmentResponse.builder()
                .id(dept.getId())
                .name(dept.getName())
                .code(dept.getCode())
                .description(dept.getDescription())
                .hodName(dept.getHodName())
                .hodEmail(dept.getHodEmail())
                .isActive(dept.getIsActive())
                .createdAt(dept.getCreatedAt())
                .build();
    }
}
