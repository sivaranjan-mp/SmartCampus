package com.smartcampus.config;

import com.smartcampus.model.User;
import com.smartcampus.model.enums.Role;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            log.info("Database is empty. Seeding initial admin user...");
            User admin = User.builder()
                    .fullName("System Administrator")
                    .email("admin@smartcampus.edu")
                    .password(passwordEncoder.encode("Admin@1234"))
                    .role(Role.ADMIN)
                    .departmentName("Administration")
                    .phoneNumber("9000000000")
                    .isVerified(true)
                    .isActive(true)
                    .build();
            userRepository.save(admin);
            log.info("Initial admin user seeded successfully.");
        }
    }
}
