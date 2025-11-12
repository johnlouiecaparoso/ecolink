# 🔧 Database Migration Fix Guide

## The Problem

You're getting errors like:
- `column "project_id" does not exist`
- `column "user_id" does not exist`

This happens because your database has **old schema versions** that don't match the current code.

---

## ✅ **SOLUTION: Run These SQL Scripts in Order**

### **Step 1: Safe Migration (No Data Loss)**

Run this **FIRST** to fix existing tables:

**File**: `sql/fix-existing-tables-safe.sql`

This script will:
- ✅ Add missing columns to existing tables
- ✅ Fix column types
- ✅ Update policies
- ✅ **Keep all your existing data**

Just copy the entire file and run in Supabase SQL Editor.

---

### **Step 2: Add Verifier RLS Policies (IMPORTANT)**

Run this **SECOND** to fix verifier authentication:

**File**: `sql/add-verifier-rls-policies.sql`

This script will:
- ✅ Add `is_verifier()` helper function
- ✅ Allow verifiers to view pending projects
- ✅ Allow verifiers to approve/reject projects
- ✅ Fix "User not authenticated" errors for verifiers

### **Step 3: Complete Setup**

Run this **THIRD** to create any missing tables:

**File**: `sql/complete-ecolink-setup.sql`

This script will:
- ✅ Create any missing tables
- ✅ Add all policies (including verifier)
- ✅ Create triggers and functions
- ✅ Add indexes

---

## 🚀 **Quick Start**

### **Option A: Safe Migration (Recommended)**

```bash
1. Open Supabase → SQL Editor
2. Open: sql/fix-existing-tables-safe.sql
3. Copy all contents
4. Paste and Run
5. Wait for success message ✅

6. Then run: sql/add-verifier-rls-policies.sql
7. Copy all contents
8. Paste and Run
9. Wait for success message ✅

10. Then run: sql/complete-ecolink-setup.sql
11. Copy all contents
12. Paste and Run
13. Wait for success message ✅

14. Done! ✅
```

### **Option B: Fresh Start (Drops All Data)**

If you don't have important data and want a clean start:

```bash
1. Open Supabase → SQL Editor
2. Open: sql/complete-ecolink-setup.sql
3. Uncomment the DROP statements at the top:
   -- DROP TABLE IF EXISTS audit_logs CASCADE;
   -- DROP TABLE IF EXISTS receipts CASCADE;
   ... (remove the -- to make them active)
4. Copy all contents
5. Paste and Run
6. Wait for success message ✅

7. Done! ✅
```

---

## 📋 **What Gets Fixed**

### **Credit Ownership Table**
- ❌ **Old**: Might have `project_credit_id` instead of `project_id`
- ✅ **New**: Has `project_id` referencing `projects(id)`

### **Receipts Table**
- ❌ **Old**: Has `user_id` column
- ✅ **New**: Has `buyer_id` and `seller_id` columns

### **All Policies**
- ✅ Updated to use correct column names
- ✅ Admin access properly configured

---

## ✅ **Verification**

After running both scripts, verify with:

```sql
-- Check credit_ownership has project_id
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'credit_ownership' 
ORDER BY ordinal_position;

-- Check receipts has buyer_id and seller_id
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'receipts' 
ORDER BY ordinal_position;

-- Check policies are created
SELECT policyname, tablename 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('credit_ownership', 'receipts');
```

---

## 🎯 **Success Criteria**

Your database is fixed when:
- ✅ No errors when running the setup scripts
- ✅ All 12 tables created
- ✅ All policies enabled
- ✅ All triggers working
- ✅ Admin panel loads without errors
- ✅ Profile edits save correctly
- ✅ Marketplace works

---

## 🆘 **Still Having Issues?**

### Check for Existing Policies

```sql
-- List all policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

### Check for Conflicts

```sql
-- Check for duplicate constraints
SELECT conname, contype 
FROM pg_constraint 
WHERE connamespace = 'public'::regnamespace 
AND contype IN ('f', 'p', 'u')
ORDER BY conname;
```

### Manual Fix (Last Resort)

If auto-migration fails, you can manually:

```sql
-- Drop a specific policy
DROP POLICY "policy_name" ON "table_name";

-- Drop a table (⚠️ deletes all data!)
DROP TABLE IF EXISTS "table_name" CASCADE;

-- Then re-run the complete setup script
```

---

## 📝 **Files You Need**

1. ✅ `sql/fix-existing-tables-safe.sql` - Safe migration
2. ✅ `sql/add-verifier-rls-policies.sql` - Verifier authentication fix
3. ✅ `sql/complete-ecolink-setup.sql` - Complete setup
4. ✅ `SETUP_GUIDE_COMPLETE.md` - Full documentation

---

## ⚠️ **CRITICAL: Verifier Authentication Issue**

**If verifiers can't approve projects**, it's because RLS policies are missing!

Run `sql/add-verifier-rls-policies.sql` to fix this immediately.

---

**Run scripts in order: safe migration → verifier fix → complete setup!** 🚀

