-- ═══════════════════════════════════════════════════════════════════════════
-- CHANGE USER ROLE SCRIPT
-- Use this to manually change a user's role in Supabase
-- ═══════════════════════════════════════════════════════════════════════════

-- EXAMPLE USAGE: Set your email to verifier
-- Replace 'your-email@example.com' with the actual email you want to modify

UPDATE public.profiles 
SET role = 'verifier'  -- Options: 'admin', 'verifier', 'project_developer', 'general_user'
WHERE email = 'your-email@example.com';

-- Verify the change
SELECT id, email, full_name, role 
FROM public.profiles 
WHERE email = 'your-email@example.com';

-- ═══════════════════════════════════════════════════════════════════════════
-- COMMON ROLE CHANGES (Uncomment the one you need)
-- ═══════════════════════════════════════════════════════════════════════════

-- Set to ADMIN
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your-email@example.com';

-- Set to VERIFIER
-- UPDATE public.profiles SET role = 'verifier' WHERE email = 'your-email@example.com';

-- Set to PROJECT DEVELOPER
-- UPDATE public.profiles SET role = 'project_developer' WHERE email = 'your-email@example.com';

-- Set to GENERAL USER (default)
-- UPDATE public.profiles SET role = 'general_user' WHERE email = 'your-email@example.com';

-- ═══════════════════════════════════════════════════════════════════════════
-- VIEW ALL USERS AND THEIR ROLES
-- ═══════════════════════════════════════════════════════════════════════════

SELECT id, email, full_name, role, created_at 
FROM public.profiles 
ORDER BY created_at DESC;

