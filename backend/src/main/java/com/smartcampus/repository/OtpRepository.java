package com.smartcampus.repository;

import com.smartcampus.model.OtpVerification;
import com.smartcampus.model.enums.OtpPurpose;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OtpRepository extends JpaRepository<OtpVerification, Long> {

    Optional<OtpVerification> findTopByEmailAndPurposeAndIsUsedFalseOrderByCreatedAtDesc(
            String email, OtpPurpose purpose);

    Optional<OtpVerification> findTopByEmailAndPurposeOrderByCreatedAtDesc(
            String email, OtpPurpose purpose);

    @Modifying
    @Query("UPDATE OtpVerification o SET o.isUsed = true WHERE o.email = :email AND o.purpose = :purpose")
    void invalidateAll(String email, OtpPurpose purpose);

    @Modifying
    @Query("DELETE FROM OtpVerification o WHERE o.expiresAt < :now OR o.isUsed = true")
    void deleteExpiredAndUsed(LocalDateTime now);
}
