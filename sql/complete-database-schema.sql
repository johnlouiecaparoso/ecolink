-- Complete EcoLink Database Schema
-- Run this in your Supabase SQL Editor to fix all missing tables and relationships

-- 1. Create profiles table (if not exists)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  company TEXT,
  location TEXT,
  bio TEXT,
  role TEXT DEFAULT 'general_user',
  kyc_level INTEGER DEFAULT 0,
  avatar_url TEXT,
  phone TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  location TEXT,
  expected_impact TEXT,
  user_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'pending',
  verification_notes TEXT,
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create project_credits table
CREATE TABLE IF NOT EXISTS project_credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  vintage_year INTEGER,
  verification_standard TEXT,
  total_credits INTEGER,
  available_credits INTEGER,
  price_per_credit DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create credit_listings table
CREATE TABLE IF NOT EXISTS credit_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_credit_id UUID REFERENCES project_credits(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  quantity INTEGER,
  price_per_credit DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'active',
  listed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create credit_ownership table (MISSING - CRITICAL)
CREATE TABLE IF NOT EXISTS credit_ownership (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  ownership_type TEXT DEFAULT 'purchased',
  transaction_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create credit_purchases table (MISSING - CRITICAL)
CREATE TABLE IF NOT EXISTS credit_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES credit_listings(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  credits_purchased INTEGER NOT NULL,
  price_per_credit DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'completed',
  payment_method TEXT,
  transaction_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create credit_retirements table (MISSING - CRITICAL)
CREATE TABLE IF NOT EXISTS credit_retirements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  reason TEXT,
  retired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Create wallet_accounts table
CREATE TABLE IF NOT EXISTS wallet_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  current_balance DECIMAL(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'PHP',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Create wallet_transactions table
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  account_id UUID REFERENCES wallet_accounts(id),
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'payment', 'refund')),
  amount DECIMAL(12,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  payment_method TEXT,
  description TEXT,
  reference_id TEXT,
  external_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Create certificates table
CREATE TABLE IF NOT EXISTS certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES credit_purchases(id),
  certificate_number TEXT UNIQUE,
  certificate_type TEXT,
  credits_purchased INTEGER,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active'
);

-- 11. Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_ownership ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_retirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Projects policies
CREATE POLICY "Anyone can view approved projects" ON projects
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Users can view their own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

-- Credit listings policies
CREATE POLICY "Anyone can view active credit listings" ON credit_listings
  FOR SELECT USING (status = 'active');

-- Credit ownership policies
CREATE POLICY "Users can view their own credit ownership" ON credit_ownership
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credit ownership" ON credit_ownership
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Credit purchases policies
CREATE POLICY "Users can view their own purchases" ON credit_purchases
  FOR SELECT USING (auth.uid() = buyer_id);

CREATE POLICY "Users can insert their own purchases" ON credit_purchases
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Wallet policies
CREATE POLICY "Users can view their own wallet" ON wallet_accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own transactions" ON wallet_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Certificates policies
CREATE POLICY "Users can view their own certificates" ON certificates
  FOR SELECT USING (auth.uid() = user_id);

-- Audit logs policies
CREATE POLICY "Users can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_credit_ownership_user_id ON credit_ownership(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_ownership_project_id ON credit_ownership(project_id);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_buyer_id ON credit_purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_seller_id ON credit_purchases(seller_id);
CREATE INDEX IF NOT EXISTS idx_credit_listings_status ON credit_listings(status);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id);

-- Create functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_credit_ownership_updated_at BEFORE UPDATE ON credit_ownership FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wallet_accounts_updated_at BEFORE UPDATE ON wallet_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wallet_transactions_updated_at BEFORE UPDATE ON wallet_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO profiles (id, full_name, email, role) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Test Admin', 'admin@ecolink.com', 'admin'),
  ('00000000-0000-0000-0000-000000000002', 'Test Verifier', 'verifier@ecolink.com', 'verifier'),
  ('00000000-0000-0000-0000-000000000003', 'Test User', 'user@ecolink.com', 'general_user')
ON CONFLICT (id) DO NOTHING;

-- Create sample projects
INSERT INTO projects (id, title, description, category, location, user_id, status) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Amazon Rainforest Protection', 'Protecting 10,000 hectares of pristine Amazon rainforest', 'Forestry', 'Brazil', '00000000-0000-0000-0000-000000000001', 'approved'),
  ('22222222-2222-2222-2222-222222222222', 'Solar Farm Development', 'Building a 50MW solar farm to replace coal-fired power', 'Renewable Energy', 'India', '00000000-0000-0000-0000-000000000001', 'approved')
ON CONFLICT (id) DO NOTHING;

-- Create sample project credits
INSERT INTO project_credits (id, project_id, total_credits, available_credits, price_per_credit) VALUES 
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 5000, 5000, 25.00),
  ('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 3000, 3000, 18.00)
ON CONFLICT (id) DO NOTHING;

-- Create sample credit listings
INSERT INTO credit_listings (id, project_credit_id, seller_id, quantity, price_per_credit) VALUES 
  ('55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', 5000, 25.00),
  ('66666666-6666-6666-6666-666666666666', '44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000001', 3000, 18.00)
ON CONFLICT (id) DO NOTHING;

-- Create sample wallet accounts
INSERT INTO wallet_accounts (user_id, current_balance, currency) VALUES 
  ('00000000-0000-0000-0000-000000000001', 1000.00, 'PHP'),
  ('00000000-0000-0000-0000-000000000002', 500.00, 'PHP'),
  ('00000000-0000-0000-0000-000000000003', 250.00, 'PHP')
ON CONFLICT (user_id) DO NOTHING;

