import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Moon, Sun, Maximize, Minimize } from "lucide-react";
import { SmartHomeDevice } from "@/hooks/useSmartHomeData";
import { Badge } from "@/components/ui/badge";

interface CameraViewProps {
  device: SmartHomeDevice;
  onPtzCommand: (device: SmartHomeDevice, command: string) => Promise<void>;
  onNightVisionChange: (device: SmartHomeDevice, mode: string) => Promise<void>;
  isUpdating: boolean;
}

export const CameraView = ({ 
  device, 
  onPtzCommand,
  onNightVisionChange,
  isUpdating 
}: CameraViewProps) => {
  const [nightVisionMode, setNightVisionMode] = useState(device.status?.night_vision || 'auto');
  
  // Update local state when device status changes
  useEffect(() => {
    setNightVisionMode(device.status?.night_vision || 'auto');
  }, [device.status]);

  const handlePtzCommand = async (command: string) => {
    try {
      console.log(`Executing PTZ command: ${command} for device: ${device.id}`);
      await onPtzCommand(device, command);
    } catch (error) {
      console.error('Error executing PTZ command:', error);
    }
  };

  const handleNightVisionChange = async (mode: string) => {
    try {
      console.log(`Setting night vision mode: ${mode} for device: ${device.id}`);
      await onNightVisionChange(device, mode);
      setNightVisionMode(mode);
    } catch (error) {
      console.error('Error changing night vision mode:', error);
      setNightVisionMode(device.status?.night_vision || 'auto');
    }
  };

  // Check if camera has PTZ capability
  const hasPtzCapability = device.capabilities?.ptz === true;
  
  // Get camera resolution if available
  const resolution = device.status?.resolution;
  
  // Get camera stream URL
  const streamUrl = device.status?.stream_url || 'https://demo.reolink.com/api/play.cgi?lang=en&token=e4631a5031b04b5&stream=1';

  return (
    <Card className="bg-white/5 hover:bg-white/10 transition-all duration-200 border-white/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-purple-400/20">
              <Camera className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="font-medium text-sm">{device.device_name}</p>
              <p className="text-xs text-blue-300">{device.room}</p>
              <div className="flex gap-1 mt-1">
                {hasPtzCapability && <Badge className="bg-blue-600/80 text-xs">PTZ</Badge>}
                {resolution && <Badge className="bg-green-600/80 text-xs">{resolution}</Badge>}
              </div>
            </div>
          </div>
        </div>

        {/* Camera Preview */}
        <div className="relative rounded-md overflow-hidden bg-black mb-3 aspect-video">
          <img 
            src={streamUrl} 
            alt={`${device.device_name} feed`}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 right-2">
            <Badge className="bg-red-600/80 text-xs">LIVE</Badge>
          </div>
        </div>

        {/* PTZ Controls (if supported) */}
        {hasPtzCapability && (
          <div className="space-y-2 mb-3">
            <p className="text-xs text-blue-200">Pan & Tilt Controls</p>
            <div className="grid grid-cols-3 gap-2 max-w-[180px] mx-auto">
              <div></div>
              <Button 
                size="sm" 
                variant="outline" 
                className="border-white/20 text-white hover:bg-white/10"
                onClick={() => handlePtzCommand('up')}
                disabled={isUpdating}
              >
                <ArrowUp className="w-4 h-4" />
              </Button>
              <div></div>
              
              <Button 
                size="sm" 
                variant="outline" 
                className="border-white/20 text-white hover:bg-white/10"
                onClick={() => handlePtzCommand('left')}
                disabled={isUpdating}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="border-white/20 text-white hover:bg-white/10"
                onClick={() => handlePtzCommand('right')}
                disabled={isUpdating}
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
              
              <div></div>
              <Button 
                size="sm" 
                variant="outline" 
                className="border-white/20 text-white hover:bg-white/10"
                onClick={() => handlePtzCommand('down')}
                disabled={isUpdating}
              >
                <ArrowDown className="w-4 h-4" />
              </Button>
              <div></div>
            </div>
            
            <div className="flex justify-center gap-2 mt-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="border-white/20 text-white hover:bg-white/10"
                onClick={() => handlePtzCommand('zoom_in')}
                disabled={isUpdating}
              >
                <Maximize className="w-4 h-4 mr-1" />
                Zoom In
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="border-white/20 text-white hover:bg-white/10"
                onClick={() => handlePtzCommand('zoom_out')}
                disabled={isUpdating}
              >
                <Minimize className="w-4 h-4 mr-1" />
                Zoom Out
              </Button>
            </div>
          </div>
        )}

        {/* Night Vision Controls */}
        <div className="space-y-2">
          <p className="text-xs text-blue-200">Night Vision</p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={nightVisionMode === 'on' ? "default" : "outline"}
              className={nightVisionMode === 'on' ? "bg-blue-600 hover:bg-blue-700" : "border-white/20 text-white hover:bg-white/10"}
              onClick={() => handleNightVisionChange('on')}
              disabled={isUpdating}
            >
              <Moon className="w-4 h-4 mr-1" />
              On
            </Button>
            <Button
              size="sm"
              variant={nightVisionMode === 'off' ? "default" : "outline"}
              className={nightVisionMode === 'off' ? "bg-yellow-600 hover:bg-yellow-700" : "border-white/20 text-white hover:bg-white/10"}
              onClick={() => handleNightVisionChange('off')}
              disabled={isUpdating}
            >
              <Sun className="w-4 h-4 mr-1" />
              Off
            </Button>
            <Button
              size="sm"
              variant={nightVisionMode === 'auto' ? "default" : "outline"}
              className={nightVisionMode === 'auto' ? "bg-green-600 hover:bg-green-700" : "border-white/20 text-white hover:bg-white/10"}
              onClick={() => handleNightVisionChange('auto')}
              disabled={isUpdating}
            >
              Auto
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
