import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Thermometer, Droplets, Door } from "lucide-react";
import { SmartHomeDevice } from "@/hooks/useSmartHomeData";

interface SensorControlProps {
  device: SmartHomeDevice;
}

export const SensorControl = ({ device }: SensorControlProps) => {
  // Determine sensor type and icon
  const getSensorTypeInfo = () => {
    switch (device.device_type) {
      case 'motion_sensor':
        return {
          icon: <Activity className="w-6 h-6 text-blue-400" />,
          bgColor: 'bg-blue-400/20',
          label: 'Motion'
        };
      case 'contact_sensor':
        return {
          icon: <Door className="w-6 h-6 text-green-400" />,
          bgColor: 'bg-green-400/20',
          label: 'Contact'
        };
      case 'temperature_sensor':
        return {
          icon: <Thermometer className="w-6 h-6 text-orange-400" />,
          bgColor: 'bg-orange-400/20',
          label: 'Temperature'
        };
      case 'humidity_sensor':
        return {
          icon: <Droplets className="w-6 h-6 text-blue-400" />,
          bgColor: 'bg-blue-400/20',
          label: 'Humidity'
        };
      default:
        return {
          icon: <Activity className="w-6 h-6 text-white/70" />,
          bgColor: 'bg-white/10',
          label: 'Sensor'
        };
    }
  };

  const { icon, bgColor, label } = getSensorTypeInfo();
  
  // Get sensor status
  const isActive = device.status?.state === 'active' || device.status?.state === 'detected' || device.status?.state === 'open';
  
  // Get battery level if available
  const batteryLevel = device.status?.battery;
  const hasLowBattery = batteryLevel !== undefined && batteryLevel < 20;
  
  // Get temperature if available
  const temperature = device.status?.temperature;
  
  // Get humidity if available
  const humidity = device.status?.humidity;

  return (
    <Card className={`bg-white/5 hover:bg-white/10 transition-all duration-200 ${isActive ? 'border-blue-400/50' : 'border-white/20'}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${bgColor}`}>
              {icon}
            </div>
            <div>
              <p className="font-medium text-sm">{device.device_name}</p>
              <p className="text-xs text-blue-300">{device.room}</p>
              <div className="flex gap-1 mt-1">
                <Badge className="bg-blue-600/80 text-xs">{label}</Badge>
                {batteryLevel !== undefined && (
                  <Badge className={`${hasLowBattery ? 'bg-red-600/80' : 'bg-green-600/80'} text-xs`}>
                    {batteryLevel}% Battery
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div>
            {isActive && (
              <Badge className="bg-blue-600 text-white">
                {device.status?.state === 'open' ? 'Open' : 'Active'}
              </Badge>
            )}
            {temperature && (
              <div className="text-xl font-bold mt-1 text-right">
                {temperature}°
              </div>
            )}
            {humidity && (
              <div className="text-sm text-blue-300 mt-1 text-right">
                {humidity}% Humidity
              </div>
            )}
          </div>
        </div>
        
        {/* Last activity timestamp if available */}
        {device.status?.last_activity && (
          <div className="mt-3 text-xs text-blue-300">
            <p>Last activity: {new Date(device.status.last_activity).toLocaleString()}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
