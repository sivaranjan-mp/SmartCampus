package com.smartcampus.controller;

import com.smartcampus.dto.auth.*;
import com.smartcampus.dto.common.ApiResponse;
import com.smartcampus.dto.user.UserProfileResponse;
import com.smartcampus.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> register(@Valid @RequestBody RegisterRequest req) {
        authService.register(req);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Registration successful. Please check your email for the verification OTP."));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyOtp(@Valid @RequestBody OtpVerifyRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Email verified successfully. Welcome to SmartCampus!", authService.verifyOtp(req)));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse<Void>> resendOtp(@Valid @RequestBody ResendOtpRequest req) {
        authService.resendOtp(req.getEmail());
        return ResponseEntity.ok(ApiResponse.success("A new OTP has been sent to your email address."));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Login successful.", authService.login(req)));
    }

    @GetMapping("/validate-register-number")
    public ResponseEntity<ApiResponse<Map<String, Object>>> validateRegisterNumber(@RequestParam String value) {
        return ResponseEntity.ok(ApiResponse.success("Validation complete.", authService.validateRegisterNumber(value)));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> me(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved.", authService.getProfile(ud.getUsername())));
    }
}
