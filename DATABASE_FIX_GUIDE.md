# Database Fix Guide for EcoLink Supabase Integration

## 🚨 **Issue Identified**

The error "column 'user_id' does not exist" occurs because there are mismatches between the existing database schema and the new setup script. Your database already has tables with different column names.

## 🔍 **Root Cause Analysis**

Based on the existing database structure, here are the key mismatches:

### **Column Name Mismatches:**

1. **wallet_transactions table:**
   - Existing: `account_id` (references wallet_accounts.id)
   - Script expects: `wallet_id` and `user_id`

2. **project_credits table:**
   - Existing: `credits_available`
   - Script expects: `available_credits`

3. **credit_ownership table:**
   - Existing: `project_credit_id` (singular)
   - Script expects: `project_credits_id` (plural)

4. **Foreign key references:**
   - Some tables reference `profiles(id)` instead of `auth.users(id)`

## 🛠️ **Solution Options**

### **Option A: Use the Fixed Script (Recommended)**

I've created `fixed-supabase-setup.sql` that:

- ✅ Works with your existing database structure
- ✅ Uses correct column names
- ✅ Adds missing columns without breaking existing data
- ✅ Creates missing tables
- ✅ Sets up proper RLS policies

### **Option B: Manual Column Alignment**

If you prefer to keep the original script, you need to:

1. **Update wallet_transactions policies:**

   ```sql
   -- Instead of: auth.uid() = user_id
   -- Use: EXISTS (SELECT 1 FROM wallet_accounts wa WHERE wa.id = wallet_transactions.account_id AND wa.user_id = auth.uid())
   ```

2. **Update project_credits references:**

   ```sql
   -- Use: credits_available instead of available_credits
   ```

3. **Update credit_ownership references:**
   ```sql
   -- Use: project_credit_id instead of project_credits_id
   ```

## 🚀 **Quick Fix Steps**

### **Step 1: Use the Fixed Script**

1. Go to your Supabase SQL Editor
2. Copy the contents of `fixed-supabase-setup.sql`
3. Paste and run it
4. This will fix all column name issues

### **Step 2: Verify the Fix**

Run this query to check if all tables exist with correct columns:

```sql
-- Check if all required tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'profiles', 'projects', 'project_credits', 'credit_listings',
  'credit_transactions', 'credit_ownership', 'audit_logs',
  'wallets', 'wallet_transactions', 'certificates', 'receipts'
);
```

### **Step 3: Test the Integration**

```bash
npm run test:supabase
```

## 🔧 **Specific Fixes Applied**

### **1. Wallet Transactions**

- ✅ Uses existing `account_id` column
- ✅ References `wallet_accounts.user_id` for ownership
- ✅ Maintains existing foreign key structure

### **2. Project Credits**

- ✅ Uses existing `credits_available` column
- ✅ Adds missing columns without breaking existing data
- ✅ Maintains existing relationships

### **3. Credit Ownership**

- ✅ Uses existing `project_credit_id` column
- ✅ Maintains existing foreign key structure
- ✅ Adds missing columns safely

### **4. RLS Policies**

- ✅ Updated to use correct column names
- ✅ Works with existing table structure
- ✅ Maintains security while fixing column references

## 📋 **Verification Checklist**

After running the fixed script, verify:

- [ ] All tables exist
- [ ] RLS policies are enabled
- [ ] Foreign keys work correctly
- [ ] No "column does not exist" errors
- [ ] Authentication works
- [ ] Project creation works
- [ ] Marketplace queries work

## 🎯 **Expected Results**

After applying the fix:

1. **No more column errors** - All references use correct column names
2. **Existing data preserved** - No data loss during migration
3. **Full functionality** - All features work as expected
4. **Proper security** - RLS policies work correctly

## 🚨 **If Issues Persist**

If you still get errors after running the fixed script:

1. **Check the exact error message** - Look for the specific table/column mentioned
2. **Verify table structure** - Run `\d table_name` in SQL editor
3. **Check foreign key constraints** - Ensure all references are correct
4. **Test individual queries** - Isolate the failing component

## 📞 **Support**

If you need help with specific errors:

1. Copy the exact error message
2. Include the table name and column name
3. Run the verification queries above
4. Share the results for targeted assistance

The fixed script should resolve all column name mismatches and get your Supabase integration working properly!

