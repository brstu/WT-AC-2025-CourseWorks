package com.microshop.controller;

import com.microshop.dto.ProductResponse;
import com.microshop.model.Product;
import com.microshop.model.User;
import com.microshop.repository.UserRepository;
import com.microshop.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
@Tag(name = "Products", description = "Product management endpoints")
@RequiredArgsConstructor
@Slf4j
public class ProductController {
    
    private final ProductService productService;
    private final UserRepository userRepository;
    
    @GetMapping
    @Operation(summary = "Get products with filters")
    public ResponseEntity<Map<String, Object>> getProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("GET /api/products - category: {}, minPrice: {}, maxPrice: {}, search: {}, page: {}, size: {}", 
            category, minPrice, maxPrice, search, page, size);
        
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Product> products = productService.getProducts(category, minPrice, maxPrice, search, pageable);
            log.info("Found {} products (total: {})", products.getContent().size(), products.getTotalElements());
            
            // Конвертируем Product в ProductResponse
            List<ProductResponse> content = products.getContent().stream()
                .map(p -> new ProductResponse(
                    p.getId(),
                    p.getName(),
                    p.getDescription(),
                    p.getPrice(),
                    p.getStock(),
                    p.getCategory(),
                    p.getImageUrl(),
                    p.getCreatedAt(),
                    p.getUpdatedAt()
                ))
                .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("content", content);
            response.put("totalElements", products.getTotalElements());
            response.put("totalPages", products.getTotalPages());
            response.put("number", products.getNumber());
            response.put("size", products.getSize());
            response.put("first", products.isFirst());
            response.put("last", products.isLast());
            
            log.info("Successfully returning products response");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting products", e);
            throw new RuntimeException("Error getting products: " + e.getMessage(), e);
        }
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get product by ID")
    public ResponseEntity<Product> getProduct(@PathVariable UUID id) {
        Product product = productService.getProductById(id);
        return ResponseEntity.ok(product);
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create product", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Product> createProduct(@Valid @RequestBody Product product) {
        Product created = productService.createProduct(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update product", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Product> updateProduct(@PathVariable UUID id, @Valid @RequestBody Product product) {
        Product updated = productService.updateProduct(id, product);
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete product", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Void> deleteProduct(@PathVariable UUID id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}
