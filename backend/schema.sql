-- PostgreSQL schema for Figuro E-Commerce Platform
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email_verified BOOLEAN DEFAULT FALSE,
    social_provider VARCHAR(50),
    social_id VARCHAR(255),
    role VARCHAR(20) DEFAULT 'customer', -- 'customer', 'admin', 'moderator'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

-- Products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(12,2) NOT NULL,
    image_url TEXT,
    is_customizable BOOLEAN DEFAULT FALSE,
    stock INT,
    production_time_days INT,
    category_id INT REFERENCES categories(id),
    slug VARCHAR(255) UNIQUE, -- SEO-friendly URL
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product Customization Options (e.g., hair color, clothing, accessories)
CREATE TABLE customization_options (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    option_type VARCHAR(50) NOT NULL, -- e.g., 'hair_color', 'clothing', 'accessory'
    option_value VARCHAR(100) NOT NULL,
    price_delta NUMERIC(12,2) DEFAULT 0
);

-- Shopping Cart (persists for registered users)
CREATE TABLE carts (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    cart_id INT REFERENCES carts(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id),
    quantity INT NOT NULL,
    customizations JSONB, -- stores selected customization options
    price NUMERIC(12,2) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    status VARCHAR(50) NOT NULL, -- e.g., pending, paid, shipped, delivered, cancelled
    total_price NUMERIC(12,2) NOT NULL,
    shipping_address TEXT NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- e.g., momo, zalopay, vnpay, cod
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id),
    quantity INT NOT NULL,
    customizations JSONB, -- stores selected customization options
    price NUMERIC(12,2) NOT NULL
);

-- Payments
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    payment_gateway VARCHAR(50) NOT NULL, -- momo, zalopay, vnpay
    amount NUMERIC(12,2) NOT NULL,
    status VARCHAR(50) NOT NULL, -- pending, completed, failed
    transaction_id VARCHAR(255),
    paid_at TIMESTAMP, -- Exact payment time
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Tracking
CREATE TABLE order_status_history (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Voice Agent Context (for maintaining conversation state)
CREATE TABLE voice_agent_contexts (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    session_id VARCHAR(255) NOT NULL,
    context JSONB,
    last_interaction TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email/SMS Notifications
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    type VARCHAR(50) NOT NULL, -- email, sms
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, sent, failed
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 