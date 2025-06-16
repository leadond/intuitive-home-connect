
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

  const lightDevices = devices.filter(d => d.device_type === 'light');
  const climateDevices = devices.filter(d => d.device_type === 'thermostat');
  const securityDevices = devices.filter(d => d.device_type === 'security');
  const cameraDevices = devices.filter(d => d.device_type === 'camera');
  const lockDevices = devices.filter(d => d.device_type === 'lock');

  const lightsOn = lightDevices.filter(d => d.status?.state === 'on').length;
  const currentTemp = climateDevices[0]?.status?.temperature || 'N/A';
  const securityArmed = securityDevices.some(d => d.status?.armed);
  const camerasRecording = cameraDevices.filter(d => d.status?.recording).length;
  const locksSecured = lockDevices.filter(d => d.status?.locked).length;

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
      subtitle: climateDevices[0]?.status?.mode || "No devices",
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
      title: "Energy Usage",
      value: "2.4kW",
      subtitle: "Current usage",
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
