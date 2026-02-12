-- Role Applications table: stores developer/verifier applications from the /apply form.
-- Run this in Supabase SQL Editor if the table does not exist yet.

CREATE TABLE IF NOT EXISTS public.role_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  applicant_full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  website TEXT,
  role_requested TEXT NOT NULL CHECK (role_requested IN ('project_developer', 'verifier')),
  experience_summary TEXT,
  motivation TEXT,
  supporting_documents TEXT,
  metadata JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ,
  admin_notes TEXT,
  decision_reason TEXT,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ
);

-- Index for admin listing (filter by status, order by date)
CREATE INDEX IF NOT EXISTS idx_role_applications_status ON public.role_applications(status);
CREATE INDEX IF NOT EXISTS idx_role_applications_created_at ON public.role_applications(created_at DESC);

-- RLS: allow anonymous insert (so /apply form works without login), allow authenticated read/update for admins via service role or policy
ALTER TABLE public.role_applications ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (public form submission)
CREATE POLICY "Allow insert for role applications"
  ON public.role_applications FOR INSERT
  WITH CHECK (true);

-- Only admins can read and update (admin panel)
CREATE POLICY "Allow read for admins"
  ON public.role_applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Allow update for admins"
  ON public.role_applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (true);

COMMENT ON TABLE public.role_applications IS 'Applications from /apply form for project developer or verifier roles; reviewed in Admin > Developer & Verifier Applications.';
