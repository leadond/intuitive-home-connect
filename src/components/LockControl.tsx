import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Unlock, Shield } from "lucide-react";
import { SmartHomeDevice } from "@/hooks/useSmartHomeData";
import { Badge } from "@/components/ui/badge";

interface LockControlProps {
  device: SmartHomeDevice;
  onToggle: (device: SmartHomeDevice) => Promise<void>;
  isUpdating: boolean;
}

export const LockControl = ({ 
  device, 
  onToggle,
  isUpdating 
}: LockControlProps) => {
  const [isLocked, setIsLocked] = useState(device.status?.state === 'locked');

  // Update local state when device status changes
  useEffect(() => {
    setIsLocked(device.status?.state === 'locked');
  }, [device.status]);

  const handleToggle = async () => {
    try {
      await onToggle(device);
      setIsLocked(!isLocked);
    } catch (error) {
      console.error('Error toggling lock:', error);
    }
  };

  // Get battery level if available
  const batteryLevel = device.status?.battery;
  const hasLowBattery = batteryLevel !== undefined && batteryLevel < 20;

  return (
    <Card className={`bg-white/5 hover:bg-white/10 transition-all duration-200 ${isLocked ? 'border-blue-400/50' : 'border-red-400/50'}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${isLocked ? 'bg-blue-400/20' : 'bg-red-400/20'}`}>
              {isLocked ? 
                <Lock className="w-6 h-6 text-blue-400" /> : 
                <Unlock className="w-6 h-6 text-red-400" />
              }
            </div>
            <div>
              <p className="font-medium text-sm">{device.device_name}</p>
              <p className="text-xs text-blue-300">{device.room}</p>
              {batteryLevel !== undefined && (
                <div className="flex items-center mt-1">
                  <Badge className={`${hasLowBattery ? 'bg-red-600/80' : 'bg-green-600/80'} text-xs`}>
                    {batteryLevel}% Battery
                  </Badge>
                </div>
              )}
            </div>
          </div>
          <Button
            size="sm"
            variant={isLocked ? "default" : "destructive"}
            className={isLocked ? "bg-blue-600 hover:bg-blue-700" : ""}
            onClick={handleToggle}
            disabled={isUpdating}
          >
            {isLocked ? 
              <><Lock className="w-4 h-4 mr-2" />Locked</> : 
              <><Unlock className="w-4 h-4 mr-2" />Unlocked</>
            }
          </Button>
        </div>
        
        {/* Last activity timestamp if available */}
        {device.status?.last_activity && (
          <div className="mt-3 text-xs text-blue-300">
            <p>Last activity: {new Date(device.status.last_activity).toLocaleString()}</p>
          </div>
        )}
        
        {/* Security status if available */}
        {device.status?.security_level && (
          <div className="mt-2 flex items-center">
            <Shield className="w-4 h-4 mr-1 text-blue-300" />
            <span className="text-xs text-blue-300">Security Level: {device.status.security_level}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
