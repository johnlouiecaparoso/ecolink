# 🔧 CREATE REAL TEST ACCOUNTS IN SUPABASE

## The Problem

Your test accounts (like `verifier@ecolink.test`) are **MOCK accounts** - they only exist in JavaScript memory. They're **NOT saved in Supabase**, so:
- ❌ Profile edits don't persist
- ❌ You see fake/default data every time
- ❌ No real database records

## ✅ Solution: Create REAL Users in Supabase

This will make test accounts work with **full persistence**!

---

## 🚀 **STEP 1: Create Users in Supabase Auth**

### **Via Supabase Dashboard**

1. **Go to Supabase Dashboard**
   - Open https://app.supabase.com
   - Select your EcoLink project
   - Navigate to **Authentication** → **Users**

2. **Click "Add User"** (or "Invite User")

3. **Create Each Test Account**:

   **Admin Account:**
   - Email: `admin@ecolink.test`
   - Password: `admin123`
   - Auto-confirm: ✅ Check this box
   - Click "Create User"

   **Verifier Account:**
   - Email: `verifier@ecolink.test`
   - Password: `verifier123`
   - Auto-confirm: ✅ Check this box
   - Click "Create User"

   **General User Account:**
   - Email: `user@ecolink.test`
   - Password: `user123`
   - Auto-confirm: ✅ Check this box
   - Click "Create User"

   **Developer Account:**
   - Email: `developer@ecolink.test`
   - Password: `developer123`
   - Auto-confirm: ✅ Check this box
   - Click "Create User"

4. **Verify Users Created**
   - You should see 4 users in the list
   - Each should show "Confirmed" status

---

## 🚀 **STEP 2: Create Profiles in Database**

Now create profiles for these users:

1. **Go to Supabase SQL Editor**

2. **Run This Script**:

```sql
-- Get the user IDs that were just created
WITH user_data AS (
  SELECT id, email
  FROM auth.users
  WHERE email IN (
    'admin@ecolink.test',
    'verifier@ecolink.test', 
    'user@ecolink.test',
    'developer@ecolink.test'
  )
)
-- Insert profiles with correct roles
INSERT INTO profiles (id, full_name, email, role, kyc_level)
SELECT 
  id,
  CASE email
    WHEN 'admin@ecolink.test' THEN 'Admin User'
    WHEN 'verifier@ecolink.test' THEN 'Verifier User'
    WHEN 'user@ecolink.test' THEN 'General User'
    WHEN 'developer@ecolink.test' THEN 'Project Developer'
  END as full_name,
  email,
  CASE email
    WHEN 'admin@ecolink.test' THEN 'admin'
    WHEN 'verifier@ecolink.test' THEN 'verifier'
    WHEN 'user@ecolink.test' THEN 'general_user'
    WHEN 'developer@ecolink.test' THEN 'project_developer'
  END as role,
  0 as kyc_level
FROM user_data
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name;
```

3. **Wait for success message** ✅

---

## 🧪 **STEP 3: Test Profile Persistence**

Now test that it works:

1. **Start your app**:
```bash
npm run dev
```

2. **Login with Test Account**:
   - Go to `/login`
   - Email: `user@ecolink.test`
   - Password: `user123`
   - Click "Sign In"

3. **Edit Profile**:
   - Go to `/profile`
   - Click "Edit Profile"
   - Fill in:
     - Company: "Test Company Ltd"
     - Location: "Manila, Philippines"
     - Bio: "This is a test bio for persistence"
   - Click "Save Changes"
   - ✅ Should see "Profile updated successfully!"

4. **Logout**:
   - Click logout

5. **Login Again**:
   - Login with same credentials
   - Go to `/profile`
   - ✅ Your data should STILL BE THERE!

---

## ✅ **VERIFICATION**

Check in Supabase:

```sql
-- Check profiles are created
SELECT id, full_name, email, role, company, location, bio
FROM profiles
WHERE email LIKE '%@ecolink.test'
ORDER BY email;

-- Should show 4 users with their roles
```

---

## 🔍 **WHY THIS FIXES IT**

### **Before (Mock Accounts)**:
```javascript
// Test account login → Uses mock session
// Profile data → Fake/mock data in JavaScript
// Save profile → Nowhere to save (no database record)
// Login again → Still fake data
```

### **After (Real Accounts)**:
```javascript
// Test account login → Uses REAL Supabase auth
// Profile data → Loaded from Supabase database
// Save profile → SAVED to Supabase profiles table
// Login again → Loads REAL saved data from database
```

---

## 📝 **What's Different Now**

| Feature | Mock Accounts | Real Accounts |
|---------|--------------|---------------|
| Profile Loading | Fake data | Real Supabase data |
| Profile Editing | Can't save | Saves to database |
| Data Persistence | Resets every time | Persists forever |
| Logout/Login | Fake data again | Your real data |
| Database Records | None | Real records in profiles table |

---

## 🎯 **IMPORTANT NOTES**

1. **Test accounts still work in dev mode** - They just use real persistence now
2. **Real users work in production** - Create them normally via registration
3. **Auto-confirm must be checked** - Otherwise you'll need email confirmation
4. **Profile updates immediately** - No need to refresh

---

## 🆘 **TROUBLESHOOTING**

### **"Email already in use"**
- User already exists in auth.users
- Skip to Step 2 to create profile

### **"Profile not found"**
- Run Step 2 SQL script again

### **"Still seeing fake data"**
- Make sure you created users in auth.users
- Check browser console for errors
- Verify profiles table has records

### **"Can't login"**
- Verify user exists in auth.users
- Check auto-confirm was checked
- Try `admin123` / `verifier123` / `user123` / `developer123`

---

## ✅ **SUCCESS CRITERIA**

Your setup is working when:
- ✅ Can login with test accounts
- ✅ Profile edits save successfully
- ✅ Data persists after logout/login
- ✅ Different accounts have different data
- ✅ No "fake" or "default" data showing

---

**Now your test accounts work with full Supabase persistence!** 🎉


