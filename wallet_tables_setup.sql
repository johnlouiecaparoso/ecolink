-- Wallet Tables Setup for EcoLink Sprint 2
-- This script creates the necessary tables for the wallet and payment system

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS wallet_transactions CASCADE;
DROP TABLE IF EXISTS wallet_accounts CASCADE;

-- Create wallet_accounts table
CREATE TABLE wallet_accounts (
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

-- Create wallet_transactions table
CREATE TABLE wallet_transactions (
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

-- Create indexes for better performance
CREATE INDEX idx_wallet_accounts_user_id ON wallet_accounts(user_id);
CREATE INDEX idx_wallet_accounts_status ON wallet_accounts(status);
CREATE INDEX idx_wallet_transactions_account_id ON wallet_transactions(account_id);
CREATE INDEX idx_wallet_transactions_type ON wallet_transactions(type);
CREATE INDEX idx_wallet_transactions_status ON wallet_transactions(status);
CREATE INDEX idx_wallet_transactions_created_at ON wallet_transactions(created_at DESC);
CREATE INDEX idx_wallet_transactions_reference_id ON wallet_transactions(reference_id);

-- Enable Row Level Security (RLS)
ALTER TABLE wallet_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for wallet_accounts
CREATE POLICY "Users can view their own wallet account" ON wallet_accounts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet account" ON wallet_accounts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert wallet accounts" ON wallet_accounts
    FOR INSERT WITH CHECK (true);

-- Create RLS policies for wallet_transactions
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

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_wallet_accounts_updated_at
    BEFORE UPDATE ON wallet_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallet_transactions_updated_at
    BEFORE UPDATE ON wallet_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically create wallet account for new users
CREATE OR REPLACE FUNCTION create_wallet_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO wallet_accounts (user_id, current_balance, currency)
    VALUES (NEW.id, 0.00, 'PHP');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to create wallet when user is created
CREATE TRIGGER create_wallet_on_user_creation
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_wallet_for_new_user();

-- Insert some sample data for testing (optional)
-- This will create wallet accounts for existing users
INSERT INTO wallet_accounts (user_id, current_balance, currency)
SELECT 
    id as user_id,
    1000.00 as current_balance,
    'PHP' as currency
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM wallet_accounts)
ON CONFLICT (user_id) DO NOTHING;

-- Insert some sample transactions for testing (optional)
INSERT INTO wallet_transactions (account_id, type, amount, status, payment_method, description)
SELECT 
    wa.id as account_id,
    'topup' as type,
    1000.00 as amount,
    'completed' as status,
    'internal' as payment_method,
    'Initial wallet funding' as description
FROM wallet_accounts wa
WHERE wa.current_balance > 0
AND wa.id NOT IN (SELECT account_id FROM wallet_transactions WHERE type = 'topup');

-- Grant necessary permissions
GRANT ALL ON wallet_accounts TO authenticated;
GRANT ALL ON wallet_transactions TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Create a view for wallet summary (useful for reporting)
CREATE VIEW wallet_summary AS
SELECT 
    wa.id as wallet_id,
    wa.user_id,
    wa.current_balance,
    wa.currency,
    wa.status as wallet_status,
    wa.created_at as wallet_created_at,
    COUNT(wt.id) as total_transactions,
    COALESCE(SUM(CASE WHEN wt.type = 'topup' AND wt.status = 'completed' THEN wt.amount ELSE 0 END), 0) as total_topups,
    COALESCE(SUM(CASE WHEN wt.type = 'withdrawal' AND wt.status = 'completed' THEN wt.amount ELSE 0 END), 0) as total_withdrawals,
    COALESCE(SUM(CASE WHEN wt.type = 'payment' AND wt.status = 'completed' THEN wt.amount ELSE 0 END), 0) as total_payments
FROM wallet_accounts wa
LEFT JOIN wallet_transactions wt ON wa.id = wt.account_id
GROUP BY wa.id, wa.user_id, wa.current_balance, wa.currency, wa.status, wa.created_at;

-- Grant access to the view
GRANT SELECT ON wallet_summary TO authenticated;

COMMENT ON TABLE wallet_accounts IS 'User wallet accounts for storing balances and currency information';
COMMENT ON TABLE wallet_transactions IS 'Transaction history for wallet operations including top-ups, withdrawals, and payments';
COMMENT ON VIEW wallet_summary IS 'Summary view of wallet accounts with transaction statistics';
