package com.smartcampus.controller;

import com.smartcampus.dto.common.ApiResponse;
import com.smartcampus.dto.resource.ResourceResponse;
import com.smartcampus.dto.user.UserLookupResponse;
import com.smartcampus.model.enums.Role;
import com.smartcampus.model.enums.ResourceCategory;
import com.smartcampus.model.enums.ResourceScope;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.service.ResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Read-only endpoints available to any authenticated user (not just admins).
 *
 * These exist because the booking flow (resource picker, coordinator/faculty
 * picker) needs to read active resources and look up people, but should not
 * require admin privileges to do so. Admin-only CRUD on resources/users still
 * lives in {@link ResourceController} (/admin/resources) and
 * {@link AdminController} (/admin/users) respectively.
 */
@RestController
@RequiredArgsConstructor
public class UserController {

    private final ResourceService  resourceService;
    private final UserRepository   userRepository;

    private static final int MAX_LOOKUP_SIZE = 50;

    /* ── Active, bookable resources ───────────────────────────────────── */

    @GetMapping("/resources")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Page<ResourceResponse>>> browseResources(
            @RequestParam(required = false) String           search,
            @RequestParam(required = false) ResourceCategory  category,
            @RequestParam(required = false) ResourceScope     scope,
            @RequestParam(required = false) Long              departmentId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {

        int safeSize = Math.min(size, 100);

        // Non-admin callers may only browse active resources; approvalAuthority
        // and isActive are pinned regardless of what's requested, so this
        // endpoint can never be used to find inactive/maintenance resources
        // or filter on fields irrelevant to a booker.
        Page<ResourceResponse> result = resourceService.search(
                search, category, scope, null, departmentId,
                true, page, safeSize, "name", "asc");

        return ResponseEntity.ok(ApiResponse.success("Resources fetched.", result));
    }

    /* ── People lookup (coordinators / supporting faculty) ───────────────── */

    @GetMapping("/users/lookup")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Page<UserLookupResponse>>> lookupUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Role   role,
            @RequestParam(defaultValue = "0")  int  page,
            @RequestParam(defaultValue = "20") int  size) {

        // A blank/very short search is rejected to avoid handing back a
        // browsable directory of the entire user base to any logged-in user.
        if (search == null || search.trim().length() < 2) {
            return ResponseEntity.ok(ApiResponse.success(
                    "Provide at least 2 characters to search.", Page.<UserLookupResponse>empty()));
        }

        int safeSize = Math.min(size, MAX_LOOKUP_SIZE);
        Pageable pageable = PageRequest.of(page, safeSize);

        Page<UserLookupResponse> result = userRepository
                .searchUsers(search.trim(), role, pageable)
                .map(UserLookupResponse::from);

        return ResponseEntity.ok(ApiResponse.success("Users fetched.", result));
    }
}
