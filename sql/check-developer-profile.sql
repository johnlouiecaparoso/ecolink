-- Check existing profile for developer@ecolink.test
SELECT p.*, u.email, u.created_at as user_created_at
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE u.email = 'developer@ecolink.test' OR p.email = 'developer@ecolink.test';









