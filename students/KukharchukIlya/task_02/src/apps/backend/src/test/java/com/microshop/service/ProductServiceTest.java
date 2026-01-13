package com.microshop.service;

import com.microshop.model.Product;
import com.microshop.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {
    
    @Mock
    private ProductRepository productRepository;
    
    @InjectMocks
    private ProductService productService;
    
    @Test
    void testGetProductById() {
        UUID id = UUID.randomUUID();
        Product product = new Product();
        product.setId(id);
        product.setName("Test Product");
        product.setPrice(BigDecimal.valueOf(99.99));
        
        when(productRepository.findById(id)).thenReturn(Optional.of(product));
        
        Product result = productService.getProductById(id);
        
        assertNotNull(result);
        assertEquals(id, result.getId());
        assertEquals("Test Product", result.getName());
    }
    
    @Test
    void testGetProductByIdNotFound() {
        UUID id = UUID.randomUUID();
        when(productRepository.findById(id)).thenReturn(Optional.empty());
        
        assertThrows(RuntimeException.class, () -> productService.getProductById(id));
    }
    
    @Test
    void testCreateProduct() {
        Product product = new Product();
        product.setName("New Product");
        product.setPrice(BigDecimal.valueOf(49.99));
        
        when(productRepository.save(any(Product.class))).thenReturn(product);
        
        Product result = productService.createProduct(product);
        
        assertNotNull(result);
        verify(productRepository, times(1)).save(product);
    }
}
