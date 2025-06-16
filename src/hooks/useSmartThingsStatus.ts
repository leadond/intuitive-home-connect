
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSmartThingsStatus = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const getSmartThingsCredentials = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: platforms, error } = await supabase
      .from('smart_home_platforms')
      .select('*')
      .eq('user_id', user.id)
      .eq('platform_name', 'SmartThings')
      .eq('is_connected', true);

    if (error) throw error;
    
    if (!platforms || platforms.length === 0) {
      throw new Error('SmartThings platform not found or not connected');
    }

    const credentials = platforms[0].credentials as { api_key: string; base_url?: string };
    if (!credentials?.api_key) {
      throw new Error('SmartThings API key not found');
    }

    return {
      apiKey: credentials.api_key,
      baseUrl: credentials.base_url || 'https://api.smartthings.com/v1'
    };
  };

  const fetchLiveDeviceStatus = async (deviceId: string) => {
    try {
      const { apiKey, baseUrl } = await getSmartThingsCredentials();
      
      const response = await fetch(`${baseUrl}/devices/${deviceId}/status`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`SmartThings API error: ${response.status}`);
      }

      const statusData = await response.json();
      console.log(`Live status for device ${deviceId}:`, statusData);
      return statusData;
    } catch (error) {
      console.error(`Error fetching live status for device ${deviceId}:`, error);
      return null;
    }
  };

  const sendDeviceCommand = async (deviceId: string, capability: string, command: string, args?: any[]) => {
    try {
      setIsUpdating(true);
      const { apiKey, baseUrl } = await getSmartThingsCredentials();
      
      const commandPayload = {
        commands: [{
          component: 'main',
          capability,
          command,
          arguments: args || []
        }]
      };

      console.log(`Sending command to device ${deviceId}:`, commandPayload);

      const response = await fetch(`${baseUrl}/devices/${deviceId}/commands`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(commandPayload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`SmartThings API error: ${response.status} - ${errorText}`);
      }

      console.log(`Command sent successfully to device ${deviceId}`);
      return true;
    } catch (error) {
      console.error(`Error sending command to device ${deviceId}:`, error);
      toast({
        title: "Command Failed",
        description: error instanceof Error ? error.message : "Failed to send command to device",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    fetchLiveDeviceStatus,
    sendDeviceCommand,
    isUpdating
  };
};
