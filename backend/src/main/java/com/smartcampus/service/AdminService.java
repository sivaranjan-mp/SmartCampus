package com.smartcampus.service;

import com.smartcampus.dto.AdminDashboardStats;
import com.smartcampus.dto.CreateManagedUserRequest;
import com.smartcampus.dto.DepartmentRequest;
import com.smartcampus.dto.DepartmentResponse;
import com.smartcampus.dto.resource.ResourceRequest;
import com.smartcampus.dto.resource.ResourceResponse;
import com.smartcampus.dto.UpdateUserStatusRequest;
import com.smartcampus.dto.common.ApiResponse;
import com.smartcampus.dto.user.UserProfileResponse;
import com.smartcampus.exception.SmartCampusException;
import com.smartcampus.model.Department;
import com.smartcampus.model.Resource;
import com.smartcampus.model.User;
import com.smartcampus.model.enums.ResourceScope;
import com.smartcampus.model.enums.ResourceCategory;
import com.smartcampus.model.enums.Role;
import com.smartcampus.repository.DepartmentRepository;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final ResourceRepository resourceRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    // ─────────────────────────────────────────────
    //  Dashboard Stats
    // ─────────────────────────────────────────────

    public AdminDashboardStats getDashboardStats() {
        return AdminDashboardStats.builder()
                .totalStudents(userRepository.countByRole(Role.STUDENT))
                .totalFaculty(userRepository.countByRole(Role.FACULTY))
                .totalHods(userRepository.countByRole(Role.HOD))
                .totalAdmins(userRepository.countByRole(Role.ADMIN))
                .totalUsers(userRepository.count())
                .totalDepartments(departmentRepository.count())
                .activeDepartments(departmentRepository.countByIsActiveTrue())
                .totalResources(resourceRepository.count())
                .activeResources(resourceRepository.countByIsActiveTrue())
                .commonResources(resourceRepository.countByScope(ResourceScope.COMMON))
                .departmentResources(resourceRepository.countByScope(ResourceScope.DEPARTMENT))
                .resourcesUnderMaintenance(resourceRepository.countByIsUnderMaintenanceTrue())
                .build();
    }

    // ─────────────────────────────────────────────
    //  User Management
    // ─────────────────────────────────────────────

    public Page<UserProfileResponse> getAllUsers(String search, Role role, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return userRepository.searchUsers(search, role, pageable)
                .map(UserProfileResponse::from);
    }

    public UserProfileResponse getUserById(Long userId) {
        return UserProfileResponse.from(
                userRepository.findById(userId)
                        .orElseThrow(() -> new SmartCampusException.NotFoundException(
                                "User not found with id: " + userId)));
    }

    @Transactional
    public UserProfileResponse createManagedUser(CreateManagedUserRequest request) {
        if (request.getRole() == Role.STUDENT) {
            throw new SmartCampusException.BadRequestException(
                    "Students must self-register. Use this endpoint for FACULTY or HOD only.");
        }
        if (request.getRole() == Role.ADMIN) {
            throw new SmartCampusException.ForbiddenException(
                    "Admin accounts cannot be created via this endpoint.");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new SmartCampusException.ConflictException(
                    "An account with this email already exists.");
        }

        String tempPassword = "Campus@" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(tempPassword))
                .role(request.getRole())
                .departmentName(request.getDepartment())
                .phoneNumber(request.getPhoneNumber())
                .isVerified(true)
                .isActive(true)
                .build();

        userRepository.save(user);
        emailService.sendManagedUserWelcomeEmail(user.getEmail(), user.getFullName(),
                user.getRole().name(), tempPassword);
        log.info("Admin created managed user: {} [{}]", user.getEmail(), user.getRole());
        return UserProfileResponse.from(user);
    }

    @Transactional
    public UserProfileResponse updateUserStatus(Long userId, UpdateUserStatusRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new SmartCampusException.NotFoundException("User not found."));

        if (request.getIsActive() != null) user.setIsActive(request.getIsActive());
        if (request.getIsVerified() != null) user.setIsVerified(request.getIsVerified());

        userRepository.save(user);
        log.info("Admin updated status of user {}: active={}, verified={}",
                userId, user.getIsActive(), user.getIsVerified());
        return UserProfileResponse.from(user);
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new SmartCampusException.NotFoundException("User not found."));
        if (user.getRole() == Role.ADMIN) {
            throw new SmartCampusException.ForbiddenException("Admin accounts cannot be deleted.");
        }
        userRepository.delete(user);
        log.info("Admin deleted user: {}", userId);
    }

    // ─────────────────────────────────────────────
    //  Department Management
    // ─────────────────────────────────────────────

    public Page<DepartmentResponse> getAllDepartments(String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        return departmentRepository.searchDepartments(search, pageable)
                .map(dept -> {
                    DepartmentResponse resp = DepartmentResponse.from(dept);
                    resp.setResourceCount(resourceRepository.countByDepartmentIdAndIsActiveTrue(dept.getId()));
                    resp.setUserCount(userRepository.countByDepartmentName(dept.getName()));
                    return resp;
                });
    }

    public List<DepartmentResponse> getActiveDepartments() {
        return departmentRepository.findAllByIsActiveTrueOrderByNameAsc()
                .stream().map(DepartmentResponse::from).collect(Collectors.toList());
    }

    public DepartmentResponse getDepartmentById(Long id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new SmartCampusException.NotFoundException(
                        "Department not found with id: " + id));
        DepartmentResponse resp = DepartmentResponse.from(dept);
        resp.setResourceCount(resourceRepository.countByDepartmentIdAndIsActiveTrue(id));
        resp.setUserCount(userRepository.countByDepartmentName(dept.getName()));
        return resp;
    }

    @Transactional
    public DepartmentResponse createDepartment(DepartmentRequest request) {
        if (departmentRepository.existsByName(request.getName())) {
            throw new SmartCampusException.ConflictException(
                    "Department with this name already exists.");
        }
        if (departmentRepository.existsByCode(request.getCode())) {
            throw new SmartCampusException.ConflictException(
                    "Department with this code already exists.");
        }

        Department dept = Department.builder()
                .name(request.getName())
                .code(request.getCode())
                .description(request.getDescription())
                .hodName(request.getHodName())
                .hodEmail(request.getHodEmail())
                .isActive(true)
                .build();

        Department saved = departmentRepository.save(dept);
        log.info("Department created: {} [{}]", saved.getName(), saved.getCode());
        return DepartmentResponse.from(saved);
    }

    @Transactional
    public DepartmentResponse updateDepartment(Long id, DepartmentRequest request) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new SmartCampusException.NotFoundException(
                        "Department not found with id: " + id));

        if (!dept.getName().equals(request.getName()) &&
                departmentRepository.existsByName(request.getName())) {
            throw new SmartCampusException.ConflictException("Department name already in use.");
        }
        if (!dept.getCode().equals(request.getCode()) &&
                departmentRepository.existsByCode(request.getCode())) {
            throw new SmartCampusException.ConflictException("Department code already in use.");
        }

        dept.setName(request.getName());
        dept.setCode(request.getCode());
        dept.setDescription(request.getDescription());
        dept.setHodName(request.getHodName());
        dept.setHodEmail(request.getHodEmail());

        return DepartmentResponse.from(departmentRepository.save(dept));
    }

    @Transactional
    public void toggleDepartmentStatus(Long id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new SmartCampusException.NotFoundException(
                        "Department not found with id: " + id));
        dept.setIsActive(!dept.getIsActive());
        departmentRepository.save(dept);
    }
}
