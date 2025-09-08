-- Drop existing table if it exists
USE shophub;

CREATE TABLE models (
    id INT AUTO_INCREMENT PRIMARY KEY,
    model_name VARCHAR(255) NOT NULL,
    rating DECIMAL(2, 1),
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100),
    photo LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT * FROM models;