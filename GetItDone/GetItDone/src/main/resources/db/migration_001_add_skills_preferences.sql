-- Migration to add skills, work categories, and service preferences
-- Run this migration to add JSON columns to workers and users tables

-- Add skills and work_categories to workers table
ALTER TABLE workers 
ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS work_categories JSONB DEFAULT '[]'::jsonb;

-- Add service_preferences to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS service_preferences JSONB DEFAULT '[]'::jsonb;

-- Add missing columns if they don't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS unique_user_code VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS job_title VARCHAR(200),
ADD COLUMN IF NOT EXISTS pan_no VARCHAR(50),
ADD COLUMN IF NOT EXISTS document_path VARCHAR(500);
