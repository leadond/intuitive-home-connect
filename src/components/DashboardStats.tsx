import { Card, CardContent } from "@/components/ui/card";
import { useSmartHomeData } from "@/hooks/useSmartHomeData";
import { Lightbulb, Thermometer, Lock, Plug, Camera, Wifi } from "lucide-react";

export const DashboardStats = () => {
  const smartHomeData = useSmartHomeData();
  
  if (!smartHomeData) {
    return <div>Loading stats...</div>;
  }
  
  const { devices } = smartHomeData;
  
  // Count devices by type
  const lightDevices = devices.filter(device => device.device_type === 'light');
  const thermostatDevices = devices.filter(device => device.device_type === 'thermostat');
  const lockDevices = devices.filter(device => device.device_type === 'lock');
  const plugDevices = devices.filter(device => device.device_type === 'plug');
  const cameraDevices = devices.filter(device => device.device_type === 'camera_view');
  
  // Count active devices
  const activeLights = lightDevices.filter(device => device.status?.state === 'on').length;
  const activePlugs = plugDevices.filter(device => device.status?.state === 'on').length;
  const unlockedDoors = lockDevices.filter(device => device.status?.state === 'unlocked').length;
  
  // Calculate average temperature from thermostats
  const avgTemperature = thermostatDevices.length > 0
    ? Math.round(
        thermostatDevices.reduce((sum, device) => sum + (device.status?.current_temperature || 0), 0) / 
        thermostatDevices.length
      )
    : null;
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      <Card className="bg-white/5 backdrop-blur-sm border-white/20 text-white">
        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
          <div className="p-3 rounded-full bg-yellow-500/20 mb-2">
            <Lightbulb className="w-6 h-6 text-yellow-400" />
          </div>
          <p className="text-2xl font-bold">{lightDevices.length}</p>
          <p className="text-sm text-blue-200">Lights</p>
          <p className="text-xs text-blue-300 mt-1">{activeLights} active</p>
        </CardContent>
      </Card>
      
      <Card className="bg-white/5 backdrop-blur-sm border-white/20 text-white">
        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
          <div className="p-3 rounded-full bg-blue-500/20 mb-2">
            <Thermometer className="w-6 h-6 text-blue-400" />
          </div>
          <p className="text-2xl font-bold">{thermostatDevices.length}</p>
          <p className="text-sm text-blue-200">Thermostats</p>
          {avgTemperature !== null && (
            <p className="text-xs text-blue-300 mt-1">Avg: {avgTemperature}°</p>
          )}
        </CardContent>
      </Card>
      
      <Card className="bg-white/5 backdrop-blur-sm border-white/20 text-white">
        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
          <div className="p-3 rounded-full bg-green-500/20 mb-2">
            <Lock className="w-6 h-6 text-green-400" />
          </div>
          <p className="text-2xl font-bold">{lockDevices.length}</p>
          <p className="text-sm text-blue-200">Locks</p>
          <p className="text-xs text-blue-300 mt-1">{unlockedDoors} unlocked</p>
        </CardContent>
      </Card>
      
      <Card className="bg-white/5 backdrop-blur-sm border-white/20 text-white">
        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
          <div className="p-3 rounded-full bg-purple-500/20 mb-2">
            <Plug className="w-6 h-6 text-purple-400" />
          </div>
          <p className="text-2xl font-bold">{plugDevices.length}</p>
          <p className="text-sm text-blue-200">Smart Plugs</p>
          <p className="text-xs text-blue-300 mt-1">{activePlugs} active</p>
        </CardContent>
      </Card>
      
      <Card className="bg-white/5 backdrop-blur-sm border-white/20 text-white">
        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
          <div className="p-3 rounded-full bg-red-500/20 mb-2">
            <Camera className="w-6 h-6 text-red-400" />
          </div>
          <p className="text-2xl font-bold">{cameraDevices.length}</p>
          <p className="text-sm text-blue-200">Cameras</p>
          <p className="text-xs text-blue-300 mt-1">All online</p>
        </CardContent>
      </Card>
      
      <Card className="bg-white/5 backdrop-blur-sm border-white/20 text-white">
        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
          <div className="p-3 rounded-full bg-teal-500/20 mb-2">
            <Wifi className="w-6 h-6 text-teal-400" />
          </div>
          <p className="text-2xl font-bold">{devices.length}</p>
          <p className="text-sm text-blue-200">Total Devices</p>
          <p className="text-xs text-blue-300 mt-1">All platforms</p>
        </CardContent>
      </Card>
    </div>
  );
};
