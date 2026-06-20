package com.smartcampus.service;

import com.smartcampus.dto.auth.*;
import com.smartcampus.dto.user.UserProfileResponse;
import com.smartcampus.exception.SmartCampusException;
import com.smartcampus.model.User;
import com.smartcampus.model.enums.OtpPurpose;
import com.smartcampus.model.enums.Role;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.security.CustomUserDetailsService;
import com.smartcampus.security.JwtService;
import com.smartcampus.util.GraduationYearCalculator;
import com.smartcampus.util.RegisterNumberValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service @RequiredArgsConstructor @Slf4j
public class AuthService {

    private final UserRepository           userRepository;
    private final PasswordEncoder          passwordEncoder;
    private final JwtService               jwtService;
    private final OtpService               otpService;
    private final EmailService             emailService;
    private final AuthenticationManager    authManager;
    private final CustomUserDetailsService userDetailsService;
    private final RegisterNumberValidator  rnValidator;
    private final GraduationYearCalculator gradCalc;

    @Transactional
    public void register(RegisterRequest req) {
        if (req.getRole() == Role.HOD || req.getRole() == Role.ADMIN)
            throw new SmartCampusException.ForbiddenException("HOD and Admin accounts must be created by an administrator.");

        if (userRepository.existsByEmail(req.getEmail()))
            throw new SmartCampusException.ConflictException("An account with this email already exists.");

        Integer graduationYear = null;

        if (req.getRole() == Role.STUDENT) {
            if (req.getRegisterNumber() == null || req.getRegisterNumber().isBlank())
                throw new SmartCampusException.BadRequestException("Register number is required for student registration.");
            if (req.getYearOfStudy() == null)
                throw new SmartCampusException.BadRequestException("Year of study is required for student registration.");

            String normalized = rnValidator.normalize(req.getRegisterNumber());
            var vr = rnValidator.validate(normalized);
            if (!vr.valid()) throw new SmartCampusException.BadRequestException(vr.message());

            if (vr.joinYear() != null && !gradCalc.isConsistent(vr.joinYear(), req.getYearOfStudy()))
                throw new SmartCampusException.BadRequestException(
                    "Register number joining year does not match the declared year of study.");

            if (userRepository.existsByRegisterNumber(normalized))
                throw new SmartCampusException.ConflictException("This register number is already linked to an account.");

            graduationYear = vr.joinYear() != null
                ? gradCalc.calculateFromJoinYear(vr.joinYear(), req.getYearOfStudy())
                : gradCalc.calculate(req.getYearOfStudy());

            req.setRegisterNumber(normalized);
        }

        User user = User.builder()
            .fullName(req.getFullName())
            .email(req.getEmail().toLowerCase().trim())
            .password(passwordEncoder.encode(req.getPassword()))
            .role(req.getRole())
            .departmentName(req.getDepartmentName())
            .phoneNumber(req.getPhoneNumber())
            .registerNumber(req.getRole() == Role.STUDENT ? req.getRegisterNumber() : null)
            .yearOfStudy(req.getRole() == Role.STUDENT ? req.getYearOfStudy() : null)
            .graduationYear(graduationYear)
            .isVerified(false).isActive(true).build();

        userRepository.save(user);
        log.info("Registered {} : {}", user.getRole(), user.getEmail());
        otpService.sendOtp(user.getEmail(), user.getFullName(), OtpPurpose.REGISTRATION);
    }

    @Transactional
    public AuthResponse verifyOtp(OtpVerifyRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
            .orElseThrow(() -> new SmartCampusException.NotFoundException("No account found with this email."));
        if (user.getIsVerified())
            throw new SmartCampusException.BadRequestException("Account already verified. Please log in.");
        otpService.verifyOtp(req.getEmail(), req.getOtp(), OtpPurpose.REGISTRATION);
        user.setIsVerified(true);
        userRepository.save(user);
        emailService.sendWelcome(user.getEmail(), user.getFullName(), user.getRole().name());
        log.info("Verified: {}", user.getEmail());
        return buildAuthResponse(user);
    }

    @Transactional
    public void resendOtp(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new SmartCampusException.NotFoundException("No account found with this email."));
        if (user.getIsVerified())
            throw new SmartCampusException.BadRequestException("Account already verified.");
        otpService.sendOtp(email, user.getFullName(), OtpPurpose.REGISTRATION);
    }

    @Transactional
    public AuthResponse login(LoginRequest req) {
        authManager.authenticate(new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
        User user = userRepository.findByEmail(req.getEmail())
            .orElseThrow(() -> new SmartCampusException.NotFoundException("User not found."));
        userRepository.updateLastLogin(user.getId(), LocalDateTime.now());
        log.info("Login: {} [{}]", user.getEmail(), user.getRole());
        return buildAuthResponse(user);
    }

    public Map<String, Object> validateRegisterNumber(String rn) {
        var vr = rnValidator.validate(rn);
        Map<String, Object> result = new HashMap<>();
        result.put("valid",     vr.valid());
        result.put("message",   vr.message());
        result.put("joinYear",  vr.joinYear());
        result.put("available", vr.valid() && !userRepository.existsByRegisterNumber(rnValidator.normalize(rn)));
        return result;
    }

    public UserProfileResponse getProfile(String email) {
        return UserProfileResponse.from(userRepository.findByEmail(email)
            .orElseThrow(() -> new SmartCampusException.NotFoundException("User not found.")));
    }

    private AuthResponse buildAuthResponse(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role",     user.getRole().name());
        claims.put("userId",   user.getId());
        claims.put("fullName", user.getFullName());
        UserDetails ud = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateTokenWithClaims(user.getEmail(), claims);
        return AuthResponse.builder()
            .accessToken(token)
            .userId(user.getId()).fullName(user.getFullName()).email(user.getEmail())
            .role(user.getRole()).departmentName(user.getDepartmentName())
            .yearOfStudy(user.getYearOfStudy()).graduationYear(user.getGraduationYear())
            .registerNumber(user.getRegisterNumber()).isVerified(user.getIsVerified()).build();
    }
}
