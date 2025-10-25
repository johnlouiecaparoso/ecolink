-- Complete Supabase Integration for EcoLink
-- This script sets up the complete database schema for project submission to marketplace flow

-- 1. Ensure all required tables exist with proper relationships

-- Projects table (already exists, but let's ensure it has all needed fields)
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

-- Project credits table (for approved projects)
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

-- Credit listings table (for marketplace)
CREATE TABLE IF NOT EXISTS credit_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_credits_id UUID REFERENCES project_credits(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES auth.users(id),
  quantity INTEGER NOT NULL,
  price_per_credit DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold_out', 'cancelled')),
  listed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credit transactions table (for purchases)
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID REFERENCES auth.users(id),
  seller_id UUID REFERENCES auth.users(id),
  project_credits_id UUID REFERENCES project_credits(id),
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

-- Credit ownership table (for tracking owned credits)
CREATE TABLE IF NOT EXISTS credit_ownership (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  transaction_id UUID REFERENCES credit_transactions(id),
  project_credits_id UUID REFERENCES project_credits(id),
  quantity INTEGER NOT NULL,
  ownership_status TEXT DEFAULT 'owned' CHECK (ownership_status IN ('owned', 'retired')),
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  retired_at TIMESTAMP WITH TIME ZONE,
  retirement_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project certificates table
CREATE TABLE IF NOT EXISTS project_certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  project_title TEXT NOT NULL,
  project_category TEXT,
  project_location TEXT,
  verification_standard TEXT DEFAULT 'EcoLink Standard',
  verifier_id UUID REFERENCES auth.users(id),
  verification_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verifier_notes TEXT,
  certificate_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'issued' CHECK (status IN ('issued', 'revoked')),
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credit certificates table
CREATE TABLE IF NOT EXISTS credit_certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID REFERENCES auth.users(id),
  transaction_id UUID REFERENCES credit_transactions(id),
  certificate_type TEXT DEFAULT 'purchase',
  credits_purchased INTEGER NOT NULL,
  certificate_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'retired')),
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_project_credits_project_id ON project_credits(project_id);
CREATE INDEX IF NOT EXISTS idx_credit_listings_status ON credit_listings(status);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_buyer_id ON credit_transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_seller_id ON credit_transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_credit_ownership_user_id ON credit_ownership(user_id);

-- 3. Create functions for automatic credit generation when project is approved

-- Function to generate credits when a project is approved
CREATE OR REPLACE FUNCTION generate_project_credits()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate credits when project status changes to 'approved'
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    
    -- Calculate credits based on project category and expected impact
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
        project_credits_id,
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

-- Create trigger to automatically generate credits when project is approved
DROP TRIGGER IF EXISTS trigger_generate_project_credits ON projects;
CREATE TRIGGER trigger_generate_project_credits
  AFTER UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION generate_project_credits();

-- 4. Function to handle credit purchases
CREATE OR REPLACE FUNCTION handle_credit_purchase()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process when transaction status changes to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    
    -- Update available credits in project_credits table
    UPDATE project_credits 
    SET available_credits = available_credits - NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.project_credits_id;
    
    -- Create credit ownership record
    INSERT INTO credit_ownership (
      user_id,
      transaction_id,
      project_credits_id,
      quantity
    ) VALUES (
      NEW.buyer_id,
      NEW.id,
      NEW.project_credits_id,
      NEW.quantity
    );
    
    -- Update listing quantity
    UPDATE credit_listings 
    SET quantity = quantity - NEW.quantity
    WHERE id = NEW.listing_id;
    
    -- Mark listing as sold_out if no more credits available
    UPDATE credit_listings 
    SET status = 'sold_out'
    WHERE id = NEW.listing_id 
    AND quantity <= 0;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to handle credit purchases
DROP TRIGGER IF EXISTS trigger_handle_credit_purchase ON credit_transactions;
CREATE TRIGGER trigger_handle_credit_purchase
  AFTER UPDATE ON credit_transactions
  FOR EACH ROW
  EXECUTE FUNCTION handle_credit_purchase();

-- 5. Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_ownership ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_certificates ENABLE ROW LEVEL SECURITY;

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

-- Project certificates policies
DROP POLICY IF EXISTS "Anyone can view project certificates" ON project_certificates;
CREATE POLICY "Anyone can view project certificates" ON project_certificates
  FOR SELECT USING (true);

-- Credit certificates policies
DROP POLICY IF EXISTS "Users can view their own credit certificates" ON credit_certificates;
CREATE POLICY "Users can view their own credit certificates" ON credit_certificates
  FOR SELECT USING (auth.uid() = buyer_id);

-- 7. Create sample data for testing
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
  ),
  (
    'Mangrove Restoration Philippines',
    'Restoration of degraded mangrove ecosystems in the Philippines to enhance carbon sequestration and protect coastal communities.',
    'Blue Carbon',
    'Philippines',
    'Restore 500 hectares of mangroves, sequester 2,000 tonnes of CO2 annually',
    '33333333-3333-3333-3333-333333333333',
    'approved'
  )
ON CONFLICT DO NOTHING;

-- 8. Create utility functions

-- Function to get marketplace listings with project details
CREATE OR REPLACE FUNCTION get_marketplace_listings()
RETURNS TABLE (
  listing_id UUID,
  project_id UUID,
  project_title TEXT,
  project_description TEXT,
  category TEXT,
  location TEXT,
  vintage_year INTEGER,
  verification_standard TEXT,
  available_quantity INTEGER,
  price_per_credit DECIMAL(10,2),
  currency TEXT,
  seller_name TEXT,
  listed_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cl.id as listing_id,
    p.id as project_id,
    p.title as project_title,
    p.description as project_description,
    p.category,
    p.location,
    pc.vintage_year,
    pc.verification_standard,
    cl.quantity as available_quantity,
    cl.price_per_credit,
    cl.currency,
    pr.full_name as seller_name,
    cl.listed_at
  FROM credit_listings cl
  JOIN project_credits pc ON cl.project_credits_id = pc.id
  JOIN projects p ON pc.project_id = p.id
  JOIN profiles pr ON cl.seller_id = pr.id
  WHERE cl.status = 'active'
  ORDER BY cl.listed_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Success message
SELECT 'Complete Supabase integration setup completed successfully!' as status;













