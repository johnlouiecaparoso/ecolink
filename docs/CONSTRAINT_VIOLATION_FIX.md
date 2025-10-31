# Constraint Violation Fix Guide

## 🚨 **Issue Identified**

The error `check constraint "profiles_role_check" of relation "profiles" is violated by some row` occurs because:

1. **Existing data conflict**: Your `profiles` table already contains data with role values that don't match the new constraint
2. **Role mapping needed**: Existing roles like `'user'` and `'super_admin'` need to be mapped to the new role system

## 🔍 **Root Cause Analysis**

### **Existing Data in Your Database:**

- Current roles: `'user'`, `'super_admin'`, `'admin'`, `'verifier'`, `'project_developer'`, `'buyer_investor'`
- New constraint only allows: `('admin', 'verifier', 'project_developer', 'buyer_investor', 'general_user')`

### **The Problem:**

- `'user'` is not in the new allowed list (should be `'general_user'`)
- `'super_admin'` is not in the new allowed list (should be `'admin'`)

## ✅ **Solution Applied**

The `final-supabase-setup.sql` script includes data migration before adding constraints:

### **1. Data Migration (Lines 8-10)**

```sql
-- Update existing role values to match our new schema
UPDATE profiles SET role = 'general_user' WHERE role = 'user';
UPDATE profiles SET role = 'admin' WHERE role = 'super_admin';
```

### **2. Safe Constraint Addition (Lines 15-16)**

```sql
-- Add constraints AFTER data migration
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'verifier', 'project_developer', 'buyer_investor', 'general_user'));
```

## 🎯 **Role Mapping Strategy**

| Old Role              | New Role              | Reason                        |
| --------------------- | --------------------- | ----------------------------- |
| `'user'`              | `'general_user'`      | Standardize naming convention |
| `'super_admin'`       | `'admin'`             | Consolidate admin roles       |
| `'admin'`             | `'admin'`             | No change needed              |
| `'verifier'`          | `'verifier'`          | No change needed              |
| `'project_developer'` | `'project_developer'` | No change needed              |
| `'buyer_investor'`    | `'buyer_investor'`    | No change needed              |

## 🚀 **How the Fix Works**

### **Step 1: Data Migration**

- Updates existing `'user'` roles to `'general_user'`
- Updates existing `'super_admin'` roles to `'admin'`
- Preserves all other existing roles

### **Step 2: Constraint Addition**

- Drops any existing conflicting constraints
- Adds the new constraint with the standardized role list
- No constraint violations because data is already migrated

### **Step 3: Verification**

- All existing users maintain their access levels
- New role system is enforced going forward
- No data loss or access disruption

## 📋 **What This Fixes**

- ✅ **No more constraint violations** - All existing data conforms to new constraints
- ✅ **Preserved user access** - Users keep their current permissions
- ✅ **Standardized roles** - Clean, consistent role naming
- ✅ **Future-proof** - New constraints prevent invalid role assignments

## 🔍 **Verification Steps**

After running the script, verify the fix worked:

```sql
-- Check that all profiles have valid roles
SELECT role, COUNT(*)
FROM profiles
GROUP BY role;

-- Should only show: admin, verifier, project_developer, buyer_investor, general_user
```

## 🎯 **Expected Results**

After running `final-supabase-setup.sql`:

1. **No constraint violations** - All existing data conforms
2. **All users preserved** - No data loss
3. **Clean role system** - Standardized role names
4. **Full functionality** - All Supabase features working

## 🚨 **Important Notes**

- **Backup recommended**: Always backup your database before running migration scripts
- **Test first**: Run on a copy of your database first if possible
- **User notification**: Consider notifying users about role name changes if they see them in the UI

The final script handles all existing data gracefully while implementing the new role system!

