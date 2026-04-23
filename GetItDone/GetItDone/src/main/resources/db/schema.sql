-- Basic schema DDL for GetItDone (PostgreSQL)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unique_user_code VARCHAR(50) UNIQUE,
  full_name VARCHAR(200) NOT NULL,
  job_title VARCHAR(200),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(200) NOT NULL,
  role VARCHAR(20) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  aadhaar_no VARCHAR(50),
  pan_no VARCHAR(50),
  upi_id VARCHAR(100),
  dob DATE,
  document_path VARCHAR(500),
  service_preferences JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  subtype VARCHAR(20),
  job_role VARCHAR(100),
  years_experience INT,
  bio TEXT,
  work_type VARCHAR(20),
  coverage_radius_km NUMERIC,
  pricing_type VARCHAR(20),
  rate NUMERIC,
  payment_upi VARCHAR(100),
  payment_bank_acc VARCHAR(50),
  payment_ifsc VARCHAR(20),
  availability BOOLEAN DEFAULT true,
  verified BOOLEAN DEFAULT false,
  skills JSONB DEFAULT '[]'::jsonb,
  work_categories JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID REFERENCES workers(id),
  client_id UUID REFERENCES users(id),
  description TEXT,
  start_date_time TIMESTAMP,
  end_date_time TIMESTAMP,
  status VARCHAR(30),
  cancellation_reason TEXT,
  location TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS calendar_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID REFERENCES workers(id),
  start_date_time TIMESTAMP,
  end_date_time TIMESTAMP,
  reason TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  type VARCHAR(50),
  title VARCHAR(255),
  body TEXT,
  read_flag BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);
