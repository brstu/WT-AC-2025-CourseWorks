package com.microshop.controller;

import com.microshop.model.Order;
import com.microshop.model.User;
import com.microshop.repository.UserRepository;
import com.microshop.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@Tag(name = "Orders", description = "Order management endpoints")
@RequiredArgsConstructor
public class OrderController {
    
    private final OrderService orderService;
    private final UserRepository userRepository;
    
    private User getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    @GetMapping
    @Operation(summary = "Get orders", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Page<Order>> getOrders(
            @RequestParam(required = false) Order.OrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        User user = getCurrentUser(authentication);
        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orders = orderService.getOrders(user, status, pageable);
        return ResponseEntity.ok(orders);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get order by ID", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Order> getOrder(@PathVariable UUID id, Authentication authentication) {
        User user = getCurrentUser(authentication);
        Order order = orderService.getOrderById(id, user);
        return ResponseEntity.ok(order);
    }
    
    @PostMapping
    @Operation(summary = "Create order", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Order> createOrder(
            @RequestBody CreateOrderRequest request,
            Authentication authentication) {
        User user = getCurrentUser(authentication);
        Order order = orderService.createOrder(user, request.getAddressId(), request.getCouponCode());
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }
    
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update order status", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable UUID id,
            @RequestBody UpdateStatusRequest request) {
        Order order = orderService.updateOrderStatus(id, request.getStatus());
        return ResponseEntity.ok(order);
    }
    
    // DTOs
    public static class CreateOrderRequest {
        private UUID addressId;
        private String couponCode;
        
        public UUID getAddressId() { return addressId; }
        public void setAddressId(UUID addressId) { this.addressId = addressId; }
        public String getCouponCode() { return couponCode; }
        public void setCouponCode(String couponCode) { this.couponCode = couponCode; }
    }
    
    public static class UpdateStatusRequest {
        private Order.OrderStatus status;
        
        public Order.OrderStatus getStatus() { return status; }
        public void setStatus(Order.OrderStatus status) { this.status = status; }
    }
}
