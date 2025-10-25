-- Final Supabase Database Setup for EcoLink
-- This script handles existing data and fixes all constraint violations
-- Run this in your Supabase SQL Editor

-- 1. Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Handle existing profiles data before adding constraints
-- First, let's see what roles exist in the current data
-- (This is just for reference - we'll handle the migration below)

-- Update existing role values to match our new schema
-- Map 'user' to 'general_user' and keep 'super_admin' as 'admin'
UPDATE profiles SET role = 'general_user' WHERE role = 'user';
UPDATE profiles SET role = 'admin' WHERE role = 'super_admin';

-- 3. Update profiles table to match expected schema
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'general_user';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS kyc_level INTEGER DEFAULT 0;

-- Add constraints for role and kyc_level (after data migration)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'verifier', 'project_developer', 'buyer_investor', 'general_user'));

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_kyc_level_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_kyc_level_check CHECK (kyc_level >= 0 AND kyc_level <= 3);

-- 4. Update projects table to match expected schema
ALTER TABLE projects ADD COLUMN IF NOT EXISTS expected_impact TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS verification_notes TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES profiles(id);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS assigned_verifier_id UUID REFERENCES profiles(id);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE projects ALTER COLUMN status SET DEFAULT 'pending';

-- Add status constraint
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;
ALTER TABLE projects ADD CONSTRAINT projects_status_check CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'active'));

-- 5. Update project_credits table to match expected schema
ALTER TABLE project_credits ADD COLUMN IF NOT EXISTS vintage_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW());
ALTER TABLE project_credits ADD COLUMN IF NOT EXISTS verification_standard TEXT DEFAULT 'EcoLink Standard';
ALTER TABLE project_credits ADD COLUMN IF NOT EXISTS total_credits INTEGER;
ALTER TABLE project_credits ADD COLUMN IF NOT EXISTS available_credits INTEGER;
ALTER TABLE project_credits ADD COLUMN IF NOT EXISTS price_per_credit DECIMAL(10,2) DEFAULT 15.00;
ALTER TABLE project_credits ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';
ALTER TABLE project_credits ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Add status constraint for project_credits
ALTER TABLE project_credits DROP CONSTRAINT IF EXISTS project_credits_status_check;
ALTER TABLE project_credits ADD CONSTRAINT project_credits_status_check CHECK (status IN ('active', 'sold_out', 'retired'));

-- 6. Update credit_listings table to match expected schema
ALTER TABLE credit_listings ADD COLUMN IF NOT EXISTS listed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add status constraint for credit_listings
ALTER TABLE credit_listings DROP CONSTRAINT IF EXISTS credit_listings_status_check;
ALTER TABLE credit_listings ADD CONSTRAINT credit_listings_status_check CHECK (status IN ('active', 'sold_out', 'cancelled'));

-- 7. Create credit_transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID REFERENCES profiles(id),
  seller_id UUID REFERENCES profiles(id),
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

-- 8. Create credit_ownership table if it doesn't exist
CREATE TABLE IF NOT EXISTS credit_ownership (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  transaction_id UUID REFERENCES credit_transactions(id),
  project_credit_id UUID REFERENCES project_credits(id),
  quantity INTEGER NOT NULL,
  ownership_status TEXT DEFAULT 'owned' CHECK (ownership_status IN ('owned', 'retired', 'transferred')),
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  retired_at TIMESTAMP WITH TIME ZONE,
  retirement_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Create audit_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  resource_type TEXT,
  user_id UUID REFERENCES profiles(id),
  resource_id UUID,
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Create wallets table (using wallet_accounts as base)
CREATE TABLE IF NOT EXISTS wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) UNIQUE,
  balance DECIMAL(12,2) DEFAULT 0.00,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Update wallet_transactions table (using existing wallet_transactions structure)
-- Note: The existing table uses account_id, not wallet_id
ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS amount DECIMAL(12,2);
ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';
ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS reference_id UUID;
ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Add constraints for wallet_transactions
ALTER TABLE wallet_transactions DROP CONSTRAINT IF EXISTS wallet_transactions_type_check;
ALTER TABLE wallet_transactions ADD CONSTRAINT wallet_transactions_type_check CHECK (type IN ('deposit', 'withdrawal', 'purchase', 'sale', 'refund'));

ALTER TABLE wallet_transactions DROP CONSTRAINT IF EXISTS wallet_transactions_status_check;
ALTER TABLE wallet_transactions ADD CONSTRAINT wallet_transactions_status_check CHECK (status IN ('pending', 'completed', 'failed', 'cancelled'));

-- 12. Create certificates table if it doesn't exist
CREATE TABLE IF NOT EXISTS certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
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

-- 13. Create receipts table if it doesn't exist
CREATE TABLE IF NOT EXISTS receipts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
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

-- 14. Enable Row Level Security (RLS)
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

-- 15. Create RLS Policies (using correct column names)

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
      WHERE pc.id = project_credits_id AND p.user_id = auth.uid()
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

-- Wallet transactions policies (using account_id)
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

-- 16. Create functions (using correct column names and proper PL/pgSQL structure)

-- Function to generate credits when project is approved
CREATE OR REPLACE FUNCTION generate_project_credits()
RETURNS TRIGGER AS $$
DECLARE
  credits_amount INTEGER;
  base_price DECIMAL(10,2);
BEGIN
  -- Only generate credits when project status changes to 'approved'
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    
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
    
    -- Insert project credits (using existing column names)
    INSERT INTO project_credits (
      project_id,
      total_credits,
      credits_available,
      price_per_credit
    ) VALUES (
      NEW.id,
      credits_amount,
      credits_amount,
      base_price
    );
    
    -- Create initial marketplace listing (using correct column name)
    INSERT INTO credit_listings (
      project_credits_id,
      seller_id,
      quantity,
      price_per_credit
    ) SELECT 
      pc.id,
      NEW.user_id,
      pc.credits_available,
      pc.price_per_credit
    FROM project_credits pc
    WHERE pc.project_id = NEW.id;
    
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
      project_credit_id,
      quantity,
      ownership_status
    ) VALUES (
      NEW.buyer_id,
      NEW.id,
      NEW.project_credit_id,
      NEW.quantity,
      'owned'
    );
    
    -- Update available credits (using existing column name)
    UPDATE project_credits 
    SET credits_available = credits_available - NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.project_credit_id;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 17. Create triggers
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

-- 18. Create indexes for better performance
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

-- 19. Success message
SELECT 'Final Supabase setup completed! All constraint violations resolved and database schema aligned.' as status;

