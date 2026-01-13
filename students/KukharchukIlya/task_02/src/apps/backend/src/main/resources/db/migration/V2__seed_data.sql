-- Admin user (password: admin123)
INSERT INTO users (id, email, password_hash, role) VALUES
('00000000-0000-0000-0000-000000000001', 'admin@microshop.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN');

-- Test user (password: user123)
INSERT INTO users (id, email, password_hash, role) VALUES
('00000000-0000-0000-0000-000000000002', 'user@microshop.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'USER');

-- Sample products
INSERT INTO products (id, name, description, price, stock, category, image_url) VALUES
('10000000-0000-0000-0000-000000000001', 'Laptop', 'High-performance laptop', 999.99, 10, 'Electronics', 'https://example.com/laptop.jpg'),
('10000000-0000-0000-0000-000000000002', 'Smartphone', 'Latest smartphone model', 699.99, 20, 'Electronics', 'https://example.com/phone.jpg'),
('10000000-0000-0000-0000-000000000003', 'Headphones', 'Wireless headphones', 199.99, 30, 'Electronics', 'https://example.com/headphones.jpg'),
('10000000-0000-0000-0000-000000000004', 'Book', 'Programming book', 49.99, 50, 'Books', 'https://example.com/book.jpg'),
('10000000-0000-0000-0000-000000000005', 'T-Shirt', 'Cotton t-shirt', 29.99, 100, 'Clothing', 'https://example.com/tshirt.jpg');

-- Sample coupon
INSERT INTO coupons (id, code, discount_percent, valid_from, valid_to, is_active) VALUES
('20000000-0000-0000-0000-000000000001', 'SUMMER10', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', TRUE);
