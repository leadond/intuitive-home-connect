import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSmartHomeData, SmartHomeDevice, SmartHomePlatform } from "@/hooks/useSmartHomeData";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const DebugPanel = () => {
  const { user } = useAuth();
  const smartHomeData = useSmartHomeData();
  const [isAddingMockData, setIsAddingMockData] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');

  const addMockDevices = async () => {
    if (!user) {
      setDebugInfo('No user authenticated');
      return;
    }

    setIsAddingMockData(true);
    setDebugInfo('Adding mock devices...');

    try {
      // First, add a mock platform if none exists
      const { data: existingPlatforms, error: platformCheckError } = await supabase
        .from('smart_home_platforms')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (platformCheckError) {
        throw new Error(`Error checking platforms: ${platformCheckError.message}`);
      }

      let platformId = '';

      if (!existingPlatforms || existingPlatforms.length === 0) {
        // Create a mock platform
        const mockPlatform: Partial<SmartHomePlatform> = {
          user_id: user.id,
          platform_name: 'Mock Platform',
          platform_type: 'mock',
          credentials: {},
          is_connected: true,
          last_sync: new Date().toISOString(),
        };

        const { data: newPlatform, error: platformError } = await supabase
          .from('smart_home_platforms')
          .insert(mockPlatform)
          .select()
          .single();

        if (platformError) {
          throw new Error(`Error creating platform: ${platformError.message}`);
        }

        platformId = newPlatform.id;
        setDebugInfo(prev => prev + '\nCreated mock platform with ID: ' + platformId);
      } else {
        platformId = existingPlatforms[0].id;
        setDebugInfo(prev => prev + '\nUsing existing platform with ID: ' + platformId);
      }

      // Create mock devices
      const mockDevices: Partial<SmartHomeDevice>[] = [
        {
          user_id: user.id,
          platform_id: platformId,
          device_id: 'mock-light-1',
          device_name: 'Living Room Light',
          device_type: 'light',
          room: 'Living Room',
          status: { state: 'on', brightness: 80, color: '#ffffff' },
          capabilities: { color_control: true },
        },
        {
          user_id: user.id,
          platform_id: platformId,
          device_id: 'mock-light-2',
          device_name: 'Bedroom Light',
          device_type: 'light',
          room: 'Bedroom',
          status: { state: 'off', brightness: 100, color: '#ffffff' },
          capabilities: { color_control: true },
        },
        {
          user_id: user.id,
          platform_id: platformId,
          device_id: 'mock-thermostat-1',
          device_name: 'Main Thermostat',
          device_type: 'thermostat',
          room: 'Living Room',
          status: { state: 'on', mode: 'cool', target_temperature: 72, current_temperature: 74 },
          capabilities: { modes: ['cool', 'heat', 'auto', 'off'] },
        },
        {
          user_id: user.id,
          platform_id: platformId,
          device_id: 'mock-camera-1',
          device_name: 'Front Door Camera',
          device_type: 'camera',
          room: 'Exterior',
          status: { state: 'on', night_vision: 'auto', ptz_position: { pan: 0, tilt: 0, zoom: 1 } },
          capabilities: { 
            ptz_commands: {
              pan_left: 'http://example.com/ptz/left',
              pan_right: 'http://example.com/ptz/right',
              tilt_up: 'http://example.com/ptz/up',
              tilt_down: 'http://example.com/ptz/down',
              zoom_in: 'http://example.com/ptz/zoomin',
              zoom_out: 'http://example.com/ptz/zoomout',
              preset_goto: 'http://example.com/ptz/preset/{preset_id}'
            },
            night_vision_commands: {
              auto: 'http://example.com/nightvision/auto',
              on: 'http://example.com/nightvision/on',
              off: 'http://example.com/nightvision/off'
            }
          },
        },
        {
          user_id: user.id,
          platform_id: platformId,
          device_id: 'mock-lock-1',
          device_name: 'Front Door Lock',
          device_type: 'lock',
          room: 'Exterior',
          status: { state: 'off' }, // off = locked, on = unlocked
          capabilities: {},
        },
      ];

      // Insert mock devices
      const { data: newDevices, error: devicesError } = await supabase
        .from('smart_home_devices')
        .insert(mockDevices)
        .select();

      if (devicesError) {
        throw new Error(`Error creating devices: ${devicesError.message}`);
      }

      setDebugInfo(prev => prev + `\nCreated ${newDevices.length} mock devices`);
      
      // Refresh data
      await smartHomeData.fetchAllData();
      setDebugInfo(prev => prev + '\nData refreshed successfully');
    } catch (error) {
      console.error('Error adding mock data:', error);
      setDebugInfo(prev => prev + `\nError: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsAddingMockData(false);
    }
  };

  const checkAuthStatus = async () => {
    setDebugInfo('Checking authentication status...');
    
    try {
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        setDebugInfo(prev => prev + `\nAuth error: ${error.message}`);
        return;
      }
      
      if (data.user) {
        setDebugInfo(prev => prev + `\nAuthenticated as: ${data.user.email} (ID: ${data.user.id})`);
      } else {
        setDebugInfo(prev => prev + '\nNot authenticated');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setDebugInfo(prev => prev + `\nError: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const checkDatabaseConnection = async () => {
    setDebugInfo('Checking database connection...');
    
    try {
      // Simple query to check connection
      const { data, error } = await supabase
        .from('smart_home_devices')
        .select('count', { count: 'exact', head: true });
      
      if (error) {
        setDebugInfo(prev => prev + `\nDatabase error: ${error.message}`);
        return;
      }
      
      setDebugInfo(prev => prev + '\nDatabase connection successful');
    } catch (error) {
      console.error('Error checking database connection:', error);
      setDebugInfo(prev => prev + `\nError: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
      <CardHeader>
        <CardTitle>Debug Panel</CardTitle>
        <CardDescription className="text-blue-200">
          Troubleshooting tools for device display issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={addMockDevices} 
            disabled={isAddingMockData}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isAddingMockData ? 'Adding...' : 'Add Mock Devices'}
          </Button>
          
          <Button 
            onClick={checkAuthStatus}
            variant="outline" 
            className="border-white/20 text-white hover:bg-white/10"
          >
            Check Auth Status
          </Button>
          
          <Button 
            onClick={checkDatabaseConnection}
            variant="outline" 
            className="border-white/20 text-white hover:bg-white/10"
          >
            Check DB Connection
          </Button>
          
          <Button 
            onClick={() => smartHomeData.fetchAllData()}
            variant="outline" 
            className="border-white/20 text-white hover:bg-white/10"
          >
            Refresh Data
          </Button>
        </div>
        
        {debugInfo && (
          <div className="mt-4 p-4 bg-black/30 rounded-md">
            <pre className="text-xs text-blue-200 whitespace-pre-wrap">{debugInfo}</pre>
          </div>
        )}
        
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Current State:</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-black/30 rounded-md">
              <p className="font-medium">Devices: {smartHomeData.devices.length}</p>
              <p>Loading: {smartHomeData.isLoading ? 'Yes' : 'No'}</p>
              <p>Updating: {smartHomeData.isUpdating ? 'Yes' : 'No'}</p>
            </div>
            <div className="p-2 bg-black/30 rounded-md">
              <p className="font-medium">Platforms: {smartHomeData.platforms.length}</p>
              <p>Activity Logs: {smartHomeData.activityLogs.length}</p>
              <p>User: {user?.email || 'Not logged in'}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
