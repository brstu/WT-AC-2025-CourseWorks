package com.microshop.repository;

import com.microshop.model.CartItem;
import com.microshop.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, UUID> {
    List<CartItem> findByUser(User user);
    
    @Query("SELECT ci FROM CartItem ci WHERE ci.user.id = :userId")
    List<CartItem> findByUserId(@Param("userId") UUID userId);
    
    Optional<CartItem> findByUserAndProductId(User user, UUID productId);
    
    void deleteByUser(User user);
}
