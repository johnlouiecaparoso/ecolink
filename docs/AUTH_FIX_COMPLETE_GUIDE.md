# 🔐 Complete Authentication Fix Guide

## 🎯 **Problem Summary**

You're experiencing "User not authenticated" errors when:
1. Verifiers try to approve projects
2. General users try to purchase in marketplace

**Root Cause:** Row-Level Security (RLS) policies are blocking operations even though users are authenticated.

---

## ✅ **Solution: Two-Step SQL Migration**

### **Step 1: Add Verifier Helper Function**

Run: `sql/add-verifier-rls-policies.sql`

This creates the `is_verifier()` helper function that checks if a user has verifier role.

### **Step 2: Apply Comprehensive RLS Policies**

Run: `sql/final-comprehensive-rls-fix.sql`

This consolidates ALL RLS policies for:
- ✅ Projects (verifiers can approve)
- ✅ Project Credits (verifiers can create)
- ✅ Credit Listings (marketplace view)
- ✅ Credit Ownership (users can insert when purchasing)
- ✅ Credit Purchases (users can insert when purchasing)
- ✅ Credit Transactions (users can insert when purchasing)
- ✅ Wallet Tables (for payments)

---

## 🚀 **How to Apply**

### **Option A: Fresh Database Setup**

If you're setting up a new database:

1. Open Supabase SQL Editor
2. Run: `sql/complete-ecolink-setup.sql`
3. Run: `sql/add-verifier-rls-policies.sql`
4. Run: `sql/final-comprehensive-rls-fix.sql`

### **Option B: Existing Database Migration**

If you already have data:

1. Open Supabase SQL Editor
2. Run: `sql/add-verifier-rls-policies.sql`
3. Run: `sql/final-comprehensive-rls-fix.sql`
4. That's it! No data loss.

---

## 🧪 **Testing Checklist**

After running the SQL scripts, test:

### **1. Verifier Flow**
- [ ] Login as verifier
- [ ] Go to `/verifier` panel
- [ ] Click "Approve Project" on a pending project
- [ ] ✅ Should succeed without "User not authenticated" error

### **2. Marketplace Purchase Flow**
- [ ] Login as general user
- [ ] Go to `/marketplace`
- [ ] Click on a credit listing
- [ ] Click "Purchase"
- [ ] Complete payment flow
- [ ] ✅ Should succeed without "User not authenticated" error

### **3. Console Logs**

Open browser console (F12) and look for:

**Good signs:**
```
✅ Supabase client initialized successfully
✅ PayMongo service initialized
✅ User is authenticated: your@email.com
🔄 Approving project: {...}
✅ Project approved successfully
🛒 Processing credit purchase: {...}
🔍 Auth check result: { hasUser: true, userEmail: "your@email.com" }
```

**Bad signs:**
```
❌ Update failed: { message: "...", code: "42501" }
❌ Authentication failed: No user found
⚠️ Supabase client not available
```

---

## 🔍 **Debugging**

If you still get errors after running the SQL scripts:

### **Check 1: Verify RLS Policies Applied**

Run in Supabase SQL Editor:

```sql
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('projects', 'credit_listings', 'credit_ownership')
ORDER BY tablename;
```

You should see policies like:
- `Projects UPDATE Policy`
- `Credit Ownership INSERT Policy`
- `Credit Listings SELECT Policy`

### **Check 2: Verify User Role**

Run in Supabase SQL Editor:

```sql
-- Check your user's role
SELECT id, email, role 
FROM profiles 
WHERE email = 'your-email@example.com';

-- Should show 'verifier' or 'project_developer' or 'general_user'
```

### **Check 3: Check Supabase Client Initialization**

In browser console, run:

```javascript
import { getSupabase } from '@/services/supabaseClient'
const supabase = getSupabase()
console.log('Supabase:', supabase ? 'Initialized' : 'Not initialized')
```

---

## 📝 **Code Changes Already Applied**

The following code fixes have already been applied:

### **1. Service Initialization Guards**
- `src/services/projectApprovalService.js` - RLS-aware getter
- `src/services/realPaymentService.js` - RLS-aware getter
- `src/services/creditOwnershipService.js` - RLS-aware getter

### **2. Debugging Logs**
- `src/services/marketplaceService.js` - Detailed auth logging
- `src/services/projectApprovalService.js` - Approval logging
- `src/views/MarketplaceViewEnhanced.vue` - Modal auth check

### **3. Route Fixes**
- `src/router/index.js` - Fixed project redirects
- `src/views/MarketplaceViewEnhanced.vue` - Modal opens on click

---

## ⚠️ **Important Notes**

1. **No Data Loss**: The SQL scripts use `DROP POLICY IF EXISTS` and `CREATE POLICY`, so they're safe to run multiple times.

2. **Test Keys**: Make sure you're using PayMongo **test keys** in `.env`:
   ```
   VITE_PAYMONGO_PUBLIC_KEY=pk_test_xxx
   VITE_PAYMONGO_SECRET_KEY=sk_test_xxx
   ```

3. **Restart Dev Server**: After changing `.env`, restart:
   ```bash
   npm run dev
   ```

4. **Browser Cache**: Hard refresh (Ctrl+Shift+R) if you see old errors.

---

## 🎉 **Expected Result**

After applying the SQL scripts:

1. ✅ Verifiers can approve projects
2. ✅ Users can purchase credits in marketplace
3. ✅ PayMongo integration works for GCash/Maya
4. ✅ All RLS policies are properly configured
5. ✅ No more "User not authenticated" errors

---

## 🆘 **Still Having Issues?**

If authentication still fails:

1. Check Supabase dashboard → Authentication → Users
2. Verify user exists with correct role in `profiles` table
3. Check browser console for detailed error messages
4. Verify `.env` file has correct Supabase and PayMongo keys
5. Try logging out and logging back in

---

## 📞 **Need Help?**

Provide:
1. Screenshot of error message
2. Browser console logs
3. Supabase SQL query results from checks above
4. Your `.env` file (redact keys)

---

**Last Updated**: $(date)
**Migration Scripts**: `sql/add-verifier-rls-policies.sql`, `sql/final-comprehensive-rls-fix.sql`

