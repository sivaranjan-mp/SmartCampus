package com.smartcampus.controller;

import com.smartcampus.dto.common.ApiResponse;
import com.smartcampus.dto.resource.ResourceRequest;
import com.smartcampus.dto.resource.ResourceResponse;
import com.smartcampus.dto.resource.ResourceStatsResponse;
import com.smartcampus.model.enums.ApprovalAuthority;
import com.smartcampus.model.enums.ResourceCategory;
import com.smartcampus.model.enums.ResourceScope;
import com.smartcampus.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/resources")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    /* ── Stats ──────────────────────────────────────────────────────────── */

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<ResourceStatsResponse>> getStats() {
        return ResponseEntity.ok(
                ApiResponse.success("Resource statistics.", resourceService.getStats()));
    }

    /* ── Search / list ──────────────────────────────────────────────────── */

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ResourceResponse>>> search(
            @RequestParam(required = false)                     String            search,
            @RequestParam(required = false)                     ResourceCategory  category,
            @RequestParam(required = false)                     ResourceScope     scope,
            @RequestParam(required = false)                     ApprovalAuthority approvalAuthority,
            @RequestParam(required = false)                     Long              departmentId,
            @RequestParam(required = false)                     Boolean           isActive,
            @RequestParam(defaultValue = "0")                   int               page,
            @RequestParam(defaultValue = "10")                  int               size,
            @RequestParam(defaultValue = "createdAt")           String            sortBy,
            @RequestParam(defaultValue = "desc")                String            sortDir) {

        Page<ResourceResponse> result = resourceService.search(
                search, category, scope, approvalAuthority, departmentId,
                isActive, page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success("Resources fetched.", result));
    }

    /* ── Get one ────────────────────────────────────────────────────────── */

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ResourceResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("Resource fetched.", resourceService.getById(id)));
    }

    /* ── Create ─────────────────────────────────────────────────────────── */

    @PostMapping
    public ResponseEntity<ApiResponse<ResourceResponse>> create(
            @Valid @RequestBody ResourceRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        ResourceResponse created = resourceService.create(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Resource created successfully.", created));
    }

    /* ── Update ─────────────────────────────────────────────────────────── */

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ResourceResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody ResourceRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        ResourceResponse updated = resourceService.update(id, request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Resource updated successfully.", updated));
    }

    /* ── Delete ─────────────────────────────────────────────────────────── */

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        resourceService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Resource deleted successfully."));
    }

    /* ── Status toggles ─────────────────────────────────────────────────── */

    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<ApiResponse<ResourceResponse>> toggleActive(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                "Resource active status toggled.", resourceService.toggleActive(id)));
    }

    @PatchMapping("/{id}/toggle-maintenance")
    public ResponseEntity<ApiResponse<ResourceResponse>> toggleMaintenance(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                "Resource maintenance status toggled.", resourceService.toggleMaintenance(id)));
    }
}
