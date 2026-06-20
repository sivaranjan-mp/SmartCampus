package com.smartcampus.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardStats {

    private long totalStudents;
    private long totalFaculty;
    private long totalHods;
    private long totalAdmins;
    private long totalUsers;

    private long totalDepartments;
    private long activeDepartments;

    private long totalResources;
    private long activeResources;
    private long commonResources;
    private long departmentResources;
    private long resourcesUnderMaintenance;

    private long pendingApprovals;
}
