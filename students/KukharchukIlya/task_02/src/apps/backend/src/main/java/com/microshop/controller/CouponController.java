package com.microshop.controller;

import com.microshop.model.Coupon;
import com.microshop.service.CouponService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/coupons")
@Tag(name = "Coupons", description = "Coupon management endpoints")
@RequiredArgsConstructor
public class CouponController {
    
    private final CouponService couponService;
    
    @GetMapping("/{code}")
    @Operation(summary = "Validate coupon")
    public ResponseEntity<Coupon> validateCoupon(@PathVariable String code) {
        Coupon coupon = couponService.validateCoupon(code);
        return ResponseEntity.ok(coupon);
    }
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get coupons", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Page<Coupon>> getCoupons(
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Coupon> coupons = couponService.getCoupons(isActive, pageable);
        return ResponseEntity.ok(coupons);
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create coupon", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Coupon> createCoupon(@Valid @RequestBody Coupon coupon) {
        Coupon created = couponService.createCoupon(coupon);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update coupon", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Coupon> updateCoupon(@PathVariable UUID id, @Valid @RequestBody Coupon coupon) {
        Coupon updated = couponService.updateCoupon(id, coupon);
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete coupon", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Void> deleteCoupon(@PathVariable UUID id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.noContent().build();
    }
}
