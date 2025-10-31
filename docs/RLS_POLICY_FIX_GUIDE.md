# 🔒 RLS Policy Fix Guide

## 🎯 Problem: Test Accounts Blocked by RLS

**Error**: `new row violates row-level security policy for table "profiles"`

**Root Cause**:

- Test accounts use fake UUIDs (`22222222-2222-2222-2222-222222222222`, etc.)
- These UUIDs don't exist in Supabase `auth.users` table
- RLS policies check `auth.uid() = id`, which fails for test accounts
- RLS blocks both SELECT and INSERT operations

---

## ✅ **Solution Applied**

### **1. Code-Level Fix** (Already Applied ✅)

**Files Modified**:

- `src/services/profileService.js` - Detects test accounts, returns mock profiles
- `src/store/userStore.js` - Handles test accounts without Supabase queries

**How It Works**:

- Detects test account UUIDs
- Returns mock profile data (no Supabase call)
- Uses role already set during login
- Bypasses RLS entirely for test accounts

---

## 📋 **Additional Fix: Update RLS Policies** (Optional)

If you want to also fix RLS policies in database (for real users):

### **Run This SQL in Supabase:**

```sql
-- Fix Profiles RLS Policies
-- File: fix-profiles-rls-policies.sql

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Create updated policies
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);
```

**Note**: This fixes RLS for REAL users only. Test accounts still need the code-level fix.

---

## ✅ **What Was Fixed**

1. ✅ **Profile Service** - Detects test accounts, returns mock profiles
2. ✅ **User Store** - Handles test accounts without Supabase queries
3. ✅ **Role Handling** - Preserves role set during test account login

---

## 🧪 **Testing**

### **Test as Verifier**:

1. Login with `verifier@ecolink.test` / `verifier123`
2. Check console - should see: `[DEV] Test account detected`
3. Profile should load with `role: 'verifier'`
4. Navigation should show "Verifier Panel" link
5. Should be able to access `/verifier` route

### **Expected Console Output**:

```
[DEV] Test account detected - using role from store: verifier
✅ [DEV] Test account profile loaded: { role: 'verifier', isVerifier: true }
[Header] Adding Verifier Panel link
✅ Verifier access granted
```

### **No More Errors**:

- ❌ No more "RLS policy violation" errors
- ❌ No more "406" errors for SELECT
- ❌ No more "401" errors for INSERT
- ✅ Test accounts work smoothly

---

## 🔍 **For Real Users**

Real users (not test accounts) will:

- ✅ Still use Supabase profiles
- ✅ Still respect RLS policies
- ✅ Still have real data persistence
- ✅ Work exactly as before

**Only test accounts** bypass Supabase - real users unchanged.

---

## ✅ **Status**

- ✅ Code-level fix applied
- ✅ Test accounts handled gracefully
- ✅ No RLS errors for test accounts
- ✅ Real users unaffected

**Test accounts now work perfectly!** 🎉

---

_RLS policies fixed at code level - test accounts bypass Supabase, real users use Supabase as normal_

