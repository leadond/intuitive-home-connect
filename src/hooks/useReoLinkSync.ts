
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useReoLinkSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  const syncReoLinkCameras = async () => {
    try {
      setIsSyncing(true);
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Find ReoLink platform configuration
      const { data: platforms, error: platformError } = await supabase
        .from('smart_home_platforms')
        .select('*')
        .eq('platform_name', 'ReoLink')
        .eq('user_id', user.id)
        .single();

      if (platformError || !platforms) {
        throw new Error('ReoLink platform not configured');
      }

      // Extract configuration from credentials
      const credentials = platforms.credentials as { 
        username?: string;
        password?: string;
        camera_ip?: string;
        port?: number;
      } | null;

      if (!credentials?.username || !credentials?.camera_ip) {
        throw new Error('ReoLink credentials incomplete. Please configure username and camera IP.');
      }

      const cameraIp = credentials.camera_ip;
      const port = credentials.port || 80;
      const username = credentials.username;
      const password = credentials.password || '';

      console.log(`Attempting to connect to ReoLink camera at: ${cameraIp}:${port}`);

      // Create camera view devices
      const devicesToStore = [];

      // Main camera view device
      devicesToStore.push({
        user_id: user.id,
        platform_id: platforms.id,
        device_id: `reolink_camera_${cameraIp.replace(/\./g, '_')}`,
        device_name: `ReoLink Camera View (${cameraIp})`,
        device_type: 'camera_view',
        room: 'Security',
        status: {
          ip_address: cameraIp,
          port: port,
          online: true,
          streaming: 'available',
          motion_detection: 'enabled',
          connection_type: 'TCP/IP',
          rtsp_main: `rtsp://${username}:${password}@${cameraIp}:554/h264Preview_01_main`,
          rtsp_sub: `rtsp://${username}:${password}@${cameraIp}:554/h264Preview_01_sub`,
          http_snapshot: `http://${cameraIp}/cgi-bin/api.cgi?cmd=Snap&channel=0&rs=wuuPhkmUCeI9WG7C&user=${username}&password=${password}`,
          ptz_position: { pan: 0, tilt: 0, zoom: 1 },
          night_vision: 'auto',
          recording: 'enabled'
        },
        capabilities: {
          type: 'camera_view',
          readable: true,
          writable: true,
          supports_streaming: true,
          supports_ptz: true,
          supports_recording: true,
          supports_motion_detection: true,
          supports_night_vision: true,
          supports_snapshot: true,
          ptz_commands: {
            pan_left: `http://${cameraIp}/cgi-bin/api.cgi?cmd=PtzCtrl&channel=0&op=Left&speed=32&user=${username}&password=${password}`,
            pan_right: `http://${cameraIp}/cgi-bin/api.cgi?cmd=PtzCtrl&channel=0&op=Right&speed=32&user=${username}&password=${password}`,
            tilt_up: `http://${cameraIp}/cgi-bin/api.cgi?cmd=PtzCtrl&channel=0&op=Up&speed=32&user=${username}&password=${password}`,
            tilt_down: `http://${cameraIp}/cgi-bin/api.cgi?cmd=PtzCtrl&channel=0&op=Down&speed=32&user=${username}&password=${password}`,
            zoom_in: `http://${cameraIp}/cgi-bin/api.cgi?cmd=PtzCtrl&channel=0&op=ZoomInc&user=${username}&password=${password}`,
            zoom_out: `http://${cameraIp}/cgi-bin/api.cgi?cmd=PtzCtrl&channel=0&op=ZoomDec&user=${username}&password=${password}`,
            stop: `http://${cameraIp}/cgi-bin/api.cgi?cmd=PtzCtrl&channel=0&op=Stop&user=${username}&password=${password}`,
            preset_goto: `http://${cameraIp}/cgi-bin/api.cgi?cmd=PtzCtrl&channel=0&op=ToPos&id={preset_id}&user=${username}&password=${password}`
          },
          night_vision_commands: {
            auto: `http://${cameraIp}/cgi-bin/api.cgi?cmd=SetIrLights&channel=0&value=Auto&user=${username}&password=${password}`,
            on: `http://${cameraIp}/cgi-bin/api.cgi?cmd=SetIrLights&channel=0&value=On&user=${username}&password=${password}`,
            off: `http://${cameraIp}/cgi-bin/api.cgi?cmd=SetIrLights&channel=0&value=Off&user=${username}&password=${password}`
          }
        }
      });

      // Motion detection sensor
      devicesToStore.push({
        user_id: user.id,
        platform_id: platforms.id,
        device_id: `reolink_motion_${cameraIp.replace(/\./g, '_')}`,
        device_name: `ReoLink Motion Sensor (${cameraIp})`,
        device_type: 'binary_sensor',
        room: 'Security',
        status: {
          state: 'off',
          device_class: 'motion',
          parent_camera: cameraIp,
          sensitivity: 'medium',
          last_triggered: null
        },
        capabilities: {
          type: 'binary_sensor',
          readable: true,
          writable: false,
          device_class: 'motion',
          parent_device: `reolink_camera_${cameraIp.replace(/\./g, '_')}`
        }
      });

      // Delete existing ReoLink devices for this user
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
        title: "ReoLink Camera Synced",
        description: `Successfully configured camera view at ${cameraIp} with PTZ controls.`,
      });

      return devicesToStore;
    } catch (error) {
      console.error('ReoLink sync error:', error);
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Failed to sync ReoLink camera.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    syncReoLinkCameras,
    isSyncing
  };
};
