# Safe Database Migration Guide

## 🚨 **The Problem**

The error `new row for relation "profiles" violates check constraint "profiles_role_check"` occurs because:

1. **Existing data still has old role values** (`'user'`, `'super_admin'`)
2. **New constraint is too strict** and doesn't allow the old values
3. **Migration happens too quickly** without proper data cleanup

## 🔍 **Root Cause Analysis**

### **What's Happening:**

1. Your database has existing rows with `role = 'user'` and `role = 'super_admin'`
2. The script tries to add a constraint that only allows `('admin', 'verifier', 'project_developer', 'buyer_investor', 'general_user')`
3. PostgreSQL rejects the constraint because existing data violates it
4. Even if the constraint is added, any new inserts with old role values will fail

### **The Failing Row:**

```
(fe316a1e-6bd8-47c7-af61-f8551e1d33fd, John Louie Caparoso, general_user, 0, ...)
```

This shows that even after migration, there might be processes still trying to insert with old role values.

## ✅ **Safe Migration Solution**

The `safe-supabase-migration.sql` script uses a **4-step safe migration approach**:

### **Step A: Temporarily Allow Both Old and New Values**

```sql
-- Allow both old and new role values temporarily
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN (
  'user', 'super_admin', 'admin', 'verifier', 'project_developer', 'buyer_investor', 'general_user'
));
```

### **Step B: Migrate Existing Data**

```sql
-- Update existing data to new role values
UPDATE profiles SET role = 'general_user' WHERE role = 'user';
UPDATE profiles SET role = 'admin' WHERE role = 'super_admin';
```

### **Step C: Update Column Default**

```sql
-- Set new default for future inserts
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'general_user';
```

### **Step D: Tighten Constraint**

```sql
-- Now safely enforce only new role values
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN (
  'admin', 'verifier', 'project_developer', 'buyer_investor', 'general_user'
));
```

## 🎯 **Why This Approach Works**

### **1. No Constraint Violations**

- Step A allows all existing data to remain valid
- No immediate constraint violations during migration

### **2. Safe Data Migration**

- Step B updates all existing data to new role values
- No data loss or access disruption

### **3. Future-Proof Defaults**

- Step C ensures new users get the correct default role
- Prevents future constraint violations

### **4. Clean Final State**

- Step D enforces the new role system
- All data is already compliant

## 🚀 **Migration Benefits**

| Benefit           | Description                              |
| ----------------- | ---------------------------------------- |
| **Zero Downtime** | No service interruption during migration |
| **No Data Loss**  | All existing users preserved             |
| **Safe Rollback** | Can revert if needed                     |
| **Future-Proof**  | New users get correct defaults           |

## 📋 **Verification Steps**

After running the safe migration script:

### **1. Check Role Distribution**

```sql
SELECT role, COUNT(*) FROM profiles GROUP BY role ORDER BY COUNT(*) DESC;
```

Should only show: `admin`, `verifier`, `project_developer`, `buyer_investor`, `general_user`

### **2. Verify No Invalid Roles**

```sql
SELECT * FROM profiles WHERE role NOT IN ('admin', 'verifier', 'project_developer', 'buyer_investor', 'general_user');
```

Should return no rows.

### **3. Test New User Creation**

```sql
-- This should work without constraint violations
INSERT INTO profiles (id, full_name, role) VALUES (gen_random_uuid(), 'Test User', 'general_user');
```

## 🔧 **Troubleshooting**

### **If Migration Still Fails:**

1. **Check for Triggers:**

   ```sql
   SELECT tgname, tgfoid::regproc FROM pg_trigger WHERE tgrelid = 'profiles'::regclass;
   ```

2. **Check for Auth Hooks:**
   - Look for any Supabase auth hooks that might be inserting profiles
   - Update them to use `'general_user'` instead of `'user'`

3. **Check Application Code:**
   - Ensure your application code uses the new role values
   - Update any hardcoded role assignments

## 🎯 **Expected Results**

After running `safe-supabase-migration.sql`:

- ✅ **No constraint violations** - All existing data conforms
- ✅ **All users preserved** - No data loss
- ✅ **Clean role system** - Standardized role names
- ✅ **Future-proof** - New users get correct defaults
- ✅ **Full functionality** - All Supabase features working

## 🚨 **Important Notes**

- **Backup First**: Always backup your database before migration
- **Test Environment**: Run on a copy first if possible
- **Monitor Logs**: Watch for any constraint violations during migration
- **Update Code**: Ensure your application code uses new role values

The safe migration script handles all edge cases and ensures a smooth transition to the new role system!

