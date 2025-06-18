import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DoorOpen, DoorClosed } from "@/components/icons/DoorIcons";

interface GarageDoorControlProps {
  device: {
    id: string;
    device_name: string;
    room: string;
    device_type: string;
    status: {
      state: string;
    };
  };
  onToggle: (deviceId: string) => void;
  isUpdating: boolean;
}

export const GarageDoorControl = ({ device, onToggle, isUpdating }: GarageDoorControlProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const isOpen = device.status.state === 'open';
  
  const handleToggle = () => {
    setIsAnimating(true);
    onToggle(device.id);
    
    // Animation duration
    setTimeout(() => {
      setIsAnimating(false);
    }, 2000);
  };
  
  return (
    <Card className="bg-white/5 hover:bg-white/10 transition-all duration-200 border-white/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${isOpen ? 'bg-green-500/20' : 'bg-white/10'}`}>
              {isOpen ? (
                <DoorOpen className="w-6 h-6 text-green-400" />
              ) : (
                <DoorClosed className="w-6 h-6 text-white/70" />
              )}
            </div>
            <div>
              <p className="font-medium text-sm">{device.device_name}</p>
              <p className="text-xs text-blue-300">{device.room}</p>
              <Badge className="mt-1 bg-blue-600">Garage Door</Badge>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <Badge className={isOpen ? "bg-green-600" : "bg-slate-600"}>
              {isOpen ? "Open" : "Closed"}
            </Badge>
            <Button 
              variant={isOpen ? "destructive" : "default"}
              size="sm"
              className="mt-2"
              onClick={handleToggle}
              disabled={isUpdating || isAnimating}
            >
              {isAnimating ? (
                isOpen ? "Closing..." : "Opening..."
              ) : (
                isOpen ? "Close Door" : "Open Door"
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
