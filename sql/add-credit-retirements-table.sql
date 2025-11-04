-- ═══════════════════════════════════════════════════════════════════════════
-- ADD CREDIT_RETIREMENTS TABLE
-- Creates the table for tracking retired carbon credits
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS credit_retirements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  reason TEXT,
  retired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE credit_retirements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view their own retirements" ON credit_retirements;
CREATE POLICY "Users can view their own retirements" ON credit_retirements
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can insert their own retirements" ON credit_retirements;
CREATE POLICY "Users can insert their own retirements" ON credit_retirements
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_credit_retirements_user_id ON credit_retirements(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_retirements_project_id ON credit_retirements(project_id);
CREATE INDEX IF NOT EXISTS idx_credit_retirements_retired_at ON credit_retirements(retired_at);

-- Verify creation
SELECT 'Credit retirements table created successfully!' AS status;






