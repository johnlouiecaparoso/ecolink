# Admin Dashboard Fix Guide

## Problem

The admin dashboard shows 0 for all statistics (users, projects, credits) even though you have 5 users in your Supabase database.

## Root Causes

1. **RLS (Row Level Security) policies** are blocking admin access to the data
2. **Missing admin RLS policies** - admins don't have permissions to view all profiles/projects
3. **Query errors** not being properly handled or logged

## Solution Steps

### Step 1: Run RLS Policy Fix SQL ⚠️ CRITICAL

**This is the most likely cause of your issue!**

1. Open your **Supabase Dashboard**
2. Go to **SQL Editor**
3. Open and run `fix-admin-rls-policies.sql`
   - This creates admin-specific RLS policies
   - Adds helper functions to check admin role
   - Allows admins to view all data

### Step 2: Verify Database Data

Run `verify-database-users.sql` in Supabase SQL Editor to verify:

- How many users are actually in `auth.users`
- How many profiles are in `profiles` table
- If RLS policies are blocking access
- Your current user's role

### Step 3: Check Browser Console

After loading the admin dashboard, check your browser console (F12) for:

- 🔍 [Analytics] logs showing query results
- ❌ Error messages with details
- 📊 Statistics about what data was fetched

### Step 4: Run Diagnostic Tool

Open browser console (F12) and run:

```javascript
await diagnoseAdminDashboard()
```

This will:

- ✅ Check Supabase connection
- ✅ Verify authentication
- ✅ Check your user role
- ✅ Test each query individually
- ✅ Show detailed error messages

## What Was Fixed

### 1. Enhanced Error Logging (`analyticsService.js`)

- Added detailed console logging for all queries
- Shows exact error codes and messages
- Attempts alternative query methods if RLS blocks access
- Logs user authentication and role for debugging

### 2. Improved Admin Dashboard (`AdminDashboard.vue`)

- Waits for Supabase initialization before queries
- Better error handling with detailed logs
- Automatic diagnostics if stats are zero
- Handles null Supabase client gracefully

### 3. Better Supabase Client Handling (`projectApprovalService.js`)

- Gets Supabase client dynamically (not in constructor)
- Waits for initialization if needed
- Better error messages

### 4. Diagnostic Tool (`diagnoseAdminDashboard.js`)

- Comprehensive diagnostic function
- Tests each query individually
- Shows exactly what's failing
- Available in browser console

## Expected Console Output

After fixes, you should see in console:

```
🔍 [Analytics] Current user: your-email@example.com
🔍 [Analytics] User profile: { id: '...', role: 'admin', ... }
🔍 [Analytics] Starting queries...
📊 [Analytics] Users result: { count: 5, error: null }
✅ [Analytics] Final counts: { totalUsers: 5, ... }
```

If you see errors, look for:

- `❌ Error fetching total users: { code: 'PGRST116', ... }` → RLS blocking access
- `⚠️ RLS policy might be blocking access` → Need to run SQL file
- `❌ Users error code: PGRST116` → Permission denied by RLS

## Verification Checklist

- [ ] Ran `fix-admin-rls-policies.sql` in Supabase
- [ ] Ran `verify-database-users.sql` shows 5 users
- [ ] Checked browser console for detailed logs
- [ ] Ran `diagnoseAdminDashboard()` in console
- [ ] Verified your user role is 'admin' or 'super_admin'
- [ ] Admin dashboard now shows correct counts

## Common Issues

### Issue: Still showing 0 users

**Solution:**

1. Make sure you ran `fix-admin-rls-policies.sql`
2. Check your user role is actually 'admin':
   ```sql
   SELECT role FROM profiles WHERE id = auth.uid();
   ```
3. Run diagnostics: `await diagnoseAdminDashboard()` in console
4. Check console for RLS error codes (PGRST116)

### Issue: Getting "permission denied" errors

**Solution:**

- RLS policies are still blocking. Run `fix-admin-rls-policies.sql` again
- Make sure the `is_admin` function was created
- Verify policies were created:
  ```sql
  SELECT policyname FROM pg_policies
  WHERE tablename = 'profiles' AND policyname LIKE '%Admin%';
  ```

### Issue: Query returns 0 but database has data

**Solution:**

- RLS is filtering out all rows
- Check you're logged in as admin
- Verify admin policy exists and is working

## Testing

1. **Test in Browser Console:**

   ```javascript
   // Check current user
   const supabase =
     window.getSupabase?.() ||
     (await import('/src/services/supabaseClient.js').then((m) => m.getSupabase()))
   const {
     data: { user },
   } = await supabase.auth.getUser()
   console.log('User:', user)

   // Check profile
   const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
   console.log('Profile:', profile, 'Is Admin:', ['admin', 'super_admin'].includes(profile?.role))

   // Try count query
   const { count, error } = await supabase
     .from('profiles')
     .select('*', { count: 'exact', head: true })
   console.log('Count:', count, 'Error:', error)
   ```

2. **Test in SQL Editor:**
   - Run queries from `verify-database-users.sql`
   - Check if admin access test returns all profiles

## Next Steps After Fix

Once the dashboard shows correct data:

1. ✅ All statistics should update in real-time
2. ✅ User Management should show all users
3. ✅ Project Approval should show all projects
4. ✅ No more zero counts

## Support

If issues persist:

1. Run `diagnoseAdminDashboard()` and share the output
2. Share browser console logs (especially [Analytics] logs)
3. Run `verify-database-users.sql` and share results
4. Check if `is_admin()` function exists in Supabase




