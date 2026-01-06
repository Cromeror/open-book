-- =============================================================================
-- OpenBook Database Initialization Script
-- =============================================================================
-- This script runs automatically when the PostgreSQL container is first created.
-- It sets up initial database configuration and extensions.
-- =============================================================================

-- Enable useful PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- For UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";       -- For encryption functions

-- Create schema for better organization (optional)
-- CREATE SCHEMA IF NOT EXISTS openbook;

-- Grant permissions (if using non-default user)
-- GRANT ALL PRIVILEGES ON SCHEMA openbook TO your_user;

-- Log successful initialization
DO $$
BEGIN
    RAISE NOTICE 'OpenBook database initialized successfully';
END $$;
