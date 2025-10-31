# ✅ Database Verification Checklist

## 🎯 Goal: Ensure all database operations work with real Supabase data

---

## 📋 **Step 1: Verify All Tables Exist**

### **Core Tables (Required)**

Run these queries in Supabase SQL Editor:

```sql
-- Check profiles table
SELECT COUNT(*) FROM profiles;

-- Check projects table
SELECT COUNT(*) FROM projects;

-- Check credit_listings table
SELECT COUNT(*) FROM credit_listings;

-- Check project_credits table
SELECT COUNT(*) FROM project_credits;

-- Check wallet_accounts table
SELECT COUNT(*) FROM wallet_accounts;

-- Check wallet_transactions table
SELECT COUNT(*) FROM wallet_transactions;

-- Check credit_transactions table
SELECT COUNT(*) FROM credit_transactions;

-- Check credit_ownership table
SELECT COUNT(*) FROM credit_ownership;

-- Check audit_logs table
SELECT COUNT(*) FROM audit_logs;

-- Check credit_certificates table
SELECT COUNT(*) FROM credit_certificates;

-- Check credit_retirements table
SELECT COUNT(*) FROM credit_retirements;
```

**Expected**: All queries should return results (even if count is 0)

---

## 📋 **Step 2: Verify RLS Policies**

### **Check RLS is Enabled**

```sql
-- Check if RLS is enabled on critical tables
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename IN (
    'profiles',
    'projects',
    'credit_listings',
    'wallet_accounts',
    'credit_transactions',
    'credit_ownership',
    'audit_logs'
);
```

**Expected**: `rowsecurity = true` for all tables

---

## 📋 **Step 3: Test CRUD Operations**

### **Test Profile Operations**

- [ ] Create new profile (via registration)
- [ ] Read profile (via profile page)
- [ ] Update profile (via profile settings)
- [ ] Verify profile persists after refresh

### **Test Project Operations**

- [ ] Submit new project (as Developer)
- [ ] View projects (as User)
- [ ] Approve project (as Verifier)
- [ ] Verify project status updates

### **Test Marketplace Operations**

- [ ] View marketplace listings
- [ ] Filter/search listings
- [ ] View listing details
- [ ] Purchase credits (simulated - no real payment yet)

### **Test Wallet Operations**

- [ ] View wallet balance
- [ ] Check transaction history
- [ ] Verify balance updates correctly

### **Test Credit Operations**

- [ ] View credit portfolio
- [ ] Check credit ownership
- [ ] Generate certificate
- [ ] Generate receipt

---

## 📋 **Step 4: Test Role-Based Data Access**

### **Admin Access**

- [ ] Can view all users
- [ ] Can view all projects
- [ ] Can view audit logs
- [ ] Can access database management

### **Verifier Access**

- [ ] Can view pending projects
- [ ] Can approve/reject projects
- [ ] Can add verification notes
- [ ] Can view project details

### **Developer Access**

- [ ] Can submit projects
- [ ] Can view own projects
- [ ] Can edit own projects
- [ ] Cannot view other users' projects

### **User Access**

- [ ] Can view marketplace
- [ ] Can purchase credits
- [ ] Can view own portfolio
- [ ] Can view own certificates
- [ ] Cannot access admin features

---

## 📋 **Step 5: Verify Data Persistence**

### **Test Scenarios**

1. **Register → Login → Profile**
   - [ ] Register new user
   - [ ] Logout
   - [ ] Login again
   - [ ] Profile data persists

2. **Update Profile → Refresh**
   - [ ] Edit profile settings
   - [ ] Save changes
   - [ ] Hard refresh page
   - [ ] Changes persist

3. **Purchase Credits → Refresh**
   - [ ] Purchase credits (simulated)
   - [ ] Hard refresh
   - [ ] Credits still in portfolio

---

## 📋 **Step 6: Check for Console Errors**

### **Monitor Browser Console**

- [ ] No 400/404 errors
- [ ] No RLS policy errors
- [ ] No "column not found" errors
- [ ] No "table not found" errors
- [ ] No authentication errors

---

## ✅ **Verification Complete When:**

- [x] All tables exist
- [x] All CRUD operations work
- [x] RLS policies enabled
- [x] Role-based access works
- [x] Data persists across sessions
- [x] No console errors

---

## 🔧 **Common Issues & Fixes**

### **Issue: "Table not found"**

**Fix**: Run SQL migrations in Supabase

### **Issue: "Column not found"**

**Fix**: Run `add-notification-preferences-column.sql`

### **Issue: RLS blocking queries**

**Fix**: Check RLS policies allow user access

### **Issue: "Cannot coerce to single JSON object"**

**Fix**: Use `.maybeSingle()` instead of `.single()` (already fixed in profileService.js)

---

_Use this checklist to systematically verify your database is production-ready!_

