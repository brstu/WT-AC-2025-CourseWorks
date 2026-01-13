package com.microshop.config;

import com.microshop.model.User;
import com.microshop.repository.UserRepository;
import com.microshop.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class StartupTokenLogger implements CommandLineRunner {
    
    private final UserRepository userRepository;
    private final JwtTokenProvider tokenProvider;
    
    @Override
    public void run(String... args) {
        log.info("========================================");
        log.info("Test User Tokens for API Testing:");
        log.info("========================================");
        
        // Admin token
        userRepository.findByEmail("admin@microshop.com").ifPresent(user -> {
            String token = tokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());
            log.info("Admin Token (admin@microshop.com / admin123):");
            log.info("Bearer {}", token);
        });
        
        // User token
        userRepository.findByEmail("user@microshop.com").ifPresent(user -> {
            String token = tokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());
            log.info("User Token (user@microshop.com / user123):");
            log.info("Bearer {}", token);
        });
        
        log.info("========================================");
    }
}
