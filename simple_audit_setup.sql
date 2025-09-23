-- Simple Audit Logs Setup for EcoLink
-- Run this step by step in Supabase SQL Editor

-- Step 1: Drop existing table if it exists (to start fresh)
DROP TABLE IF EXISTS audit_logs CASCADE;

-- Step 2: Create the audit_logs table
CREATE TABLE audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- Step 3: Create indexes for better performance
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Step 4: Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies
CREATE POLICY "Users can view their own audit logs" ON audit_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- Step 6: Create the log_user_action function
CREATE OR REPLACE FUNCTION log_user_action(
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id TEXT DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  log_id UUID;
  current_user_id UUID;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  -- Insert audit log
  INSERT INTO audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    old_values,
    new_values,
    metadata
  ) VALUES (
    current_user_id,
    p_action,
    p_resource_type,
    p_resource_id,
    p_old_values,
    p_new_values,
    p_metadata
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Create the log_system_event function
CREATE OR REPLACE FUNCTION log_system_event(
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id TEXT DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  -- Insert audit log without user_id (system event)
  INSERT INTO audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    old_values,
    new_values,
    metadata
  ) VALUES (
    NULL,
    p_action,
    p_resource_type,
    p_resource_id,
    p_old_values,
    p_new_values,
    p_metadata
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Grant permissions
GRANT SELECT ON audit_logs TO authenticated;
GRANT EXECUTE ON FUNCTION log_user_action TO authenticated;
GRANT EXECUTE ON FUNCTION log_system_event TO authenticated;

-- Step 9: Test the setup
SELECT 'Audit logging system setup completed successfully!' as status;

-- Step 10: Insert a test log to verify it works
SELECT log_user_action('SYSTEM_STARTUP', 'application', 'ecolink', NULL, '{"version": "1.0.0"}'::jsonb, '{"setup_completed": true}'::jsonb) as test_log_id;
