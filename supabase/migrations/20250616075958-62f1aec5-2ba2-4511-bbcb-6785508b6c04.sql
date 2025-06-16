
-- The upsert is failing because there's no unique constraint for the conflict resolution
-- Let's add a unique constraint on user_id and device_id combination
ALTER TABLE smart_home_devices 
ADD CONSTRAINT unique_user_device 
UNIQUE (user_id, device_id);
