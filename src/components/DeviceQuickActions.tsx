
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
  Monitor
} from "lucide-react";
import { useSmartHomeData } from "@/hooks/useSmartHomeData";
import { useToast } from "@/hooks/use-toast";

export const DeviceQuickActions = () => {
  const { devices, isLoading, updateDeviceStatus, logActivity } = useSmartHomeData();
  const { toast } = useToast();

  // Function to convert room IDs to readable room names
  const getRoomName = (roomId: string | null) => {
    if (!roomId) return 'Other';
    
    // SmartThings room ID mappings - from the API response
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
    
    return roomMappings[roomId] || `Room ${roomId.slice(0, 8)}`; // Show first 8 chars of ID if no mapping found
  };

  const getDeviceTypeFromCapabilities = (capabilities: any[], deviceType: string, deviceName: string) => {
    if (!capabilities || !Array.isArray(capabilities)) return deviceType;
    
    const capabilityIds = capabilities.flatMap(comp => 
      comp.capabilities ? comp.capabilities.map((cap: any) => cap.id) : []
    );
    
    const deviceNameLower = deviceName.toLowerCase();
    
    // Check for dimmer capabilities
    if (capabilityIds.includes('switchLevel') || capabilityIds.includes('colorControl')) {
      return 'dimmer';
    }
    
    // Check for specific device types based on capabilities and name
    if (capabilityIds.includes('lock')) return 'lock';
    if (capabilityIds.includes('thermostat') || capabilityIds.includes('temperatureMeasurement')) return 'thermostat';
    if (capabilityIds.includes('videoCamera') || deviceNameLower.includes('camera')) return 'camera';
    if (capabilityIds.includes('fanSpeed') || deviceNameLower.includes('fan')) return 'fan';
    if (capabilityIds.includes('switch') && (deviceNameLower.includes('tv') || deviceNameLower.includes('television'))) return 'tv';
    if (capabilityIds.includes('audioVolume') || deviceNameLower.includes('speaker')) return 'speaker';
    if (capabilityIds.includes('switch') && deviceNameLower.includes('outlet')) return 'outlet';
    if (capabilityIds.includes('switch') && (deviceNameLower.includes('light') || deviceNameLower.includes('lamp'))) return 'light';
    if (capabilityIds.includes('switch')) return 'switch';
    
    return deviceType;
  };

  const getDeviceIcon = (type: string, deviceName: string) => {
    const deviceNameLower = deviceName.toLowerCase();
    
    switch (type) {
      case 'dimmer': return Lightbulb;
      case 'light': return Lightbulb;
      case 'fan': return Fan;
      case 'thermostat': return Thermometer;
      case 'camera': return Camera;
      case 'lock': return Lock;
      case 'tv': return Tv;
      case 'speaker': return Volume2;
      case 'outlet': return Zap;
      case 'switch': return Power;
      default: 
        // Fallback based on device name
        if (deviceNameLower.includes('light') || deviceNameLower.includes('lamp')) return Lightbulb;
        if (deviceNameLower.includes('fan')) return Fan;
        if (deviceNameLower.includes('tv') || deviceNameLower.includes('monitor')) return Monitor;
        if (deviceNameLower.includes('camera')) return Camera;
        if (deviceNameLower.includes('lock')) return Lock;
        if (deviceNameLower.includes('speaker')) return Volume2;
        return Wifi;
    }
  };

  const getStatusColor = (status: any, type: string) => {
    if (!status) return "bg-gray-600 hover:bg-gray-600";
    
    switch (type) {
      case 'dimmer':
      case 'light':
        return status.state === 'on' ? "bg-green-600 hover:bg-green-600" : "bg-gray-600 hover:bg-gray-600";
      case 'lock':
        return status.locked ? "bg-green-600 hover:bg-green-600" : "bg-red-600 hover:bg-red-600";
      case 'camera':
        return status.recording ? "bg-green-600 hover:bg-green-600" : "bg-gray-600 hover:bg-gray-600";
      case 'thermostat':
        return "bg-blue-600 hover:bg-blue-600";
      default:
        return status.state === 'on' ? "bg-green-600 hover:bg-green-600" : "bg-gray-600 hover:bg-gray-600";
    }
  };

  const getStatusText = (status: any, type: string) => {
    if (!status) return "unknown";
    
    switch (type) {
      case 'dimmer':
        if (status.state === 'off') return 'off';
        const level = status.level || status.switchLevel || 100;
        return `${level}%`;
      case 'light':
        return status.state || "off";
      case 'lock':
        return status.locked ? "locked" : "unlocked";
      case 'camera':
        return status.recording ? "recording" : "idle";
      case 'thermostat':
        return status.mode || "auto";
      default:
        return status.state || "off";
    }
  };

  const handleToggleDevice = async (device: any) => {
    try {
      let newStatus = { ...device.status };
      const deviceType = getDeviceTypeFromCapabilities(device.capabilities, device.device_type, device.device_name);
      
      switch (deviceType) {
        case 'dimmer':
          if (device.status?.state === 'on') {
            newStatus.state = 'off';
            newStatus.level = 0;
          } else {
            newStatus.state = 'on';
            newStatus.level = device.status?.level || 100;
          }
          break;
        case 'light':
          newStatus.state = device.status?.state === 'on' ? 'off' : 'on';
          break;
        case 'lock':
          newStatus.locked = !device.status?.locked;
          break;
        case 'camera':
          newStatus.recording = !device.status?.recording;
          break;
        default:
          newStatus.state = device.status?.state === 'on' ? 'off' : 'on';
      }

      await updateDeviceStatus(device.id, newStatus);
      await logActivity(device.id, `Device ${device.device_name} toggled manually`);
      
      toast({
        title: "Device Updated",
        description: `${device.device_name} has been ${getStatusText(newStatus, deviceType)}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle device",
        variant: "destructive"
      });
    }
  };

  const handleDimmerChange = async (device: any, value: number[]) => {
    try {
      const level = value[0];
      let newStatus = { 
        ...device.status,
        level: level,
        state: level > 0 ? 'on' : 'off'
      };

      await updateDeviceStatus(device.id, newStatus);
      await logActivity(device.id, `Dimmer ${device.device_name} set to ${level}%`);
      
      toast({
        title: "Dimmer Updated",
        description: `${device.device_name} set to ${level}%`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update dimmer",
        variant: "destructive"
      });
    }
  };

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
            <Wifi className="w-5 h-5 mr-2 text-blue-400" />
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
        <CardTitle className="flex items-center">
          <Wifi className="w-5 h-5 mr-2 text-blue-400" />
          Device Quick Actions
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
                    const isDimmer = deviceType === 'dimmer';
                    const currentLevel = device.status?.level || device.status?.switchLevel || (device.status?.state === 'on' ? 100 : 0);
                    
                    return (
                      <div 
                        key={device.id}
                        className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-lg bg-white/10">
                              <DeviceIcon className="w-4 h-4 text-blue-400" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{device.device_name}</p>
                              <p className="text-xs text-blue-300">{device.platform_name}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(device.status, deviceType)}>
                              {getStatusText(device.status, deviceType)}
                            </Badge>
                          </div>
                        </div>
                        
                        {isDimmer ? (
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <Switch
                                checked={device.status?.state === 'on'}
                                onCheckedChange={() => handleToggleDevice(device)}
                                className="data-[state=checked]:bg-blue-600"
                              />
                              <span className="text-sm text-blue-200">Power</span>
                            </div>
                            {device.status?.state === 'on' && (
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
                                  className="w-full"
                                />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex justify-center">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-white hover:bg-white/20"
                              onClick={() => handleToggleDevice(device)}
                            >
                              Toggle
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
