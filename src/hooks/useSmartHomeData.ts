
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
  external_device_id?: string;
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

    // Set up real-time subscription for device status updates
    const deviceChannel = supabase
      .channel('device-status-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'smart_home_devices'
        },
        (payload) => {
          console.log('Real-time device update:', payload);
          // Update the specific device in our local state
          setDevices(prevDevices => 
            prevDevices.map(device => 
              device.id === payload.new.id 
                ? { ...device, ...payload.new }
                : device
            )
          );
        }
      )
      .subscribe();

    // Set up real-time subscription for activity logs
    const activityChannel = supabase
      .channel('activity-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'device_activity_logs'
        },
        (payload) => {
          console.log('New activity log:', payload);
          fetchActivityLogs(); // Refresh activity logs when new ones are added
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(deviceChannel);
      supabase.removeChannel(activityChannel);
    };
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

  const controlDevice = async (deviceId: string, command: string, value: any) => {
    try {
      console.log(`Controlling device ${deviceId} with command ${command}:`, value);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await supabase.functions.invoke('control-smartthings-device', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: {
          deviceId: deviceId,
          command,
          value
        }
      });

      if (response.error) {
        console.error('Control device error:', response.error);
        throw new Error(response.error.message || 'Failed to control device');
      }

      console.log('Device control response:', response.data);
      
      // The real-time subscription will handle updating the UI
      // But we can also update optimistically
      if (response.data?.status) {
        setDevices(prevDevices => 
          prevDevices.map(device => 
            device.id === deviceId 
              ? { ...device, status: response.data.status }
              : device
          )
        );
      }
      
      toast({
        title: "Device Updated",
        description: response.data?.message || "Device controlled successfully",
      });
      
      return response.data;
    } catch (error) {
      console.error('Error controlling device:', error);
      toast({
        title: "Control Failed",
        description: error.message || "Failed to control device",
        variant: "destructive"
      });
      throw error;
    }
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

  const syncSmartThingsDevices = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await supabase.functions.invoke('fetch-smartthings-devices', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to sync SmartThings devices');
      }

      // Refresh devices after sync
      await fetchDevices();
      
      toast({
        title: "Sync Complete",
        description: response.data?.message || "SmartThings devices synced successfully",
      });

      return response.data;
    } catch (error) {
      console.error('Error syncing SmartThings devices:', error);
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync SmartThings devices",
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    platforms,
    devices,
    activityLogs,
    energyData,
    isLoading,
    fetchAllData,
    addPlatform,
    updateDeviceStatus,
    controlDevice,
    logActivity,
    syncSmartThingsDevices
  };
};
