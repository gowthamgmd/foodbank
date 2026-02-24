-- Smart Food Bank DB seed
-- Run this after the backend starts (Hibernate creates tables via DDL auto=update)

-- Admin user (password: admin123)
INSERT INTO users (name, email, password_hash, role, created_at)
VALUES (
  'Admin User',
  'admin@foodbank.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'ADMIN',
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Donor user (password: donor123)
INSERT INTO users (organization_name, contact_person, email, password_hash, role, address, phone, created_at)
VALUES (
  'FreshMart Superstore',
  'Ramesh Kumar',
  'donor@foodbank.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'DONOR',
  'MG Road, Bengaluru',
  '9876543210',
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Beneficiary user (password: ben123)
INSERT INTO users (name, email, password_hash, role, family_size, dietary_restrictions, address, phone, created_at)
VALUES (
  'Priya Kumar',
  'ben@foodbank.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'BENEFICIARY',
  4,
  '["Vegetarian"]',
  'Koramangala, Bengaluru',
  '9123456789',
  NOW()
) ON CONFLICT (email) DO NOTHING;
