# SQL Syntax Error Fix Guide

## 🚨 **Issues Identified and Fixed**

### **1. `ADD CONSTRAINT IF NOT EXISTS` Error**

**Problem:** PostgreSQL doesn't support `IF NOT EXISTS` for `ADD CONSTRAINT`
**Error:** `syntax error at or near "NOT"`

**Fix Applied:**

```sql
-- ❌ WRONG (causes syntax error)
ALTER TABLE projects ADD CONSTRAINT IF NOT EXISTS projects_status_check CHECK (...);

-- ✅ CORRECT (fixed version)
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;
ALTER TABLE projects ADD CONSTRAINT projects_status_check CHECK (...);
```

### **2. PL/pgSQL Function Structure Error**

**Problem:** `DECLARE` block placed inside `BEGIN` block instead of at function start
**Error:** Invalid function structure

**Fix Applied:**

```sql
-- ❌ WRONG (causes syntax error)
CREATE OR REPLACE FUNCTION generate_project_credits()
RETURNS TRIGGER AS $$
BEGIN
  IF ... THEN
    DECLARE  -- ❌ DECLARE inside BEGIN
      credits_amount INTEGER;
    BEGIN
      -- code
    END;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ✅ CORRECT (fixed version)
CREATE OR REPLACE FUNCTION generate_project_credits()
RETURNS TRIGGER AS $$
DECLARE  -- ✅ DECLARE at function start
  credits_amount INTEGER;
  base_price DECIMAL(10,2);
BEGIN
  IF ... THEN
    -- code directly here
  END IF;
END;
$$ LANGUAGE plpgsql;
```

### **3. Column Name Alignment**

**Problem:** Script uses column names that don't match existing database
**Fix Applied:** Updated to use existing column names:

- `credits_available` instead of `available_credits`
- `project_credits_id` instead of `project_credit_id`
- `account_id` for wallet transactions

## 🛠️ **Complete Fix Applied**

The `corrected-supabase-setup.sql` file contains:

### **✅ Fixed Constraint Syntax**

- Replaced all `ADD CONSTRAINT IF NOT EXISTS` with `DROP CONSTRAINT IF EXISTS` + `ADD CONSTRAINT`
- Applied to all tables: projects, project_credits, credit_listings, wallet_transactions

### **✅ Fixed PL/pgSQL Functions**

- Moved all `DECLARE` blocks to function start
- Removed nested `BEGIN/END` blocks
- Used correct column names from existing schema

### **✅ Aligned Column Names**

- Used `credits_available` (existing) instead of `available_credits`
- Used `project_credits_id` (existing) instead of `project_credit_id`
- Maintained existing foreign key relationships

### **✅ Proper RLS Policies**

- Updated policies to use correct column names
- Fixed wallet transaction policies to use `account_id`
- Maintained security while fixing syntax

## 🚀 **How to Apply the Fix**

### **Step 1: Run the Corrected Script**

```sql
-- Copy and run corrected-supabase-setup.sql in Supabase SQL Editor
```

### **Step 2: Verify No Syntax Errors**

The script should run without any "syntax error at or near" messages.

### **Step 3: Test the Integration**

```bash
npm run test:supabase
```

## 📋 **What Was Fixed**

| Issue              | Original Code                  | Fixed Code                                     |
| ------------------ | ------------------------------ | ---------------------------------------------- |
| Constraint syntax  | `ADD CONSTRAINT IF NOT EXISTS` | `DROP CONSTRAINT IF EXISTS` + `ADD CONSTRAINT` |
| Function structure | `DECLARE` inside `BEGIN`       | `DECLARE` at function start                    |
| Column names       | `available_credits`            | `credits_available`                            |
| Foreign keys       | `project_credit_id`            | `project_credits_id`                           |
| Wallet references  | `wallet_id`                    | `account_id`                                   |

## ✅ **Expected Results**

After running the corrected script:

- ❌ No more syntax errors
- ✅ All constraints created properly
- ✅ All functions work correctly
- ✅ All RLS policies functional
- ✅ Full Supabase integration working

## 🔍 **Verification Queries**

Run these to verify the fix worked:

```sql
-- Check if constraints exist
SELECT conname, contype
FROM pg_constraint
WHERE conrelid = 'projects'::regclass;

-- Check if functions exist
SELECT proname, prosrc
FROM pg_proc
WHERE proname LIKE '%project_credits%';

-- Check if triggers exist
SELECT tgname, tgfoid::regproc
FROM pg_trigger
WHERE tgname LIKE '%project_credits%';
```

The corrected script should resolve all syntax errors and get your Supabase integration working properly!

