package com.smartcampus.service;

import com.smartcampus.exception.SmartCampusException;
import com.smartcampus.model.OtpVerification;
import com.smartcampus.model.enums.OtpPurpose;
import com.smartcampus.repository.OtpRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service @RequiredArgsConstructor @Slf4j
public class OtpService {

    private final OtpRepository otpRepository;
    private final EmailService  emailService;

    @Value("${app.otp.expiry-minutes:10}")          private int expiryMinutes;
    @Value("${app.otp.max-attempts:3}")             private int maxAttempts;
    @Value("${app.otp.resend-cooldown-seconds:60}") private int cooldownSeconds;
    private final SecureRandom rng = new SecureRandom();

    @Transactional
    public void sendOtp(String email, String name, OtpPurpose purpose) {
        otpRepository.findTopByEmailAndPurposeOrderByCreatedAtDesc(email, purpose).ifPresent(e -> {
            long elapsed = ChronoUnit.SECONDS.between(e.getCreatedAt(), LocalDateTime.now());
            if (elapsed < cooldownSeconds)
                throw new SmartCampusException.TooManyRequestsException(
                    "Please wait " + (cooldownSeconds - elapsed) + "s before requesting a new OTP.");
        });
        otpRepository.invalidateAll(email, purpose);
        String raw = String.format("%06d", 100000 + rng.nextInt(900000));
        otpRepository.save(OtpVerification.builder()
            .email(email).otp(raw).purpose(purpose)
            .expiresAt(LocalDateTime.now().plusMinutes(expiryMinutes)).build());
        if (purpose == OtpPurpose.REGISTRATION) emailService.sendRegistrationOtp(email, name, raw);
        else emailService.sendPasswordResetOtp(email, name, raw);
    }

    @Transactional
    public void verifyOtp(String email, String input, OtpPurpose purpose) {
        OtpVerification r = otpRepository
            .findTopByEmailAndPurposeAndIsUsedFalseOrderByCreatedAtDesc(email, purpose)
            .orElseThrow(() -> new SmartCampusException.BadRequestException("No active OTP found. Please request a new one."));
        if (r.getExpiresAt().isBefore(LocalDateTime.now()))
            throw new SmartCampusException.BadRequestException("OTP has expired. Please request a new one.");
        if (r.getAttemptCount() >= maxAttempts)
            throw new SmartCampusException.TooManyRequestsException("Too many attempts. Please request a new OTP.");
        r.setAttemptCount(r.getAttemptCount() + 1);
        if (!r.getOtp().equals(input.trim())) {
            otpRepository.save(r);
            int rem = maxAttempts - r.getAttemptCount();
            throw new SmartCampusException.BadRequestException(
                rem > 0 ? "Incorrect OTP. " + rem + " attempt(s) remaining."
                        : "Incorrect OTP. No attempts remaining. Please request a new OTP.");
        }
        r.setIsUsed(true);
        otpRepository.save(r);
    }

    @Scheduled(cron = "0 0 * * * *") @Transactional
    public void cleanup() { otpRepository.deleteExpiredAndUsed(LocalDateTime.now()); }
}
