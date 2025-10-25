-- EcoLink Database Schema Setup
-- Run this in your Supabase SQL Editor

-- 1. Create profiles table
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create project_credits table
CREATE TABLE IF NOT EXISTS project_credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
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
  project_credits_id UUID REFERENCES project_credits(id),
  seller_id UUID REFERENCES profiles(id),
  quantity INTEGER,
  price_per_credit DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'active',
  listed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create credit_certificates table
CREATE TABLE IF NOT EXISTS credit_certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID REFERENCES profiles(id),
  listing_id UUID REFERENCES credit_listings(id),
  certificate_type TEXT,
  credits_purchased INTEGER,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create RLS (Row Level Security) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 8. Create policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 9. Create policies for projects
CREATE POLICY "Anyone can view active projects" ON projects
  FOR SELECT USING (status = 'active');

-- 10. Create policies for credit_listings
CREATE POLICY "Anyone can view active credit listings" ON credit_listings
  FOR SELECT USING (status = 'active');

-- 11. Create policies for credit_certificates
CREATE POLICY "Users can view their own certificates" ON credit_certificates
  FOR SELECT USING (auth.uid() = buyer_id);

-- 12. Create policies for audit_logs
CREATE POLICY "Users can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 13. Insert sample data (only if you want demo data)
-- INSERT INTO profiles (id, full_name, email, role) VALUES
--   (auth.uid(), 'Demo User', 'demo@example.com', 'general_user')
-- ON CONFLICT (id) DO NOTHING;

INSERT INTO projects (title, description, category, location) VALUES
  ('Amazon Rainforest Protection', 'Protecting 10,000 hectares of primary rainforest', 'Forestry', 'Brazil'),
  ('Solar Energy Initiative', 'Large-scale solar farm in Kenya', 'Renewable Energy', 'Kenya'),
  ('Blue Carbon Project', 'Mangrove restoration project', 'Blue Carbon', 'Philippines');

-- 14. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 15. Create trigger for profiles table
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 16. Create function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
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
        -- Profile already exists, just return
        RETURN new;
    WHEN OTHERS THEN
        -- Log error but don't fail user creation
        RAISE WARNING 'Could not create profile for user %: %', new.id, SQLERRM;
        RETURN new;
END;
$$ language plpgsql security definer;

-- 17. Create trigger to automatically create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 18. Create credit_transactions table for marketplace transactions
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID REFERENCES profiles(id) NOT NULL,
  seller_id UUID REFERENCES profiles(id) NOT NULL,
  project_credits_id UUID REFERENCES project_credits(id) NOT NULL,
  quantity INTEGER NOT NULL,
  price_per_credit DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'PHP',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled', 'failed')),
  payment_method TEXT,
  platform_fee_percentage DECIMAL(5,2) DEFAULT 2.5,
  certificate_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 19. Create receipts table for transaction receipts
CREATE TABLE IF NOT EXISTS receipts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID REFERENCES credit_transactions(id) NOT NULL,
  receipt_number TEXT NOT NULL UNIQUE,
  buyer_id UUID REFERENCES profiles(id) NOT NULL,
  seller_id UUID REFERENCES profiles(id) NOT NULL,
  receipt_data JSONB NOT NULL,
  status TEXT DEFAULT 'issued' CHECK (status IN ('issued', 'downloaded', 'void')),
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  downloaded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 20. Enable RLS on new tables
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

-- 21. Create RLS policies for credit_transactions
CREATE POLICY "Users can view their own transactions" ON credit_transactions
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can insert transactions as buyer" ON credit_transactions
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- 22. Create RLS policies for receipts
CREATE POLICY "Users can view their own receipts" ON receipts
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "System can insert receipts" ON receipts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update receipt download status" ON receipts
  FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- 23. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_credit_listings_status ON credit_listings(status);
CREATE INDEX IF NOT EXISTS idx_credit_certificates_buyer ON credit_certificates(buyer_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_buyer ON credit_transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_seller ON credit_transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_status ON credit_transactions(status);
CREATE INDEX IF NOT EXISTS idx_receipts_buyer ON receipts(buyer_id);
CREATE INDEX IF NOT EXISTS idx_receipts_seller ON receipts(seller_id);
CREATE INDEX IF NOT EXISTS idx_receipts_transaction ON receipts(transaction_id);
CREATE INDEX IF NOT EXISTS idx_receipts_number ON receipts(receipt_number);
