
-- First, let's drop the existing foreign key constraints that are causing issues
ALTER TABLE device_activity_logs DROP CONSTRAINT IF EXISTS device_activity_logs_device_id_fkey;
ALTER TABLE energy_usage DROP CONSTRAINT IF EXISTS energy_usage_device_id_fkey;
ALTER TABLE smart_home_devices DROP CONSTRAINT IF EXISTS smart_home_devices_platform_id_fkey;

-- Now recreate them with CASCADE DELETE to automatically handle deletions
ALTER TABLE device_activity_logs 
ADD CONSTRAINT device_activity_logs_device_id_fkey 
FOREIGN KEY (device_id) REFERENCES smart_home_devices(id) ON DELETE CASCADE;

ALTER TABLE energy_usage 
ADD CONSTRAINT energy_usage_device_id_fkey 
FOREIGN KEY (device_id) REFERENCES smart_home_devices(id) ON DELETE CASCADE;

ALTER TABLE smart_home_devices 
ADD CONSTRAINT smart_home_devices_platform_id_fkey 
FOREIGN KEY (platform_id) REFERENCES smart_home_platforms(id) ON DELETE CASCADE;
