# Wallet Transactions Migration Guide

## 🚨 **The Problem**

The error `check constraint "wallet_transactions_type_check" of relation "wallet_transactions" is violated by some row` occurs because:

1. **Existing data has different type values** (`'topup'`, `'payment'`, `'fee'`)
2. **New constraint only allows different values** (`'deposit'`, `'withdrawal'`, `'purchase'`, `'sale'`, `'refund'`)
3. **Migration tries to replace constraint** without migrating existing data first

## 🔍 **Root Cause Analysis**

### **What's Happening:**

1. Your `wallet_transactions` table already has data with types like `'topup'`, `'payment'`, `'fee'`
2. The script tries to add a constraint that only allows `('deposit', 'withdrawal', 'purchase', 'sale', 'refund')`
3. PostgreSQL rejects the constraint because existing data violates it
4. Even if the constraint is added, any new inserts with old type values will fail

### **The Type Mismatch:**

| Existing Types | New Types      | Mapping Needed      |
| -------------- | -------------- | ------------------- |
| `'topup'`      | `'deposit'`    | ✅ Direct mapping   |
| `'payment'`    | `'purchase'`   | ✅ Direct mapping   |
| `'fee'`        | `'sale'`       | ✅ Direct mapping   |
| `'withdrawal'` | `'withdrawal'` | ✅ No change needed |
| `'refund'`     | `'refund'`     | ✅ No change needed |

## ✅ **Safe Migration Solution**

The updated `safe-supabase-migration.sql` script includes a **3-step safe migration approach** for wallet transactions:

### **Step A: Temporarily Allow Both Old and New Values**

```sql
-- Allow both old and new type values temporarily
ALTER TABLE wallet_transactions ADD CONSTRAINT wallet_transactions_type_check CHECK (type IN (
  'topup', 'deposit', 'withdrawal', 'payment', 'purchase', 'sale', 'refund', 'fee'
));
```

### **Step B: Migrate Existing Data**

```sql
-- Update existing data to new type values
UPDATE wallet_transactions SET type = 'deposit' WHERE type = 'topup';
UPDATE wallet_transactions SET type = 'purchase' WHERE type = 'payment';
UPDATE wallet_transactions SET type = 'sale' WHERE type = 'fee';
UPDATE wallet_transactions SET type = 'deposit' WHERE type IS NULL;
```

### **Step C: Tighten Constraint**

```sql
-- Now safely enforce only new type values
ALTER TABLE wallet_transactions ADD CONSTRAINT wallet_transactions_type_check CHECK (type IN (
  'deposit', 'withdrawal', 'purchase', 'sale', 'refund'
));
```

## 🎯 **Type Mapping Strategy**

| Old Type       | New Type       | Reason                         |
| -------------- | -------------- | ------------------------------ |
| `'topup'`      | `'deposit'`    | Standardize terminology        |
| `'payment'`    | `'purchase'`   | More specific transaction type |
| `'fee'`        | `'sale'`       | Platform fee is a type of sale |
| `'withdrawal'` | `'withdrawal'` | No change needed               |
| `'refund'`     | `'refund'`     | No change needed               |
| `NULL`         | `'deposit'`    | Default for missing values     |

## 🚀 **Why This Approach Works**

### **1. No Constraint Violations**

- Step A allows all existing data to remain valid
- No immediate constraint violations during migration

### **2. Safe Data Migration**

- Step B updates all existing data to new type values
- No data loss or transaction disruption

### **3. Clean Final State**

- Step C enforces the new type system
- All data is already compliant

## 📋 **Verification Steps**

After running the updated migration script:

### **1. Check Type Distribution**

```sql
SELECT type, COUNT(*) FROM wallet_transactions GROUP BY type ORDER BY COUNT(*) DESC;
```

Should only show: `deposit`, `withdrawal`, `purchase`, `sale`, `refund`

### **2. Verify No Invalid Types**

```sql
SELECT * FROM wallet_transactions WHERE type NOT IN ('deposit', 'withdrawal', 'purchase', 'sale', 'refund');
```

Should return no rows.

### **3. Test New Transaction Creation**

```sql
-- This should work without constraint violations
INSERT INTO wallet_transactions (account_id, type, amount) VALUES (some_account_id, 'deposit', 100.00);
```

## 🔧 **Troubleshooting**

### **If Migration Still Fails:**

1. **Check for Triggers:**

   ```sql
   SELECT tgname, tgfoid::regproc FROM pg_trigger WHERE tgrelid = 'wallet_transactions'::regclass;
   ```

2. **Check for Application Code:**
   - Ensure your application code uses the new type values
   - Update any hardcoded type assignments

3. **Check for NULL Values:**
   ```sql
   SELECT COUNT(*) FROM wallet_transactions WHERE type IS NULL;
   ```

## 🎯 **Expected Results**

After running the updated `safe-supabase-migration.sql`:

- ✅ **No constraint violations** - All existing data conforms
- ✅ **All transactions preserved** - No data loss
- ✅ **Clean type system** - Standardized transaction types
- ✅ **Future-proof** - New transactions use correct types
- ✅ **Full functionality** - All wallet features working

## 🚨 **Important Notes**

- **Backup First**: Always backup your database before migration
- **Test Environment**: Run on a copy first if possible
- **Monitor Logs**: Watch for any constraint violations during migration
- **Update Code**: Ensure your application code uses new type values

## 📊 **Migration Summary**

| Step | Action                       | Result                     |
| ---- | ---------------------------- | -------------------------- |
| A    | Allow both old and new types | No constraint violations   |
| B    | Migrate existing data        | All data uses new types    |
| C    | Enforce new constraint       | Clean, standardized system |

The updated migration script handles all wallet transaction edge cases and ensures a smooth transition to the new type system!

