import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Lightbulb, 
  Fan, 
  Thermometer, 
  Camera, 
  Lock, 
  Tv,
  Volume2,
  Wifi
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

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'light': return Lightbulb;
      case 'fan': return Fan;
      case 'thermostat': return Thermometer;
      case 'camera': return Camera;
      case 'lock': return Lock;
      case 'tv': return Tv;
      case 'speaker': return Volume2;
      default: return Wifi;
    }
  };

  const getStatusColor = (status: any, type: string) => {
    if (!status) return "bg-gray-600 hover:bg-gray-600";
    
    switch (type) {
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
      
      switch (device.device_type) {
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
        description: `${device.device_name} has been ${getStatusText(newStatus, device.device_type)}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle device",
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {roomDevices.map((device) => {
                    const DeviceIcon = getDeviceIcon(device.device_type);
                    return (
                      <div 
                        key={device.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200"
                      >
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
                          <Badge className={getStatusColor(device.status, device.device_type)}>
                            {getStatusText(device.status, device.device_type)}
                          </Badge>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-white hover:bg-white/20"
                            onClick={() => handleToggleDevice(device)}
                          >
                            Toggle
                          </Button>
                        </div>
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
