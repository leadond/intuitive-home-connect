import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plug, Power, Zap } from "lucide-react";
import { SmartHomeDevice } from "@/hooks/useSmartHomeData";
import { Badge } from "@/components/ui/badge";

interface PlugControlProps {
  device: SmartHomeDevice;
  onToggle: (device: SmartHomeDevice) => Promise<void>;
  isUpdating: boolean;
}

export const PlugControl = ({ 
  device, 
  onToggle,
  isUpdating 
}: PlugControlProps) => {
  const [isOn, setIsOn] = useState(device.status?.state === 'on');

  // Update local state when device status changes
  useEffect(() => {
    setIsOn(device.status?.state === 'on');
  }, [device.status]);

  const handleToggle = async () => {
    try {
      await onToggle(device);
      setIsOn(!isOn);
    } catch (error) {
      console.error('Error toggling plug:', error);
    }
  };

  // Get power consumption if available
  const powerConsumption = device.status?.power_consumption;
  const energyUsage = device.status?.energy_usage;

  return (
    <Card className={`bg-white/5 hover:bg-white/10 transition-all duration-200 ${isOn ? 'border-green-400/50' : 'border-white/20'}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${isOn ? 'bg-green-400/20' : 'bg-white/10'}`}>
              <Plug className={`w-6 h-6 ${isOn ? 'text-green-400' : 'text-white/70'}`} />
            </div>
            <div>
              <p className="font-medium text-sm">{device.device_name}</p>
              <p className="text-xs text-blue-300">{device.room}</p>
              {device.capabilities?.energy_monitoring && (
                <Badge className="mt-1 bg-blue-600/80 text-xs">Energy Monitoring</Badge>
              )}
            </div>
          </div>
          <Button
            size="sm"
            variant={isOn ? "default" : "outline"}
            className={isOn ? "bg-green-600 hover:bg-green-700" : "border-white/20 text-white hover:bg-white/10"}
            onClick={handleToggle}
            disabled={isUpdating}
          >
            <Power className="w-4 h-4 mr-2" />
            {isOn ? "On" : "Off"}
          </Button>
        </div>
        
        {/* Power consumption display if available */}
        {isOn && powerConsumption && (
          <div className="mt-3 flex items-center">
            <Zap className="w-4 h-4 mr-1 text-yellow-400" />
            <span className="text-sm font-medium">{powerConsumption} W</span>
            {energyUsage && (
              <span className="text-xs text-blue-300 ml-2">{energyUsage} kWh today</span>
            )}
          </div>
        )}
        
        {/* Connected device info if available */}
        {device.status?.connected_device && (
          <div className="mt-2 text-xs text-blue-300">
            <p>Connected: {device.status.connected_device}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
