-- Complete Database Setup for EcoLink
-- This script sets up all necessary tables, policies, and functions
-- Run this in your Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================
-- 1. PROFILES TABLE SETUP
-- ==============================================

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'verifier', 'admin', 'super_admin')),
  kyc_level INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- ==============================================
-- 2. PROJECTS TABLE SETUP
-- ==============================================

-- Create projects table if it doesn't exist
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  expected_impact TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'under_review')),
  verification_notes TEXT,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert their own projects" ON projects;
DROP POLICY IF EXISTS "Users can update their own pending projects" ON projects;
DROP POLICY IF EXISTS "Users can delete their own pending projects" ON projects;
DROP POLICY IF EXISTS "Verifiers can view all projects" ON projects;
DROP POLICY IF EXISTS "Verifiers can update project verification" ON projects;
DROP POLICY IF EXISTS "Admins can view all projects" ON projects;
DROP POLICY IF EXISTS "Admins can update all projects" ON projects;
DROP POLICY IF EXISTS "Admins can delete any project" ON projects;

-- Create RLS policies for projects
CREATE POLICY "Users can view their own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Users can delete their own pending projects" ON projects
  FOR DELETE USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Verifiers can view all projects" ON projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('verifier', 'admin', 'super_admin')
    )
  );

CREATE POLICY "Verifiers can update project verification" ON projects
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('verifier', 'admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can view all projects" ON projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update all projects" ON projects
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can delete any project" ON projects
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- ==============================================
-- 3. WALLET TABLES SETUP
-- ==============================================

-- Create wallet_accounts table if it doesn't exist
CREATE TABLE IF NOT EXISTS wallet_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    current_balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) NOT NULL DEFAULT 'PHP',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT wallet_accounts_balance_positive CHECK (current_balance >= 0),
    CONSTRAINT wallet_accounts_currency_valid CHECK (currency IN ('PHP', 'USD', 'EUR')),
    CONSTRAINT wallet_accounts_status_valid CHECK (status IN ('active', 'suspended', 'closed')),
    
    -- Unique constraint to ensure one wallet per user
    UNIQUE(user_id)
);

-- Create wallet_transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES wallet_accounts(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    payment_method VARCHAR(50),
    reference_id VARCHAR(100),
    reference_type VARCHAR(50),
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT wallet_transactions_amount_positive CHECK (amount > 0),
    CONSTRAINT wallet_transactions_type_valid CHECK (type IN ('topup', 'withdrawal', 'payment', 'refund', 'fee')),
    CONSTRAINT wallet_transactions_status_valid CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
    CONSTRAINT wallet_transactions_payment_method_valid CHECK (payment_method IN ('gcash', 'maya', 'bpi', 'bdo', 'paypal', 'stripe', 'internal'))
);

-- Enable RLS for wallet tables
ALTER TABLE wallet_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own wallet account" ON wallet_accounts;
DROP POLICY IF EXISTS "Users can update their own wallet account" ON wallet_accounts;
DROP POLICY IF EXISTS "System can insert wallet accounts" ON wallet_accounts;
DROP POLICY IF EXISTS "Users can view their own wallet transactions" ON wallet_transactions;
DROP POLICY IF EXISTS "System can insert wallet transactions" ON wallet_transactions;
DROP POLICY IF EXISTS "System can update wallet transactions" ON wallet_transactions;

-- Create RLS policies for wallet tables
CREATE POLICY "Users can view their own wallet account" ON wallet_accounts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet account" ON wallet_accounts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert wallet accounts" ON wallet_accounts
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own wallet transactions" ON wallet_transactions
    FOR SELECT USING (
        account_id IN (
            SELECT id FROM wallet_accounts WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert wallet transactions" ON wallet_transactions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update wallet transactions" ON wallet_transactions
    FOR UPDATE WITH CHECK (true);

-- ==============================================
-- 4. INDEXES FOR PERFORMANCE
-- ==============================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- Projects indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);

-- Wallet indexes
CREATE INDEX IF NOT EXISTS idx_wallet_accounts_user_id ON wallet_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_accounts_status ON wallet_accounts(status);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_account_id ON wallet_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON wallet_transactions(type);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_status ON wallet_transactions(status);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON wallet_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_reference_id ON wallet_transactions(reference_id);

-- ==============================================
-- 5. FUNCTIONS AND TRIGGERS
-- ==============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to create profile for new users
CREATE OR REPLACE FUNCTION create_profile_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, full_name, role, kyc_level)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'User'), 'user', 0);
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to create wallet for new users
CREATE OR REPLACE FUNCTION create_wallet_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO wallet_accounts (user_id, current_balance, currency)
    VALUES (NEW.id, 0.00, 'PHP');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to update project verification details
CREATE OR REPLACE FUNCTION update_verification_details()
RETURNS TRIGGER AS $$
BEGIN
    -- If status changed to approved or rejected, set verification details
    IF OLD.status != NEW.status AND NEW.status IN ('approved', 'rejected') THEN
        NEW.verified_by = auth.uid();
        NEW.verified_at = NOW();
    END IF;
    
    -- If status changed back to pending, clear verification details
    IF OLD.status != NEW.status AND NEW.status = 'pending' THEN
        NEW.verified_by = NULL;
        NEW.verified_at = NULL;
        NEW.verification_notes = NULL;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_wallet_accounts_updated_at ON wallet_accounts;
CREATE TRIGGER update_wallet_accounts_updated_at
    BEFORE UPDATE ON wallet_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_wallet_transactions_updated_at ON wallet_transactions;
CREATE TRIGGER update_wallet_transactions_updated_at
    BEFORE UPDATE ON wallet_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS create_profile_on_user_creation ON auth.users;
CREATE TRIGGER create_profile_on_user_creation
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_profile_for_new_user();

DROP TRIGGER IF EXISTS create_wallet_on_user_creation ON auth.users;
CREATE TRIGGER create_wallet_on_user_creation
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_wallet_for_new_user();

DROP TRIGGER IF EXISTS update_verification_details ON projects;
CREATE TRIGGER update_verification_details
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_verification_details();

-- ==============================================
-- 6. GRANT PERMISSIONS
-- ==============================================

GRANT ALL ON profiles TO authenticated;
GRANT ALL ON projects TO authenticated;
GRANT ALL ON wallet_accounts TO authenticated;
GRANT ALL ON wallet_transactions TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- ==============================================
-- 7. CREATE PROFILES FOR EXISTING USERS
-- ==============================================

-- Insert profiles for existing users who don't have one
INSERT INTO profiles (id, full_name, role, kyc_level)
SELECT 
    u.id,
    COALESCE(u.raw_user_meta_data->>'name', 'User') as full_name,
    'user' as role,
    0 as kyc_level
FROM auth.users u
WHERE u.id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;

-- Insert wallet accounts for existing users who don't have one
INSERT INTO wallet_accounts (user_id, current_balance, currency)
SELECT 
    id as user_id,
    0.00 as current_balance,
    'PHP' as currency
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM wallet_accounts)
ON CONFLICT (user_id) DO NOTHING;

-- ==============================================
-- 8. VERIFICATION QUERIES
-- ==============================================

-- Check table structures
SELECT 'profiles' as table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
UNION ALL
SELECT 'projects' as table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'projects' AND table_schema = 'public'
UNION ALL
SELECT 'wallet_accounts' as table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'wallet_accounts' AND table_schema = 'public'
UNION ALL
SELECT 'wallet_transactions' as table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'wallet_transactions' AND table_schema = 'public'
ORDER BY table_name, column_name;

-- Check current data
SELECT 'profiles' as table_name, COUNT(*) as record_count FROM profiles
UNION ALL
SELECT 'projects' as table_name, COUNT(*) as record_count FROM projects
UNION ALL
SELECT 'wallet_accounts' as table_name, COUNT(*) as record_count FROM wallet_accounts
UNION ALL
SELECT 'wallet_transactions' as table_name, COUNT(*) as record_count FROM wallet_transactions;

-- Check RLS policies
SELECT tablename, policyname, cmd, permissive
FROM pg_policies 
WHERE tablename IN ('profiles', 'projects', 'wallet_accounts', 'wallet_transactions')
ORDER BY tablename, policyname;

-- Success message
SELECT 'Database setup completed successfully! All tables, policies, and functions have been created.' as status;
