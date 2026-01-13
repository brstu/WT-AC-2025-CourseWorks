package com.microshop.controller;

import com.microshop.model.CartItem;
import com.microshop.model.User;
import com.microshop.repository.UserRepository;
import com.microshop.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/cart")
@Tag(name = "Cart", description = "Shopping cart endpoints")
@RequiredArgsConstructor
public class CartController {
    
    private final CartService cartService;
    private final UserRepository userRepository;
    
    private User getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    @GetMapping
    @Operation(summary = "Get cart", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<CartItem>> getCart(Authentication authentication) {
        User user = getCurrentUser(authentication);
        List<CartItem> cart = cartService.getCart(user);
        return ResponseEntity.ok(cart);
    }
    
    @PostMapping("/items")
    @Operation(summary = "Add item to cart", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<CartItem> addToCart(
            @RequestBody AddToCartRequest request,
            Authentication authentication) {
        User user = getCurrentUser(authentication);
        CartItem item = cartService.addToCart(user, request.getProductId(), request.getQuantity());
        return ResponseEntity.ok(item);
    }
    
    @PutMapping("/items/{id}")
    @Operation(summary = "Update cart item", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<CartItem> updateCartItem(
            @PathVariable UUID id,
            @RequestBody UpdateCartItemRequest request,
            Authentication authentication) {
        User user = getCurrentUser(authentication);
        CartItem item = cartService.updateCartItem(user, id, request.getQuantity());
        return ResponseEntity.ok(item);
    }
    
    @DeleteMapping("/items/{id}")
    @Operation(summary = "Remove item from cart", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Void> removeFromCart(@PathVariable UUID id, Authentication authentication) {
        User user = getCurrentUser(authentication);
        cartService.removeFromCart(user, id);
        return ResponseEntity.noContent().build();
    }
    
    @DeleteMapping
    @Operation(summary = "Clear cart", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Void> clearCart(Authentication authentication) {
        User user = getCurrentUser(authentication);
        cartService.clearCart(user);
        return ResponseEntity.noContent().build();
    }
    
    // DTOs
    public static class AddToCartRequest {
        private UUID productId;
        private Integer quantity;
        
        public UUID getProductId() { return productId; }
        public void setProductId(UUID productId) { this.productId = productId; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }
    
    public static class UpdateCartItemRequest {
        private Integer quantity;
        
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }
}
