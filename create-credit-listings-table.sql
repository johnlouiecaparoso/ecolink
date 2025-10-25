-- Create credit_listings table for marketplace
-- Run this in your Supabase SQL Editor

-- 1. Create credit_listings table if it doesn't exist
CREATE TABLE IF NOT EXISTS credit_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  location TEXT,
  price_per_credit DECIMAL(10,2) NOT NULL DEFAULT 15.00,
  available_quantity INTEGER NOT NULL DEFAULT 1000,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  vintage_year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  verification_standard TEXT DEFAULT 'EcoLink Standard',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_credit_listings_project_id ON credit_listings(project_id);
CREATE INDEX IF NOT EXISTS idx_credit_listings_seller_id ON credit_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_credit_listings_status ON credit_listings(status);
CREATE INDEX IF NOT EXISTS idx_credit_listings_category ON credit_listings(category);

-- 3. Enable RLS on credit_listings table
ALTER TABLE credit_listings ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for credit_listings
-- Allow everyone to view active listings
CREATE POLICY "Anyone can view active credit listings" ON credit_listings
  FOR SELECT
  USING (status = 'active');

-- Allow sellers to manage their own listings
CREATE POLICY "Sellers can manage their own listings" ON credit_listings
  FOR ALL
  USING (seller_id = auth.uid());

-- Allow admins to manage all listings
CREATE POLICY "Admins can manage all credit listings" ON credit_listings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 5. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Create trigger to automatically update updated_at
CREATE TRIGGER update_credit_listings_updated_at 
  BEFORE UPDATE ON credit_listings 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();









