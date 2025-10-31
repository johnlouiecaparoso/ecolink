-- EcoLink Receipts and Transactions Setup for Supabase
-- Run this in your Supabase SQL Editor to set up the missing tables

-- 0. Update projects table to add missing columns
ALTER TABLE projects ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS expected_impact TEXT;
ALTER TABLE projects ALTER COLUMN status SET DEFAULT 'pending';

-- 1. Create credit_transactions table if it doesn't exist
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

-- 2. Create receipts table if it doesn't exist
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

-- 2. Update existing credit_ownership table to align with our expected schema
-- First, add missing columns if they don't exist (non-destructive approach)
ALTER TABLE credit_ownership ADD COLUMN IF NOT EXISTS ownership_status TEXT DEFAULT 'owned' CHECK (ownership_status IN ('owned', 'retired', 'transferred'));
ALTER TABLE credit_ownership ADD COLUMN IF NOT EXISTS project_credits_id UUID REFERENCES project_credits(id);
ALTER TABLE credit_ownership ADD COLUMN IF NOT EXISTS purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE credit_ownership ADD COLUMN IF NOT EXISTS retired_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE credit_ownership ADD COLUMN IF NOT EXISTS retirement_reason TEXT;

-- Backfill ownership_status from existing status column if needed
UPDATE credit_ownership 
SET ownership_status = CASE 
  WHEN status = 'owned' THEN 'owned'
  WHEN status = 'retired' THEN 'retired' 
  WHEN status = 'transferred' THEN 'transferred'
  ELSE 'owned' 
END 
WHERE ownership_status IS NULL;

-- Backfill project_credits_id from existing project_credit_id if needed
UPDATE credit_ownership 
SET project_credits_id = project_credit_id 
WHERE project_credits_id IS NULL AND project_credit_id IS NOT NULL;

-- 3. Enable Row Level Security
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_ownership ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for credit_transactions
DROP POLICY IF EXISTS "Users can view their own transactions" ON credit_transactions;
CREATE POLICY "Users can view their own transactions" ON credit_transactions
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

DROP POLICY IF EXISTS "Users can insert transactions as buyer" ON credit_transactions;
CREATE POLICY "Users can insert transactions as buyer" ON credit_transactions
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- 5. Create RLS policies for receipts
DROP POLICY IF EXISTS "Users can view their own receipts" ON receipts;
CREATE POLICY "Users can view their own receipts" ON receipts
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

DROP POLICY IF EXISTS "System can insert receipts" ON receipts;
CREATE POLICY "System can insert receipts" ON receipts
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update receipt download status" ON receipts;
CREATE POLICY "Users can update receipt download status" ON receipts
  FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- 6. Create RLS policies for credit_ownership
DROP POLICY IF EXISTS "Users can view their own credit ownership" ON credit_ownership;
CREATE POLICY "Users can view their own credit ownership" ON credit_ownership
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own credit ownership" ON credit_ownership;
CREATE POLICY "Users can update their own credit ownership" ON credit_ownership
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert credit ownership" ON credit_ownership;
CREATE POLICY "System can insert credit ownership" ON credit_ownership
  FOR INSERT WITH CHECK (true);

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_credit_transactions_buyer ON credit_transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_seller ON credit_transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_status ON credit_transactions(status);
CREATE INDEX IF NOT EXISTS idx_receipts_buyer ON receipts(buyer_id);
CREATE INDEX IF NOT EXISTS idx_receipts_seller ON receipts(seller_id);
CREATE INDEX IF NOT EXISTS idx_receipts_transaction ON receipts(transaction_id);
CREATE INDEX IF NOT EXISTS idx_receipts_number ON receipts(receipt_number);
CREATE INDEX IF NOT EXISTS idx_credit_ownership_user ON credit_ownership(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_ownership_status ON credit_ownership(ownership_status);

-- 7. Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_credit_transactions_updated_at ON credit_transactions;
CREATE TRIGGER update_credit_transactions_updated_at 
    BEFORE UPDATE ON credit_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Create function to populate credit_ownership when transaction is completed
CREATE OR REPLACE FUNCTION create_credit_ownership_on_completion()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create ownership record when transaction becomes 'completed'
    IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
        -- Try to insert with both old and new column names for compatibility
        BEGIN
            INSERT INTO credit_ownership (
                user_id,
                transaction_id,
                project_credits_id,
                quantity,
                ownership_status,
                purchase_date
            ) VALUES (
                NEW.buyer_id,
                NEW.id,
                NEW.project_credits_id,
                NEW.quantity,
                'owned',
                COALESCE(NEW.completed_at, NOW())
            )
            ON CONFLICT (transaction_id) DO NOTHING;
        EXCEPTION
            WHEN undefined_column THEN
                -- Fallback to existing column names if new columns don't exist yet
                INSERT INTO credit_ownership (
                    user_id,
                    transaction_id,
                    project_credit_id,
                    quantity,
                    status,
                    purchase_price
                ) VALUES (
                    NEW.buyer_id,
                    NEW.id,
                    NEW.project_credits_id,
                    NEW.quantity,
                    'owned',
                    NEW.price_per_credit * NEW.quantity
                )
                ON CONFLICT (transaction_id) DO NOTHING;
        END;
    END IF;
    
    RETURN NEW;
END;
$$ language plpgsql;

-- 9. Create trigger to populate credit_ownership
DROP TRIGGER IF EXISTS create_ownership_on_transaction_complete ON credit_transactions;
CREATE TRIGGER create_ownership_on_transaction_complete
    AFTER UPDATE ON credit_transactions
    FOR EACH ROW EXECUTE FUNCTION create_credit_ownership_on_completion();
