
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card, CardContent } from "@/components/ui/card";
import { Thermometer, Snowflake, Flame, Wind, Power } from "lucide-react";
import { useSmartThingsStatus } from "@/hooks/useSmartThingsStatus";
import { useToast } from "@/hooks/use-toast";
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
  const { sendDeviceCommand, isUpdating } = useSmartThingsStatus();
  const { toast } = useToast();
  
  const [localHeatingSetpoint, setLocalHeatingSetpoint] = useState(deviceStatus.heatingSetpoint || 70);
  const [localCoolingSetpoint, setLocalCoolingSetpoint] = useState(deviceStatus.coolingSetpoint || 75);
  const [localMode, setLocalMode] = useState(deviceStatus.thermostatMode || 'off');

  useEffect(() => {
    setLocalHeatingSetpoint(deviceStatus.heatingSetpoint || 70);
    setLocalCoolingSetpoint(deviceStatus.coolingSetpoint || 75);
    setLocalMode(deviceStatus.thermostatMode || 'off');
  }, [deviceStatus]);

  const handleModeChange = async (mode: string) => {
    if (!mode) return;
    
    try {
      setLocalMode(mode);
      await sendDeviceCommand(device.device_id, 'thermostatMode', 'setThermostatMode', [mode]);
      
      toast({
        title: "Mode Updated",
        description: `Thermostat set to ${mode} mode`,
      });
      
      setTimeout(onStatusUpdate, 1000);
    } catch (error) {
      console.error('Error changing thermostat mode:', error);
      setLocalMode(deviceStatus.thermostatMode || 'off');
    }
  };

  const handleHeatingSetpointChange = async (value: number[]) => {
    const temperature = value[0];
    setLocalHeatingSetpoint(temperature);
    
    try {
      await sendDeviceCommand(device.device_id, 'thermostatHeatingSetpoint', 'setHeatingSetpoint', [temperature]);
      
      toast({
        title: "Heating Setpoint Updated",
        description: `Heating set to ${temperature}°F`,
      });
      
      setTimeout(onStatusUpdate, 1000);
    } catch (error) {
      console.error('Error changing heating setpoint:', error);
      setLocalHeatingSetpoint(deviceStatus.heatingSetpoint || 70);
    }
  };

  const handleCoolingSetpointChange = async (value: number[]) => {
    const temperature = value[0];
    setLocalCoolingSetpoint(temperature);
    
    try {
      await sendDeviceCommand(device.device_id, 'thermostatCoolingSetpoint', 'setCoolingSetpoint', [temperature]);
      
      toast({
        title: "Cooling Setpoint Updated",
        description: `Cooling set to ${temperature}°F`,
      });
      
      setTimeout(onStatusUpdate, 1000);
    } catch (error) {
      console.error('Error changing cooling setpoint:', error);
      setLocalCoolingSetpoint(deviceStatus.coolingSetpoint || 75);
    }
  };

  const currentTemp = deviceStatus.temperature || 72;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-800 to-slate-900 text-white border-slate-600">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Thermometer className="w-6 h-6 text-blue-400" />
            {device.device_name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Current Temperature Display */}
          <Card className="bg-slate-700/50 border-slate-600">
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold text-white mb-2">
                {Math.round(currentTemp)}°F
              </div>
              <div className="text-sm text-slate-300">Current Temperature</div>
            </CardContent>
          </Card>

          {/* Mode Selection */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Mode</h3>
            <ToggleGroup
              type="single"
              value={localMode}
              onValueChange={handleModeChange}
              className="grid grid-cols-2 gap-2 w-full"
              disabled={isUpdating}
            >
              <ToggleGroupItem
                value="off"
                className="flex flex-col items-center p-4 h-auto bg-slate-700 hover:bg-slate-600 data-[state=on]:bg-slate-500 text-white border-slate-600"
              >
                <Power className="w-6 h-6 mb-2" />
                <span className="text-sm">Off</span>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="heat"
                className="flex flex-col items-center p-4 h-auto bg-slate-700 hover:bg-slate-600 data-[state=on]:bg-orange-600 text-white border-slate-600"
              >
                <Flame className="w-6 h-6 mb-2" />
                <span className="text-sm">Heat</span>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="cool"
                className="flex flex-col items-center p-4 h-auto bg-slate-700 hover:bg-slate-600 data-[state=on]:bg-blue-600 text-white border-slate-600"
              >
                <Snowflake className="w-6 h-6 mb-2" />
                <span className="text-sm">Cool</span>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="auto"
                className="flex flex-col items-center p-4 h-auto bg-slate-700 hover:bg-slate-600 data-[state=on]:bg-green-600 text-white border-slate-600"
              >
                <Wind className="w-6 h-6 mb-2" />
                <span className="text-sm">Auto</span>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Temperature Controls */}
          {(localMode === 'heat' || localMode === 'auto') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-400" />
                  Heat to
                </h3>
                <span className="text-2xl font-bold text-orange-400">
                  {localHeatingSetpoint}°F
                </span>
              </div>
              <Slider
                value={[localHeatingSetpoint]}
                onValueChange={handleHeatingSetpointChange}
                min={50}
                max={85}
                step={1}
                disabled={isUpdating}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>50°F</span>
                <span>85°F</span>
              </div>
            </div>
          )}

          {(localMode === 'cool' || localMode === 'auto') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Snowflake className="w-5 h-5 text-blue-400" />
                  Cool to
                </h3>
                <span className="text-2xl font-bold text-blue-400">
                  {localCoolingSetpoint}°F
                </span>
              </div>
              <Slider
                value={[localCoolingSetpoint]}
                onValueChange={handleCoolingSetpointChange}
                min={50}
                max={85}
                step={1}
                disabled={isUpdating}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>50°F</span>
                <span>85°F</span>
              </div>
            </div>
          )}

          {/* Close Button */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
