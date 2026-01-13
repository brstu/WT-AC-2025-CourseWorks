package com.microshop.controller;

import com.microshop.model.Payment;
import com.microshop.repository.PaymentRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@Tag(name = "Payments", description = "Payment endpoints (mock)")
@RequiredArgsConstructor
public class PaymentController {
    
    private final PaymentRepository paymentRepository;
    
    @PostMapping
    @Operation(summary = "Create payment (mock)", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Payment> createPayment(@RequestBody CreatePaymentRequest request) {
        Payment payment = paymentRepository.findByOrderId(request.getOrderId())
            .orElseThrow(() -> new RuntimeException("Payment not found"));
        
        // Mock payment - already completed in OrderService
        return ResponseEntity.status(HttpStatus.CREATED).body(payment);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get payment status", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Payment> getPayment(@PathVariable UUID id) {
        Payment payment = paymentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Payment not found"));
        return ResponseEntity.ok(payment);
    }
    
    // DTO
    public static class CreatePaymentRequest {
        private UUID orderId;
        
        public UUID getOrderId() { return orderId; }
        public void setOrderId(UUID orderId) { this.orderId = orderId; }
    }
}
