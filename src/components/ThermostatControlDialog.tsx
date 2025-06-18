import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Thermometer, Snowflake, Flame, Wind, Power } from "lucide-react";
import { SmartHomeDevice } from "@/hooks/useSmartHomeData";

interface ThermostatControlDialogProps {
  device: SmartHomeDevice;
  isOpen: boolean;
  onClose: () => void;
  deviceStatus: any;
  onStatusUpdate: () => void;
}

export const ThermostatControlDialog = ({
  device,
  isOpen,
  onClose,
  deviceStatus,
  onStatusUpdate
}: ThermostatControlDialogProps) => {
  const [temperature, setTemperature] = useState(deviceStatus?.target_temperature || 72);
  const [mode, setMode] = useState(deviceStatus?.mode || 'off');
  const [fanMode, setFanMode] = useState(deviceStatus?.fan_mode || 'auto');
  
  // Update local state when device status changes
  useEffect(() => {
    if (deviceStatus) {
      setTemperature(deviceStatus.target_temperature || 72);
      setMode(deviceStatus.mode || 'off');
      setFanMode(deviceStatus.fan_mode || 'auto');
    }
  }, [deviceStatus]);

  const handleSave = () => {
    // In a real implementation, this would call an API to update the thermostat
    console.log('Saving thermostat settings:', { temperature, mode, fanMode });
    onStatusUpdate();
    onClose();
  };

  const currentTemp = deviceStatus?.current_temperature || temperature;
  const humidity = deviceStatus?.humidity || 45;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 text-white border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Thermometer className="w-5 h-5" />
            {device.device_name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {/* Current Temperature Display */}
          <div className="text-center mb-6">
            <div className="text-5xl font-light">{currentTemp}°</div>
            <div className="text-sm text-blue-300 mt-1">Current Temperature</div>
            <div className="text-xs text-blue-300 mt-1">Humidity: {humidity}%</div>
          </div>
          
          {/* Temperature Control */}
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm">Target Temperature</p>
                <p className="text-sm font-medium">{temperature}°</p>
              </div>
              <Slider
                value={[temperature]}
                onValueChange={(value) => setTemperature(value[0])}
                min={60}
                max={85}
                step={1}
              />
              <div className="flex justify-between text-xs text-blue-300">
                <span>60°</span>
                <span>85°</span>
              </div>
            </div>
            
            {/* Mode Selection */}
            <div className="space-y-2">
              <p className="text-sm">Mode</p>
              <div className="grid grid-cols-4 gap-2">
                <Button
                  variant={mode === 'off' ? 'default' : 'outline'}
                  className={mode === 'off' ? 'bg-slate-600' : 'border-white/20'}
                  onClick={() => setMode('off')}
                >
                  <Power className="w-4 h-4 mr-2" />
                  Off
                </Button>
                <Button
                  variant={mode === 'heat' ? 'default' : 'outline'}
                  className={mode === 'heat' ? 'bg-orange-600' : 'border-white/20'}
                  onClick={() => setMode('heat')}
                >
                  <Flame className="w-4 h-4 mr-2" />
                  Heat
                </Button>
                <Button
                  variant={mode === 'cool' ? 'default' : 'outline'}
                  className={mode === 'cool' ? 'bg-blue-600' : 'border-white/20'}
                  onClick={() => setMode('cool')}
                >
                  <Snowflake className="w-4 h-4 mr-2" />
                  Cool
                </Button>
                <Button
                  variant={mode === 'auto' ? 'default' : 'outline'}
                  className={mode === 'auto' ? 'bg-green-600' : 'border-white/20'}
                  onClick={() => setMode('auto')}
                >
                  <Wind className="w-4 h-4 mr-2" />
                  Auto
                </Button>
              </div>
            </div>
            
            {/* Fan Mode */}
            <div className="space-y-2">
              <p className="text-sm">Fan</p>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={fanMode === 'auto' ? 'default' : 'outline'}
                  className={fanMode === 'auto' ? 'bg-blue-600' : 'border-white/20'}
                  onClick={() => setFanMode('auto')}
                >
                  Auto
                </Button>
                <Button
                  variant={fanMode === 'on' ? 'default' : 'outline'}
                  className={fanMode === 'on' ? 'bg-blue-600' : 'border-white/20'}
                  onClick={() => setFanMode('on')}
                >
                  On
                </Button>
                <Button
                  variant={fanMode === 'circulate' ? 'default' : 'outline'}
                  className={fanMode === 'circulate' ? 'bg-blue-600' : 'border-white/20'}
                  onClick={() => setFanMode('circulate')}
                >
                  Circulate
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" className="border-white/20" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
