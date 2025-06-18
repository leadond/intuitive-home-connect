import { DeviceDebugger } from "@/components/DeviceDebugger";
import { LightControl } from "@/components/LightControl";
import { ThermostatControl } from "@/components/ThermostatControl";
import { LockControl } from "@/components/LockControl";
import { PlugControl } from "@/components/PlugControl";
import { useSmartHomeData } from "@/hooks/useSmartHomeData";

export const DeviceDebugPage = () => {
  const smartHomeData = useSmartHomeData();
  
  if (!smartHomeData) {
    return <div>Loading device data...</div>;
  }
  
  const { 
    devices, 
    isUpdating,
    toggleDeviceState,
    setDeviceBrightness,
    setDeviceColor,
    setThermostatTemperature,
    setThermostatMode
  } = smartHomeData;
  
  // Get one device of each type for testing
  const lightDevice = devices.find(d => d.device_type === 'light');
  const thermostatDevice = devices.find(d => d.device_type === 'thermostat');
  const lockDevice = devices.find(d => d.device_type === 'lock');
  const plugDevice = devices.find(d => d.device_type === 'plug');
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Device Control Debugging</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <DeviceDebugger />
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Individual Component Tests</h2>
          
          {lightDevice && (
            <div>
              <h3 className="text-lg mb-2">Light Control</h3>
              <LightControl 
                device={lightDevice}
                onToggle={toggleDeviceState}
                onBrightnessChange={setDeviceBrightness}
                onColorChange={setDeviceColor}
                isUpdating={isUpdating}
              />
            </div>
          )}
          
          {thermostatDevice && (
            <div className="mt-4">
              <h3 className="text-lg mb-2">Thermostat Control</h3>
              <ThermostatControl 
                device={thermostatDevice}
                onTemperatureChange={setThermostatTemperature}
                onModeChange={setThermostatMode}
                isUpdating={isUpdating}
              />
            </div>
          )}
          
          {lockDevice && (
            <div className="mt-4">
              <h3 className="text-lg mb-2">Lock Control</h3>
              <LockControl 
                device={lockDevice}
                onToggle={toggleDeviceState}
                isUpdating={isUpdating}
              />
            </div>
          )}
          
          {plugDevice && (
            <div className="mt-4">
              <h3 className="text-lg mb-2">Plug Control</h3>
              <PlugControl 
                device={plugDevice}
                onToggle={toggleDeviceState}
                isUpdating={isUpdating}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
