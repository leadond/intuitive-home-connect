
-- Create table for storing smart home platform credentials
CREATE TABLE public.smart_home_platforms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  platform_name TEXT NOT NULL,
  platform_type TEXT NOT NULL, -- 'oauth', 'api_key', 'homekit'
  credentials JSONB NOT NULL, -- encrypted storage for tokens/keys
  is_connected BOOLEAN NOT NULL DEFAULT false,
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for storing device data from platforms
CREATE TABLE public.smart_home_devices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  platform_id UUID REFERENCES public.smart_home_platforms NOT NULL,
  device_id TEXT NOT NULL, -- external device ID from platform
  device_name TEXT NOT NULL,
  device_type TEXT NOT NULL, -- 'light', 'thermostat', 'lock', 'camera', etc.
  room TEXT,
  status JSONB, -- current device status/state
  capabilities JSONB, -- what the device can do
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for storing activity logs
CREATE TABLE public.device_activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  device_id UUID REFERENCES public.smart_home_devices NOT NULL,
  action TEXT NOT NULL,
  details JSONB,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for storing energy usage data
CREATE TABLE public.energy_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  device_id UUID REFERENCES public.smart_home_devices,
  usage_kwh DECIMAL(10,3) NOT NULL,
  solar_generation_kwh DECIMAL(10,3) DEFAULT 0,
  cost_usd DECIMAL(10,2),
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.smart_home_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_home_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energy_usage ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for smart_home_platforms
CREATE POLICY "Users can view their own platforms" 
  ON public.smart_home_platforms 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own platforms" 
  ON public.smart_home_platforms 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own platforms" 
  ON public.smart_home_platforms 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own platforms" 
  ON public.smart_home_platforms 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for smart_home_devices
CREATE POLICY "Users can view their own devices" 
  ON public.smart_home_devices 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own devices" 
  ON public.smart_home_devices 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own devices" 
  ON public.smart_home_devices 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own devices" 
  ON public.smart_home_devices 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for device_activity_logs
CREATE POLICY "Users can view their own activity logs" 
  ON public.device_activity_logs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activity logs" 
  ON public.device_activity_logs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for energy_usage
CREATE POLICY "Users can view their own energy usage" 
  ON public.energy_usage 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own energy usage" 
  ON public.energy_usage 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_smart_home_platforms_user_id ON public.smart_home_platforms(user_id);
CREATE INDEX idx_smart_home_devices_user_id ON public.smart_home_devices(user_id);
CREATE INDEX idx_smart_home_devices_platform_id ON public.smart_home_devices(platform_id);
CREATE INDEX idx_device_activity_logs_user_id ON public.device_activity_logs(user_id);
CREATE INDEX idx_device_activity_logs_device_id ON public.device_activity_logs(device_id);
CREATE INDEX idx_energy_usage_user_id ON public.energy_usage(user_id);
CREATE INDEX idx_energy_usage_recorded_at ON public.energy_usage(recorded_at);
