
import { Card, CardContent } from "@/components/ui/card";
import { 
  Lightbulb, 
  Thermometer, 
  Shield, 
  Camera, 
  Lock, 
  Zap
} from "lucide-react";
import { useSmartHomeData } from "@/hooks/useSmartHomeData";

export const DashboardStats = () => {
  const { devices, isLoading } = useSmartHomeData();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 animate-pulse">
            <CardContent className="p-4">
              <div className="h-16 bg-white/10 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Helper function to identify device types based on capabilities and name
  const getDeviceType = (device: any) => {
    const name = device.device_name?.toLowerCase() || '';
    const deviceType = device.device_type?.toLowerCase() || '';
    
    // Check for camera devices
    if (deviceType === 'camera_view' || name.includes('camera') || device.capabilities?.ptz_commands) {
      return 'camera';
    }
    
    // Check for thermostat devices
    if (deviceType === 'thermostat' || name.includes('thermostat') || 
        (device.capabilities && Array.isArray(device.capabilities) && 
         device.capabilities.some((cap: any) => 
           cap?.capabilities?.some((c: any) => c?.id?.includes('thermostat'))))) {
      return 'thermostat';
    }
    
    // Check for light/dimmer devices
    if (name.includes('light') || name.includes('lamp') || name.includes('dimmer') ||
        (device.capabilities && Array.isArray(device.capabilities) && 
         device.capabilities.some((cap: any) => 
           cap?.capabilities?.some((c: any) => c?.id?.includes('switchLevel'))))) {
      return 'light';
    }
    
    // Check for fan devices
    if (name.includes('fan') && !name.includes('light')) {
      return 'fan';
    }
    
    // Check for lock devices
    if (name.includes('lock') || deviceType === 'lock') {
      return 'lock';
    }
    
    // Check for security/sensor devices
    if (name.includes('sensor') || name.includes('door') || name.includes('motion') || 
        deviceType === 'binary_sensor' || device.capabilities?.zone_number) {
      return 'security';
    }
    
    return 'other';
  };

  // Categorize devices
  const deviceCategories = devices.reduce((acc, device) => {
    const type = getDeviceType(device);
    if (!acc[type]) acc[type] = [];
    acc[type].push(device);
    return acc;
  }, {} as Record<string, any[]>);

  // Count devices on/active
  const lightDevices = deviceCategories.light || [];
  const thermostatDevices = deviceCategories.thermostat || [];
  const securityDevices = deviceCategories.security || [];
  const cameraDevices = deviceCategories.camera || [];
  const lockDevices = deviceCategories.lock || [];
  const fanDevices = deviceCategories.fan || [];

  // Get lights that are on
  const lightsOn = lightDevices.filter(device => {
    if (device.capabilities && Array.isArray(device.capabilities)) {
      return device.capabilities.some((cap: any) => 
        cap?.switch?.switch?.value === 'on'
      );
    }
    return device.status?.state === 'on';
  }).length;

  // Get current temperature from first thermostat
  const currentTemp = thermostatDevices.length > 0 ? 
    (thermostatDevices[0].capabilities?.[0]?.temperatureMeasurement?.temperature?.value || 
     thermostatDevices[0].status?.temperature || 'N/A') : 'N/A';

  // Check if any security devices are armed/active
  const securityArmed = securityDevices.some(device => 
    device.status?.armed || device.status?.state === 'active'
  );

  // Count cameras that are recording
  const camerasRecording = cameraDevices.filter(device => 
    device.status?.recording === 'enabled'
  ).length;

  // Count locks that are secured
  const locksSecured = lockDevices.filter(device => 
    device.status?.locked || device.status?.state === 'locked'
  ).length;

  // Calculate total energy usage (simplified calculation)
  const totalDevices = devices.length;
  const activeDevices = devices.filter(device => 
    device.status?.state === 'on' || device.status?.online !== false
  ).length;
  const estimatedUsage = (activeDevices * 0.1).toFixed(1); // Rough estimate

  const stats = [
    {
      title: "Smart Lights",
      value: lightDevices.length.toString(),
      subtitle: `${lightsOn} on, ${lightDevices.length - lightsOn} off`,
      icon: Lightbulb,
      color: "text-yellow-400",
      bgColor: "bg-yellow-400/20"
    },
    {
      title: "Climate Control",
      value: typeof currentTemp === 'number' ? `${currentTemp}°F` : currentTemp.toString(),
      subtitle: thermostatDevices.length > 0 ? `${thermostatDevices.length} thermostat${thermostatDevices.length !== 1 ? 's' : ''}` : "No devices",
      icon: Thermometer,
      color: "text-blue-400",
      bgColor: "bg-blue-400/20"
    },
    {
      title: "Security",
      value: securityArmed ? "Armed" : "Disarmed",
      subtitle: `${securityDevices.length} sensor${securityDevices.length !== 1 ? 's' : ''}`,
      icon: Shield,
      color: securityArmed ? "text-green-400" : "text-red-400",
      bgColor: securityArmed ? "bg-green-400/20" : "bg-red-400/20"
    },
    {
      title: "Cameras",
      value: cameraDevices.length.toString(),
      subtitle: `${camerasRecording} recording`,
      icon: Camera,
      color: "text-purple-400",
      bgColor: "bg-purple-400/20"
    },
    {
      title: "Smart Locks",
      value: lockDevices.length.toString(),
      subtitle: `${locksSecured} locked`,
      icon: Lock,
      color: "text-red-400",
      bgColor: "bg-red-400/20"
    },
    {
      title: "Energy Usage",
      value: `${estimatedUsage}kW`,
      subtitle: `${activeDevices}/${totalDevices} devices active`,
      icon: Zap,
      color: "text-orange-400",
      bgColor: "bg-orange-400/20"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-blue-200 mb-1">{stat.title}</p>
              <p className="text-xs text-blue-300">{stat.subtitle}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
