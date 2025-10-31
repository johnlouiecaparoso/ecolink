-- Fix Certificates Table Permission Issue
-- This script fixes the certificates table and its permissions

-- 1. Drop the certificates table if it exists (to recreate it properly)
DROP TABLE IF EXISTS certificates CASCADE;

-- 2. Recreate the certificates table with proper structure
CREATE TABLE certificates (
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

-- 3. Enable RLS on certificates table
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for certificates
DROP POLICY IF EXISTS "Users can view their own certificates" ON certificates;
CREATE POLICY "Users can view their own certificates" ON certificates
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own certificates" ON certificates;
CREATE POLICY "Users can insert their own certificates" ON certificates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own certificates" ON certificates;
CREATE POLICY "Users can update their own certificates" ON certificates
  FOR UPDATE USING (auth.uid() = user_id);

-- 5. Grant necessary permissions
GRANT ALL ON certificates TO authenticated;
GRANT ALL ON certificates TO anon;

-- 6. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_certificate_number ON certificates(certificate_number);

-- 7. Success message
SELECT 'Certificates table fixed successfully!' as status;

