package com.microshop.controller;

import com.microshop.model.User;
import com.microshop.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Admin management endpoints")
@RequiredArgsConstructor
public class AdminController {
    
    private final UserRepository userRepository;
    
    @GetMapping("/users")
    @Operation(summary = "Get all users", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Page<User>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<User> users = userRepository.findAll(pageable);
        return ResponseEntity.ok(users);
    }
    
    @PutMapping("/users/{id}/block")
    @Operation(summary = "Block user", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<User> blockUser(@PathVariable UUID id) {
        // Simplified - in real app would have isBlocked field
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(user);
    }
}
