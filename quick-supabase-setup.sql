-- Quick Supabase Setup for Project Submission to Marketplace
-- Run this in your Supabase SQL Editor to make the project workflow functional

-- 1. Create projects table (if not exists)
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create project_credits table (for approved projects)
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

-- 3. Create credit_listings table (for marketplace)
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

-- 4. Create credit_transactions table (for purchases)
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

-- 5. Enable RLS (Row Level Security)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies
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

-- 7. Create function to generate credits when project is approved
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

-- 8. Create trigger to automatically generate credits when project is approved
DROP TRIGGER IF EXISTS trigger_generate_project_credits ON projects;
CREATE TRIGGER trigger_generate_project_credits
  AFTER UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION generate_project_credits();

-- 9. Create test user in auth.users (for testing purposes only)
-- Note: This bypasses normal auth flow and should only be used for development/testing
INSERT INTO auth.users (
  id,
  email,
  created_at,
  updated_at,
  email_confirmed_at,
  phone,
  phone_confirmed_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token,
  encrypted_password
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  'test@ecolink.test',
  NOW(),
  NOW(),
  NOW(),
  NULL,
  NULL,
  '',
  '',
  '',
  '',
  '$2a$10$dummy.password.hash.for.testing'
) ON CONFLICT (id) DO NOTHING;

-- 10. Insert test projects that are already approved (for immediate testing)
INSERT INTO projects (title, description, category, location, expected_impact, user_id, status) VALUES
  (
    'Amazon Rainforest Protection Initiative',
    'Protecting 10,000 hectares of primary rainforest in the Amazon basin through community-based conservation efforts. This project prevents deforestation and supports local indigenous communities.',
    'Forestry',
    'Brazil',
    'Prevent deforestation of 10,000 hectares, protect biodiversity, support local communities',
    '33333333-3333-3333-3333-333333333333', -- Test user ID
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

-- 11. Success message
SELECT 'Quick Supabase setup completed! Project submission to marketplace is now functional.' as status;
