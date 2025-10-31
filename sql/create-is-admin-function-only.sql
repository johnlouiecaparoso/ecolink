-- ============================================
-- Quick script to create/update the is_admin function
-- ============================================
-- This script will CREATE OR REPLACE the function
-- It won't drop existing function (which would break RLS policies)
-- Safe to run multiple times
-- ============================================

-- Note: We use CREATE OR REPLACE instead of DROP
-- This avoids errors if RLS policies depend on the function
-- If you get "cannot drop" error, the function already exists - that's OK!

-- Step 2: Create the is_admin function
-- This function checks if a user has an admin role
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

-- Step 3: Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO anon;

-- Step 4: Verify the function was created
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public' AND p.proname = 'is_admin'
    ) THEN '✅ is_admin function created successfully!'
    ELSE '❌ Failed to create is_admin function'
  END as status;

-- Step 5: Test the function (if you're logged in)
-- This will show if you're recognized as admin
SELECT 
  auth.uid() as your_user_id,
  public.is_admin(auth.uid()) as you_are_admin,
  CASE 
    WHEN public.is_admin(auth.uid()) THEN '✅ You ARE recognized as admin'
    ELSE '❌ You are NOT recognized as admin - check your role in profiles table'
  END as admin_status;

-- Step 6: Show your current role for reference
SELECT 
  p.id,
  p.role as your_role,
  au.email,
  CASE 
    WHEN p.role IN ('admin', 'super_admin', 'Administrator', 'Admin') THEN '✅ Role matches admin'
    ELSE '⚠️ Role does not match admin check - update your role to "admin"'
  END as role_check
FROM profiles p
JOIN auth.users au ON p.id = au.id
WHERE p.id = auth.uid();

