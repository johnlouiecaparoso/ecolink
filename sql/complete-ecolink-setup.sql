-- ═══════════════════════════════════════════════════════════════
-- COMPLETE ECOLINK DATABASE SETUP
-- Run this once in Supabase SQL Editor to set up everything
-- ═══════════════════════════════════════════════════════════════

-- ⚠️ IMPORTANT: If you have existing tables with wrong schemas,
-- uncomment these DROP statements to recreate them correctly:

-- DROP TABLE IF EXISTS audit_logs CASCADE;
-- DROP TABLE IF EXISTS receipts CASCADE;
-- DROP TABLE IF EXISTS certificates CASCADE;
-- DROP TABLE IF EXISTS wallet_transactions CASCADE;
-- DROP TABLE IF EXISTS wallet_accounts CASCADE;
-- DROP TABLE IF EXISTS credit_transactions CASCADE;
-- DROP TABLE IF EXISTS credit_purchases CASCADE;
-- DROP TABLE IF EXISTS credit_ownership CASCADE;
-- DROP TABLE IF EXISTS credit_listings CASCADE;
-- DROP TABLE IF EXISTS project_credits CASCADE;
-- DROP TABLE IF EXISTS projects CASCADE;
-- DROP TABLE IF EXISTS profiles CASCADE;

-- ───────────────────────────────────────────────────────────────
-- 1. PROFILES TABLE (Complete Setup)
-- ───────────────────────────────────────────────────────────────

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
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
  notification_preferences JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'email') THEN
        ALTER TABLE profiles ADD COLUMN email TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'company') THEN
        ALTER TABLE profiles ADD COLUMN company TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'location') THEN
        ALTER TABLE profiles ADD COLUMN location TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'bio') THEN
        ALTER TABLE profiles ADD COLUMN bio TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'phone') THEN
        ALTER TABLE profiles ADD COLUMN phone TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'website') THEN
        ALTER TABLE profiles ADD COLUMN website TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'notification_preferences') THEN
        ALTER TABLE profiles ADD COLUMN notification_preferences JSONB DEFAULT '{
            "emailNotifications": { "enabled": true },
            "projectUpdates": { "enabled": true },
            "marketAlerts": { "enabled": false },
            "newsletter": { "enabled": true }
        }'::jsonb;
    END IF;
END $$;

-- Update existing profiles with defaults
UPDATE profiles 
SET notification_preferences = '{
    "emailNotifications": { "enabled": true },
    "projectUpdates": { "enabled": true },
    "marketAlerts": { "enabled": false },
    "newsletter": { "enabled": true }
}'::jsonb
WHERE notification_preferences IS NULL;

-- ───────────────────────────────────────────────────────────────
-- 2. PROJECTS TABLE
-- ───────────────────────────────────────────────────────────────

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

-- ───────────────────────────────────────────────────────────────
-- 3. PROJECT_CREDITS TABLE
-- ───────────────────────────────────────────────────────────────

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

-- ───────────────────────────────────────────────────────────────
-- 4. CREDIT_LISTINGS TABLE
-- ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS credit_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_credit_id UUID REFERENCES project_credits(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES profiles(id),
  quantity INTEGER NOT NULL,
  price_per_credit DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ───────────────────────────────────────────────────────────────
-- 5. CREDIT_OWNERSHIP TABLE
-- ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS credit_ownership (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  ownership_type TEXT DEFAULT 'purchased',
  transaction_id UUID,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ───────────────────────────────────────────────────────────────
-- 6. CREDIT_PURCHASES TABLE
-- ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS credit_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES credit_listings(id),
  buyer_id UUID REFERENCES profiles(id),
  seller_id UUID REFERENCES profiles(id),
  credits_amount INTEGER NOT NULL,
  price_per_credit DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- ───────────────────────────────────────────────────────────────
-- 7. CREDIT_TRANSACTIONS TABLE
-- ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID REFERENCES profiles(id),
  seller_id UUID REFERENCES profiles(id),
  project_credit_id UUID REFERENCES project_credits(id),
  listing_id UUID REFERENCES credit_listings(id),
  quantity INTEGER NOT NULL,
  price_per_credit DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_method TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- ───────────────────────────────────────────────────────────────
-- 8. WALLET TABLES
-- ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS wallet_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  account_type TEXT DEFAULT 'primary',
  current_balance DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_account_id UUID REFERENCES wallet_accounts(id),
  user_id UUID REFERENCES profiles(id),
  type TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_method TEXT,
  status TEXT DEFAULT 'pending',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ───────────────────────────────────────────────────────────────
-- 9. CERTIFICATES AND RECEIPTS
-- ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  transaction_id UUID,
  certificate_number TEXT UNIQUE NOT NULL,
  certificate_type TEXT DEFAULT 'carbon_credit',
  credits_purchased INTEGER,
  status TEXT DEFAULT 'active',
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS receipts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID REFERENCES credit_transactions(id),
  receipt_number TEXT UNIQUE NOT NULL,
  buyer_id UUID REFERENCES profiles(id),
  seller_id UUID REFERENCES profiles(id),
  receipt_data JSONB NOT NULL,
  status TEXT DEFAULT 'issued',
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  downloaded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ───────────────────────────────────────────────────────────────
-- 10. AUDIT LOGS
-- ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ───────────────────────────────────────────────────────────────
-- 11. TRIGGERS AND FUNCTIONS
-- ───────────────────────────────────────────────────────────────

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_credit_listings_updated_at ON credit_listings;
CREATE TRIGGER update_credit_listings_updated_at BEFORE UPDATE ON credit_listings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_credit_ownership_updated_at ON credit_ownership;
CREATE TRIGGER update_credit_ownership_updated_at BEFORE UPDATE ON credit_ownership
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_wallet_accounts_updated_at ON wallet_accounts;
CREATE TRIGGER update_wallet_accounts_updated_at BEFORE UPDATE ON wallet_accounts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
        new.email,
        'general_user'
    );
    RETURN new;
EXCEPTION
    WHEN unique_violation THEN
        RETURN new;
    WHEN OTHERS THEN
        RAISE WARNING 'Could not create profile for user %: %', new.id, SQLERRM;
        RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ───────────────────────────────────────────────────────────────
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- ───────────────────────────────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_ownership ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id
    AND role IN ('admin', 'super_admin', 'Administrator', 'Admin')
  );
$$;

-- Helper function to check if user is verifier
CREATE OR REPLACE FUNCTION public.is_verifier(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id
    AND role IN ('verifier', 'Verifier', 'VERIFIER')
  );
$$;

-- PROFILES POLICIES
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- PROJECTS POLICIES
DROP POLICY IF EXISTS "Anyone can view approved projects" ON projects;
CREATE POLICY "Anyone can view approved projects" ON projects
    FOR SELECT USING (status = 'approved' OR user_id = auth.uid() OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Verifiers can view pending projects" ON projects;
CREATE POLICY "Verifiers can view pending projects" ON projects
    FOR SELECT USING (public.is_verifier(auth.uid()) OR status = 'approved' OR user_id = auth.uid() OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can create their own projects" ON projects;
CREATE POLICY "Users can create their own projects" ON projects
    FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can update any project" ON projects;
CREATE POLICY "Admins can update any project" ON projects
    FOR UPDATE USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Verifiers can update project status" ON projects;
CREATE POLICY "Verifiers can update project status" ON projects
    FOR UPDATE USING (public.is_verifier(auth.uid()));

-- CREDIT_LISTINGS POLICIES
DROP POLICY IF EXISTS "Anyone can view active listings" ON credit_listings;
CREATE POLICY "Anyone can view active listings" ON credit_listings
    FOR SELECT USING (status = 'active' OR seller_id = auth.uid() OR public.is_admin(auth.uid()));

-- CREDIT_OWNERSHIP POLICIES
DROP POLICY IF EXISTS "Users can view their own ownership" ON credit_ownership;
CREATE POLICY "Users can view their own ownership" ON credit_ownership
    FOR SELECT USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can insert their own ownership" ON credit_ownership;
CREATE POLICY "Users can insert their own ownership" ON credit_ownership
    FOR INSERT WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- CREDIT_PURCHASES POLICIES
DROP POLICY IF EXISTS "Users can view their own purchases" ON credit_purchases;
CREATE POLICY "Users can view their own purchases" ON credit_purchases
    FOR SELECT USING (buyer_id = auth.uid() OR seller_id = auth.uid() OR public.is_admin(auth.uid()));

-- CREDIT_TRANSACTIONS POLICIES
DROP POLICY IF EXISTS "Users can view their own transactions" ON credit_transactions;
CREATE POLICY "Users can view their own transactions" ON credit_transactions
    FOR SELECT USING (buyer_id = auth.uid() OR seller_id = auth.uid() OR public.is_admin(auth.uid()));

-- WALLET POLICIES
DROP POLICY IF EXISTS "Users can view their own wallet" ON wallet_accounts;
CREATE POLICY "Users can view their own wallet" ON wallet_accounts
    FOR SELECT USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can insert their own wallet" ON wallet_accounts;
CREATE POLICY "Users can insert their own wallet" ON wallet_accounts
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- CERTIFICATES POLICIES
DROP POLICY IF EXISTS "Users can view their own certificates" ON certificates;
CREATE POLICY "Users can view their own certificates" ON certificates
    FOR SELECT USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- RECEIPTS POLICIES
DROP POLICY IF EXISTS "Users can view their own receipts" ON receipts;
CREATE POLICY "Users can view their own receipts" ON receipts
    FOR SELECT USING (buyer_id = auth.uid() OR seller_id = auth.uid() OR public.is_admin(auth.uid()));

-- AUDIT_LOGS POLICIES (Admin only)
DROP POLICY IF EXISTS "Admins can view all audit logs" ON audit_logs;
CREATE POLICY "Admins can view all audit logs" ON audit_logs
    FOR SELECT USING (public.is_admin(auth.uid()));

-- ───────────────────────────────────────────────────────────────
-- 13. INDEXES FOR PERFORMANCE
-- ───────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_credit_listings_status ON credit_listings(status);
CREATE INDEX IF NOT EXISTS idx_credit_ownership_user_id ON credit_ownership(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_ownership_project_id ON credit_ownership(project_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- ───────────────────────────────────────────────────────────────
-- SUCCESS MESSAGE
-- ───────────────────────────────────────────────────────────────

SELECT '🎉 Database setup complete! All tables, policies, and triggers are ready.' as status;


