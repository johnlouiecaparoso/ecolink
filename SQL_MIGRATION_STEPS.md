# 📋 SQL Migration Steps for EcoLink

## ⚠️ **CRITICAL: Run in this EXACT order!**

---

## **Step 1: Add Verifier Helper Function**
**File:** `sql/add-verifier-rls-policies.sql`

**What it does:** Creates the `is_verifier()` function for role checking

**Run:** Copy entire contents of `add-verifier-rls-policies.sql` to Supabase SQL Editor and execute

**Expected output:** "is_verifier function created successfully"

---

## **Step 2: Fix Wallet Transactions Schema**
**File:** `sql/fix-wallet-transactions-add-userid.sql`

**What it does:** Adds missing `user_id` column to wallet_transactions if needed

**Run:** Copy entire contents of `fix-wallet-transactions-add-userid.sql` to Supabase SQL Editor and execute

**Expected output:** Table structure with user_id column listed

---

## **Step 3: Apply Comprehensive RLS Policies**
**File:** `sql/final-comprehensive-rls-fix.sql`

**What it does:** Sets up all Row-Level Security policies for marketplace, verifier, wallet, etc.

**Run:** Copy entire contents of `final-comprehensive-rls-fix.sql` to Supabase SQL Editor and execute

**Expected output:** "All RLS policies have been updated successfully!"

**⚠️ Note:** This will take a moment - be patient!

---

## **Step 4: Fix Wallet RLS for Real Users**
**File:** `sql/fix-real-user-wallet-rls.sql`

**What it does:** Allows real authenticated users to create their own wallet accounts

**Run:** Copy entire contents of `fix-real-user-wallet-rls.sql` to Supabase SQL Editor and execute

**Expected output:** "Wallet policies updated for real users"

---

## **Step 5: Clean Duplicate Listings** ⚠️ OPTIONAL
**File:** `sql/fix-duplicate-listings.sql`

**What it does:** Removes duplicate marketplace listings

**Run:** Copy entire contents of `fix-duplicate-listings.sql` to Supabase SQL Editor and execute

**⚠️ Only run if you see duplicate listings in your marketplace!**

---

## **✅ Verification Checklist**

After running all scripts, verify in Supabase SQL Editor:

```sql
-- Check if is_verifier function exists
SELECT proname FROM pg_proc 
WHERE proname = 'is_verifier';

-- Check wallet_transactions has user_id column
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'wallet_transactions';

-- Check RLS policies are enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('projects', 'credit_listings', 'wallet_accounts', 'wallet_transactions');
```

**All should return TRUE/RECORDS!**

---

## **🚨 Common Issues**

### **"Relation already exists"**
**Solution:** Script uses `CREATE OR REPLACE` - this is normal, safe to ignore

### **"Policy already exists"**
**Solution:** Script uses `DROP POLICY IF EXISTS` - this is normal

### **"Column does not exist"**
**Solution:** Run Step 2 first (fix-wallet-transactions-add-userid.sql)

### **"Permission denied"**
**Solution:** Make sure you're running as a database admin/superuser in Supabase

---

## **📝 Final Test**

After all scripts run successfully:

1. ✅ Restart your dev server: `npm run dev`
2. ✅ Login with a REAL user account (not test account)
3. ✅ Try to approve a project as verifier
4. ✅ Try to purchase credits in marketplace

---

## **🎉 Success Indicators**

You'll know it's working if:
- ✅ No "User not authenticated" errors
- ✅ No "Payment processing failed" errors
- ✅ No "duplicate key" errors
- ✅ Projects approve successfully
- ✅ Purchases redirect to PayMongo checkout

---

## **📞 Need Help?**

If errors persist:
1. Share the complete error message
2. Show which step failed
3. Include the verification query results

