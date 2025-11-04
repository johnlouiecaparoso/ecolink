-- ═══════════════════════════════════════════════════════════════════════════
-- DELETE TEST ACCOUNTS
-- Removes all test accounts from Supabase Auth and profiles
-- ═══════════════════════════════════════════════════════════════════════════

-- First, view what will be deleted (SAFETY CHECK)
SELECT id, email, full_name, role, created_at 
FROM public.profiles 
WHERE email LIKE '%@ecolink.test'
ORDER BY created_at;

-- ═══════════════════════════════════════════════════════════════════════════
-- DELETE FROM AUTH.USERS (Supabase Auth table)
-- ═══════════════════════════════════════════════════════════════════════════

DELETE FROM auth.users 
WHERE email LIKE '%@ecolink.test';

-- Note: This will cascade delete from profiles due to foreign key constraint

-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFY DELETION
-- ═══════════════════════════════════════════════════════════════════════════

SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ All test accounts deleted successfully'
        ELSE '⚠️ Still found ' || COUNT(*) || ' test accounts'
    END AS result
FROM public.profiles 
WHERE email LIKE '%@ecolink.test';

-- Show remaining users
SELECT 'Remaining users:' AS info;
SELECT id, email, full_name, role, created_at 
FROM public.profiles 
ORDER BY created_at DESC;

