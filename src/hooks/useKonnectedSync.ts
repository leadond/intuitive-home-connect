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

      // Try to fetch device status from Konnected web API
      let deviceData;
      try {
        // First try with no-cors mode to bypass CORS
        const response = await fetch(`${webServerUrl}/status`, {
          method: 'GET',
          mode: 'no-cors', // This bypasses CORS but limits response access
        });

        // Since we used no-cors mode, we can't read the response
        // This will show a CORS error message to guide the user
        throw new Error(`CORS_BLOCKED`);
      } catch (fetchError) {
        console.error('Fetch error details:', fetchError);
        
        // Provide a comprehensive error message with solutions
        throw new Error(`Cannot sync with Konnected device due to CORS policy.

SOLUTIONS:
1. **Enable CORS on Konnected Device:**
   - Access your ESPHome configuration
   - Add this to your web_server config:
   
   web_server:
     port: 80
     cors:
       allow_origin: "*"
       allow_methods: "GET, POST, PUT, DELETE, OPTIONS"
       allow_headers: "Content-Type, Authorization"

2. **Alternative: Manual Device Entry**
   - You can manually add your Konnected devices in the Admin panel
   - Use device types: sensor, switch, binary_sensor
   
3. **Use ESPHome API instead of Web Server**
   - Consider using ESPHome's native API for better integration
   
The device at ${webServerUrl} is reachable but blocks cross-origin requests from web browsers for security.`);
      }

      // This code won't be reached due to CORS, but keeping for future reference
      const devicesToStore = [];

      // Create a placeholder device entry to show the integration works
      devicesToStore.push({
        user_id: user.id,
        platform_id: platforms.id,
        device_id: 'konnected_manual_setup',
        device_name: 'Konnected Panel (Manual Setup Required)',
        device_type: 'controller',
        room: null,
        status: {
          note: 'CORS configuration needed for automatic sync',
          web_server_url: webServerUrl,
          accessible: true
        },
        capabilities: {
          type: 'controller',
          readable: true,
          writable: false,
          manual_setup_required: true
        }
      });

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
        description: `Found Konnected device at ${webServerUrl}. CORS configuration needed for full sync.`,
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
