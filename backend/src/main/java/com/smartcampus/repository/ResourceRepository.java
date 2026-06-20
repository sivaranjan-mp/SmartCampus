package com.smartcampus.repository;

import com.smartcampus.model.Resource;
import com.smartcampus.model.enums.ApprovalAuthority;
import com.smartcampus.model.enums.ResourceCategory;
import com.smartcampus.model.enums.ResourceScope;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {

    boolean existsByResourceCode(String resourceCode);
    boolean existsByResourceCodeAndIdNot(String resourceCode, Long id);
    Optional<Resource> findByResourceCode(String resourceCode);

    @Query("""
           SELECT r FROM Resource r LEFT JOIN r.departmentOwner d WHERE
             (:search IS NULL
               OR LOWER(r.name)         LIKE LOWER(CONCAT('%',:search,'%'))
               OR LOWER(r.resourceCode) LIKE LOWER(CONCAT('%',:search,'%'))
               OR LOWER(r.location)     LIKE LOWER(CONCAT('%',:search,'%'))
               OR LOWER(r.buildingName) LIKE LOWER(CONCAT('%',:search,'%')))
             AND (:category          IS NULL OR r.category          = :category)
             AND (:scope             IS NULL OR r.scope             = :scope)
             AND (:approvalAuthority IS NULL OR r.approvalAuthority = :approvalAuthority)
             AND (:departmentId      IS NULL OR d.id                = :departmentId)
             AND (:isActive          IS NULL OR r.isActive          = :isActive)
           """)
    Page<Resource> search(
            @Param("search")            String            search,
            @Param("category")          ResourceCategory  category,
            @Param("scope")             ResourceScope     scope,
            @Param("approvalAuthority") ApprovalAuthority approvalAuthority,
            @Param("departmentId")      Long              departmentId,
            @Param("isActive")          Boolean           isActive,
            Pageable pageable);

    List<Resource> findAllByIsActiveTrueAndIsUnderMaintenanceFalseOrderByNameAsc();
    List<Resource> findByScopeAndIsActiveTrueAndIsUnderMaintenanceFalse(ResourceScope scope);
    List<Resource> findByDepartmentOwnerIdAndIsActiveTrueAndIsUnderMaintenanceFalse(Long departmentId);

    long countByIsActiveTrue();
    long countByIsActiveFalse();
    long countByIsUnderMaintenanceTrue();
    long countByScope(ResourceScope scope);
    long countByCategory(ResourceCategory category);
    long countByApprovalAuthority(ApprovalAuthority approvalAuthority);
    long countByDepartmentOwnerIdAndIsActiveTrue(Long departmentId);

    @Query("SELECT r.category AS cat, COUNT(r) AS cnt FROM Resource r GROUP BY r.category")
    List<Object[]> countByEachCategory();

    @Query("SELECT COUNT(r) > 0 FROM Resource r WHERE r.resourceCode = :code AND r.id != :id")
    boolean codeExistsForOtherId(@Param("code") String code, @Param("id") Long id);
}
