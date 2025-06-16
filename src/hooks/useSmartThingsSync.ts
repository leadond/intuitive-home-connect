
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSmartThingsSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  const syncSmartThingsDevices = async () => {
    try {
      setIsSyncing(true);
      console.log('Starting SmartThings device sync...');

      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Find the SmartThings platform
      const { data: platforms, error: platformError } = await supabase
        .from('smart_home_platforms')
        .select('*')
        .eq('user_id', user.id)
        .eq('platform_name', 'SmartThings')
        .eq('is_connected', true);

      if (platformError) throw platformError;
      
      if (!platforms || platforms.length === 0) {
        throw new Error('SmartThings platform not found or not connected');
      }

      const smartThingsPlatform = platforms[0];
      const credentials = smartThingsPlatform.credentials as { api_key: string; base_url?: string };
      
      if (!credentials?.api_key) {
        throw new Error('SmartThings API key not found');
      }

      console.log('Fetching devices from SmartThings API...');

      // Fetch devices from SmartThings API
      const baseUrl = credentials.base_url || 'https://api.smartthings.com/v1';
      const response = await fetch(`${baseUrl}/devices`, {
        headers: {
          'Authorization': `Bearer ${credentials.api_key}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`SmartThings API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('SmartThings API response:', data);

      if (!data.items || !Array.isArray(data.items)) {
        throw new Error('Invalid response format from SmartThings API');
      }

      const devices = data.items;
      console.log(`Found ${devices.length} devices from SmartThings`);

      // Clear existing SmartThings devices for this user
      const { error: deleteError } = await supabase
        .from('smart_home_devices')
        .delete()
        .eq('user_id', user.id)
        .eq('platform_id', smartThingsPlatform.id);

      if (deleteError) {
        console.error('Error deleting existing devices:', deleteError);
        throw deleteError;
      }

      // Insert new devices
      const deviceInserts = devices.map((device: any) => ({
        user_id: user.id,
        platform_id: smartThingsPlatform.id,
        device_id: device.deviceId,
        device_name: device.label || device.name || 'Unknown Device',
        device_type: device.deviceTypeName || 'Unknown',
        room: device.roomId || null,
        status: {
          online: device.status === 'ONLINE',
          health: device.health || 'UNKNOWN'
        },
        capabilities: device.components || []
      }));

      if (deviceInserts.length > 0) {
        const { error: insertError } = await supabase
          .from('smart_home_devices')
          .insert(deviceInserts);

        if (insertError) {
          console.error('Error inserting devices:', insertError);
          throw insertError;
        }
      }

      // Update platform last sync time
      const { error: updateError } = await supabase
        .from('smart_home_platforms')
        .update({ 
          last_sync: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', smartThingsPlatform.id);

      if (updateError) {
        console.error('Error updating platform sync time:', updateError);
      }

      toast({
        title: "Sync Complete",
        description: `Successfully synced ${devices.length} devices from SmartThings.`,
      });

      console.log('SmartThings sync completed successfully');
      return devices.length;

    } catch (error) {
      console.error('Error syncing SmartThings devices:', error);
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Failed to sync SmartThings devices",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    syncSmartThingsDevices,
    isSyncing
  };
};
