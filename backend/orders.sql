USE shuphub;

-- CREATE TABLE orders (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     email VARCHAR(100) NOT NULL,
--     items TEXT NOT NULL, -- Stores comma-separated string of items, quantities, and prices
--     totalAmount DECIMAL(10, 2) NOT NULL,
--     order_status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
--     order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     customer_name VARCHAR(100),
--     customer_email VARCHAR(100),
--     customer_phone VARCHAR(20),
--     customer_address VARCHAR(255),
--     customer_city VARCHAR(100),
--     customer_state VARCHAR(100),
--     customer_postal_code VARCHAR(20)
-- ); 

-- INSERT INTO orders (email, items, totalAmount, order_status, customer_name, customer_email, customer_phone, customer_address, customer_city, customer_state, customer_postal_code) VALUES
-- ('alice.j@example.com', 'Luxury Smartwatch (Qty: 1, Price: $299.99), Organic Cotton T-Shirt (Qty: 2, Price: $35.50)', 370.99, 'delivered', 'Alice Johnson', 'alice.j@example.com', '1234567890', '101 Elm St', 'New York', 'NY', '10001'),
-- ('bob.s@example.com', 'Ergonomic Office Chair (Qty: 1, Price: $199.00)', 199.00, 'shipped', 'Bob Smith', 'bob.s@example.com', '0987654321', '202 Oak Ave', 'Los Angeles', 'CA', '90012'),
-- ('charlie.b@example.com', 'Gourmet Coffee Blend (Qty: 3, Price: $18.75)', 56.25, 'confirmed', 'Charlie Brown', 'charlie.b@example.com', '1122334455', '303 Pine Ln', 'Chicago', 'IL', '60601'),
-- ('diana.p@example.com', 'Pro Noise-Cancelling Headphones (Qty: 1, Price: $349.99)', 349.99, 'pending', 'Diana Prince', 'diana.p@example.com', '2233445566', '404 Cedar Blvd', 'Miami', 'FL', '33101'),
-- ('ethan.h@example.com', 'Luxury Smartwatch (Qty: 1, Price: $299.99), Gourmet Coffee Blend (Qty: 1, Price: $18.75)', 318.74, 'cancelled', 'Ethan Hunt', 'ethan.h@example.com', '3344556677', '505 Birch Rd', 'Seattle', 'WA', '98101');