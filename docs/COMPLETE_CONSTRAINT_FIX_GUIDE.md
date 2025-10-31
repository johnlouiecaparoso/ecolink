# Complete Constraint Fix Guide

## 🚨 **The Problem**

The error `new row for relation "wallet_transactions" violates check constraint "wallet_transactions_type_valid"` occurs because:

1. **Existing constraints have different names** than what the script expects
2. **Multiple constraints exist** with different naming conventions
3. **Old constraints remain active** and block new data

## 🔍 **Root Cause Analysis**

### **What's Happening:**

1. Your database has existing constraints with names like `wallet_transactions_type_valid`
2. The migration script tries to drop `wallet_transactions_type_check` (different name)
3. The old constraint remains active and blocks new data
4. Even after migration attempts, the old constraint still enforces old rules

### **The Constraint Name Mismatch:**

| Script Expects                   | Database Has                     | Result                        |
| -------------------------------- | -------------------------------- | ----------------------------- |
| `wallet_transactions_type_check` | `wallet_transactions_type_valid` | ❌ Constraint not dropped     |
| `profiles_role_check`            | Various names                    | ❌ Multiple constraints exist |

## ✅ **Complete Solution**

The `complete-constraint-fix.sql` script uses a **comprehensive approach** to handle all existing constraints:

### **Step A: Drop ALL Existing Constraints (Regardless of Name)**

```sql
-- Use dynamic SQL to find and drop ALL constraints
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT conname
        FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        WHERE t.relname = 'profiles'
        AND c.contype = 'c'
        AND pg_get_constraintdef(c.oid) LIKE '%role%'
    LOOP
        EXECUTE format('ALTER TABLE profiles DROP CONSTRAINT IF EXISTS %I', r.conname);
    END LOOP;
END $$;
```

### **Step B: Temporarily Allow Both Old and New Values**

```sql
-- Allow both old and new values temporarily
ALTER TABLE profiles ADD CONSTRAINT profiles_role_temp_check CHECK (role IN (
  'user', 'super_admin', 'admin', 'verifier', 'project_developer', 'buyer_investor', 'general_user'
) OR role IS NULL);
```

### **Step C: Migrate Existing Data**

```sql
-- Update existing data to new values
UPDATE profiles SET role = 'general_user' WHERE role = 'user';
UPDATE profiles SET role = 'admin' WHERE role = 'super_admin';
UPDATE profiles SET role = 'general_user' WHERE role IS NULL;
```

### **Step D: Replace with Final Constraint**

```sql
-- Now safely enforce only new values
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_temp_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN (
  'admin', 'verifier', 'project_developer', 'buyer_investor', 'general_user'
));
```

## 🎯 **Why This Approach Works**

### **1. Dynamic Constraint Discovery**

- Finds ALL existing constraints regardless of name
- Drops them safely using dynamic SQL
- No more constraint name mismatches

### **2. Safe Data Migration**

- Temporarily allows both old and new values
- Migrates all existing data to new values
- No data loss or constraint violations

### **3. Clean Final State**

- Replaces temporary constraints with final ones
- All data is already compliant
- No more constraint violations

## 🚀 **Migration Benefits**

| Benefit                     | Description                                    |
| --------------------------- | ---------------------------------------------- |
| **Handles All Constraints** | Finds and drops constraints regardless of name |
| **Safe Data Migration**     | No data loss or constraint violations          |
| **Future-Proof**            | New constraints prevent invalid data           |
| **Comprehensive**           | Handles both profiles and wallet_transactions  |

## 📋 **Verification Steps**

After running the complete constraint fix script:

### **1. Check Role Distribution**

```sql
SELECT role, COUNT(*) FROM profiles GROUP BY role ORDER BY COUNT(*) DESC;
```

Should only show: `admin`, `verifier`, `project_developer`, `buyer_investor`, `general_user`

### **2. Check Type Distribution**

```sql
SELECT type, COUNT(*) FROM wallet_transactions GROUP BY type ORDER BY COUNT(*) DESC;
```

Should only show: `deposit`, `withdrawal`, `purchase`, `sale`, `refund`

### **3. Verify No Invalid Values**

```sql
-- Check for invalid roles
SELECT * FROM profiles WHERE role NOT IN ('admin', 'verifier', 'project_developer', 'buyer_investor', 'general_user');

-- Check for invalid types
SELECT * FROM wallet_transactions WHERE type NOT IN ('deposit', 'withdrawal', 'purchase', 'sale', 'refund');
```

Both should return no rows.

### **4. Test New Data Creation**

```sql
-- Test new profile creation
INSERT INTO profiles (id, full_name, role) VALUES (gen_random_uuid(), 'Test User', 'general_user');

-- Test new wallet transaction creation
INSERT INTO wallet_transactions (account_id, type, amount) VALUES (some_account_id, 'deposit', 100.00);
```

## 🔧 **Troubleshooting**

### **If Migration Still Fails:**

1. **Check for Remaining Constraints:**

   ```sql
   SELECT conname, pg_get_constraintdef(c.oid) AS def
   FROM pg_constraint c
   JOIN pg_class t ON c.conrelid = t.oid
   WHERE t.relname = 'profiles' AND c.contype = 'c';
   ```

2. **Check for Triggers:**

   ```sql
   SELECT tgname, tgfoid::regproc FROM pg_trigger WHERE tgrelid = 'profiles'::regclass;
   ```

3. **Check for Application Code:**
   - Ensure your application code uses the new values
   - Update any hardcoded assignments

## 🎯 **Expected Results**

After running `complete-constraint-fix.sql`:

- ✅ **No constraint violations** - All existing data conforms
- ✅ **All users preserved** - No data loss
- ✅ **Clean role system** - Standardized role names
- ✅ **Clean type system** - Standardized transaction types
- ✅ **Future-proof** - New data uses correct values
- ✅ **Full functionality** - All Supabase features working

## 🚨 **Important Notes**

- **Backup First**: Always backup your database before migration
- **Test Environment**: Run on a copy first if possible
- **Monitor Logs**: Watch for any constraint violations during migration
- **Update Code**: Ensure your application code uses new values

## 📊 **Migration Summary**

| Step | Action                        | Result                       |
| ---- | ----------------------------- | ---------------------------- |
| A    | Drop ALL existing constraints | No more constraint conflicts |
| B    | Allow both old and new values | No constraint violations     |
| C    | Migrate existing data         | All data uses new values     |
| D    | Enforce new constraints       | Clean, standardized system   |

The complete constraint fix script handles all edge cases and ensures a smooth transition to the new constraint system!

