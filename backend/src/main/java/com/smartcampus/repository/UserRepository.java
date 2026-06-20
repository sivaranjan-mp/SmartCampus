package com.smartcampus.repository;

import com.smartcampus.model.User;
import com.smartcampus.model.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
    Optional<User> findByRegisterNumber(String registerNumber);
    boolean existsByEmail(String email);
    boolean existsByRegisterNumber(String registerNumber);
    long countByRole(Role role);

    @Query("SELECT COUNT(u) FROM User u WHERE LOWER(u.departmentName) = LOWER(:name)")
    long countByDepartmentName(String name);

    @Query("""
           SELECT u FROM User u WHERE
           (:search IS NULL
               OR LOWER(u.fullName)       LIKE LOWER(CONCAT('%',:search,'%'))
               OR LOWER(u.email)          LIKE LOWER(CONCAT('%',:search,'%'))
               OR LOWER(u.registerNumber) LIKE LOWER(CONCAT('%',:search,'%')))
           AND (:role IS NULL OR u.role = :role)
           """)
    Page<User> searchUsers(String search, Role role, Pageable pageable);

    @Modifying
    @Query("UPDATE User u SET u.lastLoginAt = :at WHERE u.id = :id")
    void updateLastLogin(Long id, LocalDateTime at);
}
