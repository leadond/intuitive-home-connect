import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { 
  Lightbulb, 
  Fan, 
  Thermometer, 
  Camera, 
  Lock, 
  Tv,
  Volume2,
  Wifi,
  Power,
  Zap,
  Monitor,
  Home,
  Lamp,
  RefreshCw
} from "lucide-react";
import { useSmartHomeData, SmartHomeDevice } from "@/hooks/useSmartHomeData";
import { useSmartThingsStatus } from "@/hooks/useSmartThingsStatus";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

// Utility function to determine device type from capabilities
const getDeviceTypeFromCapabilities = (capabilities: any, deviceType: string, deviceName: string): string => {
  if (!capabilities || !Array.isArray(capabilities)) return 'switch';
  
  const hasCapability = (capName: string) => 
    capabilities.some((comp: any) => 
      comp && typeof comp === 'object' && 
      Object.keys(comp).some(key => key.toLowerCase().includes(capName.toLowerCase()))
    );

  // Check for fan speed capability first
  if (hasCapability('fanSpeed') || hasCapability('speed')) return 'fan';
  if (hasCapability('switchLevel') || hasCapability('level')) return 'dimmer';
  if (hasCapability('thermostat')) return 'thermostat';
  if (hasCapability('lock')) return 'lock';
  if (hasCapability('camera') || hasCapability('videoCamera')) return 'camera';
  if (deviceName.toLowerCase().includes('fan')) return 'fan';
  if (deviceName.toLowerCase().includes('tv') || deviceName.toLowerCase().includes('television')) return 'tv';
  
  return 'switch';
};

// Utility function to get the appropriate icon for a device
const getDeviceIcon = (deviceType: string, deviceName: string) => {
  const name = deviceName.toLowerCase();
  
  if (deviceType === 'dimmer' || name.includes('light') || name.includes('lamp')) return Lightbulb;
  if (deviceType === 'fan' || name.includes('fan')) return Fan;
  if (deviceType === 'thermostat' || name.includes('thermostat')) return Thermometer;
  if (deviceType === 'camera' || name.includes('camera')) return Camera;
  if (deviceType === 'lock' || name.includes('lock')) return Lock;
  if (deviceType === 'tv' || name.includes('tv')) return Tv;
  if (name.includes('speaker') || name.includes('audio')) return Volume2;
  if (name.includes('monitor')) return Monitor;
  
  return Power;
};

// Updated function to extract device status from both stored and live data
const getDeviceStatus = (device: SmartHomeDevice, deviceType: string, liveStatus?: any) => {
  let state = 'unknown';
  let level = 0;
  let fanSpeed = 0;

  // First, try to get status from live data if available
  if (liveStatus && liveStatus.components && liveStatus.components.main) {
    const mainComponent = liveStatus.components.main;
    
    // Check for switch state
    if (mainComponent.switch && mainComponent.switch.switch && mainComponent.switch.switch.value) {
      state = mainComponent.switch.switch.value;
    }
    
    // Check for level (dimmer) - only for non-fan devices
    if (deviceType !== 'fan' && mainComponent.switchLevel && mainComponent.switchLevel.level && mainComponent.switchLevel.level.value !== undefined) {
      level = mainComponent.switchLevel.level.value;
    }
    
    // Check for fan speed - only for fan devices
    if (deviceType === 'fan' && mainComponent.fanSpeed && mainComponent.fanSpeed.fanSpeed && mainComponent.fanSpeed.fanSpeed.value !== undefined) {
      fanSpeed = mainComponent.fanSpeed.fanSpeed.value;
    }
  }
  
  // Fallback to stored device capabilities if live data doesn't have what we need
  if (state === 'unknown' && device.capabilities && Array.isArray(device.capabilities)) {
    for (const component of device.capabilities) {
      if (component && typeof component === 'object') {
        // Check for switch state
        if (component.switch && component.switch.switch) {
          state = component.switch.switch.value || 'unknown';
        }
        // Check for level (dimmer) - only for non-fan devices
        if (deviceType !== 'fan' && component.switchLevel && component.switchLevel.level) {
          level = component.switchLevel.level.value || 0;
        }
        // Check for fan speed - only for fan devices
        if (deviceType === 'fan' && component.fanSpeed && component.fanSpeed.fanSpeed) {
          fanSpeed = component.fanSpeed.fanSpeed.value || 0;
        }
      }
    }
  }
  
  return { state, level, fanSpeed };
};

// Utility function to get status color based on device state
const getStatusColor = (deviceStatus: any, deviceType: string): string => {
  if (deviceStatus.state === 'on') return 'bg-green-600 hover:bg-green-600';
  if (deviceStatus.state === 'off') return 'bg-gray-600 hover:bg-gray-600';
  return 'bg-yellow-600 hover:bg-yellow-600';
};

// Updated utility function to get status text
const getStatusText = (deviceStatus: any, deviceType: string): string => {
  if (deviceStatus.state === 'on') {
    if (deviceType === 'dimmer' && deviceStatus.level > 0) {
      return `ON (${deviceStatus.level}%)`;
    }
    if (deviceType === 'fan' && deviceStatus.fanSpeed > 0) {
      return `ON (Speed ${deviceStatus.fanSpeed})`;
    }
    return 'ON';
  }
  if (deviceStatus.state === 'off') return 'OFF';
  return 'Unknown';
};

export const DeviceQuickActions = () => {
  const { devices, isLoading, updateDeviceStatus, logActivity } = useSmartHomeData();
  const { fetchLiveDeviceStatus, sendDeviceCommand, isUpdating } = useSmartThingsStatus();
  const { toast } = useToast();
  const [liveStatuses, setLiveStatuses] = useState<Record<string, any>>({});
  const [refreshing, setRefreshing] = useState(false);

  // Function to convert room IDs to readable room names
  const getRoomName = (roomId: string | null) => {
    if (!roomId) return 'Other';
    
    const roomMappings: Record<string, string> = {
      'cc18dc80-d9b9-4e02-97dc-0d15db379260': 'Living room',
      '8c0275df-a6e1-45d7-9ff3-f9d5c9d51b52': 'Kitchen',
      'fd2f09e3-063f-4d56-906f-c891312822e6': 'Master Bedroom',
      '271e55a9-9a01-4bbf-a586-c753d0c52ea1': 'Office',
      'fcf4684c-02c6-435a-ab9a-f3ba76e9fe47': 'Upstairs',
      '402d5168-7baa-41d4-b8e4-30c9a65febf7': 'Movie Room',
      'a5572f69-7130-4805-b4df-f174e19db38f': 'Patio',
      'e4d6b3e9-2f3a-4693-a7a6-4fa03cbdfbd1': 'Front Door',
      'ae8a41c1-0342-4f8f-b80d-f86e646b7749': 'Garage',
      '9cf1f938-1b69-427a-9466-ca27d2c631c6': "Evan's Room",
    };
    
    return roomMappings[roomId] || `Room ${roomId.slice(0, 8)}`;
  };

  // Handler function for toggling devices
  const handleToggleDevice = async (device: SmartHomeDevice) => {
    try {
      const liveStatus = liveStatuses[device.device_id];
      const deviceStatus = getDeviceStatus(device, getDeviceTypeFromCapabilities(device.capabilities, device.device_type, device.device_name), liveStatus);
      const newState = deviceStatus.state === 'on' ? 'off' : 'on';
      
      await sendDeviceCommand(device.device_id, 'switch', newState);
      await logActivity(device.id, `Turned ${newState}`, { newState });
      
      toast({
        title: "Device Updated",
        description: `${device.device_name} turned ${newState}`,
      });
      
      // Refresh status after a short delay
      setTimeout(() => refreshLiveStatuses(), 1000);
    } catch (error) {
      console.error('Error toggling device:', error);
    }
  };

  // Handler function for dimmer changes
  const handleDimmerChange = async (device: SmartHomeDevice, value: number[]) => {
    try {
      const level = value[0];
      await sendDeviceCommand(device.device_id, 'switchLevel', 'setLevel', [level]);
      await logActivity(device.id, `Set brightness to ${level}%`, { level });
      
      toast({
        title: "Brightness Updated",
        description: `${device.device_name} set to ${level}%`,
      });
      
      // Refresh status after a short delay
      setTimeout(() => refreshLiveStatuses(), 1000);
    } catch (error) {
      console.error('Error changing dimmer level:', error);
    }
  };

  // Handler function for fan speed changes
  const handleFanSpeedChange = async (device: SmartHomeDevice, value: number[]) => {
    try {
      const speed = value[0];
      await sendDeviceCommand(device.device_id, 'fanSpeed', 'setFanSpeed', [speed]);
      await logActivity(device.id, `Set fan speed to ${speed}`, { speed });
      
      toast({
        title: "Fan Speed Updated",
        description: `${device.device_name} set to speed ${speed}`,
      });
      
      // Refresh status after a short delay
      setTimeout(() => refreshLiveStatuses(), 1000);
    } catch (error) {
      console.error('Error changing fan speed:', error);
    }
  };

  const refreshLiveStatuses = async () => {
    setRefreshing(true);
    const newStatuses: Record<string, any> = {};
    
    for (const device of devices) {
      const liveStatus = await fetchLiveDeviceStatus(device.device_id);
      if (liveStatus) {
        newStatuses[device.device_id] = liveStatus;
      }
    }
    
    setLiveStatuses(newStatuses);
    setRefreshing(false);
  };

  // Refresh live statuses on component mount and periodically
  useEffect(() => {
    if (devices.length > 0) {
      refreshLiveStatuses();
      const interval = setInterval(refreshLiveStatuses, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, [devices]);

  // Group devices by room using the room name mapping
  const devicesByRoom = devices.reduce((acc, device) => {
    const roomName = getRoomName(device.room);
    if (!acc[roomName]) {
      acc[roomName] = [];
    }
    acc[roomName].push(device);
    return acc;
  }, {} as Record<string, typeof devices>);

  if (isLoading) {
    return (
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wifi className="w-6 h-6 mr-2 text-blue-400" />
            Device Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index}>
                <div className="h-6 bg-white/10 rounded mb-2"></div>
                <div className="space-y-2">
                  {Array.from({ length: 2 }).map((_, deviceIndex) => (
                    <div key={deviceIndex} className="h-16 bg-white/10 rounded"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Wifi className="w-6 h-6 mr-2 text-blue-400" />
            Device Quick Actions
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshLiveStatuses}
            disabled={refreshing}
            className="text-blue-300 hover:text-white hover:bg-white/10"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.keys(devicesByRoom).length === 0 ? (
            <p className="text-blue-300 text-center py-4">No devices found. Connect your smart home platforms in the Admin panel.</p>
          ) : (
            Object.entries(devicesByRoom).map(([room, roomDevices]) => (
              <div key={room}>
                <h3 className="text-lg font-semibold text-blue-200 mb-3">{room}</h3>
                <div className="grid grid-cols-1 gap-4">
                  {roomDevices.map((device) => {
                    const deviceType = getDeviceTypeFromCapabilities(device.capabilities, device.device_type, device.device_name);
                    const DeviceIcon = getDeviceIcon(deviceType, device.device_name);
                    const liveStatus = liveStatuses[device.device_id];
                    const deviceStatus = getDeviceStatus(device, deviceType, liveStatus);
                    const isDimmer = deviceType === 'dimmer';
                    const isFan = deviceType === 'fan';
                    const currentLevel = deviceStatus.level || 0;
                    const currentFanSpeed = deviceStatus.fanSpeed || 0;
                    
                    console.log(`Rendering device ${device.device_name}:`, { deviceType, deviceStatus, currentLevel, currentFanSpeed, liveStatus });
                    
                    return (
                      <div 
                        key={device.id}
                        className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="p-3 rounded-lg bg-white/10">
                              <DeviceIcon className="w-8 h-8 text-blue-400" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{device.device_name}</p>
                              <p className="text-xs text-blue-300">{device.platform_name}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(deviceStatus, deviceType)}>
                              {getStatusText(deviceStatus, deviceType)}
                            </Badge>
                          </div>
                        </div>
                        
                        {isDimmer ? (
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <Switch
                                checked={deviceStatus.state === 'on'}
                                onCheckedChange={() => handleToggleDevice(device)}
                                disabled={isUpdating}
                                className="data-[state=checked]:bg-blue-600"
                              />
                              <span className="text-sm text-blue-200">Power</span>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-blue-200">Brightness</span>
                                <span className="text-sm text-white">{currentLevel}%</span>
                              </div>
                              <Slider
                                value={[currentLevel]}
                                onValueChange={(value) => handleDimmerChange(device, value)}
                                max={100}
                                step={1}
                                disabled={isUpdating}
                                className="w-full"
                              />
                            </div>
                          </div>
                        ) : isFan ? (
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <Switch
                                checked={deviceStatus.state === 'on'}
                                onCheckedChange={() => handleToggleDevice(device)}
                                disabled={isUpdating}
                                className="data-[state=checked]:bg-blue-600"
                              />
                              <span className="text-sm text-blue-200">Power</span>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-blue-200">Fan Speed</span>
                                <span className="text-sm text-white">
                                  {currentFanSpeed === 0 ? 'Off' : `Speed ${currentFanSpeed}`}
                                </span>
                              </div>
                              <Slider
                                value={[currentFanSpeed]}
                                onValueChange={(value) => handleFanSpeedChange(device, value)}
                                max={4}
                                min={0}
                                step={1}
                                disabled={isUpdating}
                                className="w-full"
                              />
                              <div className="flex justify-between text-xs text-blue-300">
                                <span>Off</span>
                                <span>1</span>
                                <span>2</span>
                                <span>3</span>
                                <span>4</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-center">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-white hover:bg-white/20"
                              onClick={() => handleToggleDevice(device)}
                              disabled={isUpdating}
                            >
                              {isUpdating ? 'Updating...' : 'Toggle'}
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
