package com.microshop.controller;

import com.microshop.model.Address;
import com.microshop.model.User;
import com.microshop.repository.UserRepository;
import com.microshop.service.AddressService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/addresses")
@Tag(name = "Addresses", description = "Address management endpoints")
@RequiredArgsConstructor
public class AddressController {
    
    private final AddressService addressService;
    private final UserRepository userRepository;
    
    private User getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    @GetMapping
    @Operation(summary = "Get addresses", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<Address>> getAddresses(Authentication authentication) {
        User user = getCurrentUser(authentication);
        List<Address> addresses = addressService.getAddresses(user);
        return ResponseEntity.ok(addresses);
    }
    
    @PostMapping
    @Operation(summary = "Create address", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Address> createAddress(
            @Valid @RequestBody Address address,
            Authentication authentication) {
        User user = getCurrentUser(authentication);
        Address created = addressService.createAddress(user, address);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update address", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Address> updateAddress(
            @PathVariable UUID id,
            @Valid @RequestBody Address address,
            Authentication authentication) {
        User user = getCurrentUser(authentication);
        Address updated = addressService.updateAddress(id, user, address);
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete address", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Void> deleteAddress(@PathVariable UUID id, Authentication authentication) {
        User user = getCurrentUser(authentication);
        addressService.deleteAddress(id, user);
        return ResponseEntity.noContent().build();
    }
}
