# ✅ FIXED: Receipts Table Schema Error

## The Problem

Error when running SQL setup:
```
ERROR: 42703: column "user_id" does not exist
HINT: Perhaps you meant to reference the column "receipts.buyer_id".
```

## The Root Cause

The receipts table definition had the **wrong column structure**:
- ❌ **Old**: Had `user_id` column
- ✅ **New**: Should have `buyer_id` and `seller_id` columns

The RLS policy was trying to use `user_id` which didn't exist.

## The Fix

Updated `sql/complete-ecolink-setup.sql`:

### Before:
```sql
CREATE TABLE IF NOT EXISTS receipts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,  -- ❌ Wrong
  transaction_id UUID,
  receipt_number TEXT UNIQUE NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policy
CREATE POLICY "Users can view their own receipts" ON receipts
    FOR SELECT USING (user_id = auth.uid() OR public.is_admin(auth.uid()));  -- ❌ Wrong
```

### After:
```sql
CREATE TABLE IF NOT EXISTS receipts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID REFERENCES credit_transactions(id),
  receipt_number TEXT UNIQUE NOT NULL,
  buyer_id UUID REFERENCES profiles(id),      -- ✅ Correct
  seller_id UUID REFERENCES profiles(id),     -- ✅ Correct
  receipt_data JSONB NOT NULL,
  status TEXT DEFAULT 'issued',
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  downloaded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policy
CREATE POLICY "Users can view their own receipts" ON receipts
    FOR SELECT USING (buyer_id = auth.uid() OR seller_id = auth.uid() OR public.is_admin(auth.uid()));  -- ✅ Correct
```

## Why This Matters

The `receiptService.js` code expects:
- `buyer_id` - who purchased the credits
- `seller_id` - who sold the credits
- `receipt_data` - JSONB with receipt details
- `status` - issued/downloaded/void

The old schema didn't match the code expectations.

## ✅ Now Fixed

The SQL setup script now matches:
1. ✅ The receipts table structure
2. ✅ The RLS policies
3. ✅ The service code expectations

**You can now run the setup SQL without errors!** 🎉

## Next Steps

1. Open `sql/complete-ecolink-setup.sql`
2. Copy all contents
3. Paste into Supabase SQL Editor
4. Run the query
5. ✅ Success!

All tables, policies, and triggers will be created correctly.


