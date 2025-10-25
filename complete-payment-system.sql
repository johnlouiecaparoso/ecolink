-- Complete Payment and Transaction System
-- This script creates all necessary tables for real payment processing

-- 1. Payment Transactions Table
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_id VARCHAR(255) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'PHP',
    payment_method VARCHAR(50) NOT NULL, -- 'gcash', 'maya', 'bank_transfer'
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'cancelled'
    gateway_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Credit Ownership Table (Enhanced)
CREATE TABLE IF NOT EXISTS credit_ownership (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    ownership_type VARCHAR(50) NOT NULL DEFAULT 'purchased', -- 'purchased', 'earned', 'transferred'
    transaction_id UUID REFERENCES credit_purchases(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, project_id)
);

-- 3. Credit Retirements Table
CREATE TABLE IF NOT EXISTS credit_retirements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    reason TEXT,
    retired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Credit Purchases Table (Enhanced)
CREATE TABLE IF NOT EXISTS credit_purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id UUID NOT NULL REFERENCES credit_listings(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    credits_amount INTEGER NOT NULL CHECK (credits_amount > 0),
    price_per_credit DECIMAL(10,2) NOT NULL CHECK (price_per_credit > 0),
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    payment_method VARCHAR(50) NOT NULL,
    payment_reference VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_transaction_id ON payment_transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON payment_transactions(created_at);

CREATE INDEX IF NOT EXISTS idx_credit_ownership_user_id ON credit_ownership(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_ownership_project_id ON credit_ownership(project_id);
CREATE INDEX IF NOT EXISTS idx_credit_ownership_type ON credit_ownership(ownership_type);

CREATE INDEX IF NOT EXISTS idx_credit_retirements_user_id ON credit_retirements(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_retirements_project_id ON credit_retirements(project_id);
CREATE INDEX IF NOT EXISTS idx_credit_retirements_retired_at ON credit_retirements(retired_at);

CREATE INDEX IF NOT EXISTS idx_credit_purchases_buyer_id ON credit_purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_seller_id ON credit_purchases(seller_id);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_listing_id ON credit_purchases(listing_id);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_status ON credit_purchases(status);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_created_at ON credit_purchases(created_at);

-- 6. Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_payment_transactions_updated_at ON payment_transactions;
DROP TRIGGER IF EXISTS update_credit_ownership_updated_at ON credit_ownership;
DROP TRIGGER IF EXISTS update_credit_purchases_updated_at ON credit_purchases;

-- Create triggers
CREATE TRIGGER update_payment_transactions_updated_at
    BEFORE UPDATE ON payment_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_credit_ownership_updated_at
    BEFORE UPDATE ON credit_ownership
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_credit_purchases_updated_at
    BEFORE UPDATE ON credit_purchases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Add Row Level Security (RLS) policies
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_ownership ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_retirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_purchases ENABLE ROW LEVEL SECURITY;

-- Payment transactions policies
CREATE POLICY "Users can view their own payment transactions" ON payment_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment transactions" ON payment_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment transactions" ON payment_transactions
    FOR UPDATE USING (auth.uid() = user_id);

-- Credit ownership policies
CREATE POLICY "Users can view their own credit ownership" ON credit_ownership
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credit ownership" ON credit_ownership
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own credit ownership" ON credit_ownership
    FOR UPDATE USING (auth.uid() = user_id);

-- Credit retirements policies
CREATE POLICY "Users can view their own credit retirements" ON credit_retirements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credit retirements" ON credit_retirements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Credit purchases policies
CREATE POLICY "Users can view their own credit purchases" ON credit_purchases
    FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can insert their own credit purchases" ON credit_purchases
    FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Users can update their own credit purchases" ON credit_purchases
    FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- 8. Add comments for documentation
COMMENT ON TABLE payment_transactions IS 'Records of all payment transactions processed through the system';
COMMENT ON TABLE credit_ownership IS 'Tracks user ownership of carbon credits from different projects';
COMMENT ON TABLE credit_retirements IS 'Records when users retire/use their carbon credits';
COMMENT ON TABLE credit_purchases IS 'Records of credit purchase transactions between buyers and sellers';

COMMENT ON COLUMN payment_transactions.transaction_id IS 'Unique transaction ID from payment gateway';
COMMENT ON COLUMN payment_transactions.gateway_response IS 'Full response from payment gateway (GCash/Maya)';
COMMENT ON COLUMN credit_ownership.ownership_type IS 'Type of ownership: purchased, earned, transferred';
COMMENT ON COLUMN credit_ownership.transaction_id IS 'Reference to the purchase transaction that created this ownership';
COMMENT ON COLUMN credit_retirements.reason IS 'Reason for retiring credits (e.g., carbon offset, corporate goal)';

-- 9. Create views for easier querying
CREATE OR REPLACE VIEW user_credit_portfolio AS
SELECT 
    co.user_id,
    co.project_id,
    p.title as project_title,
    p.description as project_description,
    p.category as project_category,
    p.location as project_location,
    p.project_image,
    p.image_name,
    p.image_type,
    co.quantity,
    co.ownership_type,
    co.created_at as owned_since,
    co.updated_at as last_updated
FROM credit_ownership co
JOIN projects p ON co.project_id = p.id
WHERE co.quantity > 0;

CREATE OR REPLACE VIEW user_transaction_summary AS
SELECT 
    user_id,
    COUNT(*) as total_transactions,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_transactions,
    SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END) as total_spent,
    MAX(created_at) as last_transaction_date
FROM credit_purchases
GROUP BY user_id;

-- 10. Verify the setup
SELECT 
    'Payment System Setup Complete' as status,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name IN ('payment_transactions', 'credit_ownership', 'credit_retirements', 'credit_purchases')) as tables_created,
    (SELECT COUNT(*) FROM information_schema.views WHERE view_name IN ('user_credit_portfolio', 'user_transaction_summary')) as views_created;




