
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useKonnectedSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  const syncKonnectedDevices = async () => {
    try {
      setIsSyncing(true);
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Find Konnected platform configuration
      const { data: platforms, error: platformError } = await supabase
        .from('smart_home_platforms')
        .select('*')
        .eq('platform_name', 'Konnected')
        .eq('user_id', user.id)
        .single();

      if (platformError || !platforms) {
        throw new Error('Konnected platform not configured');
      }

      // Extract web server config from YAML - fix type assertion
      const credentials = platforms.credentials as { yaml_config?: string } | null;
      const yamlConfig = credentials?.yaml_config;
      
      if (!yamlConfig) {
        throw new Error('YAML configuration not found');
      }

      // Parse basic web server info from YAML (simplified parsing)
      const webServerMatch = yamlConfig.match(/web_server:\s*([^\n]*(?:\n\s+[^\n]*)*)/);
      let webServerUrl = 'http://192.168.0.225'; // default fallback
      
      if (webServerMatch) {
        const ipMatch = yamlConfig.match(/(\d+\.\d+\.\d+\.\d+)/);
        const portMatch = yamlConfig.match(/port:\s*(\d+)/);
        
        if (ipMatch) {
          const ip = ipMatch[1];
          const port = portMatch ? portMatch[1] : '80';
          webServerUrl = `http://${ip}:${port}`;
        }
      }

      console.log(`Attempting to fetch from Konnected at: ${webServerUrl}`);

      // Try to fetch device status from Konnected web API with CORS handling
      let deviceData;
      try {
        const response = await fetch(`${webServerUrl}/status`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          mode: 'cors', // Explicitly set CORS mode
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        deviceData = await response.json();
        console.log('Successfully fetched Konnected device data:', deviceData);
      } catch (fetchError) {
        console.error('Fetch error details:', fetchError);
        
        if (fetchError instanceof TypeError && fetchError.message.includes('Failed to fetch')) {
          throw new Error(`Cannot connect to Konnected device at ${webServerUrl}. This could be due to:
            1. CORS policy blocking the request (most common)
            2. Device is not accessible from this network
            3. Device is offline or unreachable
            4. Incorrect IP address or port
            
            Try accessing ${webServerUrl} directly in your browser to verify it's reachable.`);
        } else {
          throw new Error(`Network error: ${fetchError.message}`);
        }
      }

      // Process and store device data
      const devicesToStore = [];

      // Handle different types of Konnected devices/sensors
      if (deviceData.sensors) {
        deviceData.sensors.forEach((sensor: any, index: number) => {
          devicesToStore.push({
            user_id: user.id,
            platform_id: platforms.id,
            device_id: `konnected_sensor_${index}`,
            device_name: sensor.name || `Sensor ${index + 1}`,
            device_type: 'sensor',
            room: sensor.room || null,
            status: {
              state: sensor.state,
              value: sensor.value,
              unit: sensor.unit_of_measurement
            },
            capabilities: {
              type: sensor.device_class || 'generic',
              readable: true,
              writable: false
            }
          });
        });
      }

      if (deviceData.switches) {
        deviceData.switches.forEach((switch_device: any, index: number) => {
          devicesToStore.push({
            user_id: user.id,
            platform_id: platforms.id,
            device_id: `konnected_switch_${index}`,
            device_name: switch_device.name || `Switch ${index + 1}`,
            device_type: 'switch',
            room: switch_device.room || null,
            status: {
              state: switch_device.state
            },
            capabilities: {
              type: 'switch',
              readable: true,
              writable: true
            }
          });
        });
      }

      // If no specific sensor/switch data, try to parse general status
      if (devicesToStore.length === 0 && deviceData) {
        // Create a general device entry
        devicesToStore.push({
          user_id: user.id,
          platform_id: platforms.id,
          device_id: 'konnected_main',
          device_name: 'Konnected Panel',
          device_type: 'controller',
          room: null,
          status: deviceData,
          capabilities: {
            type: 'controller',
            readable: true,
            writable: true
          }
        });
      }

      // Delete existing Konnected devices for this user
      await supabase
        .from('smart_home_devices')
        .delete()
        .eq('platform_id', platforms.id);

      // Insert new device data
      if (devicesToStore.length > 0) {
        const { error: insertError } = await supabase
          .from('smart_home_devices')
          .insert(devicesToStore);

        if (insertError) throw insertError;
      }

      // Update platform sync timestamp
      await supabase
        .from('smart_home_platforms')
        .update({ last_sync: new Date().toISOString() })
        .eq('id', platforms.id);

      toast({
        title: "Sync Complete",
        description: `Successfully synced ${devicesToStore.length} Konnected device(s).`,
      });

      return devicesToStore;
    } catch (error) {
      console.error('Konnected sync error:', error);
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Failed to sync Konnected devices.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    syncKonnectedDevices,
    isSyncing
  };
};
