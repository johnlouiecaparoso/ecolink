# Step-by-Step Fix Guide for Admin Dashboard

## The Problem

The `is_admin()` function doesn't exist in your database, which is why `test-admin-access.sql` is failing.

## Solution: Run These SQL Files in Order

### Step 1: Create the `is_admin()` Function

**Run this FIRST:** `create-is-admin-function-only.sql` in Supabase SQL Editor

This will:

- Create the `is_admin()` function
- Grant proper permissions
- Test if it works
- Show your current role

**Expected Result:** You should see "✅ is_admin function created successfully!"

### Step 2: Create All RLS Policies

**Run this SECOND:** `fix-admin-rls-policies.sql` in Supabase SQL Editor

This will:

- Ensure the function exists (creates it if needed)
- Create admin RLS policies for all tables
- Allow admins to view all data

**Expected Result:** Success messages for each policy creation

### Step 3: Verify Everything Works

**Run this THIRD:** `test-admin-access.sql` in Supabase SQL Editor

This will now work (since function exists) and show:

- ✅ If function exists
- ✅ Your role
- ✅ If you're recognized as admin
- ✅ If RLS policies exist

### Step 4: Verify Database Users

**Run this FOURTH:** `verify-database-users.sql` in Supabase SQL Editor

This will show:

- How many users you actually have
- If profiles match auth.users
- RLS policy status

## Quick Fix (If You Just Want the Function)

If you only need to create the function right now, just run:

```sql
-- Create is_admin function
DROP FUNCTION IF EXISTS public.is_admin(UUID);

CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id
    AND role IN ('admin', 'super_admin', 'Administrator', 'Admin')
  );
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO anon;

-- Test it
SELECT public.is_admin(auth.uid()) as is_admin;
```

## After Running SQL Files

1. **Refresh your admin dashboard**
2. **Check browser console (F12)** for logs
3. **You should see:**
   - ✅ Total Users: 5 (or your actual count)
   - ✅ Other stats showing real data

## Common Issues

### Issue: "function does not exist" error

**Fix:** Run `create-is-admin-function-only.sql` first

### Issue: Still showing 0 users

**Fix:**

1. Check browser console for errors
2. Make sure you ran `fix-admin-rls-policies.sql`
3. Verify your role is 'admin' in profiles table

### Issue: "You are NOT recognized as admin"

**Fix:** Update your role in profiles table:

```sql
UPDATE profiles
SET role = 'admin'
WHERE id = auth.uid();
```

## Verification Checklist

- [ ] Ran `create-is-admin-function-only.sql` - Function exists
- [ ] Ran `fix-admin-rls-policies.sql` - RLS policies created
- [ ] Ran `test-admin-access.sql` - Shows you're admin
- [ ] Ran `verify-database-users.sql` - Shows 5 users
- [ ] Admin dashboard shows correct user count

## Next Steps

After SQL files are run:

1. Open admin dashboard
2. Open browser console (F12)
3. Look for `✅ [Analytics] Final counts: { totalUsers: 5, ... }`
4. Dashboard should display correct statistics




