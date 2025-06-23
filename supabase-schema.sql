-- Supabase PostgreSQL Schema for Nixty Database
-- Convert from MySQL to PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create categories table
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  version VARCHAR(50),
  description TEXT,
  short_description VARCHAR(500),
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'IDR',
  period VARCHAR(50),
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  image_url VARCHAR(500),
  is_new BOOLEAN DEFAULT FALSE,
  discount_percentage INTEGER DEFAULT 0,
  time_left VARCHAR(50),
  is_featured BOOLEAN DEFAULT FALSE,
  is_trending BOOLEAN DEFAULT FALSE,
  sold_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'out_of_stock')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create announcements table
CREATE TABLE announcements (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  image_url VARCHAR(500),
  is_new BOOLEAN DEFAULT TRUE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create deals table
CREATE TABLE deals (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  old_price DECIMAL(10,2),
  new_price DECIMAL(10,2) NOT NULL,
  discount_percentage INTEGER,
  badge VARCHAR(100),
  background_image_url VARCHAR(500),
  is_featured BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create hero_slides table
CREATE TABLE hero_slides (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  background_image_url VARCHAR(500),
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  is_new BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  account_type VARCHAR(20) DEFAULT 'user' CHECK (account_type IN ('user', 'admin')),
  google_id VARCHAR(255),
  profile_picture VARCHAR(255),
  reset_token VARCHAR(255),
  reset_token_expires TIMESTAMP WITH TIME ZONE
);

-- Create transactions table
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(100) NOT NULL UNIQUE,
  product_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  amount DECIMAL(15,2) NOT NULL,
  status VARCHAR(20) NOT NULL,
  payment_method VARCHAR(50),
  va_number VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_licenses table
CREATE TABLE product_licenses (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  license_type VARCHAR(50) DEFAULT 'product_key' CHECK (license_type IN ('product_key', 'email_password', 'access_code', 'download_link')),
  product_key VARCHAR(500),
  email VARCHAR(255),
  password VARCHAR(255),
  access_code VARCHAR(255),
  download_link VARCHAR(1000),
  additional_info TEXT,
  is_used BOOLEAN DEFAULT FALSE,
  used_by_transaction_id INTEGER REFERENCES transactions(id) ON DELETE SET NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'used', 'expired', 'reserved')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_products_trending ON products(is_trending);
CREATE INDEX idx_products_name_version ON products(name, version);

CREATE INDEX idx_announcements_status ON announcements(status);

CREATE INDEX idx_deals_product_id ON deals(product_id);
CREATE INDEX idx_deals_status ON deals(status);
CREATE INDEX idx_deals_featured ON deals(is_featured);
CREATE INDEX idx_deals_expires ON deals(expires_at);

CREATE INDEX idx_hero_slides_product_id ON hero_slides(product_id);
CREATE INDEX idx_hero_slides_status ON hero_slides(status);
CREATE INDEX idx_hero_slides_sort ON hero_slides(sort_order);

CREATE INDEX idx_users_google_id ON users(google_id);

CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_payment_method ON transactions(payment_method);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

CREATE INDEX idx_product_licenses_product_id ON product_licenses(product_id);
CREATE INDEX idx_product_licenses_status ON product_licenses(status);
CREATE INDEX idx_product_licenses_license_type ON product_licenses(license_type);
CREATE INDEX idx_product_licenses_is_used ON product_licenses(is_used);
CREATE INDEX idx_product_licenses_expires_at ON product_licenses(expires_at);
CREATE INDEX idx_product_licenses_transaction ON product_licenses(used_by_transaction_id);

-- Create functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hero_slides_updated_at BEFORE UPDATE ON hero_slides FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_licenses_updated_at BEFORE UPDATE ON product_licenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
