-- ═══════════════════════════════════════════════════════════════════════════
-- CREATE MISSING PROFILES FOR AUTH USERS
-- This script creates profiles for auth.users that don't have profiles yet
-- ═══════════════════════════════════════════════════════════════════════════

-- Insert missing profiles for auth users that don't have them
INSERT INTO public.profiles (id, full_name, email, role)
SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1), 'User'),
    au.email,
    'general_user'
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Show how many profiles were created
SELECT 
    'Created ' || COUNT(*) || ' missing profiles' AS result
FROM public.profiles;




















