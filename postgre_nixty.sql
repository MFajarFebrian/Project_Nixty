CREATE TYPE nixty.account_role AS ENUM ('user', 'admin');
CREATE TYPE nixty.product_status AS ENUM ('active', 'inactive');
CREATE TYPE nixty.license_type AS ENUM ('product_key', 'email_password');
CREATE TYPE nixty.license_status AS ENUM ('available', 'used', 'expired', 'reserved');
CREATE TYPE nixty.order_status AS ENUM ('pending', 'completed', 'failed');
CREATE TYPE nixty.email_status AS ENUM ('success', 'failed', 'pending');

CREATE TABLE nixty.categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL,
    slug VARCHAR(30) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE nixty.users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(40) UNIQUE NOT NULL,
    password VARCHAR(60) NOT NULL,
    name VARCHAR(30),
    account_type nixty.account_role NOT NULL DEFAULT 'user',
    phone VARCHAR(15)
);

CREATE TABLE nixty.products (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES nixty.categories(id),
    name VARCHAR(30) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL, -- (10, 2) adalah presisi umum untuk harga
    image_url VARCHAR(110),
    status nixty.product_status DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    slug VARCHAR(40) UNIQUE
);

CREATE TABLE nixty.product_license_base (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES nixty.products(id) ON DELETE CASCADE,
    license_type nixty.license_type NOT NULL,
    status nixty.license_status DEFAULT 'available',
    max_usage SMALLINT DEFAULT 1
);

CREATE TABLE nixty.product_license_keys (
    id INTEGER PRIMARY KEY REFERENCES nixty.product_license_base(id) ON DELETE CASCADE,
    product_key VARCHAR(25) NOT NULL
);

CREATE TABLE nixty.product_license_accounts (
    id INTEGER PRIMARY KEY REFERENCES nixty.product_license_base(id) ON DELETE CASCADE,
    email VARCHAR(40) NOT NULL,
    password VARCHAR(60) NOT NULL
);

CREATE TABLE nixty.orders (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(36) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES nixty.users(id),
    product_id INTEGER REFERENCES nixty.products(id),
    quantity SMALLINT DEFAULT 1,
    total NUMERIC(10, 2) NOT NULL,
    status nixty.order_status NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE nixty.orders_license (
    id SERIAL PRIMARY KEY,
    transaction_id INTEGER REFERENCES nixty.orders(id),
    license_id INTEGER REFERENCES nixty.product_license_base(id),
    order_ref VARCHAR(36)
);

CREATE TABLE nixty.payment_gateway_logs (
    id SERIAL PRIMARY KEY,
    transaction_id INTEGER REFERENCES nixty.orders(id),
    order_ref VARCHAR(36),
    key VARCHAR(30),
    value TEXT
);

CREATE TABLE nixty.email_logs (
    id BIGSERIAL PRIMARY KEY,
    order_id VARCHAR(36) REFERENCES nixty.orders(order_id),
    recipients TEXT NOT NULL,
    email_type VARCHAR(20) DEFAULT 'license_delivery',
    status nixty.email_status,
    error_message TEXT,
    email_subject VARCHAR(50),
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);