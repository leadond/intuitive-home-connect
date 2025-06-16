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
  VolumeX,
  Zap,
  Circle
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
    if (!status) return "from-gray-500 to-gray-600";
    
    const deviceType = type.toLowerCase();
    switch (deviceType) {
      case 'light':
      case 'bulb':
      case 'switch':
      case 'dimmer':
        return status.switch === 'on' || status.state === 'on' ? "from-amber-400 to-yellow-500" : "from-gray-500 to-gray-600";
      case 'lock':
        return status.lock === 'locked' || status.locked ? "from-green-400 to-emerald-500" : "from-red-400 to-red-500";
      case 'camera':
        return status.recording ? "from-red-400 to-red-500" : "from-gray-500 to-gray-600";
      case 'thermostat':
        return "from-blue-400 to-blue-500";
      case 'speaker':
        return status.switch === 'on' || status.state === 'on' ? "from-purple-400 to-purple-500" : "from-gray-500 to-gray-600";
      default:
        return status.switch === 'on' || status.state === 'on' ? "from-green-400 to-emerald-500" : "from-gray-500 to-gray-600";
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
          const newLockState = currentLock === 'locked' ? 'unlock' : 'lock';
          await controlDevice(device.id, 'lock', newLockState);
          break;
        case 'camera':
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

  const isDimmable = (device: any) => {
    return device.device_type.toLowerCase() === 'dimmer' || 
           (device.status?.level !== undefined && device.device_type.toLowerCase() !== 'speaker');
  };

  const isLight = (device: any) => {
    const type = device.device_type.toLowerCase();
    return ['light', 'bulb', 'switch', 'dimmer'].includes(type);
  };

  const isLock = (device: any) => {
    return device.device_type.toLowerCase() === 'lock';
  };

  const isSpeaker = (device: any) => {
    const type = device.device_type.toLowerCase();
    return ['speaker', 'audio'].includes(type);
  };

  const isThermostat = (device: any) => {
    return device.device_type.toLowerCase() === 'thermostat';
  };

  const isCamera = (device: any) => {
    return device.device_type.toLowerCase() === 'camera';
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
    const isControlling = controllingDevices.has(device.id);
    const isOn = device.status?.switch === 'on' || device.status?.state === 'on';
    
    // Enhanced Dimmable lights with stunning animations
    if (isDimmable(device) && isLight(device)) {
      const currentLevel = device.status?.level || 0;
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 backdrop-blur-sm border border-amber-300/30">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Switch 
                  checked={isOn}
                  onCheckedChange={() => handleToggleDevice(device)}
                  disabled={isControlling}
                  className={`data-[state=checked]:bg-amber-500 transition-all duration-500 ${isControlling ? 'animate-pulse' : ''}`}
                />
                {isOn && (
                  <div className="absolute -inset-1 bg-amber-400/50 rounded-full blur-sm animate-pulse"></div>
                )}
              </div>
              <span className={`text-sm font-bold transition-all duration-500 ${
                isOn ? 'text-amber-300 drop-shadow-lg' : 'text-gray-400'
              }`}>
                {isOn ? 'ON' : 'OFF'}
              </span>
            </div>
            <div className={`text-sm font-bold px-3 py-1 rounded-full transition-all duration-500 backdrop-blur-md ${
              isOn ? 'text-amber-200 bg-amber-400/30 shadow-lg shadow-amber-400/50' : 'text-gray-400 bg-gray-400/20'
            }`}>
              {currentLevel}%
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-amber-300 font-medium">Brightness</span>
              <div className={`w-3 h-3 rounded-full transition-all duration-700 ${
                isOn && currentLevel > 0 ? 'bg-amber-400 animate-pulse shadow-lg shadow-amber-400/80' : 'bg-gray-500'
              }`}></div>
            </div>
            <div className="relative group">
              <Slider
                value={[currentLevel]}
                onValueChange={(value) => handleLevelChange(device, value)}
                max={100}
                step={1}
                disabled={isControlling || !isOn}
                className={`w-full transition-all duration-300 ${isControlling ? 'opacity-50' : ''}`}
              />
              <div 
                className={`absolute top-0 left-0 h-full bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 rounded-full transition-all duration-700 pointer-events-none ${
                  isOn ? 'opacity-40 shadow-lg shadow-amber-400/50' : 'opacity-0'
                }`}
                style={{ width: `${currentLevel}%` }}
              ></div>
              {isOn && currentLevel > 0 && (
                <div className="absolute inset-0 bg-gradient-to-r from-amber-200/20 to-yellow-200/20 rounded-full animate-pulse pointer-events-none"></div>
              )}
            </div>
          </div>
        </div>
      );
    }
    
    // Enhanced Regular lights/switches
    if (isLight(device)) {
      return (
        <div className={`flex items-center justify-between p-3 rounded-xl transition-all duration-500 backdrop-blur-sm border ${
          isOn ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-300/30 shadow-lg shadow-amber-400/30' : 'bg-gray-500/10 border-gray-400/20'
        }`}>
          <div className="relative">
            <Switch 
              checked={isOn}
              onCheckedChange={() => handleToggleDevice(device)}
              disabled={isControlling}
              className={`data-[state=checked]:bg-amber-500 transition-all duration-500 ${isControlling ? 'animate-pulse' : ''}`}
            />
            {isOn && (
              <div className="absolute -inset-1 bg-amber-400/50 rounded-full blur-sm animate-pulse"></div>
            )}
          </div>
          <span className={`text-sm font-bold transition-all duration-500 ${
            isOn ? 'text-amber-300 drop-shadow-lg' : 'text-gray-400'
          }`}>
            {isOn ? 'ON' : 'OFF'}
          </span>
        </div>
      );
    }
    
    // Enhanced Locks with security theme
    if (isLock(device)) {
      const isLocked = device.status?.lock === 'locked' || device.status?.locked;
      return (
        <div className={`flex items-center justify-between p-3 rounded-xl transition-all duration-500 backdrop-blur-sm border ${
          isLocked ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-300/30 shadow-lg shadow-green-400/30' : 'bg-gradient-to-r from-red-500/20 to-rose-500/20 border-red-300/30 shadow-lg shadow-red-400/30'
        }`}>
          <div className="relative">
            <Switch 
              checked={isLocked}
              onCheckedChange={() => handleToggleDevice(device)}
              disabled={isControlling}
              className={`${isLocked ? 'data-[state=checked]:bg-green-500' : 'data-[state=unchecked]:bg-red-500'} transition-all duration-500 ${isControlling ? 'animate-pulse' : ''}`}
            />
            {(isLocked || !isLocked) && (
              <div className={`absolute -inset-1 ${isLocked ? 'bg-green-400/50' : 'bg-red-400/50'} rounded-full blur-sm animate-pulse`}></div>
            )}
          </div>
          <span className={`text-sm font-bold transition-all duration-500 ${
            isLocked ? 'text-green-300 drop-shadow-lg' : 'text-red-300 drop-shadow-lg'
          }`}>
            {isLocked ? 'LOCKED' : 'UNLOCKED'}
          </span>
        </div>
      );
    }
    
    // Enhanced Speakers with music theme
    if (isSpeaker(device)) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-violet-500/20 backdrop-blur-sm border border-purple-300/30">
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-white hover:bg-purple-500/30 p-2 rounded-full transition-all duration-300 hover:scale-110"
              onClick={() => handleToggleDevice(device)}
              disabled={isControlling}
            >
              <Power className={`w-4 h-4 ${isControlling ? 'animate-spin' : ''}`} />
            </Button>
            <div className="flex space-x-2">
              <Button size="sm" variant="ghost" className="text-white hover:bg-purple-500/30 p-2 rounded-full transition-all duration-300 hover:scale-110">
                <SkipBack className="w-3 h-3" />
              </Button>
              <Button size="sm" variant="ghost" className="text-white hover:bg-purple-500/30 p-2 rounded-full transition-all duration-300 hover:scale-110">
                {device.status?.playing ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </Button>
              <Button size="sm" variant="ghost" className="text-white hover:bg-purple-500/30 p-2 rounded-full transition-all duration-300 hover:scale-110">
                <SkipForward className="w-3 h-3" />
              </Button>
            </div>
          </div>
          {device.status?.volume !== undefined && (
            <div className="flex items-center space-x-3 p-2 rounded-lg bg-purple-500/10">
              <VolumeX className="w-4 h-4 text-purple-300" />
              <div className="flex-1 relative">
                <Slider
                  value={[device.status?.volume || 0]}
                  onValueChange={(value) => handleVolumeChange(device, value)}
                  max={100}
                  step={1}
                  disabled={isControlling}
                  className="flex-1"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-300/20 to-violet-300/20 rounded-full animate-pulse pointer-events-none"></div>
              </div>
              <Volume2 className="w-4 h-4 text-purple-300" />
            </div>
          )}
        </div>
      );
    }
    
    // Enhanced Thermostats with climate theme
    if (isThermostat(device)) {
      let thermostatModeValue = 'auto';
      if (typeof device.status?.thermostatMode === 'string') {
        thermostatModeValue = device.status.thermostatMode;
      } else if (typeof device.status?.mode === 'string') {
        thermostatModeValue = device.status.mode;
      }
        
      return (
        <div className="space-y-3 p-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border border-blue-300/30">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-300 font-medium">Target Temperature</span>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="ghost" className="text-white hover:bg-blue-500/30 p-1 rounded-full transition-all duration-300 hover:scale-110">
                <Minus className="w-3 h-3" />
              </Button>
              <span className="text-sm text-white min-w-[3rem] text-center font-bold bg-blue-400/30 px-3 py-1 rounded-full">
                {device.status?.thermostatSetpoint || device.status?.temperature || '--'}°
              </span>
              <Button size="sm" variant="ghost" className="text-white hover:bg-blue-500/30 p-1 rounded-full transition-all duration-300 hover:scale-110">
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <div className="text-xs text-blue-300 text-center font-medium bg-blue-400/20 py-1 rounded-lg">
            Mode: {thermostatModeValue}
          </div>
        </div>
      );
    }
    
    // Enhanced Cameras with surveillance theme
    if (isCamera(device)) {
      const isRecording = device.status?.recording;
      return (
        <div className={`flex items-center justify-between p-3 rounded-xl transition-all duration-500 backdrop-blur-sm border ${
          isRecording ? 'bg-gradient-to-r from-red-500/20 to-rose-500/20 border-red-300/30 shadow-lg shadow-red-400/30' : 'bg-gray-500/10 border-gray-400/20'
        }`}>
          <div className="relative">
            <Switch 
              checked={isRecording}
              onCheckedChange={() => handleToggleDevice(device)}
              disabled={isControlling}
              className={`data-[state=checked]:bg-red-500 transition-all duration-500 ${isControlling ? 'animate-pulse' : ''}`}
            />
            {isRecording && (
              <div className="absolute -inset-1 bg-red-400/50 rounded-full blur-sm animate-pulse"></div>
            )}
          </div>
          <span className={`text-sm font-bold transition-all duration-500 flex items-center gap-2 ${
            isRecording ? 'text-red-300 drop-shadow-lg' : 'text-gray-400'
          }`}>
            {isRecording && <Circle className="w-2 h-2 fill-current animate-pulse" />}
            {isRecording ? 'RECORDING' : 'IDLE'}
          </span>
        </div>
      );
    }
    
    // Enhanced Default control with energy theme
    return (
      <Button 
        size="sm" 
        variant="ghost" 
        className="text-white hover:bg-gradient-to-r hover:from-blue-500/30 hover:to-cyan-500/30 p-3 rounded-xl transition-all duration-500 hover:scale-105 hover:shadow-lg hover:shadow-blue-400/30 border border-blue-300/20"
        onClick={() => handleToggleDevice(device)}
        disabled={isControlling}
      >
        <div className="relative">
          <Power className={`w-5 h-5 transition-all duration-300 ${isControlling ? 'animate-spin' : ''}`} />
          {isControlling && (
            <div className="absolute -inset-1 bg-blue-400/50 rounded-full blur-sm animate-pulse"></div>
          )}
        </div>
      </Button>
    );
  };

  if (isLoading) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border-white/20 text-white shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wifi className="w-5 h-5 mr-2 text-blue-400" />
            Device Control
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index}>
                <div className="h-6 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-lg mb-4 animate-shimmer"></div>
                <div className="space-y-3">
                  {Array.from({ length: 2 }).map((_, deviceIndex) => (
                    <div 
                      key={deviceIndex} 
                      className="h-24 bg-gradient-to-r from-white/5 to-white/10 rounded-xl animate-shimmer border border-white/10" 
                      style={{ animationDelay: `${deviceIndex * 150}ms` }}
                    ></div>
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
    <Card className="bg-white/5 backdrop-blur-xl border-white/20 text-white shadow-2xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-b border-white/10">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="relative">
              <Wifi className="w-6 h-6 mr-3 text-blue-400" />
              <div className="absolute -inset-1 bg-blue-400/30 rounded-full blur-sm animate-pulse"></div>
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
                Device Control
              </span>
              <div className="text-xs text-blue-200 mt-1">Smart Home Command Center</div>
            </div>
          </div>
          {hasSmartThings && (
            <Button 
              size="sm"
              onClick={handleSyncDevices}
              disabled={syncing}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-400/30"
            >
              <RefreshCw className={`w-4 h-4 mr-2 transition-transform duration-500 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync'}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-8">
          {Object.keys(devicesByRoom).length === 0 ? (
            <div className="text-center py-12 animate-fade-in">
              <div className="mb-6">
                <Zap className="w-16 h-16 mx-auto text-blue-400 opacity-50" />
              </div>
              <p className="text-blue-300 mb-6 text-lg">No devices found.</p>
              {hasSmartThings ? (
                <Button 
                  onClick={handleSyncDevices}
                  disabled={syncing}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-400/30"
                >
                  <RefreshCw className={`w-5 h-5 mr-2 transition-transform duration-500 ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? 'Syncing Devices...' : 'Sync SmartThings Devices'}
                </Button>
              ) : (
                <p className="text-blue-300 text-sm">Connect your smart home platforms in the Admin panel to see devices.</p>
              )}
            </div>
          ) : (
            Object.entries(devicesByRoom).map(([room, roomDevices]) => (
              <div key={room} className="animate-fade-in">
                <div className="flex items-center mb-6">
                  <h3 className="text-xl font-bold bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
                    {room}
                  </h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-blue-400/50 to-transparent ml-4"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {roomDevices.map((device, index) => {
                    const DeviceIcon = getDeviceIcon(device.device_type, device.capabilities);
                    const statusText = getStatusText(device.status, device.device_type);
                    const statusGradient = getStatusColor(device.status, device.device_type);
                    const isControlling = controllingDevices.has(device.id);
                    
                    return (
                      <div 
                        key={device.id}
                        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 hover:border-white/40 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/20 animate-fade-in"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        {/* Animated background gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        {/* Status indicator line */}
                        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${statusGradient} transition-all duration-500`}></div>
                        
                        <div className="relative p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-4">
                              <div className={`relative p-3 rounded-xl bg-gradient-to-br ${statusGradient}/20 backdrop-blur-sm transition-all duration-500 ${isControlling ? 'animate-pulse' : 'group-hover:scale-110'}`}>
                                <DeviceIcon className="w-6 h-6 text-white drop-shadow-lg" />
                                {isControlling && (
                                  <div className="absolute -inset-1 bg-blue-400/50 rounded-xl blur-sm animate-pulse"></div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-white text-lg truncate group-hover:text-blue-200 transition-colors duration-300" title={device.device_name}>
                                  {device.device_name}
                                </p>
                                <p className="text-sm text-blue-300/80">{device.platform_name}</p>
                              </div>
                            </div>
                            <Badge className={`bg-gradient-to-r ${statusGradient} text-white text-xs px-3 py-1 font-bold shadow-lg transition-all duration-500 shrink-0 border-0`}>
                              {statusText}
                            </Badge>
                          </div>
                          
                          <div className="mt-6">
                            {renderDeviceControls(device)}
                          </div>
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
