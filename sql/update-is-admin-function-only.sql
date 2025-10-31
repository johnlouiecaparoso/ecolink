-- ============================================
-- Update is_admin function WITHOUT dropping it
-- ============================================
-- Use this if you need to update the function
-- but can't drop it because RLS policies depend on it
-- ============================================

-- Step 1: Update the is_admin function (CREATE OR REPLACE avoids drop error)
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

-- Step 2: Ensure permissions are set
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO anon;

-- Step 3: Verify the function was updated
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public' AND p.proname = 'is_admin'
    ) THEN '✅ is_admin function updated successfully!'
    ELSE '❌ Failed to update is_admin function'
  END as status;

-- Step 4: Test the function (if you're logged in)
SELECT 
  auth.uid() as your_user_id,
  public.is_admin(auth.uid()) as you_are_admin,
  CASE 
    WHEN public.is_admin(auth.uid()) THEN '✅ You ARE recognized as admin'
    ELSE '❌ You are NOT recognized as admin - check your role in profiles table'
  END as admin_status;

-- Step 5: Show your current role for reference
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





