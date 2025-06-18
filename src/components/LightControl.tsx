import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Lightbulb, Power } from "lucide-react";
import { SmartHomeDevice } from "@/hooks/useSmartHomeData";
import { Badge } from "@/components/ui/badge";

interface LightControlProps {
  device: SmartHomeDevice;
  onToggle: (device: SmartHomeDevice) => Promise<void>;
  onBrightnessChange: (device: SmartHomeDevice, brightness: number) => Promise<void>;
  onColorChange: (device: SmartHomeDevice, color: string) => Promise<void>;
  isUpdating: boolean;
}

export const LightControl = ({ 
  device, 
  onToggle, 
  onBrightnessChange, 
  onColorChange,
  isUpdating 
}: LightControlProps) => {
  const [isOn, setIsOn] = useState(device.status?.state === 'on');
  const [brightness, setBrightness] = useState(device.status?.brightness || 100);
  const [color, setColor] = useState(device.status?.color || '#ffffff');

  // Update local state when device status changes
  useEffect(() => {
    setIsOn(device.status?.state === 'on');
    setBrightness(device.status?.brightness || 100);
    setColor(device.status?.color || '#ffffff');
  }, [device.status]);

  const handleToggle = async () => {
    try {
      await onToggle(device);
      setIsOn(!isOn);
    } catch (error) {
      console.error('Error toggling light:', error);
    }
  };

  const handleBrightnessChange = async (value: number[]) => {
    const newBrightness = value[0];
    setBrightness(newBrightness);
    
    try {
      await onBrightnessChange(device, newBrightness);
    } catch (error) {
      console.error('Error changing brightness:', error);
      setBrightness(device.status?.brightness || 100);
    }
  };

  const handleColorChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = event.target.value;
    setColor(newColor);
    
    try {
      await onColorChange(device, newColor);
    } catch (error) {
      console.error('Error changing color:', error);
      setColor(device.status?.color || '#ffffff');
    }
  };

  // Check if device has color control capability
  const hasColorControl = device.capabilities?.color_control === true;
  
  // Check if device is dimmable (all lights are considered dimmable unless explicitly set to false)
  const isDimmable = device.capabilities?.dimmable !== false;

  return (
    <Card className={`bg-white/5 hover:bg-white/10 transition-all duration-200 ${isOn ? 'border-yellow-400/50' : 'border-white/20'}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${isOn ? 'bg-yellow-400/20' : 'bg-white/10'}`}>
              <Lightbulb className={`w-6 h-6 ${isOn ? 'text-yellow-400' : 'text-white/70'}`} />
            </div>
            <div>
              <p className="font-medium text-sm">{device.device_name}</p>
              <p className="text-xs text-blue-300">{device.room}</p>
              <div className="flex gap-1 mt-1">
                {isDimmable && <Badge className="bg-blue-600/80 text-xs">Dimmable</Badge>}
                {hasColorControl && <Badge className="bg-purple-600/80 text-xs">Color</Badge>}
              </div>
            </div>
          </div>
          <Button
            size="sm"
            variant={isOn ? "default" : "outline"}
            className={isOn ? "bg-yellow-600 hover:bg-yellow-700" : "border-white/20 text-white hover:bg-white/10"}
            onClick={handleToggle}
            disabled={isUpdating}
          >
            <Power className="w-4 h-4 mr-2" />
            {isOn ? "On" : "Off"}
          </Button>
        </div>

        {isOn && (
          <div className="space-y-4">
            {/* Brightness Slider - only show if dimmable */}
            {isDimmable && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-blue-200">Brightness</p>
                  <p className="text-xs font-medium">{brightness}%</p>
                </div>
                <Slider
                  value={[brightness]}
                  onValueChange={handleBrightnessChange}
                  min={1}
                  max={100}
                  step={1}
                  disabled={isUpdating}
                />
              </div>
            )}

            {/* Color Picker (if supported) */}
            {hasColorControl && (
              <div className="space-y-2">
                <p className="text-xs text-blue-200">Color</p>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={color}
                    onChange={handleColorChange}
                    className="w-10 h-10 rounded-md border-0 cursor-pointer"
                    disabled={isUpdating}
                  />
                  <div className="text-xs font-mono">{color}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
