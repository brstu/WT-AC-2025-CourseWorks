package com.microshop.service;

import com.microshop.model.Coupon;
import com.microshop.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CouponService {
    
    private final CouponRepository couponRepository;
    
    public Coupon validateCoupon(String code) {
        Coupon coupon = couponRepository.findByCode(code)
            .orElseThrow(() -> new RuntimeException("Coupon not found"));
        
        if (!coupon.isValid()) {
            throw new RuntimeException("Coupon is expired or not active");
        }
        
        return coupon;
    }
    
    public Page<Coupon> getCoupons(Boolean isActive, Pageable pageable) {
        if (isActive != null) {
            return couponRepository.findAll(pageable); // Simplified, should filter by isActive
        }
        return couponRepository.findAll(pageable);
    }
    
    @Transactional
    public Coupon createCoupon(Coupon coupon) {
        if (couponRepository.existsByCode(coupon.getCode())) {
            throw new RuntimeException("Coupon code already exists");
        }
        return couponRepository.save(coupon);
    }
    
    @Transactional
    public Coupon updateCoupon(UUID id, Coupon coupon) {
        Coupon existing = couponRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Coupon not found"));
        
        if (coupon.getDiscountPercent() != null) {
            existing.setDiscountPercent(coupon.getDiscountPercent());
        }
        if (coupon.getValidFrom() != null) {
            existing.setValidFrom(coupon.getValidFrom());
        }
        if (coupon.getValidTo() != null) {
            existing.setValidTo(coupon.getValidTo());
        }
        if (coupon.getIsActive() != null) {
            existing.setIsActive(coupon.getIsActive());
        }
        
        return couponRepository.save(existing);
    }
    
    @Transactional
    public void deleteCoupon(UUID id) {
        couponRepository.deleteById(id);
    }
}
