-- Complete Supabase Database Setup for EcoLink
-- Run this in your Supabase SQL Editor to set up the complete database

-- 1. Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  company TEXT,
  location TEXT,
  bio TEXT,
  avatar_url TEXT,
  website TEXT,
  role TEXT DEFAULT 'general_user' CHECK (role IN ('admin', 'verifier', 'project_developer', 'buyer_investor', 'general_user')),
  kyc_level INTEGER DEFAULT 0 CHECK (kyc_level >= 0 AND kyc_level <= 3),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  location TEXT,
  expected_impact TEXT,
  user_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'active')),
  verification_notes TEXT,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  assigned_verifier_id UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create project_credits table
CREATE TABLE IF NOT EXISTS project_credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  vintage_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),
  verification_standard TEXT DEFAULT 'EcoLink Standard',
  total_credits INTEGER NOT NULL,
  available_credits INTEGER NOT NULL,
  price_per_credit DECIMAL(10,2) DEFAULT 15.00,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold_out', 'retired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create credit_listings table
CREATE TABLE IF NOT EXISTS credit_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_credit_id UUID REFERENCES project_credits(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES auth.users(id),
  quantity INTEGER NOT NULL,
  price_per_credit DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold_out', 'cancelled')),
  listed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create credit_transactions table
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID REFERENCES auth.users(id),
  seller_id UUID REFERENCES auth.users(id),
  project_credit_id UUID REFERENCES project_credits(id),
  listing_id UUID REFERENCES credit_listings(id),
  quantity INTEGER NOT NULL,
  price_per_credit DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_method TEXT DEFAULT 'wallet',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'retired')),
  platform_fee_percentage DECIMAL(5,2) DEFAULT 2.5,
  completed_at TIMESTAMP WITH TIME ZONE,
  certificate_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create credit_ownership table
CREATE TABLE IF NOT EXISTS credit_ownership (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  transaction_id UUID REFERENCES credit_transactions(id),
  project_credits_id UUID REFERENCES project_credits(id),
  quantity INTEGER NOT NULL,
  ownership_status TEXT DEFAULT 'owned' CHECK (ownership_status IN ('owned', 'retired', 'transferred')),
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  retired_at TIMESTAMP WITH TIME ZONE,
  retirement_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  resource_type TEXT,
  user_id UUID REFERENCES auth.users(id),
  resource_id UUID,
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Create wallets table
CREATE TABLE IF NOT EXISTS wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  balance DECIMAL(12,2) DEFAULT 0.00,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Create wallet_transactions table
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_id UUID REFERENCES wallets(id),
  user_id UUID REFERENCES auth.users(id),
  type TEXT CHECK (type IN ('deposit', 'withdrawal', 'purchase', 'sale', 'refund')),
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  description TEXT,
  reference_id UUID, -- Reference to related transaction
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Create certificates table
CREATE TABLE IF NOT EXISTS certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  transaction_id UUID REFERENCES credit_transactions(id),
  certificate_number TEXT UNIQUE NOT NULL,
  project_title TEXT,
  project_category TEXT,
  project_location TEXT,
  credits_quantity INTEGER,
  vintage_year INTEGER,
  verification_standard TEXT,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Create receipts table
CREATE TABLE IF NOT EXISTS receipts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  transaction_id UUID REFERENCES credit_transactions(id),
  receipt_number TEXT UNIQUE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_method TEXT,
  status TEXT DEFAULT 'issued' CHECK (status IN ('issued', 'sent', 'delivered')),
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_ownership ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

-- 14. Create RLS Policies

-- Profiles policies
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Projects policies
DROP POLICY IF EXISTS "Users can view all projects" ON projects;
CREATE POLICY "Users can view all projects" ON projects
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own projects" ON projects;
CREATE POLICY "Users can insert their own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

-- Project credits policies
DROP POLICY IF EXISTS "Anyone can view project credits" ON project_credits;
CREATE POLICY "Anyone can view project credits" ON project_credits
  FOR SELECT USING (true);

-- Credit listings policies
DROP POLICY IF EXISTS "Anyone can view active credit listings" ON credit_listings;
CREATE POLICY "Anyone can view active credit listings" ON credit_listings
  FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Users can create credit listings for their projects" ON credit_listings;
CREATE POLICY "Users can create credit listings for their projects" ON credit_listings
  FOR INSERT WITH CHECK (
    auth.uid() = seller_id AND 
    EXISTS (
      SELECT 1 FROM project_credits pc 
      JOIN projects p ON pc.project_id = p.id 
      WHERE pc.id = project_credit_id AND p.user_id = auth.uid()
    )
  );

-- Credit transactions policies
DROP POLICY IF EXISTS "Users can view their own transactions" ON credit_transactions;
CREATE POLICY "Users can view their own transactions" ON credit_transactions
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

DROP POLICY IF EXISTS "Users can insert transactions as buyers" ON credit_transactions;
CREATE POLICY "Users can insert transactions as buyers" ON credit_transactions
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Credit ownership policies
DROP POLICY IF EXISTS "Users can view their own credit ownership" ON credit_ownership;
CREATE POLICY "Users can view their own credit ownership" ON credit_ownership
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own credit ownership" ON credit_ownership;
CREATE POLICY "Users can update their own credit ownership" ON credit_ownership
  FOR UPDATE USING (auth.uid() = user_id);

-- Audit logs policies
DROP POLICY IF EXISTS "Users can view their own audit logs" ON audit_logs;
CREATE POLICY "Users can view their own audit logs" ON audit_logs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;
CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- Wallets policies
DROP POLICY IF EXISTS "Users can view their own wallet" ON wallets;
CREATE POLICY "Users can view their own wallet" ON wallets
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own wallet" ON wallets;
CREATE POLICY "Users can update their own wallet" ON wallets
  FOR UPDATE USING (auth.uid() = user_id);

-- Wallet transactions policies
DROP POLICY IF EXISTS "Users can view their own wallet transactions" ON wallet_transactions;
CREATE POLICY "Users can view their own wallet transactions" ON wallet_transactions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own wallet transactions" ON wallet_transactions;
CREATE POLICY "Users can insert their own wallet transactions" ON wallet_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Certificates policies
DROP POLICY IF EXISTS "Users can view their own certificates" ON certificates;
CREATE POLICY "Users can view their own certificates" ON certificates
  FOR SELECT USING (auth.uid() = user_id);

-- Receipts policies
DROP POLICY IF EXISTS "Users can view their own receipts" ON receipts;
CREATE POLICY "Users can view their own receipts" ON receipts
  FOR SELECT USING (auth.uid() = user_id);

-- 15. Create functions

-- Function to generate credits when project is approved
CREATE OR REPLACE FUNCTION generate_project_credits()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate credits when project status changes to 'approved'
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    
    -- Calculate credits based on project category
    DECLARE
      credits_amount INTEGER;
      base_price DECIMAL(10,2);
    BEGIN
      -- Determine credits amount based on category
      CASE NEW.category
        WHEN 'Forestry' THEN credits_amount := 1000;
        WHEN 'Renewable Energy' THEN credits_amount := 500;
        WHEN 'Blue Carbon' THEN credits_amount := 800;
        WHEN 'Energy Efficiency' THEN credits_amount := 300;
        WHEN 'Waste Management' THEN credits_amount := 400;
        ELSE credits_amount := 500;
      END CASE;
      
      -- Determine base price based on category
      CASE NEW.category
        WHEN 'Forestry' THEN base_price := 15.00;
        WHEN 'Renewable Energy' THEN base_price := 20.00;
        WHEN 'Blue Carbon' THEN base_price := 18.00;
        WHEN 'Energy Efficiency' THEN base_price := 12.00;
        WHEN 'Waste Management' THEN base_price := 14.00;
        ELSE base_price := 15.00;
      END CASE;
      
      -- Insert project credits
      INSERT INTO project_credits (
        project_id,
        total_credits,
        available_credits,
        price_per_credit
      ) VALUES (
        NEW.id,
        credits_amount,
        credits_amount,
        base_price
      );
      
      -- Create initial marketplace listing
      INSERT INTO credit_listings (
        project_credit_id,
        seller_id,
        quantity,
        price_per_credit
      ) SELECT 
        pc.id,
        NEW.user_id,
        pc.available_credits,
        pc.price_per_credit
      FROM project_credits pc
      WHERE pc.project_id = NEW.id;
      
    END;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create wallet for new users
CREATE OR REPLACE FUNCTION create_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO wallets (user_id, balance, currency)
  VALUES (NEW.id, 0.00, 'USD');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update credit ownership after transaction
CREATE OR REPLACE FUNCTION update_credit_ownership()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process completed transactions
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    
    -- Create credit ownership record
    INSERT INTO credit_ownership (
      user_id,
      transaction_id,
      project_credits_id,
      quantity,
      ownership_status
    ) VALUES (
      NEW.buyer_id,
      NEW.id,
      NEW.project_credit_id,
      NEW.quantity,
      'owned'
    );
    
    -- Update available credits
    UPDATE project_credits 
    SET available_credits = available_credits - NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.project_credit_id;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 16. Create triggers
DROP TRIGGER IF EXISTS trigger_generate_project_credits ON projects;
CREATE TRIGGER trigger_generate_project_credits
  AFTER UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION generate_project_credits();

DROP TRIGGER IF EXISTS trigger_create_user_wallet ON auth.users;
CREATE TRIGGER trigger_create_user_wallet
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_wallet();

DROP TRIGGER IF EXISTS trigger_update_credit_ownership ON credit_transactions;
CREATE TRIGGER trigger_update_credit_ownership
  AFTER UPDATE ON credit_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_credit_ownership();

-- 17. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_credit_listings_status ON credit_listings(status);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_buyer_id ON credit_transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_seller_id ON credit_transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_status ON credit_transactions(status);
CREATE INDEX IF NOT EXISTS idx_credit_ownership_user_id ON credit_ownership(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_user_id ON receipts(user_id);

-- 18. Insert test data (optional - for development)
INSERT INTO auth.users (
  id,
  email,
  created_at,
  updated_at,
  email_confirmed_at,
  encrypted_password
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  'test@ecolink.test',
  NOW(),
  NOW(),
  NOW(),
  '$2a$10$dummy.password.hash.for.testing'
) ON CONFLICT (id) DO NOTHING;

-- Insert test projects
INSERT INTO projects (title, description, category, location, expected_impact, user_id, status) VALUES
  (
    'Amazon Rainforest Protection Initiative',
    'Protecting 10,000 hectares of primary rainforest in the Amazon basin through community-based conservation efforts. This project prevents deforestation and supports local indigenous communities.',
    'Forestry',
    'Brazil',
    'Prevent deforestation of 10,000 hectares, protect biodiversity, support local communities',
    '33333333-3333-3333-3333-333333333333',
    'approved'
  ),
  (
    'Solar Energy Initiative Kenya',
    'Large-scale solar farm providing clean energy to rural communities in Kenya, reducing reliance on fossil fuels and improving energy access.',
    'Renewable Energy',
    'Kenya',
    'Generate 50MW of clean energy, reduce CO2 emissions by 25,000 tonnes annually',
    '33333333-3333-3333-3333-333333333333',
    'approved'
  )
ON CONFLICT DO NOTHING;

-- 19. Success message
SELECT 'Complete Supabase setup completed! All tables, policies, and functions are now ready.' as status;












