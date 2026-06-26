package com.smartcampus.service;

import com.smartcampus.dto.resource.ResourceRequest;
import com.smartcampus.dto.resource.ResourceResponse;
import com.smartcampus.dto.resource.ResourceStatsResponse;
import com.smartcampus.exception.SmartCampusException;
import com.smartcampus.model.Department;
import com.smartcampus.model.Resource;
import com.smartcampus.model.User;
import com.smartcampus.model.enums.ApprovalAuthority;
import com.smartcampus.model.enums.ResourceCategory;
import com.smartcampus.model.enums.ResourceScope;
import com.smartcampus.repository.DepartmentRepository;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ResourceService {

    private final ResourceRepository   resourceRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository       userRepository;

    // ─────────────────────────────────────────────────────────────────────────
    //  Stats
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public ResourceStatsResponse getStats() {
        Map<String, Long> byCategory = new LinkedHashMap<>();
        resourceRepository.countByEachCategory()
                .forEach(row -> byCategory.put(row[0].toString(), (Long) row[1]));

        Map<String, Long> byScope = new LinkedHashMap<>();
        byScope.put("COMMON",     resourceRepository.countByScope(ResourceScope.COMMON));
        byScope.put("DEPARTMENT", resourceRepository.countByScope(ResourceScope.DEPARTMENT));

        return ResourceStatsResponse.builder()
                .totalResources(resourceRepository.count())
                .activeResources(resourceRepository.countByIsActiveTrue())
                .inactiveResources(resourceRepository.countByIsActiveFalse())
                .underMaintenance(resourceRepository.countByIsUnderMaintenanceTrue())
                .commonResources(resourceRepository.countByScope(ResourceScope.COMMON))
                .departmentResources(resourceRepository.countByScope(ResourceScope.DEPARTMENT))
                .byCategory(byCategory)
                .byScope(byScope)
                .build();
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Search / list
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<ResourceResponse> search(
            String search, ResourceCategory category, ResourceScope scope,
            ApprovalAuthority approvalAuthority, Long departmentId,
            Boolean isActive, int page, int size, String sortBy, String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);

        return resourceRepository.search(
                blankToNull(search), category, scope,
                approvalAuthority, departmentId, isActive, pageable)
                .map(ResourceResponse::from);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Get one
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public ResourceResponse getById(Long id) {
        return ResourceResponse.from(findOrThrow(id));
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Create
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional
    public ResourceResponse create(ResourceRequest req, String creatorEmail) {
        validateRequest(req, null);

        Department dept = resolveOwnerDepartment(req);
        User       creator = userRepository.findByEmail(creatorEmail).orElse(null);

        String normalizedCode = req.getResourceCode().trim().toUpperCase();

        ApprovalAuthority authority = resolveAuthority(req, dept);

        Resource resource = Resource.builder()
                .name(req.getName().trim())
                .resourceCode(normalizedCode)
                .category(req.getCategory())
                .scope(req.getScope())
                .departmentOwner(dept)
                .approvalAuthority(authority)
                .capacity(req.getCapacity())
                .location(req.getLocation())
                .floorNumber(req.getFloorNumber())
                .buildingName(req.getBuildingName())
                .description(req.getDescription())
                .amenities(req.getAmenities())
                .imageUrl(req.getImageUrl())
                .availableFrom(req.getAvailableFrom())
                .availableTo(req.getAvailableTo())
                .availableDays(req.getAvailableDays())
                .minAdvanceDays(req.getMinAdvanceDays())
                .maxAdvanceDays(req.getMaxAdvanceDays())
                .maxBookingHours(req.getMaxBookingHours())
                .bufferDaysBefore(req.getBufferDaysBefore())
                .bufferDaysAfter(req.getBufferDaysAfter())
                .createdBy(creator)
                .isActive(true)
                .isUnderMaintenance(false)
                .build();

        Resource saved = resourceRepository.save(resource);
        log.info("Resource created: {} [{}] by {}", saved.getName(), saved.getResourceCode(), creatorEmail);
        return ResourceResponse.from(saved);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Update
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional
    public ResourceResponse update(Long id, ResourceRequest req, String editorEmail) {
        Resource resource = findOrThrow(id);
        validateRequest(req, id);

        Department dept      = resolveOwnerDepartment(req);
        ApprovalAuthority authority = resolveAuthority(req, dept);

        resource.setName(req.getName().trim());
        resource.setResourceCode(req.getResourceCode().trim().toUpperCase());
        resource.setCategory(req.getCategory());
        resource.setScope(req.getScope());
        resource.setDepartmentOwner(dept);
        resource.setApprovalAuthority(authority);
        resource.setCapacity(req.getCapacity());
        resource.setLocation(req.getLocation());
        resource.setFloorNumber(req.getFloorNumber());
        resource.setBuildingName(req.getBuildingName());
        resource.setDescription(req.getDescription());
        resource.setAmenities(req.getAmenities());
        resource.setImageUrl(req.getImageUrl());
        resource.setAvailableFrom(req.getAvailableFrom());
        resource.setAvailableTo(req.getAvailableTo());
        resource.setAvailableDays(req.getAvailableDays());
        resource.setMinAdvanceDays(req.getMinAdvanceDays());
        resource.setMaxAdvanceDays(req.getMaxAdvanceDays());
        resource.setMaxBookingHours(req.getMaxBookingHours());
        resource.setBufferDaysBefore(req.getBufferDaysBefore());
        resource.setBufferDaysAfter(req.getBufferDaysAfter());

        Resource saved = resourceRepository.save(resource);
        log.info("Resource updated: {} by {}", id, editorEmail);
        return ResourceResponse.from(saved);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Delete
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional
    public void delete(Long id) {
        Resource resource = findOrThrow(id);
        // Soft-check: don't delete if there are pending bookings (to be enforced once
        // the bookings module is added — placeholder hook here).
        resourceRepository.delete(resource);
        log.info("Resource deleted: {}", id);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Status toggles
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional
    public ResourceResponse toggleActive(Long id) {
        Resource r = findOrThrow(id);
        r.setIsActive(!r.getIsActive());
        return ResourceResponse.from(resourceRepository.save(r));
    }

    @Transactional
    public ResourceResponse toggleMaintenance(Long id) {
        Resource r = findOrThrow(id);
        r.setIsUnderMaintenance(!r.getIsUnderMaintenance());
        // When entering maintenance mode also deactivate to block new bookings
        if (r.getIsUnderMaintenance()) r.setIsActive(false);
        return ResourceResponse.from(resourceRepository.save(r));
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Private helpers
    // ─────────────────────────────────────────────────────────────────────────

    private Resource findOrThrow(Long id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new SmartCampusException.NotFoundException(
                        "Resource not found with id: " + id));
    }

    private void validateRequest(ResourceRequest req, Long excludeId) {
        // Code uniqueness
        String code = req.getResourceCode().trim().toUpperCase();
        if (excludeId == null) {
            if (resourceRepository.existsByResourceCode(code))
                throw new SmartCampusException.ConflictException(
                        "Resource code '" + code + "' is already in use.");
        } else {
            if (resourceRepository.codeExistsForOtherId(code, excludeId))
                throw new SmartCampusException.ConflictException(
                        "Resource code '" + code + "' is already used by another resource.");
        }

        // Department scope requires a department
        if (req.getScope() == ResourceScope.DEPARTMENT && req.getDepartmentOwnerId() == null)
            throw new SmartCampusException.BadRequestException(
                    "A department owner is required for DEPARTMENT-scoped resources.");

        // Time ordering
        if (req.getAvailableFrom() != null && req.getAvailableTo() != null
                && !req.getAvailableFrom().isBefore(req.getAvailableTo()))
            throw new SmartCampusException.BadRequestException(
                    "Available-from time must be before available-to time.");

        // Advance days ordering
        if (req.getMinAdvanceDays() > req.getMaxAdvanceDays())
            throw new SmartCampusException.BadRequestException(
                    "Minimum advance days cannot exceed maximum advance days.");

        // Available days format check
        if (req.getAvailableDays() != null && !req.getAvailableDays().isBlank()) {
            String[] valid = {"MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"};
            for (String day : req.getAvailableDays().split(",")) {
                if (Arrays.stream(valid).noneMatch(v -> v.equalsIgnoreCase(day.trim())))
                    throw new SmartCampusException.BadRequestException(
                            "Invalid day code '" + day.trim() + "'. Use MON,TUE,WED,THU,FRI,SAT,SUN.");
            }
        }
    }

    private Department resolveOwnerDepartment(ResourceRequest req) {
        if (req.getScope() != ResourceScope.DEPARTMENT || req.getDepartmentOwnerId() == null)
            return null;
        return departmentRepository.findById(req.getDepartmentOwnerId())
                .orElseThrow(() -> new SmartCampusException.NotFoundException(
                        "Department not found with id: " + req.getDepartmentOwnerId()));
    }

    /**
     * If the admin explicitly set an authority, use it.
     * Otherwise derive from scope: DEPARTMENT → HOD, COMMON → ADMIN.
     */
    private ApprovalAuthority resolveAuthority(ResourceRequest req, Department dept) {
        if (req.getApprovalAuthority() != null) return req.getApprovalAuthority();
        return (dept != null) ? ApprovalAuthority.HOD : ApprovalAuthority.ADMIN;
    }

    private String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }
}
