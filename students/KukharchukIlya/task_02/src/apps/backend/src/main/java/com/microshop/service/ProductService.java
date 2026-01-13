package com.microshop.service;

import com.microshop.model.Product;
import com.microshop.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductService {
    
    private final ProductRepository productRepository;
    
    // Кэширование отключено - Page<Product> сложно сериализовать в Redis
    public Page<Product> getProducts(String category, BigDecimal minPrice, BigDecimal maxPrice, String search, Pageable pageable) {
        // Нормализуем search - если пустая строка, делаем null
        String normalizedSearch = (search != null && search.trim().isEmpty()) ? null : search;
        return productRepository.findWithFilters(category, minPrice, maxPrice, normalizedSearch, pageable);
    }
    
    public Product getProductById(UUID id) {
        return productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Product not found"));
    }
    
    @Transactional
    public Product createProduct(Product product) {
        return productRepository.save(product);
    }
    
    @Transactional
    public Product updateProduct(UUID id, Product product) {
        Product existing = getProductById(id);
        if (product.getName() != null) existing.setName(product.getName());
        if (product.getDescription() != null) existing.setDescription(product.getDescription());
        if (product.getPrice() != null) existing.setPrice(product.getPrice());
        if (product.getStock() != null) existing.setStock(product.getStock());
        if (product.getCategory() != null) existing.setCategory(product.getCategory());
        if (product.getImageUrl() != null) existing.setImageUrl(product.getImageUrl());
        return productRepository.save(existing);
    }
    
    @Transactional
    public void deleteProduct(UUID id) {
        productRepository.deleteById(id);
    }
}
