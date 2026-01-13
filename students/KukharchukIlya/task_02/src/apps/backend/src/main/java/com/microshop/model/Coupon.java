package com.microshop.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "coupons")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Coupon {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank
    @Column(unique = true, nullable = false)
    private String code;

    @NotNull
    @Min(value = 0, message = "Discount percent must be between 0 and 100")
    @Max(value = 100, message = "Discount percent must be between 0 and 100")
    @Column(name = "discount_percent", nullable = false)
    private Integer discountPercent;

    @NotNull
    @Column(name = "valid_from", nullable = false)
    private LocalDateTime validFrom;

    @NotNull
    @Column(name = "valid_to", nullable = false)
    private LocalDateTime validTo;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public boolean isValid() {
        LocalDateTime now = LocalDateTime.now();
        return isActive && now.isAfter(validFrom) && now.isBefore(validTo);
    }
}
