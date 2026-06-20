package com.smartcampus.repository;

import com.smartcampus.model.Department;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {

    boolean existsByName(String name);
    boolean existsByCode(String code);
    Optional<Department> findByCode(String code);
    Optional<Department> findByNameIgnoreCase(String name);
    List<Department> findAllByIsActiveTrueOrderByNameAsc();

    @Query("SELECT d FROM Department d WHERE "
         + "(:search IS NULL OR LOWER(d.name) LIKE LOWER(CONCAT('%',:search,'%')) "
         + "OR LOWER(d.code) LIKE LOWER(CONCAT('%',:search,'%')))")
    Page<Department> searchDepartments(String search, Pageable pageable);

    long countByIsActiveTrue();
}
