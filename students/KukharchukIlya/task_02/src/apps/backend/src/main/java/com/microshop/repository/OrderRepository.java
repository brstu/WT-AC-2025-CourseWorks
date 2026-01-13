package com.microshop.repository;

import com.microshop.model.Order;
import com.microshop.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    Page<Order> findByUser(User user, Pageable pageable);
    
    @Query("SELECT o FROM Order o WHERE " +
           "(:userId IS NULL OR o.user.id = :userId) AND " +
           "(:status IS NULL OR o.status = :status)")
    Page<Order> findWithFilters(
        @Param("userId") UUID userId,
        @Param("status") Order.OrderStatus status,
        Pageable pageable
    );
}
