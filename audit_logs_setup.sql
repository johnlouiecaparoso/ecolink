-- Audit Logs Setup for EcoLink
-- This script creates the audit logs table and related functions
-- Run this in your Supabase SQL Editor

-- ==============================================
-- 1. AUDIT LOGS TABLE SETUP
-- ==============================================

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_session_id ON audit_logs(session_id);

-- Enable RLS for audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for audit_logs
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

-- Only system can insert audit logs (no direct user inserts)
CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- ==============================================
-- 2. AUDIT LOGGING FUNCTIONS
-- ==============================================

-- Function to log user actions
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
  current_ip INET;
  current_user_agent TEXT;
  current_session_id TEXT;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  -- Get client IP (if available)
  current_ip := inet_client_addr();
  
  -- Get user agent (if available)
  current_user_agent := current_setting('request.headers', true)::json->>'user-agent';
  
  -- Generate session ID (you can implement your own session tracking)
  current_session_id := gen_random_uuid()::text;
  
  -- Insert audit log
  INSERT INTO audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    old_values,
    new_values,
    ip_address,
    user_agent,
    session_id,
    metadata
  ) VALUES (
    current_user_id,
    p_action,
    p_resource_type,
    p_resource_id,
    p_old_values,
    p_new_values,
    current_ip,
    current_user_agent,
    current_session_id,
    p_metadata
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log system events
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

-- ==============================================
-- 3. TRIGGERS FOR AUTOMATIC AUDIT LOGGING
-- ==============================================

-- Function to create audit trigger
CREATE OR REPLACE FUNCTION create_audit_trigger(table_name TEXT) RETURNS VOID AS $$
BEGIN
  EXECUTE format('
    DROP TRIGGER IF EXISTS audit_trigger_%I ON %I;
    CREATE TRIGGER audit_trigger_%I
      AFTER INSERT OR UPDATE OR DELETE ON %I
      FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
  ', table_name, table_name, table_name, table_name);
END;
$$ LANGUAGE plpgsql;

-- Generic audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function() RETURNS TRIGGER AS $$
DECLARE
  old_data JSONB;
  new_data JSONB;
  action_type TEXT;
BEGIN
  -- Determine action type
  IF TG_OP = 'INSERT' THEN
    action_type := 'CREATE';
    new_data := to_jsonb(NEW);
    old_data := NULL;
  ELSIF TG_OP = 'UPDATE' THEN
    action_type := 'UPDATE';
    old_data := to_jsonb(OLD);
    new_data := to_jsonb(NEW);
  ELSIF TG_OP = 'DELETE' THEN
    action_type := 'DELETE';
    old_data := to_jsonb(OLD);
    new_data := NULL;
  END IF;
  
  -- Log the action
  PERFORM log_user_action(
    action_type,
    TG_TABLE_NAME,
    COALESCE(NEW.id::TEXT, OLD.id::TEXT),
    old_data,
    new_data,
    jsonb_build_object(
      'trigger_name', TG_NAME,
      'trigger_when', TG_WHEN,
      'trigger_level', TG_LEVEL
    )
  );
  
  -- Return appropriate record
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- 4. CREATE AUDIT TRIGGERS FOR EXISTING TABLES
-- ==============================================

-- Create audit triggers for key tables
SELECT create_audit_trigger('profiles');
SELECT create_audit_trigger('projects');
SELECT create_audit_trigger('wallet_accounts');
SELECT create_audit_trigger('wallet_transactions');

-- ==============================================
-- 5. AUDIT LOG QUERIES AND VIEWS
-- ==============================================

-- View for recent audit logs
CREATE OR REPLACE VIEW recent_audit_logs AS
SELECT 
  al.id,
  al.created_at,
  al.action,
  al.resource_type,
  al.resource_id,
  p.full_name as user_name,
  p.role as user_role,
  al.ip_address,
  al.metadata
FROM audit_logs al
LEFT JOIN profiles p ON al.user_id = p.id
ORDER BY al.created_at DESC
LIMIT 100;

-- View for user activity summary
CREATE OR REPLACE VIEW user_activity_summary AS
SELECT 
  p.id as user_id,
  p.full_name,
  p.role,
  COUNT(al.id) as total_actions,
  COUNT(CASE WHEN al.created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as actions_24h,
  COUNT(CASE WHEN al.created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as actions_7d,
  MAX(al.created_at) as last_activity
FROM profiles p
LEFT JOIN audit_logs al ON p.id = al.user_id
GROUP BY p.id, p.full_name, p.role
ORDER BY total_actions DESC;

-- ==============================================
-- 6. CLEANUP FUNCTIONS
-- ==============================================

-- Function to clean old audit logs (run periodically)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(retention_days INTEGER DEFAULT 90) RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM audit_logs 
  WHERE created_at < NOW() - (retention_days || ' days')::INTERVAL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- 7. GRANT PERMISSIONS
-- ==============================================

-- Grant permissions to authenticated users
GRANT SELECT ON audit_logs TO authenticated;
GRANT SELECT ON recent_audit_logs TO authenticated;
GRANT SELECT ON user_activity_summary TO authenticated;

-- Grant execute permissions for audit functions
GRANT EXECUTE ON FUNCTION log_user_action TO authenticated;
GRANT EXECUTE ON FUNCTION log_system_event TO authenticated;

-- ==============================================
-- 8. SAMPLE DATA
-- ==============================================

-- Insert sample audit log
INSERT INTO audit_logs (
  action,
  resource_type,
  resource_id,
  new_values,
  metadata
) VALUES (
  'SYSTEM_STARTUP',
  'application',
  'ecolink',
  '{"version": "1.0.0", "environment": "production"}'::jsonb,
  '{"setup_completed": true}'::jsonb
);

SELECT 'Audit logging system setup completed successfully!' as status;
