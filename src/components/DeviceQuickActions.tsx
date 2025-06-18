import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lightbulb, Thermometer, Lock, Plug, Camera, Search, Activity, Droplets } from "lucide-react";
import { DoorOpen, DoorClosed } from "@/components/icons/DoorIcons";
import { useSmartHomeData } from "@/hooks/useSmartHomeData";
import { LightControl } from "@/components/LightControl";
import { ThermostatControl } from "@/components/ThermostatControl";
import { LockControl } from "@/components/LockControl";
import { PlugControl } from "@/components/PlugControl";
import { CameraView } from "@/components/CameraView";
import { SensorControl } from "@/components/SensorControl";
import { GarageDoorControl } from "@/components/GarageDoorControl";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const DeviceQuickActions = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
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
    setThermostatMode,
    executePtzCommand,
    setNightVisionMode,
    turnOffAllLights
  } = smartHomeData;
  
  // Filter devices by type
  const lightDevices = devices.filter(device => device.device_type === 'light');
  const thermostatDevices = devices.filter(device => device.device_type === 'thermostat');
  const lockDevices = devices.filter(device => device.device_type === 'lock');
  const plugDevices = devices.filter(device => device.device_type === 'plug');
  const cameraDevices = devices.filter(device => device.device_type === 'camera_view');
  const sensorDevices = devices.filter(device => 
    ['motion_sensor', 'contact_sensor', 'temperature_sensor', 'humidity_sensor'].includes(device.device_type)
  );
  const garageDoorDevices = devices.filter(device => device.device_type === 'garage_door');
  const otherDevices = devices.filter(device => 
    !['light', 'thermostat', 'lock', 'plug', 'camera_view', 'motion_sensor', 'contact_sensor', 'temperature_sensor', 'humidity_sensor', 'garage_door'].includes(device.device_type)
  );
  
  // Filter devices by search query
  const filterDevicesBySearch = (deviceList) => {
    if (!searchQuery) return deviceList;
    return deviceList.filter(device => 
      device.device_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.device_type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };
  
  // Get filtered devices based on active tab and search query
  const getFilteredDevices = () => {
    switch (activeTab) {
      case 'lights':
        return filterDevicesBySearch(lightDevices);
      case 'thermostats':
        return filterDevicesBySearch(thermostatDevices);
      case 'locks':
        return filterDevicesBySearch(lockDevices);
      case 'plugs':
        return filterDevicesBySearch(plugDevices);
      case 'cameras':
        return filterDevicesBySearch(cameraDevices);
      case 'sensors':
        return filterDevicesBySearch(sensorDevices);
      case 'garage':
        return filterDevicesBySearch(garageDoorDevices);
      case 'other':
        return filterDevicesBySearch(otherDevices);
      case 'all':
      default:
        return filterDevicesBySearch(devices);
    }
  };
  
  const filteredDevices = getFilteredDevices();
  
  // Handle turn off all lights
  const handleTurnOffAllLights = () => {
    setIsConfirmDialogOpen(true);
  };
  
  const confirmTurnOffAllLights = async () => {
    await turnOffAllLights();
    setIsConfirmDialogOpen(false);
  };
  
  // Render device control based on device type
  const renderDeviceControl = (device) => {
    switch (device.device_type) {
      case 'light':
        return (
          <LightControl
            key={device.id}
            device={device}
            onToggle={toggleDeviceState}
            onBrightnessChange={setDeviceBrightness}
            onColorChange={setDeviceColor}
            isUpdating={isUpdating}
          />
        );
      case 'thermostat':
        return (
          <ThermostatControl
            key={device.id}
            device={device}
            onTemperatureChange={setThermostatTemperature}
            onModeChange={setThermostatMode}
            isUpdating={isUpdating}
          />
        );
      case 'lock':
        return (
          <LockControl
            key={device.id}
            device={device}
            onToggle={toggleDeviceState}
            isUpdating={isUpdating}
          />
        );
      case 'plug':
        return (
          <PlugControl
            key={device.id}
            device={device}
            onToggle={toggleDeviceState}
            isUpdating={isUpdating}
          />
        );
      case 'camera_view':
        return (
          <CameraView
            key={device.id}
            device={device}
            onPtzCommand={executePtzCommand}
            onNightVisionChange={setNightVisionMode}
            isUpdating={isUpdating}
          />
        );
      case 'garage_door':
        return (
          <GarageDoorControl
            key={device.id}
            device={device}
            onToggle={toggleDeviceState}
            isUpdating={isUpdating}
          />
        );
      case 'motion_sensor':
      case 'contact_sensor':
      case 'temperature_sensor':
      case 'humidity_sensor':
        return (
          <SensorControl
            key={device.id}
            device={device}
          />
        );
      default:
        // Generic device card for other device types
        return (
          <Card key={device.id} className="bg-white/5 hover:bg-white/10 transition-all duration-200 border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-white/10">
                    <Lightbulb className="w-6 h-6 text-white/70" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{device.device_name}</p>
                    <p className="text-xs text-blue-300">{device.room}</p>
                    <Badge className="mt-1 bg-blue-600">{device.device_type}</Badge>
                  </div>
                </div>
                <div>
                  {device.status?.state && (
                    <Badge className={device.status.state === 'on' || device.status.state === 'active' || device.status.state === 'open' ? "bg-green-600" : "bg-slate-600"}>
                      {device.status.state}
                    </Badge>
                  )}
                  {device.status?.temperature && (
                    <div className="text-sm font-medium mt-1">
                      {device.status.temperature}°
                    </div>
                  )}
                  {device.status?.humidity && (
                    <div className="text-sm font-medium mt-1">
                      {device.status.humidity}%
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
    }
  };
  
  // Get icon for tab
  const getTabIcon = (tabName) => {
    switch (tabName) {
      case 'lights':
        return <Lightbulb className="w-4 h-4 mr-1" />;
      case 'thermostats':
        return <Thermometer className="w-4 h-4 mr-1" />;
      case 'locks':
        return <Lock className="w-4 h-4 mr-1" />;
      case 'plugs':
        return <Plug className="w-4 h-4 mr-1" />;
      case 'cameras':
        return <Camera className="w-4 h-4 mr-1" />;
      case 'sensors':
        return <Activity className="w-4 h-4 mr-1" />;
      case 'garage':
        return <DoorOpen className="w-4 h-4 mr-1" />;
      default:
        return null;
    }
  };
  
  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/20 text-white">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <Lightbulb className="w-5 h-5 mr-2 text-yellow-400" />
            Device Controls
          </CardTitle>
          
          {/* Turn All Lights Off button */}
          <Button 
            variant="destructive" 
            size="sm"
            onClick={handleTurnOffAllLights}
            disabled={isUpdating || lightDevices.filter(d => d.status?.state === 'on').length === 0}
          >
            Turn All Lights Off
          </Button>
        </div>
        
        <CardDescription className="text-blue-200">
          Control all your smart home devices ({devices.length} devices found)
        </CardDescription>
        
        {/* Search bar */}
        <div className="relative mt-2">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-blue-300" />
          <Input
            placeholder="Search devices by name, room, or type..."
            className="pl-8 bg-white/5 border-white/20 text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 md:grid-cols-8 mb-6">
            <TabsTrigger value="all">All ({devices.length})</TabsTrigger>
            <TabsTrigger value="lights" className="flex items-center">
              {getTabIcon('lights')}Lights ({lightDevices.length})
            </TabsTrigger>
            <TabsTrigger value="thermostats" className="flex items-center">
              {getTabIcon('thermostats')}Thermostats ({thermostatDevices.length})
            </TabsTrigger>
            <TabsTrigger value="locks" className="flex items-center">
              {getTabIcon('locks')}Locks ({lockDevices.length})
            </TabsTrigger>
            <TabsTrigger value="plugs" className="flex items-center">
              {getTabIcon('plugs')}Plugs ({plugDevices.length})
            </TabsTrigger>
            <TabsTrigger value="cameras" className="flex items-center">
              {getTabIcon('cameras')}Cameras ({cameraDevices.length})
            </TabsTrigger>
            <TabsTrigger value="sensors" className="flex items-center">
              {getTabIcon('sensors')}Sensors ({sensorDevices.length})
            </TabsTrigger>
            <TabsTrigger value="garage" className="flex items-center">
              {getTabIcon('garage')}Garage ({garageDoorDevices.length})
            </TabsTrigger>
          </TabsList>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDevices.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-blue-300">
                  {searchQuery 
                    ? `No devices found matching "${searchQuery}"`
                    : "No devices found in this category. Sync your platforms to see devices here."}
                </p>
              </div>
            ) : (
              filteredDevices.map(device => renderDeviceControl(device))
            )}
          </div>
        </Tabs>
        
        {/* Device count display */}
        <div className="mt-4 text-right text-sm text-blue-300">
          Showing {filteredDevices.length} of {devices.length} devices
        </div>
      </CardContent>
      
      {/* Confirmation Dialog for Turn All Lights Off */}
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent className="bg-slate-900 border-slate-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Turn Off All Lights?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              This will turn off all {lightDevices.filter(d => d.status?.state === 'on').length} lights that are currently on. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700 text-white" 
              onClick={confirmTurnOffAllLights}
              disabled={isUpdating}
            >
              Turn Off All Lights
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
