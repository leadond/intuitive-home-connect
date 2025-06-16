
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
  Wifi,
  RefreshCw,
  Power,
  MoreHorizontal
} from "lucide-react";
import { useSmartHomeData } from "@/hooks/useSmartHomeData";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export const DeviceQuickActions = () => {
  const { devices, platforms, isLoading, updateDeviceStatus, logActivity, syncSmartThingsDevices } = useSmartHomeData();
  const { toast } = useToast();
  const [syncing, setSyncing] = useState(false);

  const getDeviceIcon = (type: string) => {
    const deviceType = type.toLowerCase();
    switch (deviceType) {
      case 'light':
      case 'bulb':
      case 'switch':
        return Lightbulb;
      case 'fan':
        return Fan;
      case 'thermostat':
      case 'temperature':
        return Thermometer;
      case 'camera':
        return Camera;
      case 'lock':
        return Lock;
      case 'tv':
      case 'television':
        return Tv;
      case 'speaker':
      case 'audio':
        return Volume2;
      default:
        return Wifi;
    }
  };

  const getStatusColor = (status: any, type: string) => {
    if (!status) return "bg-gray-600 hover:bg-gray-600";
    
    const deviceType = type.toLowerCase();
    switch (deviceType) {
      case 'light':
      case 'bulb':
      case 'switch':
        return status.switch === 'on' || status.state === 'on' ? "bg-green-600 hover:bg-green-600" : "bg-gray-600 hover:bg-gray-600";
      case 'lock':
        return status.lock === 'locked' || status.locked ? "bg-green-600 hover:bg-green-600" : "bg-red-600 hover:bg-red-600";
      case 'camera':
        return status.recording ? "bg-green-600 hover:bg-green-600" : "bg-gray-600 hover:bg-gray-600";
      case 'thermostat':
        return "bg-blue-600 hover:bg-blue-600";
      default:
        return status.switch === 'on' || status.state === 'on' ? "bg-green-600 hover:bg-green-600" : "bg-gray-600 hover:bg-gray-600";
    }
  };

  const getStatusText = (status: any, type: string) => {
    if (!status) return "unknown";
    
    const deviceType = type.toLowerCase();
    switch (deviceType) {
      case 'light':
      case 'bulb':
      case 'switch':
        return status.switch || status.state || "off";
      case 'lock':
        return status.lock === 'locked' || status.locked ? "locked" : "unlocked";
      case 'camera':
        return status.recording ? "recording" : "idle";
      case 'thermostat':
        return status.temperature ? `${status.temperature}°` : (status.mode || "auto");
      default:
        return status.switch || status.state || "off";
    }
  };

  const handleToggleDevice = async (device: any) => {
    try {
      let newStatus = { ...device.status };
      const deviceType = device.device_type.toLowerCase();
      
      switch (deviceType) {
        case 'light':
        case 'bulb':
        case 'switch':
          const currentState = device.status?.switch || device.status?.state;
          newStatus.switch = currentState === 'on' ? 'off' : 'on';
          if (newStatus.state) {
            newStatus.state = newStatus.switch;
          }
          break;
        case 'lock':
          const currentLock = device.status?.lock || (device.status?.locked ? 'locked' : 'unlocked');
          newStatus.lock = currentLock === 'locked' ? 'unlocked' : 'locked';
          newStatus.locked = newStatus.lock === 'locked';
          break;
        case 'camera':
          newStatus.recording = !device.status?.recording;
          break;
        default:
          const currentSwitch = device.status?.switch || device.status?.state;
          newStatus.switch = currentSwitch === 'on' ? 'off' : 'on';
          if (newStatus.state) {
            newStatus.state = newStatus.switch;
          }
      }

      await updateDeviceStatus(device.id, newStatus);
      await logActivity(device.id, `Device ${device.device_name} toggled to ${getStatusText(newStatus, device.device_type)}`);
      
      toast({
        title: "Device Updated",
        description: `${device.device_name} is now ${getStatusText(newStatus, device.device_type)}`,
      });
    } catch (error) {
      console.error('Error toggling device:', error);
      toast({
        title: "Error",
        description: "Failed to toggle device",
        variant: "destructive"
      });
    }
  };

  const handleSyncDevices = async () => {
    setSyncing(true);
    try {
      await syncSmartThingsDevices();
    } catch (error) {
      // Error is already handled in the hook
    } finally {
      setSyncing(false);
    }
  };

  // Group devices by room
  const devicesByRoom = devices.reduce((acc, device) => {
    const room = device.room || 'Other';
    if (!acc[room]) {
      acc[room] = [];
    }
    acc[room].push(device);
    return acc;
  }, {} as Record<string, typeof devices>);

  const hasSmartThings = platforms.some(p => p.platform_name === 'SmartThings' && p.is_connected);

  if (isLoading) {
    return (
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wifi className="w-5 h-5 mr-2 text-blue-400" />
            Device Control
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
            <Wifi className="w-5 h-5 mr-2 text-blue-400" />
            Device Control
          </div>
          {hasSmartThings && (
            <Button 
              size="sm"
              onClick={handleSyncDevices}
              disabled={syncing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync'}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.keys(devicesByRoom).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-blue-300 mb-4">No devices found.</p>
              {hasSmartThings ? (
                <Button 
                  onClick={handleSyncDevices}
                  disabled={syncing}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? 'Syncing Devices...' : 'Sync SmartThings Devices'}
                </Button>
              ) : (
                <p className="text-blue-300 text-sm">Connect your smart home platforms in the Admin panel to see devices.</p>
              )}
            </div>
          ) : (
            Object.entries(devicesByRoom).map(([room, roomDevices]) => (
              <div key={room}>
                <h3 className="text-lg font-semibold text-blue-200 mb-3">{room}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {roomDevices.map((device) => {
                    const DeviceIcon = getDeviceIcon(device.device_type);
                    const statusText = getStatusText(device.status, device.device_type);
                    const statusColor = getStatusColor(device.status, device.device_type);
                    
                    return (
                      <div 
                        key={device.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200 border border-white/10"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-white/10">
                            <DeviceIcon className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{device.device_name}</p>
                            <p className="text-xs text-blue-300">{device.platform_name}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={`${statusColor} text-white text-xs px-2 py-1`}>
                            {statusText}
                          </Badge>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-white hover:bg-white/20 p-2"
                            onClick={() => handleToggleDevice(device)}
                          >
                            <Power className="w-4 h-4" />
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
