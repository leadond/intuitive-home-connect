import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSmartHomeData } from "@/hooks/useSmartHomeData";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const DeviceDebugger = () => {
  const [activeTab, setActiveTab] = useState("devices");
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [actionLog, setActionLog] = useState<string[]>([]);
  
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
  
  const selectedDeviceData = selectedDevice 
    ? devices.find(d => d.id === selectedDevice) 
    : null;
  
  const logAction = (message: string) => {
    setActionLog(prev => [message, ...prev].slice(0, 20));
  };
  
  const handleToggleDevice = async (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;
    
    try {
      logAction(`Attempting to toggle device: ${device.device_name}`);
      await toggleDeviceState(device);
      logAction(`Successfully toggled device: ${device.device_name}`);
    } catch (error) {
      logAction(`ERROR: Failed to toggle device: ${device.device_name}`);
      console.error('Toggle error:', error);
    }
  };
  
  const handleSetBrightness = async (deviceId: string, brightness: number) => {
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;
    
    try {
      logAction(`Attempting to set brightness to ${brightness} for: ${device.device_name}`);
      await setDeviceBrightness(device, brightness);
      logAction(`Successfully set brightness to ${brightness} for: ${device.device_name}`);
    } catch (error) {
      logAction(`ERROR: Failed to set brightness for: ${device.device_name}`);
      console.error('Brightness error:', error);
    }
  };
  
  const handleSetColor = async (deviceId: string, color: string) => {
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;
    
    try {
      logAction(`Attempting to set color to ${color} for: ${device.device_name}`);
      await setDeviceColor(device, color);
      logAction(`Successfully set color to ${color} for: ${device.device_name}`);
    } catch (error) {
      logAction(`ERROR: Failed to set color for: ${device.device_name}`);
      console.error('Color error:', error);
    }
  };
  
  const handleSetTemperature = async (deviceId: string, temperature: number) => {
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;
    
    try {
      logAction(`Attempting to set temperature to ${temperature} for: ${device.device_name}`);
      await setThermostatTemperature(device, temperature);
      logAction(`Successfully set temperature to ${temperature} for: ${device.device_name}`);
    } catch (error) {
      logAction(`ERROR: Failed to set temperature for: ${device.device_name}`);
      console.error('Temperature error:', error);
    }
  };
  
  const handleSetMode = async (deviceId: string, mode: string) => {
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;
    
    try {
      logAction(`Attempting to set mode to ${mode} for: ${device.device_name}`);
      await setThermostatMode(device, mode);
      logAction(`Successfully set mode to ${mode} for: ${device.device_name}`);
    } catch (error) {
      logAction(`ERROR: Failed to set mode for: ${device.device_name}`);
      console.error('Mode error:', error);
    }
  };
  
  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/20 text-white">
      <CardHeader>
        <CardTitle>Device Debugger</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="devices" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="devices">Devices</TabsTrigger>
            <TabsTrigger value="actions">Test Actions</TabsTrigger>
            <TabsTrigger value="log">Action Log</TabsTrigger>
          </TabsList>
          
          <TabsContent value="devices">
            <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto">
              {devices.map(device => (
                <div 
                  key={device.id}
                  className={`p-2 rounded border ${selectedDevice === device.id ? 'border-blue-500 bg-blue-900/20' : 'border-white/20'} cursor-pointer`}
                  onClick={() => setSelectedDevice(device.id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{device.device_name}</p>
                      <p className="text-xs text-blue-300">{device.room} • {device.device_type}</p>
                    </div>
                    <Badge className={
                      device.status?.state === 'on' || 
                      device.status?.state === 'active' || 
                      device.status?.state === 'open' || 
                      device.status?.state === 'unlocked' 
                        ? 'bg-green-600' 
                        : 'bg-slate-600'
                    }>
                      {device.status?.state || 'unknown'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="actions">
            {selectedDeviceData ? (
              <div className="space-y-4">
                <div className="p-3 bg-slate-800 rounded">
                  <h3 className="font-medium mb-1">{selectedDeviceData.device_name}</h3>
                  <p className="text-xs text-blue-300 mb-2">{selectedDeviceData.room} • {selectedDeviceData.device_type}</p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      onClick={() => handleToggleDevice(selectedDeviceData.id)}
                      disabled={isUpdating}
                    >
                      Toggle State
                    </Button>
                    
                    {selectedDeviceData.device_type === 'light' && selectedDeviceData.capabilities?.dimmable && (
                      <>
                        <Button 
                          onClick={() => handleSetBrightness(selectedDeviceData.id, 50)}
                          disabled={isUpdating}
                        >
                          Set Brightness 50%
                        </Button>
                        
                        {selectedDeviceData.capabilities?.color_control && (
                          <Button 
                            onClick={() => handleSetColor(selectedDeviceData.id, '#ff0000')}
                            disabled={isUpdating}
                          >
                            Set Color Red
                          </Button>
                        )}
                      </>
                    )}
                    
                    {selectedDeviceData.device_type === 'thermostat' && (
                      <>
                        <Button 
                          onClick={() => handleSetTemperature(selectedDeviceData.id, 72)}
                          disabled={isUpdating}
                        >
                          Set Temp 72°
                        </Button>
                        
                        <Button 
                          onClick={() => handleSetMode(selectedDeviceData.id, 'cool')}
                          disabled={isUpdating}
                        >
                          Set Mode: Cool
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="p-3 bg-slate-800 rounded">
                  <h3 className="font-medium mb-2">Device Data</h3>
                  <pre className="text-xs bg-slate-900 p-2 rounded overflow-auto max-h-[200px]">
                    {JSON.stringify(selectedDeviceData, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <p className="text-center text-blue-300">Select a device to test actions</p>
            )}
          </TabsContent>
          
          <TabsContent value="log">
            <div className="bg-slate-900 p-3 rounded max-h-[400px] overflow-y-auto">
              {actionLog.length === 0 ? (
                <p className="text-center text-blue-300">No actions logged yet</p>
              ) : (
                actionLog.map((log, index) => (
                  <div 
                    key={index} 
                    className={`mb-1 p-1 text-sm ${log.includes('ERROR') ? 'text-red-400' : 'text-green-300'}`}
                  >
                    {log}
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
