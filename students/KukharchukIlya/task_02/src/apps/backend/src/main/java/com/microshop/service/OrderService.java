package com.microshop.service;

import com.microshop.model.*;
import com.microshop.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {
    
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final AddressRepository addressRepository;
    private final CouponRepository couponRepository;
    private final PaymentRepository paymentRepository;
    
    @Transactional
    public Order createOrder(User user, UUID addressId, String couponCode) {
        List<CartItem> cartItems = cartItemRepository.findByUser(user);
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }
        
        Address address = addressRepository.findById(addressId)
            .orElseThrow(() -> new RuntimeException("Address not found"));
        
        if (!address.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        
        BigDecimal total = BigDecimal.ZERO;
        Order order = new Order();
        order.setUser(user);
        order.setAddress(address);
        order.setStatus(Order.OrderStatus.PENDING);
        
        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            if (product.getStock() < cartItem.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }
            
            BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            total = total.add(itemTotal);
            
            product.setStock(product.getStock() - cartItem.getQuantity());
            productRepository.save(product);
        }
        
        BigDecimal discountAmount = BigDecimal.ZERO;
        if (couponCode != null && !couponCode.isEmpty()) {
            Coupon coupon = couponRepository.findByCode(couponCode)
                .orElseThrow(() -> new RuntimeException("Invalid coupon"));
            
            if (!coupon.isValid()) {
                throw new RuntimeException("Coupon is expired or not active");
            }
            
            discountAmount = total.multiply(BigDecimal.valueOf(coupon.getDiscountPercent()))
                .divide(BigDecimal.valueOf(100));
            order.setCouponCode(couponCode);
            order.setDiscountAmount(discountAmount);
        }
        
        order.setTotal(total.subtract(discountAmount));
        order = orderRepository.save(order);
        
        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem cartItem : cartItems) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(cartItem.getProduct());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(cartItem.getProduct().getPrice());
            orderItems.add(orderItemRepository.save(orderItem));
        }
        order.setItems(orderItems);
        
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setAmount(order.getTotal());
        payment.setStatus(Payment.PaymentStatus.COMPLETED);
        payment.setPaymentMethod("mock");
        paymentRepository.save(payment);
        
        order.setStatus(Order.OrderStatus.PAID);
        orderRepository.save(order);
        
        cartItemRepository.deleteByUser(user);
        
        return order;
    }
    
    public Page<Order> getOrders(User user, Order.OrderStatus status, Pageable pageable) {
        if (user.getRole() == User.Role.ADMIN) {
            return orderRepository.findWithFilters(null, status, pageable);
        }
        return orderRepository.findWithFilters(user.getId(), status, pageable);
    }
    
    public Order getOrderById(UUID id, User user) {
        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Order not found"));
        
        if (user.getRole() != User.Role.ADMIN && !order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        
        return order;
    }
    
    @Transactional
    public Order updateOrderStatus(UUID id, Order.OrderStatus status) {
        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Order not found"));
        
        order.setStatus(status);
        return orderRepository.save(order);
    }
}
