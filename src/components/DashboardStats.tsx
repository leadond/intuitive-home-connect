

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

  // Enhanced device filtering to handle SmartThings device types
  const lightDevices = devices.filter(d => 
    ['light', 'bulb', 'switch'].includes(d.device_type.toLowerCase()) ||
    d.device_name.toLowerCase().includes('light') ||
    d.device_name.toLowerCase().includes('bulb')
  );
  
  const climateDevices = devices.filter(d => 
    ['thermostat', 'temperature'].includes(d.device_type.toLowerCase()) ||
    d.device_name.toLowerCase().includes('thermostat')
  );
  
  const securityDevices = devices.filter(d => 
    ['security', 'sensor', 'motion'].includes(d.device_type.toLowerCase()) ||
    d.device_name.toLowerCase().includes('sensor')
  );
  
  const cameraDevices = devices.filter(d => 
    d.device_type.toLowerCase().includes('camera') ||
    d.device_name.toLowerCase().includes('camera')
  );
  
  const lockDevices = devices.filter(d => 
    d.device_type.toLowerCase().includes('lock') ||
    d.device_name.toLowerCase().includes('lock')
  );

  // Calculate active states
  const lightsOn = lightDevices.filter(d => 
    d.status?.switch === 'on' || 
    d.status?.state === 'on'
  ).length;

  const currentTemp = climateDevices[0]?.status?.temperature || 'N/A';
  
  const securityArmed = securityDevices.some(d => 
    d.status?.armed || 
    d.status?.contact === 'closed'
  );
  
  const camerasRecording = cameraDevices.filter(d => 
    d.status?.recording
  ).length;
  
  const locksSecured = lockDevices.filter(d => 
    d.status?.lock === 'locked' || 
    d.status?.locked
  ).length;

  // Helper function to safely extract thermostat mode as string
  const getThermostatModeString = (status: any): string => {
    if (!status) return 'auto';
    
    // Handle if thermostatMode is a string
    if (typeof status.thermostatMode === 'string') {
      return status.thermostatMode;
    }
    
    // Handle if mode is a string
    if (typeof status.mode === 'string') {
      return status.mode;
    }
    
    // Handle if thermostatMode is an object with a thermostatMode property
    if (status.thermostatMode && typeof status.thermostatMode === 'object' && status.thermostatMode.thermostatMode) {
      return String(status.thermostatMode.thermostatMode);
    }
    
    // Default fallback
    return 'auto';
  };

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
      value: typeof currentTemp === 'number' ? `${currentTemp}°F` : currentTemp,
      subtitle: getThermostatModeString(climateDevices[0]?.status) || `${climateDevices.length} devices`,
      icon: Thermometer,
      color: "text-blue-400",
      bgColor: "bg-blue-400/20"
    },
    {
      title: "Security",
      value: securityArmed ? "Armed" : "Disarmed",
      subtitle: `${securityDevices.length} sensors`,
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
      title: "Total Devices",
      value: devices.length.toString(),
      subtitle: "Connected devices",
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

