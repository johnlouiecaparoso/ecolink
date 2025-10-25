# How to Update User Roles in Supabase

## 🎯 **Quick Method: Update Existing User Roles**

If you already have accounts in Supabase, you can easily change their roles without creating new accounts.

## 🚀 **Step 1: See Your Current Users**

First, let's see what users you have:

```sql
-- Run this in Supabase SQL Editor
SELECT email, role, full_name FROM profiles ORDER BY email;
```

## 🔧 **Step 2: Update User Roles**

### **Method 1: Update Specific Users**

Replace the email addresses with your actual user emails:

```sql
-- Set someone to Project Developer
UPDATE profiles
SET role = 'project_developer', kyc_level = 1, updated_at = NOW()
WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');

-- Set someone to Admin
UPDATE profiles
SET role = 'admin', kyc_level = 3, updated_at = NOW()
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@example.com');

-- Set someone to Verifier
UPDATE profiles
SET role = 'verifier', kyc_level = 2, updated_at = NOW()
WHERE id = (SELECT id FROM auth.users WHERE email = 'verifier@example.com');

-- Set someone to General User
UPDATE profiles
SET role = 'general_user', kyc_level = 0, updated_at = NOW()
WHERE id = (SELECT id FROM auth.users WHERE email = 'user@example.com');
```

### **Method 2: Use the Simple Script**

1. Open `set-user-role.sql`
2. Replace the email addresses with your actual emails
3. Run the script in Supabase SQL Editor

## 📋 **Available Roles**

| Role                | Description          | KYC Level |
| ------------------- | -------------------- | --------- |
| `admin`             | Full system access   | 3         |
| `verifier`          | Project verification | 2         |
| `project_developer` | Create projects      | 1         |
| `general_user`      | Basic user           | 0         |

## 🎯 **Example: Set Your Account to Project Developer**

If your email is `yourname@gmail.com` and you want to be a Project Developer:

```sql
UPDATE profiles
SET role = 'project_developer', kyc_level = 1, updated_at = NOW()
WHERE id = (SELECT id FROM auth.users WHERE email = 'yourname@gmail.com');
```

## 🔍 **Verify the Changes**

After updating, check the roles:

```sql
SELECT email, role, full_name FROM profiles ORDER BY email;
```

## 🚨 **If User Doesn't Have a Profile**

If a user doesn't have a profile yet, create one:

```sql
INSERT INTO profiles (id, full_name, email, role, kyc_level, created_at, updated_at)
SELECT
  au.id,
  COALESCE(au.raw_user_meta_data->>'name', 'User'),
  au.email,
  'project_developer', -- or whatever role you want
  1, -- kyc level
  NOW(),
  NOW()
FROM auth.users au
WHERE au.email = 'your-email@example.com';
```

## 🎉 **That's It!**

Now your existing users have the correct roles and can access the appropriate features in your application!

## 🚀 **Test the Roles**

1. **Login to your app** with the updated user
2. **Check the interface** - you should see role-appropriate features
3. **Project Developer**: Should see project creation options
4. **Admin**: Should see admin panel at `/admin`
5. **Verifier**: Should see verifier interface
6. **General User**: Should see marketplace and basic features

