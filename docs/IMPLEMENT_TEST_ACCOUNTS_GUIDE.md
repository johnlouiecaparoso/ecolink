# Implement Test Accounts in Supabase

## 🎯 **Two Methods to Create Test Accounts**

You have two options to create the test accounts in your Supabase database:

### **Method 1: SQL Script (Recommended)**

### **Method 2: Node.js Script**

## 🚀 **Method 1: SQL Script (Easiest)**

### **Step 1: Run the SQL Script**

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `create-test-accounts-simple.sql` (recommended)
4. Click **Run**

**Note**: If you get duplicate email errors, use `create-test-accounts-fixed.sql` instead

### **What the SQL Script Does:**

- ✅ Creates 4 auth users with proper IDs
- ✅ Creates profiles with correct roles
- ✅ Creates wallets with $1000 starting balance
- ✅ Handles conflicts (won't duplicate if accounts exist)

### **Step 2: Verify Accounts**

After running the script, you should see:

```
Test accounts created successfully!
You can now login with any of the test accounts
```

## 🔧 **Method 2: Node.js Script**

### **Step 1: Set Up Service Role Key**

1. Go to your Supabase Dashboard
2. Navigate to **Settings** → **API**
3. Copy the **Service Role Key** (not the anon key)
4. Add it to your `.env` file:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

### **Step 2: Run the Script**

```bash
npm run setup:accounts
```

### **What the Node.js Script Does:**

- ✅ Creates auth users programmatically
- ✅ Creates profiles with correct roles
- ✅ Creates wallets with starting balance
- ✅ Provides detailed logging

## 📋 **Test Accounts Created**

After running either method, you'll have these accounts:

| Role                  | Email                    | Password       | Access Level         |
| --------------------- | ------------------------ | -------------- | -------------------- |
| **Admin**             | `admin@ecolink.test`     | `admin123`     | Full system access   |
| **Verifier**          | `verifier@ecolink.test`  | `verifier123`  | Project verification |
| **Project Developer** | `developer@ecolink.test` | `developer123` | Create projects      |
| **General User**      | `user@ecolink.test`      | `user123`      | Browse marketplace   |

## 🧪 **Test the Accounts**

### **Step 1: Start Your Application**

```bash
npm run dev
```

### **Step 2: Test Login**

1. Go to `http://localhost:5173`
2. Click "Login"
3. Try logging in with any of the test accounts
4. You should be able to login successfully

### **Step 3: Test Role-Based Access**

- **Admin**: Should see admin panel at `/admin`
- **Verifier**: Should see verifier interface
- **Project Developer**: Should see project creation options
- **General User**: Should see marketplace and basic features

## 🔍 **Verify in Supabase Dashboard**

### **Check Auth Users:**

1. Go to Supabase Dashboard
2. Navigate to **Authentication** → **Users**
3. You should see 4 users with the test emails

### **Check Profiles:**

1. Go to **Table Editor** → **profiles**
2. You should see 4 profiles with correct roles

### **Check Wallets:**

1. Go to **Table Editor** → **wallets**
2. You should see 4 wallets with $1000 balance each

## 🚨 **Troubleshooting**

### **If SQL Script Fails:**

- **Duplicate email error**: Use `create-test-accounts-simple.sql` instead of the original script
- **Still getting duplicate errors**: Use `create-test-accounts-fixed.sql` which handles existing users
- Check that your database has the correct tables
- Ensure RLS policies allow the operations
- Check for any constraint violations

### **If Node.js Script Fails:**

- Verify your `SUPABASE_SERVICE_ROLE_KEY` is correct
- Check that the service role key has admin permissions
- Ensure your `.env` file is properly configured

### **If Login Fails:**

- Check that the auth users were created
- Verify the profiles have the correct roles
- Check browser console for any errors

## 🎯 **Expected Results**

After successful setup:

1. **All 4 accounts can login** ✅
2. **Role-based access works** ✅
3. **Admin can access `/admin`** ✅
4. **Project Developer can create projects** ✅
5. **General User can browse marketplace** ✅
6. **Verifier can review projects** ✅

## 🚀 **Next Steps**

Once the accounts are created:

1. **Test the complete workflow**:
   - Login as Project Developer → Create project
   - Login as Admin → Approve project
   - Login as General User → Purchase credits

2. **Test role-based navigation**:
   - Each role should see appropriate menu items
   - Access should be restricted based on role

3. **Test database integration**:
   - Projects should be saved to database
   - Credits should be generated on approval
   - Marketplace should show available credits

Your test accounts are now ready for comprehensive testing! 🎉
