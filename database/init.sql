-- ============================================================
-- SmartCampus Database Setup (PostgreSQL / Supabase)
-- Run this ONCE before starting the application, OR just let
-- Hibernate create everything automatically — see note below.
-- ============================================================

-- spring.jpa.hibernate.ddl-auto=update means Hibernate will create/update
-- all tables automatically on application startup based on the JPA
-- entities in backend/src/main/java/com/smartcampus/model/**.
-- This file only needs to provide the initial admin seed data; for a
-- fully documented reference schema (indexes, constraints, views), see
-- database/schema.sql.

-- Seed: Default Admin Account
-- Password: Admin@1234 (BCrypt encoded)
INSERT INTO users
    (full_name, email, register_number, password, role, department_name, phone_number,
     is_verified, is_active, created_at, updated_at)
VALUES (
    'System Administrator',
    'admin@smartcampus.edu',
    NULL,
    '$2a$12$LKpToQwRfbDt8g2CyRb7cO5Y0VFMS1uM.5eeMXsFAQWHiU0nY9wWi',
    'ADMIN',
    'Administration',
    '9000000000',
    TRUE,
    TRUE,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;
