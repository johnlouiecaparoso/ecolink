# Final Diagnosis Steps - Admin Dashboard Showing 0 Users

## The Issue

Your database has 5 users, SQL queries work fine, but the frontend shows 0 users. This is **99% an RLS (Row Level Security) policy issue**.

## What's Happening

RLS policies can return **0 rows with NO error** when they filter out all results. This is why:

- ✅ SQL Editor works (you might be using service role or different auth context)
- ✅ No console errors (RLS doesn't throw errors, it just filters)
- ❌ Frontend shows 0 (RLS is silently blocking)

## Step 1: Run Enhanced Debug in Browser Console

1. Open your admin dashboard
2. Press **F12** to open browser console
3. Wait 2 seconds for automatic diagnostics to run
4. OR manually run:
   ```javascript
   await debugAdminQueries()
   ```

This will show:

- ✅ If you're authenticated
- ✅ Your role from database
- ✅ If count query returns 0 (RLS filtering)
- ✅ If select query works
- ❌ Exact problem diagnosis

## Step 2: Check the Console Output

Look for these specific messages:

### If you see:

```
⚠️ CRITICAL: Count query returned 0 with NO error!
❌ PROBLEM: RLS is filtering out all OTHER profiles
```

**This confirms RLS is blocking you.**

### If you see:

```
✅ Can query own profile. Role: general_user
❌ Your role might not be recognized as admin
```

**Your role is wrong - need to update it.**

### If you see:

```
✅ Got count via select query: 5
```

**Select query works, but count doesn't - this is normal, we'll fix it.**

## Step 3: Verify Your Role in Database

Run this in Supabase SQL Editor:

```sql
-- Check your current role
SELECT
  p.id,
  p.role,
  au.email,
  CASE
    WHEN p.role IN ('admin', 'super_admin', 'Administrator', 'Admin') THEN '✅ Is Admin'
    ELSE '❌ NOT Admin - needs update'
  END as admin_check
FROM profiles p
JOIN auth.users au ON p.id = au.id
WHERE au.id = auth.uid();  -- Your current logged-in user
```

**If your role is NOT 'admin' or 'super_admin':**

```sql
-- Update your role to admin
UPDATE profiles
SET role = 'admin'
WHERE id = auth.uid();

-- Verify it worked
SELECT role FROM profiles WHERE id = auth.uid();
```

## Step 4: Verify is_admin() Function Works

Run this in Supabase SQL Editor (while logged in as admin):

```sql
-- Test if is_admin() recognizes you
SELECT
  auth.uid() as your_id,
  public.is_admin(auth.uid()) as is_admin_result,
  CASE
    WHEN public.is_admin(auth.uid()) THEN '✅ Function recognizes you as admin'
    ELSE '❌ Function does NOT recognize you as admin'
  END as status;
```

**If this returns FALSE:**

1. Your role might not be exactly 'admin'
2. The function might not exist
3. Run `create-is-admin-function-only.sql` again

## Step 5: Test RLS Policies Directly

Run this in Supabase SQL Editor (while logged in as admin):

```sql
-- This should return ALL profiles if RLS is working
SELECT COUNT(*) as total_profiles FROM profiles;

-- If this shows 0 when you have 5 users, RLS is blocking
-- Check what the admin policy allows:
SELECT
  policyname,
  qual as policy_condition
FROM pg_policies
WHERE tablename = 'profiles'
  AND policyname LIKE '%Admin%';
```

## Step 6: Common Fixes

### Fix 1: Role Name Must Match Exactly

Your role in `profiles` table must be EXACTLY one of:

- `'admin'` (lowercase) ✅
- `'super_admin'` ✅
- `'Administrator'` ✅
- `'Admin'` ✅

NOT:

- `'administrator'` ❌
- `'ADMIN'` ❌
- `'Admin User'` ❌

### Fix 2: Re-run RLS Policies

Even if you ran them before, run again:

```sql
-- Run the complete fix
-- Copy and paste fix-admin-rls-policies.sql entirely
```

### Fix 3: Check Function Permissions

```sql
-- Make sure function is accessible
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;
```

## Step 7: Verify Frontend Authentication

In browser console, check if your session is valid:

```javascript
// Check current session
const supabase = await import('/src/services/supabaseClient.js').then((m) => m.getSupabase())
const {
  data: { user },
} = await supabase.auth.getUser()
console.log('Current user:', user)

// Check profile
const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
console.log('Your role:', profile.role)
```

## The Most Likely Solution

Based on the symptoms, **your role is probably not exactly 'admin'** in the database.

### Quick Fix:

1. Run in Supabase SQL Editor:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE id = auth.uid();
   ```
2. Refresh admin dashboard
3. Check console - should now show users

## Still Not Working?

Share the output of:

1. `await debugAdminQueries()` from browser console
2. SQL result of: `SELECT role FROM profiles WHERE id = auth.uid();`
3. SQL result of: `SELECT public.is_admin(auth.uid());`

These three things will tell us exactly what's wrong.




