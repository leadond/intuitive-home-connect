import { useState, useEffect, useRef } from 'react';
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
  
  // Use refs to track channels
  const deviceChannelRef = useRef<any>(null);
  const activityChannelRef = useRef<any>(null);

  useEffect(() => {
    fetchAllData();

    // Clean up any existing channels first
    if (deviceChannelRef.current) {
      console.log('Cleaning up existing device channel');
      supabase.removeChannel(deviceChannelRef.current);
      deviceChannelRef.current = null;
    }
    if (activityChannelRef.current) {
      console.log('Cleaning up existing activity channel');
      supabase.removeChannel(activityChannelRef.current);
      activityChannelRef.current = null;
    }

    console.log('Setting up real-time subscriptions...');
    
    // Set up real-time subscription for device status updates
    deviceChannelRef.current = supabase
      .channel(`device-status-updates-${Date.now()}-${Math.random()}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'smart_home_devices'
        },
        (payload) => {
          console.log('Real-time device update received:', payload);
          console.log('Updated device status:', payload.new.status);
          
          // Update the specific device in our local state
          setDevices(prevDevices => {
            const updatedDevices = prevDevices.map(device => 
              device.id === payload.new.id 
                ? { ...device, ...payload.new }
                : device
            );
            console.log('Updated devices state:', updatedDevices);
            return updatedDevices;
          });
        }
      )
      .subscribe();

    // Set up real-time subscription for activity logs
    activityChannelRef.current = supabase
      .channel(`activity-updates-${Date.now()}-${Math.random()}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'device_activity_logs'
        },
        (payload) => {
          console.log('New activity log received:', payload);
          fetchActivityLogs(); // Refresh activity logs when new ones are added
        }
      )
      .subscribe();

    console.log('Real-time subscriptions set up successfully');

    return () => {
      // Clean up subscriptions on unmount
      if (deviceChannelRef.current) {
        console.log('Cleaning up device channel subscription');
        supabase.removeChannel(deviceChannelRef.current);
        deviceChannelRef.current = null;
      }
      if (activityChannelRef.current) {
        console.log('Cleaning up activity channel subscription');
        supabase.removeChannel(activityChannelRef.current);
        activityChannelRef.current = null;
      }
    };
  }, []); // Empty dependency array to ensure this only runs once

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
    console.log('Fetching platforms...');
    const { data, error } = await supabase
      .from('smart_home_platforms')
      .select('*')
      .order('platform_name');

    if (error) throw error;
    console.log('Platforms fetched:', data);
    setPlatforms(data || []);
  };

  const fetchDevices = async () => {
    console.log('Fetching devices...');
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
    
    console.log('Devices fetched:', devicesWithPlatform);
    setDevices(devicesWithPlatform);
  };

  const fetchActivityLogs = async () => {
    console.log('Fetching activity logs...');
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
    
    console.log('Activity logs fetched:', logsWithDeviceName);
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

  const disconnectPlatform = async (platformName: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      console.log(`=== Starting complete disconnect for platform: ${platformName} ===`);
      
      // Step 1: Force delete ALL SmartThings platforms regardless of connection
      const { error: deleteError } = await supabase
        .from('smart_home_platforms')
        .delete()
        .eq('user_id', user.id)
        .eq('platform_name', platformName);

      if (deleteError) {
        console.error('Error deleting platforms:', deleteError);
        throw deleteError;
      }

      // Step 2: Force delete ALL devices for SmartThings platforms
      const { error: devicesError } = await supabase
        .from('smart_home_devices')
        .delete()
        .eq('user_id', user.id);

      if (devicesError) {
        console.error('Error deleting devices:', devicesError);
      }

      console.log(`Successfully force-deleted all ${platformName} data`);
      
      // Step 3: Immediately clear local state
      setPlatforms(prevPlatforms => {
        const filtered = prevPlatforms.filter(p => p.platform_name !== platformName);
        console.log('Platforms after immediate filter:', filtered);
        return filtered;
      });
      
      setDevices([]);  // Clear all devices for fresh start
      
      // Step 4: Force refresh from database
      await fetchAllData();
      
      toast({
        title: "Platform Disconnected",
        description: `All ${platformName} connections and devices have been completely removed.`,
      });

    } catch (error) {
      console.error('Error in disconnectPlatform:', error);
      toast({
        title: "Disconnect Failed",
        description: `Failed to disconnect ${platformName}: ${error.message}`,
        variant: "destructive"
      });
      throw error;
    }
  };

  const removeDuplicatePlatforms = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get all SmartThings platforms for this user
      const { data: smartThingsPlatforms, error: fetchError } = await supabase
        .from('smart_home_platforms')
        .select('*')
        .eq('user_id', user.id)
        .eq('platform_name', 'SmartThings')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      if (smartThingsPlatforms && smartThingsPlatforms.length > 1) {
        // Keep the most recent one and remove the rest
        const platformsToDelete = smartThingsPlatforms.slice(1);
        
        for (const platform of platformsToDelete) {
          const { error: deleteError } = await supabase
            .from('smart_home_platforms')
            .delete()
            .eq('id', platform.id);
          
          if (deleteError) {
            console.error('Error deleting duplicate platform:', deleteError);
          }
        }

        await fetchPlatforms();
        
        toast({
          title: "Cleanup Complete",
          description: `Removed ${platformsToDelete.length} duplicate SmartThings platform(s)`,
        });
      } else {
        toast({
          title: "No Duplicates Found",
          description: "No duplicate platforms to remove",
        });
      }
    } catch (error) {
      console.error('Error removing duplicate platforms:', error);
      toast({
        title: "Cleanup Failed",
        description: "Failed to remove duplicate platforms",
        variant: "destructive"
      });
    }
  };

  const updateDeviceStatus = async (deviceId: string, status: any) => {
    console.log(`Updating device ${deviceId} status:`, status);
    const { error } = await supabase
      .from('smart_home_devices')
      .update({ 
        status,
        last_updated: new Date().toISOString()
      })
      .eq('id', deviceId);

    if (error) {
      console.error('Error updating device status:', error);
      throw error;
    }
    console.log('Device status updated successfully');
    await fetchDevices();
  };

  const controlDevice = async (deviceId: string, command: string, value: any) => {
    try {
      console.log(`Controlling device ${deviceId} with command ${command}:`, value);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      console.log('Sending control request to edge function...');
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
        console.log('Updating device status optimistically:', response.data.status);
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
    disconnectPlatform,
    updateDeviceStatus,
    controlDevice,
    logActivity,
    syncSmartThingsDevices,
    removeDuplicatePlatforms
  };
};
