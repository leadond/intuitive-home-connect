import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Thermometer, Power, Snowflake, Flame, Fan } from "lucide-react";
import { SmartHomeDevice } from "@/hooks/useSmartHomeData";

interface ThermostatControlProps {
  device: SmartHomeDevice;
  onTemperatureChange: (device: SmartHomeDevice, temperature: number) => Promise<void>;
  onModeChange: (device: SmartHomeDevice, mode: string) => Promise<void>;
  isUpdating: boolean;
}

export const ThermostatControl = ({ 
  device, 
  onTemperatureChange, 
  onModeChange,
  isUpdating 
}: ThermostatControlProps) => {
  const [localTemperature, setLocalTemperature] = useState(device.status?.target_temperature || 72);
  const [mode, setMode] = useState(device.status?.mode || 'off');

  // Update local state when device status changes
  useEffect(() => {
    setLocalTemperature(device.status?.target_temperature || 72);
    setMode(device.status?.mode || 'off');
  }, [device.status]);

  const handleTemperatureChange = async (value: number[]) => {
    const temperature = value[0];
    setLocalTemperature(temperature);
    
    try {
      await onTemperatureChange(device, temperature);
    } catch (error) {
      console.error('Error changing temperature:', error);
      setLocalTemperature(device.status?.target_temperature || 72);
    }
  };

  const handleModeChange = async (newMode: string) => {
    try {
      await onModeChange(device, newMode);
      setMode(newMode);
    } catch (error) {
      console.error('Error changing mode:', error);
      setMode(device.status?.mode || 'off');
    }
  };

  // Get available modes from device capabilities
  const availableModes = device.capabilities?.modes || ['cool', 'heat', 'auto', 'off'];

  // Get current temperature from device status
  const currentTemperature = device.status?.current_temperature || 72;
  const currentHumidity = device.status?.humidity;

  // Determine if the system is actively heating/cooling
  const isActive = mode !== 'off';
  const isHeating = isActive && (mode === 'heat' || (mode === 'auto' && currentTemperature < localTemperature));
  const isCooling = isActive && (mode === 'cool' || (mode === 'auto' && currentTemperature > localTemperature));

  return (
    <Card className={`bg-white/5 hover:bg-white/10 transition-all duration-200 ${
      isHeating ? 'border-orange-400/50' : 
      isCooling ? 'border-blue-400/50' : 
      isActive ? 'border-green-400/50' : 
      'border-white/20'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              isHeating ? 'bg-orange-400/20' : 
              isCooling ? 'bg-blue-400/20' : 
              isActive ? 'bg-green-400/20' : 
              'bg-white/10'
            }`}>
              <Thermometer className={`w-6 h-6 ${
                isHeating ? 'text-orange-400' : 
                isCooling ? 'text-blue-400' : 
                isActive ? 'text-green-400' : 
                'text-white/70'
              }`} />
            </div>
            <div>
              <p className="font-medium text-sm">{device.device_name}</p>
              <p className="text-xs text-blue-300">{device.room}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{currentTemperature}°</p>
            <p className="text-xs text-blue-300">Current</p>
            {currentHumidity && (
              <p className="text-xs text-blue-300 mt-1">{currentHumidity}% humidity</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {/* Temperature Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-blue-200">Target Temperature</p>
              <p className="text-xs font-medium">{localTemperature}°</p>
            </div>
            <Slider
              value={[localTemperature]}
              onValueChange={handleTemperatureChange}
              min={60}
              max={85}
              step={1}
              disabled={isUpdating || mode === 'off'}
              className={mode === 'off' ? 'opacity-50' : ''}
            />
          </div>

          {/* Mode Controls */}
          <div className="space-y-2">
            <p className="text-xs text-blue-200">Mode</p>
            <div className="grid grid-cols-4 gap-2">
              {availableModes.includes('cool') && (
                <Button
                  size="sm"
                  variant={mode === 'cool' ? "default" : "outline"}
                  className={mode === 'cool' ? "bg-blue-600 hover:bg-blue-700" : "border-white/20 text-white hover:bg-white/10"}
                  onClick={() => handleModeChange('cool')}
                  disabled={isUpdating}
                >
                  <Snowflake className="w-4 h-4 mr-1" />
                  Cool
                </Button>
              )}
              {availableModes.includes('heat') && (
                <Button
                  size="sm"
                  variant={mode === 'heat' ? "default" : "outline"}
                  className={mode === 'heat' ? "bg-orange-600 hover:bg-orange-700" : "border-white/20 text-white hover:bg-white/10"}
                  onClick={() => handleModeChange('heat')}
                  disabled={isUpdating}
                >
                  <Flame className="w-4 h-4 mr-1" />
                  Heat
                </Button>
              )}
              {availableModes.includes('auto') && (
                <Button
                  size="sm"
                  variant={mode === 'auto' ? "default" : "outline"}
                  className={mode === 'auto' ? "bg-green-600 hover:bg-green-700" : "border-white/20 text-white hover:bg-white/10"}
                  onClick={() => handleModeChange('auto')}
                  disabled={isUpdating}
                >
                  <Fan className="w-4 h-4 mr-1" />
                  Auto
                </Button>
              )}
              {availableModes.includes('off') && (
                <Button
                  size="sm"
                  variant={mode === 'off' ? "default" : "outline"}
                  className={mode === 'off' ? "bg-slate-600 hover:bg-slate-700" : "border-white/20 text-white hover:bg-white/10"}
                  onClick={() => handleModeChange('off')}
                  disabled={isUpdating}
                >
                  <Power className="w-4 h-4 mr-1" />
                  Off
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
