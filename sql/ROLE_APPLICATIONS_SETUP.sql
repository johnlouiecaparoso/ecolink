-- Role Applications Table & Policies
-- Run this script in the Supabase SQL editor after pulling the latest code.

-- Ensure uuid extension is available (safe to run multiple times)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.role_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    applicant_full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT,
    website TEXT,
    role_requested TEXT NOT NULL CHECK (role_requested IN ('project_developer', 'verifier')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'under_review', 'approved', 'rejected', 'cancelled')
    ),
    experience_summary TEXT,
    motivation TEXT,
    supporting_documents TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    admin_notes TEXT,
    decision_reason TEXT,
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION public.update_role_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_role_applications_updated ON public.role_applications;
CREATE TRIGGER on_role_applications_updated
    BEFORE UPDATE ON public.role_applications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_role_applications_updated_at();

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_role_applications_status ON public.role_applications(status);
CREATE INDEX IF NOT EXISTS idx_role_applications_role_requested ON public.role_applications(role_requested);
CREATE INDEX IF NOT EXISTS idx_role_applications_created_at ON public.role_applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_role_applications_user_id ON public.role_applications(user_id);

-- Prevent duplicate pending applications for the same authenticated user and role
CREATE UNIQUE INDEX IF NOT EXISTS role_applications_pending_unique
ON public.role_applications(user_id, role_requested)
WHERE status IN ('pending', 'under_review') AND user_id IS NOT NULL;

-- Enable RLS
ALTER TABLE public.role_applications ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Public can create role applications without account" ON public.role_applications;
DROP POLICY IF EXISTS "Authenticated users can create role applications" ON public.role_applications;
DROP POLICY IF EXISTS "Users can view their own role applications" ON public.role_applications;
DROP POLICY IF EXISTS "Admins can view all role applications" ON public.role_applications;
DROP POLICY IF EXISTS "Admins can manage role applications" ON public.role_applications;

-- Allow unauthenticated submissions with null user_id
CREATE POLICY "Public can create role applications without account"
ON public.role_applications
FOR INSERT
TO anon
WITH CHECK (user_id IS NULL);

-- Allow authenticated users to submit (user_id must match their auth.uid or be null)
CREATE POLICY "Authenticated users can create role applications"
ON public.role_applications
FOR INSERT
TO authenticated
WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- Allow applicants to view their own submissions
CREATE POLICY "Users can view their own role applications"
ON public.role_applications
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Allow admins to view everything
CREATE POLICY "Admins can view all role applications"
ON public.role_applications
FOR SELECT
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  )
);

-- Allow admins to update applications (approve/reject)
CREATE POLICY "Admins can manage role applications"
ON public.role_applications
FOR UPDATE
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  )
);

-- OPTIONAL: Allow admins to delete records if needed
-- CREATE POLICY "Admins can delete role applications"
-- ON public.role_applications
-- FOR DELETE
-- TO authenticated
-- USING (
--   auth.uid() IN (
--     SELECT id FROM public.profiles WHERE role = 'admin'
--   )
-- );

-- Helpful views
SELECT
    status,
    COUNT(*) AS total
FROM public.role_applications
GROUP BY status
ORDER BY status;










