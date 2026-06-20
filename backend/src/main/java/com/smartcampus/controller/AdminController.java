package com.smartcampus.controller;

import com.smartcampus.dto.AdminDashboardStats;
import com.smartcampus.dto.CreateManagedUserRequest;
import com.smartcampus.dto.DepartmentRequest;
import com.smartcampus.dto.DepartmentResponse;
import com.smartcampus.dto.resource.ResourceRequest;
import com.smartcampus.dto.resource.ResourceResponse;
import com.smartcampus.dto.UpdateUserStatusRequest;
import com.smartcampus.dto.common.ApiResponse;
import com.smartcampus.dto.user.UserProfileResponse;
import com.smartcampus.model.enums.ResourceScope;
import com.smartcampus.model.enums.ResourceCategory;
import com.smartcampus.model.enums.Role;
import com.smartcampus.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // ─────────────────────────────────────────
    //  Dashboard
    // ─────────────────────────────────────────

    @GetMapping("/dashboard/stats")
    public ResponseEntity<ApiResponse<AdminDashboardStats>> getDashboardStats() {
        return ResponseEntity.ok(ApiResponse.success("Dashboard stats.", adminService.getDashboardStats()));
    }

    // ─────────────────────────────────────────
    //  User Management
    // ─────────────────────────────────────────

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<UserProfileResponse>>> getAllUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Role role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return ResponseEntity.ok(ApiResponse.success(
                "Users fetched.", adminService.getAllUsers(search, role, page, size)));
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getUserById(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success("User fetched.", adminService.getUserById(userId)));
    }

    @PostMapping("/users")
    public ResponseEntity<ApiResponse<UserProfileResponse>> createManagedUser(
            @Valid @RequestBody CreateManagedUserRequest request) {
        UserProfileResponse user = adminService.createManagedUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User created successfully. Credentials emailed.", user));
    }

    @PatchMapping("/users/{userId}/status")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateUserStatus(
            @PathVariable Long userId,
            @RequestBody UpdateUserStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "User status updated.", adminService.updateUserStatus(userId, request)));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long userId) {
        adminService.deleteUser(userId);
        return ResponseEntity.ok(ApiResponse.success("User deleted."));
    }

    // ─────────────────────────────────────────
    //  Department Management
    // ─────────────────────────────────────────

    @GetMapping("/departments")
    public ResponseEntity<ApiResponse<Page<DepartmentResponse>>> getAllDepartments(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return ResponseEntity.ok(ApiResponse.success(
                "Departments fetched.", adminService.getAllDepartments(search, page, size)));
    }

    @GetMapping("/departments/active")
    public ResponseEntity<ApiResponse<List<DepartmentResponse>>> getActiveDepartments() {
        return ResponseEntity.ok(ApiResponse.success(
                "Active departments.", adminService.getActiveDepartments()));
    }

    @GetMapping("/departments/{id}")
    public ResponseEntity<ApiResponse<DepartmentResponse>> getDepartmentById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                "Department fetched.", adminService.getDepartmentById(id)));
    }

    @PostMapping("/departments")
    public ResponseEntity<ApiResponse<DepartmentResponse>> createDepartment(
            @Valid @RequestBody DepartmentRequest request) {
        DepartmentResponse dept = adminService.createDepartment(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Department created.", dept));
    }

    @PutMapping("/departments/{id}")
    public ResponseEntity<ApiResponse<DepartmentResponse>> updateDepartment(
            @PathVariable Long id, @Valid @RequestBody DepartmentRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Department updated.", adminService.updateDepartment(id, request)));
    }

    @PatchMapping("/departments/{id}/toggle-status")
    public ResponseEntity<ApiResponse<Void>> toggleDepartmentStatus(@PathVariable Long id) {
        adminService.toggleDepartmentStatus(id);
        return ResponseEntity.ok(ApiResponse.success("Department status toggled."));
    }

    // ─────────────────────────────────────────
}
