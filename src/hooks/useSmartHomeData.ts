import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SmartHomePlatform {
  id: string;
  platform_name: string;
  platform_type: string;
  is_connected: boolean;
  last_sync: string | null;
}

export interface SmartHomeDevice {
  id: string;
  device_name: string;
  device_type: string;
  room: string | null;
  status: any;
  capabilities: any;
  platform_name: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  details: any;
  timestamp: string;
  device_name: string;
}

export interface EnergyData {
  recorded_at: string;
  usage_kwh: number;
  solar_generation_kwh: number;
  cost_usd: number | null;
}

export const useSmartHomeData = () => {
  const [platforms, setPlatforms] = useState<SmartHomePlatform[]>([]);
  const [devices, setDevices] = useState<SmartHomeDevice[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [energyData, setEnergyData] = useState<EnergyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        fetchPlatforms(),
        fetchDevices(),
        fetchActivityLogs(),
        fetchEnergyData()
      ]);
    } catch (error) {
      console.error('Error fetching smart home data:', error);
      toast({
        title: "Error",
        description: "Failed to load smart home data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlatforms = async () => {
    const { data, error } = await supabase
      .from('smart_home_platforms')
      .select('*')
      .order('platform_name');

    if (error) throw error;
    setPlatforms(data || []);
  };

  const fetchDevices = async () => {
    const { data, error } = await supabase
      .from('smart_home_devices')
      .select(`
        *,
        smart_home_platforms(platform_name)
      `)
      .order('device_name');

    if (error) throw error;
    
    const devicesWithPlatform = data?.map(device => ({
      ...device,
      platform_name: device.smart_home_platforms?.platform_name || 'Unknown'
    })) || [];
    
    setDevices(devicesWithPlatform);
  };

  const fetchActivityLogs = async () => {
    const { data, error } = await supabase
      .from('device_activity_logs')
      .select(`
        *,
        smart_home_devices(device_name)
      `)
      .order('timestamp', { ascending: false })
      .limit(10);

    if (error) throw error;
    
    const logsWithDeviceName = data?.map(log => ({
      ...log,
      device_name: log.smart_home_devices?.device_name || 'Unknown Device'
    })) || [];
    
    setActivityLogs(logsWithDeviceName);
  };

  const fetchEnergyData = async () => {
    const { data, error } = await supabase
      .from('energy_usage')
      .select('*')
      .order('recorded_at', { ascending: false })
      .limit(24); // Last 24 hours

    if (error) throw error;
    setEnergyData(data || []);
  };

  const addPlatform = async (platformData: { 
    platform_name: string; 
    platform_type: string; 
    credentials: any;
    is_connected?: boolean;
  }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('smart_home_platforms')
      .insert({
        platform_name: platformData.platform_name,
        platform_type: platformData.platform_type,
        credentials: platformData.credentials,
        is_connected: platformData.is_connected || false,
        user_id: user.id
      });

    if (error) throw error;
    await fetchPlatforms();
  };

  const removePlatform = async (platformId: string) => {
    try {
      console.log(`Starting removal of platform ${platformId}...`);
      
      // Get ALL devices for this platform
      const { data: devices, error: devicesError } = await supabase
        .from('smart_home_devices')
        .select('id')
        .eq('platform_id', platformId);

      if (devicesError) throw devicesError;

      const deviceIds = devices?.map(device => device.id) || [];
      console.log(`Found ${deviceIds.length} devices to remove`);

      if (deviceIds.length > 0) {
        // Delete ALL activity logs first
        const { error: logsError } = await supabase
          .from('device_activity_logs')
          .delete()
          .in('device_id', deviceIds);

        if (logsError) {
          console.error('Error deleting activity logs:', logsError);
          throw logsError;
        }
        console.log('Activity logs removed');

        // Delete ALL energy usage data
        const { error: energyError } = await supabase
          .from('energy_usage')
          .delete()
          .in('device_id', deviceIds);

        if (energyError) {
          console.error('Error deleting energy usage:', energyError);
          throw energyError;
        }
        console.log('Energy usage data removed');

        // Delete ALL devices
        const { error: deleteDevicesError } = await supabase
          .from('smart_home_devices')
          .delete()
          .eq('platform_id', platformId);

        if (deleteDevicesError) {
          console.error('Error deleting devices:', deleteDevicesError);
          throw deleteDevicesError;
        }
        console.log('Devices removed');
      }

      // Finally delete the platform
      const { error: deletePlatformError } = await supabase
        .from('smart_home_platforms')
        .delete()
        .eq('id', platformId);

      if (deletePlatformError) {
        console.error('Error deleting platform:', deletePlatformError);
        throw deletePlatformError;
      }
      console.log('Platform removed');

      await fetchAllData();
      
      toast({
        title: "Platform Removed",
        description: "Platform and all associated data removed successfully.",
      });
    } catch (error) {
      console.error('Error removing platform:', error);
      throw error;
    }
  };

  const updateDeviceStatus = async (deviceId: string, status: any) => {
    const { error } = await supabase
      .from('smart_home_devices')
      .update({ 
        status,
        last_updated: new Date().toISOString()
      })
      .eq('id', deviceId);

    if (error) throw error;
    await fetchDevices();
  };

  const logActivity = async (deviceId: string, action: string, details?: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('device_activity_logs')
      .insert({
        user_id: user.id,
        device_id: deviceId,
        action,
        details
      });

    if (error) throw error;
    await fetchActivityLogs();
  };

  return {
    platforms,
    devices,
    activityLogs,
    energyData,
    isLoading,
    fetchAllData,
    addPlatform,
    removePlatform,
    updateDeviceStatus,
    logActivity
  };
};
