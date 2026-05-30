-- PostgreSQL Schema for CodeStart Ghana

CREATE TABLE IF NOT EXISTS registrations (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  whatsapp VARCHAR(50) NOT NULL,
  age INTEGER,
  school VARCHAR(255),
  experience VARCHAR(255),
  motivation TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  approval_email_sent BOOLEAN DEFAULT FALSE,
  approval_email_sent_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  student_name VARCHAR(255) NOT NULL,
  transaction_id VARCHAR(255) UNIQUE NOT NULL,
  sender_number VARCHAR(50) NOT NULL,
  screenshot_url TEXT,
  payment_status VARCHAR(50) DEFAULT 'pending',
  registration_id INTEGER REFERENCES registrations(id) ON DELETE CASCADE,
  approved_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SEED AUTHORIZED ADMIN (Password should be hashed with bcrypt)
-- INSERT INTO admins (username, password_hash, role) VALUES ('philemonmelabah0@gmail.com', '$2a$10$YourHashedPasswordHere', 'superadmin');

CREATE TABLE IF NOT EXISTS verification_codes (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER REFERENCES admins(id) ON DELETE CASCADE,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER REFERENCES admins(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
