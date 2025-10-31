-- Add notification_preferences column to profiles table
-- Run this in your Supabase SQL Editor

-- Add notification_preferences column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'notification_preferences') THEN
        ALTER TABLE profiles ADD COLUMN notification_preferences JSONB DEFAULT '{
            "emailNotifications": { "enabled": true },
            "projectUpdates": { "enabled": true },
            "marketAlerts": { "enabled": false },
            "newsletter": { "enabled": true }
        }'::jsonb;
        
        -- Add comment for documentation
        COMMENT ON COLUMN profiles.notification_preferences IS 'User notification preferences stored as JSONB';
    END IF;
END $$;

-- Update existing profiles with default notification preferences if null
UPDATE profiles 
SET notification_preferences = '{
    "emailNotifications": { "enabled": true },
    "projectUpdates": { "enabled": true },
    "marketAlerts": { "enabled": false },
    "newsletter": { "enabled": true }
}'::jsonb
WHERE notification_preferences IS NULL;

-- Verify the column was added
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'notification_preferences';

-- Success message
SELECT 'Notification preferences column added successfully!' as status;


