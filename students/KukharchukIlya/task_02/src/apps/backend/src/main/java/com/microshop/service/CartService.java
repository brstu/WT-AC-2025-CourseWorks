package com.microshop.service;

import com.microshop.model.CartItem;
import com.microshop.model.Product;
import com.microshop.model.User;
import com.microshop.repository.CartItemRepository;
import com.microshop.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CartService {
    
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    
    @Cacheable(value = "cart", key = "#user.id")
    public List<CartItem> getCart(User user) {
        return cartItemRepository.findByUser(user);
    }
    
    @Transactional
    @CacheEvict(value = "cart", key = "#user.id")
    public CartItem addToCart(User user, UUID productId, Integer quantity) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));
        
        if (product.getStock() < quantity) {
            throw new RuntimeException("Insufficient stock");
        }
        
        CartItem existing = cartItemRepository.findByUserAndProductId(user, productId).orElse(null);
        
        if (existing != null) {
            int newQuantity = existing.getQuantity() + quantity;
            if (product.getStock() < newQuantity) {
                throw new RuntimeException("Insufficient stock");
            }
            existing.setQuantity(newQuantity);
            return cartItemRepository.save(existing);
        } else {
            CartItem cartItem = new CartItem();
            cartItem.setUser(user);
            cartItem.setProduct(product);
            cartItem.setQuantity(quantity);
            return cartItemRepository.save(cartItem);
        }
    }
    
    @Transactional
    @CacheEvict(value = "cart", key = "#user.id")
    public CartItem updateCartItem(User user, UUID cartItemId, Integer quantity) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
            .orElseThrow(() -> new RuntimeException("Cart item not found"));
        
        if (!cartItem.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        
        if (cartItem.getProduct().getStock() < quantity) {
            throw new RuntimeException("Insufficient stock");
        }
        
        cartItem.setQuantity(quantity);
        return cartItemRepository.save(cartItem);
    }
    
    @Transactional
    @CacheEvict(value = "cart", key = "#user.id")
    public void removeFromCart(User user, UUID cartItemId) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
            .orElseThrow(() -> new RuntimeException("Cart item not found"));
        
        if (!cartItem.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        
        cartItemRepository.delete(cartItem);
    }
    
    @Transactional
    @CacheEvict(value = "cart", key = "#user.id")
    public void clearCart(User user) {
        cartItemRepository.deleteByUser(user);
    }
}
