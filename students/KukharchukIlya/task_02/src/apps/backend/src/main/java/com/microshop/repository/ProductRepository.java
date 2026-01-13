package com.microshop.repository;

import com.microshop.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {
    Page<Product> findByCategory(String category, Pageable pageable);
    
    @Query("SELECT p FROM Product p WHERE " +
           "(:category IS NULL OR p.category = :category) AND " +
           "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.price <= :maxPrice) AND " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(p.name) LIKE CONCAT('%', LOWER(:search), '%') OR " +
           "(p.description IS NOT NULL AND LOWER(p.description) LIKE CONCAT('%', LOWER(:search), '%')))")
    Page<Product> findWithFilters(
        @Param("category") String category,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        @Param("search") String search,
        Pageable pageable
    );
}
