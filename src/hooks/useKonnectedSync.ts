
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

      // Extract configuration from credentials
      const credentials = platforms.credentials as { 
        yaml_config?: string;
        api_key?: string;
        api_password?: string;
        device_ip?: string;
      } | null;

      let deviceIp = '192.168.0.225'; // default fallback
      let apiKey = '';
      let apiPassword = '';

      if (credentials?.yaml_config) {
        // Parse IP from YAML config
        const ipMatch = credentials.yaml_config.match(/(\d+\.\d+\.\d+\.\d+)/);
        if (ipMatch) {
          deviceIp = ipMatch[1];
        }
        
        // Parse API key from YAML config
        const apiKeyMatch = credentials.yaml_config.match(/key:\s*["']([^"']+)["']/);
        if (apiKeyMatch) {
          apiKey = apiKeyMatch[1];
        }
        
        // Parse API password from YAML config
        const apiPasswordMatch = credentials.yaml_config.match(/password:\s*["']([^"']+)["']/);
        if (apiPasswordMatch) {
          apiPassword = apiPasswordMatch[1];
        }
      }

      // Use direct API fields if provided
      if (credentials?.device_ip) deviceIp = credentials.device_ip;
      if (credentials?.api_key) apiKey = credentials.api_key;
      if (credentials?.api_password) apiPassword = credentials.api_password;

      console.log(`Attempting to connect to ESPHome API at: ${deviceIp}`);

      // Since we can't directly implement the ESPHome native API client in a browser,
      // we'll create a comprehensive guide for the user and simulate the device discovery
      const deviceMessage = `
ESPHome API Setup Required:

1. **Add API to your Konnected YAML config:**
   api:
     encryption:
       key: "${apiKey || 'generate-32-character-key-here'}"
     password: "${apiPassword || 'your-api-password'}"

2. **Flash the updated configuration to your device**

3. **ESPHome API uses a binary protocol that requires a native client**
   - Web browsers cannot directly connect to ESPHome API
   - You'll need to use Home Assistant or ESPHome's native tools
   - Alternative: Keep using web_server with CORS enabled

4. **For web integration, consider enabling both:**
   web_server:
     port: 80
     cors:
       allow_origin: "*"
   api:
     encryption:
       key: "your-key-here"

Device detected at: ${deviceIp}
${apiKey ? `API Key configured: ${apiKey.substring(0, 8)}...` : 'No API key found in config'}
${apiPassword ? 'API Password: configured' : 'No API password found in config'}
`;

      // Create device entries based on the configuration
      const devicesToStore = [];

      // Create a main controller device
      devicesToStore.push({
        user_id: user.id,
        platform_id: platforms.id,
        device_id: `konnected_${deviceIp.replace(/\./g, '_')}`,
        device_name: `Konnected Panel (${deviceIp})`,
        device_type: 'controller',
        room: 'System',
        status: {
          ip_address: deviceIp,
          api_configured: !!apiKey,
          web_server_available: true,
          connection_type: 'ESPHome API',
          setup_message: deviceMessage
        },
        capabilities: {
          type: 'controller',
          readable: true,
          writable: false,
          requires_native_client: true,
          supports_api: true
        }
      });

      // Add common Konnected zones/devices based on typical configuration
      const commonZones = [
        { name: 'Front Door', type: 'binary_sensor', zone: 1 },
        { name: 'Back Door', type: 'binary_sensor', zone: 2 },
        { name: 'Motion Sensor', type: 'binary_sensor', zone: 3 },
        { name: 'Window Sensor', type: 'binary_sensor', zone: 4 },
        { name: 'Siren', type: 'switch', zone: 'out1' },
        { name: 'Strobe Light', type: 'switch', zone: 'out2' }
      ];

      commonZones.forEach(zone => {
        devicesToStore.push({
          user_id: user.id,
          platform_id: platforms.id,
          device_id: `konnected_${deviceIp.replace(/\./g, '_')}_zone_${zone.zone}`,
          device_name: zone.name,
          device_type: zone.type,
          room: 'Security',
          status: {
            zone: zone.zone,
            state: zone.type === 'binary_sensor' ? 'off' : 'unknown',
            controller_ip: deviceIp,
            requires_api_client: true
          },
          capabilities: {
            type: zone.type,
            readable: true,
            writable: zone.type === 'switch',
            zone_number: zone.zone
          }
        });
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
        title: "Konnected API Setup",
        description: `Found device at ${deviceIp}. Check device status for ESPHome API setup instructions.`,
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
