-- Initialize 4AMI Database
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('ADMIN', 'CUSTOMER_ADMIN', 'CUSTOMER_USER');
CREATE TYPE project_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
CREATE TYPE asset_status AS ENUM ('active', 'inactive', 'archived');
CREATE TYPE report_status AS ENUM ('generating', 'completed', 'failed');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
