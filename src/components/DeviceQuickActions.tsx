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
  RefreshCw,
  Power,
  Minus,
  Plus,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  VolumeX
} from "lucide-react";
import { useSmartHomeData } from "@/hooks/useSmartHomeData";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export const DeviceQuickActions = () => {
  const { devices, platforms, isLoading, updateDeviceStatus, controlDevice, logActivity, syncSmartThingsDevices } = useSmartHomeData();
  const { toast } = useToast();
  const [syncing, setSyncing] = useState(false);
  const [controllingDevices, setControllingDevices] = useState<Set<string>>(new Set());

  const getDeviceIcon = (type: string, capabilities: any) => {
    const deviceType = type.toLowerCase();
    
    // Check capabilities for more precise icon selection
    if (capabilities?.main?.components?.[0]?.capabilities) {
      const caps = capabilities.main.components[0].capabilities;
      if (caps.includes('switch') || caps.includes('switchLevel')) return Lightbulb;
      if (caps.includes('lock')) return Lock;
      if (caps.includes('thermostat')) return Thermometer;
      if (caps.includes('camera')) return Camera;
      if (caps.includes('speaker')) return Volume2;
    }
    
    switch (deviceType) {
      case 'light':
      case 'bulb':
      case 'switch':
      case 'dimmer':
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
    if (!status) return "bg-gray-600";
    
    const deviceType = type.toLowerCase();
    switch (deviceType) {
      case 'light':
      case 'bulb':
      case 'switch':
      case 'dimmer':
        return status.switch === 'on' || status.state === 'on' ? "bg-green-500" : "bg-gray-500";
      case 'lock':
        return status.lock === 'locked' || status.locked ? "bg-green-500" : "bg-red-500";
      case 'camera':
        return status.recording ? "bg-green-500" : "bg-gray-500";
      case 'thermostat':
        return "bg-blue-500";
      default:
        return status.switch === 'on' || status.state === 'on' ? "bg-green-500" : "bg-gray-500";
    }
  };

  const getStatusText = (status: any, type: string): string => {
    if (!status) return "unknown";
    
    const deviceType = type.toLowerCase();
    switch (deviceType) {
      case 'light':
      case 'bulb':
      case 'switch':
      case 'dimmer':
        if (status.level && status.switch === 'on') {
          return `${status.level}%`;
        }
        const switchState = typeof status.switch === 'string' ? status.switch : 
                           typeof status.state === 'string' ? status.state : 
                           (status.switch === true || status.state === true) ? 'on' : 'off';
        return switchState;
      case 'lock':
        const lockState = status.lock === 'locked' || status.locked ? "locked" : "unlocked";
        return lockState;
      case 'camera':
        return status.recording ? "recording" : "idle";
      case 'thermostat':
        if (status.temperature) {
          return `${status.temperature}°`;
        }
        // Ensure we always return a string for thermostat mode
        let thermostatMode = 'auto';
        if (typeof status.thermostatMode === 'string') {
          thermostatMode = status.thermostatMode;
        } else if (typeof status.mode === 'string') {
          thermostatMode = status.mode;
        }
        return thermostatMode;
      case 'speaker':
      case 'audio':
        if (status.volume !== undefined) {
          return `Vol: ${status.volume}%`;
        }
        const audioState = typeof status.switch === 'string' ? status.switch : 
                          (status.switch === true) ? 'on' : 'off';
        return audioState;
      default:
        const defaultState = typeof status.switch === 'string' ? status.switch : 
                            typeof status.state === 'string' ? status.state : 
                            (status.switch === true || status.state === true) ? 'on' : 'off';
        return defaultState;
    }
  };

  const handleToggleDevice = async (device: any) => {
    const deviceId = device.id;
    setControllingDevices(prev => new Set(prev).add(deviceId));
    
    try {
      const deviceType = device.device_type.toLowerCase();
      
      switch (deviceType) {
        case 'light':
        case 'bulb':
        case 'switch':
        case 'dimmer':
          const currentState = device.status?.switch || device.status?.state;
          const newSwitchState = currentState === 'on' ? 'off' : 'on';
          await controlDevice(device.id, 'switch', newSwitchState);
          break;
        case 'lock':
          const currentLock = device.status?.lock || (device.status?.locked ? 'locked' : 'unlocked');
          const newLockState = currentLock === 'locked' ? 'unlocked' : 'locked';
          await controlDevice(device.id, 'lock', newLockState);
          break;
        case 'camera':
          // For cameras, we'll still use the local status update since most cameras don't support direct recording control
          let newStatus = { ...device.status };
          newStatus.recording = !device.status?.recording;
          await updateDeviceStatus(device.id, newStatus);
          break;
        case 'speaker':
        case 'audio':
          const currentSwitch = device.status?.switch || device.status?.state;
          const newAudioState = currentSwitch === 'on' ? 'off' : 'on';
          await controlDevice(device.id, 'switch', newAudioState);
          break;
        default:
          const currentDefault = device.status?.switch || device.status?.state;
          const newDefaultState = currentDefault === 'on' ? 'off' : 'on';
          await controlDevice(device.id, 'switch', newDefaultState);
      }

      await logActivity(device.id, `${device.device_name} toggled`);
      
      toast({
        title: "Device Updated",
        description: `${device.device_name} command sent successfully`,
      });
    } catch (error) {
      console.error('Error toggling device:', error);
      toast({
        title: "Error",
        description: `Failed to toggle ${device.device_name}`,
        variant: "destructive"
      });
    } finally {
      setControllingDevices(prev => {
        const newSet = new Set(prev);
        newSet.delete(deviceId);
        return newSet;
      });
    }
  };

  const handleLevelChange = async (device: any, level: number[]) => {
    const deviceId = device.id;
    setControllingDevices(prev => new Set(prev).add(deviceId));
    
    try {
      await controlDevice(device.id, 'switchLevel', level[0]);
      await logActivity(device.id, `${device.device_name} brightness set to ${level[0]}%`);
    } catch (error) {
      console.error('Error updating device level:', error);
      toast({
        title: "Error",
        description: `Failed to update ${device.device_name} brightness`,
        variant: "destructive"
      });
    } finally {
      setControllingDevices(prev => {
        const newSet = new Set(prev);
        newSet.delete(deviceId);
        return newSet;
      });
    }
  };

  const handleVolumeChange = async (device: any, volume: number[]) => {
    const deviceId = device.id;
    setControllingDevices(prev => new Set(prev).add(deviceId));
    
    try {
      const newStatus = { 
        ...device.status, 
        volume: volume[0],
        mute: volume[0] === 0
      };
      
      await updateDeviceStatus(device.id, newStatus);
      await logActivity(device.id, `${device.device_name} volume set to ${volume[0]}%`);
    } catch (error) {
      console.error('Error updating device volume:', error);
      toast({
        title: "Error",
        description: `Failed to update ${device.device_name} volume`,
        variant: "destructive"
      });
    } finally {
      setControllingDevices(prev => {
        const newSet = new Set(prev);
        newSet.delete(deviceId);
        return newSet;
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

  const renderDeviceControls = (device: any) => {
    const deviceType = device.device_type.toLowerCase();
    const isControlling = controllingDevices.has(device.id);
    
    switch (deviceType) {
      case 'light':
      case 'bulb':
      case 'dimmer':
        if (device.status?.level !== undefined) {
          return (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Switch 
                  checked={device.status?.switch === 'on'}
                  onCheckedChange={() => handleToggleDevice(device)}
                  disabled={isControlling}
                  className="data-[state=checked]:bg-blue-500"
                />
                <span className="text-xs text-blue-300">
                  {device.status?.level || 0}%
                </span>
              </div>
              <Slider
                value={[device.status?.level || 0]}
                onValueChange={(value) => handleLevelChange(device, value)}
                max={100}
                step={1}
                disabled={isControlling}
                className="w-full"
              />
            </div>
          );
        }
        break;
        
      case 'speaker':
      case 'audio':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between space-x-2">
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-white hover:bg-white/20 p-2"
                onClick={() => handleToggleDevice(device)}
                disabled={isControlling}
              >
                <Power className="w-3 h-3" />
              </Button>
              <div className="flex space-x-1">
                <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 p-1">
                  <SkipBack className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 p-1">
                  {device.status?.playing ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                </Button>
                <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 p-1">
                  <SkipForward className="w-3 h-3" />
                </Button>
              </div>
            </div>
            {device.status?.volume !== undefined && (
              <div className="flex items-center space-x-2">
                <VolumeX className="w-3 h-3 text-blue-300" />
                <Slider
                  value={[device.status?.volume || 0]}
                  onValueChange={(value) => handleVolumeChange(device, value)}
                  max={100}
                  step={1}
                  disabled={isControlling}
                  className="flex-1"
                />
                <Volume2 className="w-3 h-3 text-blue-300" />
              </div>
            )}
          </div>
        );
        
      case 'thermostat':
        // Ensure thermostatModeValue is always a string
        let thermostatModeValue = 'auto';
        if (typeof device.status?.thermostatMode === 'string') {
          thermostatModeValue = device.status.thermostatMode;
        } else if (typeof device.status?.mode === 'string') {
          thermostatModeValue = device.status.mode;
        }
          
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-blue-300">Target:</span>
              <div className="flex items-center space-x-1">
                <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 p-1">
                  <Minus className="w-3 h-3" />
                </Button>
                <span className="text-xs text-white min-w-[3rem] text-center">
                  {device.status?.thermostatSetpoint || device.status?.temperature || '--'}°
                </span>
                <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 p-1">
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <div className="text-xs text-blue-300 text-center">
              Mode: {thermostatModeValue}
            </div>
          </div>
        );
        
      default:
        return (
          <Button 
            size="sm" 
            variant="ghost" 
            className="text-white hover:bg-white/20 p-2 transition-all duration-200 hover:scale-105"
            onClick={() => handleToggleDevice(device)}
            disabled={isControlling}
          >
            <Power className={`w-4 h-4 transition-all duration-300 ${isControlling ? 'animate-spin' : ''}`} />
          </Button>
        );
    }
    
    return (
      <Button 
        size="sm" 
        variant="ghost" 
        className="text-white hover:bg-white/20 p-2 transition-all duration-200 hover:scale-105"
        onClick={() => handleToggleDevice(device)}
        disabled={isControlling}
      >
        <Power className={`w-4 h-4 transition-all duration-300 ${isControlling ? 'animate-spin' : ''}`} />
      </Button>
    );
  };

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
                <div className="h-6 bg-white/10 rounded mb-2 animate-fade-in"></div>
                <div className="space-y-2">
                  {Array.from({ length: 2 }).map((_, deviceIndex) => (
                    <div key={deviceIndex} className="h-20 bg-white/10 rounded animate-fade-in" style={{ animationDelay: `${deviceIndex * 100}ms` }}></div>
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
              className="bg-blue-600 hover:bg-blue-700 transition-all duration-200 hover:scale-105"
            >
              <RefreshCw className={`w-3 h-3 mr-1 transition-transform duration-500 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync'}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.keys(devicesByRoom).length === 0 ? (
            <div className="text-center py-8 animate-fade-in">
              <p className="text-blue-300 mb-4">No devices found.</p>
              {hasSmartThings ? (
                <Button 
                  onClick={handleSyncDevices}
                  disabled={syncing}
                  className="bg-blue-600 hover:bg-blue-700 transition-all duration-200 hover:scale-105"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 transition-transform duration-500 ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? 'Syncing Devices...' : 'Sync SmartThings Devices'}
                </Button>
              ) : (
                <p className="text-blue-300 text-sm">Connect your smart home platforms in the Admin panel to see devices.</p>
              )}
            </div>
          ) : (
            Object.entries(devicesByRoom).map(([room, roomDevices]) => (
              <div key={room} className="animate-fade-in">
                <h3 className="text-lg font-semibold text-blue-200 mb-3">{room}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {roomDevices.map((device, index) => {
                    const DeviceIcon = getDeviceIcon(device.device_type, device.capabilities);
                    const statusText = getStatusText(device.status, device.device_type);
                    const statusColor = getStatusColor(device.status, device.device_type);
                    const isControlling = controllingDevices.has(device.id);
                    
                    return (
                      <div 
                        key={device.id}
                        className="flex flex-col p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/20 hover:scale-[1.02] animate-fade-in"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg bg-white/10 transition-all duration-300 ${isControlling ? 'animate-pulse' : ''}`}>
                              <DeviceIcon className="w-5 h-5 text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate" title={device.device_name}>
                                {device.device_name}
                              </p>
                              <p className="text-xs text-blue-300">{device.platform_name}</p>
                            </div>
                          </div>
                          <Badge className={`${statusColor} text-white text-xs px-2 py-1 transition-all duration-300 shrink-0`}>
                            {statusText}
                          </Badge>
                        </div>
                        
                        <div className="mt-auto">
                          {renderDeviceControls(device)}
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
