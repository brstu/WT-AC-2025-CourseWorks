package com.microshop.controller;

import com.microshop.dto.AuthResponse;
import com.microshop.dto.LoginRequest;
import com.microshop.dto.RegisterRequest;
import com.microshop.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Authentication endpoints")
@RequiredArgsConstructor
@Slf4j
public class AuthController {
    
    private final AuthService authService;
    
    @PostMapping("/register")
    @Operation(summary = "Register a new user")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        log.info("POST /api/auth/register - email: {}", request.getEmail());
        try {
            AuthResponse response = authService.register(request);
            log.info("User registered successfully: {}", request.getEmail());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Registration failed for email: {}", request.getEmail(), e);
            throw e;
        }
    }
    
    @PostMapping("/login")
    @Operation(summary = "Login user")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("POST /api/auth/login - email: {}", request.getEmail());
        try {
            AuthResponse response = authService.login(request);
            log.info("User logged in successfully: {}", request.getEmail());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Login failed for email: {}", request.getEmail(), e);
            throw e;
        }
    }
    
    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token")
    public ResponseEntity<AuthResponse> refresh(@RequestBody String refreshToken) {
        String accessToken = authService.refreshToken(refreshToken);
        AuthResponse response = new AuthResponse(accessToken, refreshToken, null);
        return ResponseEntity.ok(response);
    }
}
