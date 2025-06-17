
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight,
  ZoomIn,
  ZoomOut,
  Square,
  Moon,
  Sun,
  Eye,
  Circle,
  Image as ImageIcon,
  Maximize,
  Settings,
  RefreshCw
} from "lucide-react";
import { SmartHomeDevice } from "@/hooks/useSmartHomeData";
import { useToast } from "@/hooks/use-toast";

interface CameraViewProps {
  device: SmartHomeDevice;
  onPtzCommand: (device: SmartHomeDevice, command: string) => Promise<void>;
  onNightVisionToggle: (device: SmartHomeDevice, mode: string) => Promise<void>;
  isUpdating: boolean;
}

export const CameraView = ({ 
  device, 
  onPtzCommand, 
  onNightVisionToggle, 
  isUpdating 
}: CameraViewProps) => {
  const [selectedPreset, setSelectedPreset] = useState('1');
  const [showControls, setShowControls] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageKey, setImageKey] = useState(0);
  const { toast } = useToast();

  const deviceStatus = device.status as {
    ip_address?: string;
    online?: boolean;
    streaming?: string;
    rtsp_main?: string;
    rtsp_sub?: string;
    http_snapshot?: string;
    ptz_position?: { pan: number; tilt: number; zoom: number };
    night_vision?: string;
    recording?: string;
    port?: number;
  };

  const capabilities = device.capabilities as {
    ptz_commands?: Record<string, string>;
    night_vision_commands?: Record<string, string>;
  };

  // For ReoLink cameras, assume they're online if they have an IP address
  const isOnline = deviceStatus.online !== false && !!deviceStatus.ip_address;

  // Auto-refresh the image every 5 seconds
  useEffect(() => {
    if (isOnline && !imageError) {
      const interval = setInterval(() => {
        setImageKey(prev => prev + 1);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isOnline, imageError]);

  const handlePtzCommand = async (command: string) => {
    try {
      console.log(`Sending PTZ command: ${command}`);
      
      // Get the command URL from capabilities
      const commandUrl = capabilities.ptz_commands?.[command];
      if (!commandUrl) {
        throw new Error(`PTZ command ${command} not found`);
      }

      // Make direct HTTP request to camera
      const response = await fetch(commandUrl, {
        method: 'GET',
        mode: 'no-cors' // This will prevent CORS issues but we won't get response data
      });

      toast({
        title: "PTZ Command Sent",
        description: `Camera ${command} command executed`,
      });
    } catch (error) {
      console.error('PTZ command error:', error);
      toast({
        title: "PTZ Command Failed",
        description: `Failed to execute ${command} command: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };

  const handleNightVisionToggle = async () => {
    const currentMode = deviceStatus.night_vision || 'auto';
    const nextMode = currentMode === 'auto' ? 'on' : currentMode === 'on' ? 'off' : 'auto';
    
    try {
      console.log(`Changing night vision from ${currentMode} to ${nextMode}`);
      
      const commandUrl = capabilities.night_vision_commands?.[nextMode];
      if (!commandUrl) {
        throw new Error(`Night vision command ${nextMode} not found`);
      }

      const response = await fetch(commandUrl, {
        method: 'GET',
        mode: 'no-cors'
      });

      toast({
        title: "Night Vision Updated",
        description: `Night vision set to ${nextMode}`,
      });
    } catch (error) {
      console.error('Night vision error:', error);
      toast({
        title: "Night Vision Failed",
        description: "Failed to change night vision mode",
        variant: "destructive"
      });
    }
  };

  const handlePresetGoto = async () => {
    try {
      const presetCommand = `preset_goto_${selectedPreset}`;
      await handlePtzCommand(presetCommand);
    } catch (error) {
      toast({
        title: "Preset Command Failed",
        description: `Failed to go to preset ${selectedPreset}`,
        variant: "destructive"
      });
    }
  };

  const refreshImage = () => {
    setImageError(false);
    setImageKey(prev => prev + 1);
  };

  const openSnapshotUrl = () => {
    if (deviceStatus.http_snapshot) {
      window.open(`${deviceStatus.http_snapshot}&t=${Date.now()}`, '_blank');
    }
  };

  const openStreamUrl = () => {
    if (deviceStatus.rtsp_main) {
      navigator.clipboard.writeText(deviceStatus.rtsp_main);
      toast({
        title: "Stream URL Copied",
        description: "RTSP URL copied to clipboard. Open in VLC or compatible player.",
      });
    }
  };

  // Create a timestamped snapshot URL to prevent caching
  const snapshotUrl = deviceStatus.http_snapshot ? 
    `${deviceStatus.http_snapshot}&t=${Date.now()}&key=${imageKey}` : null;

  return (
    <Card className="bg-white/5 hover:bg-white/10 transition-all duration-200">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-white/10">
              <Camera className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="font-medium text-sm">{device.device_name}</p>
              <p className="text-xs text-blue-300">{deviceStatus.ip_address}:{deviceStatus.port || 80}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={isOnline ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}>
              {isOnline ? 'Live' : 'Offline'}
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={() => setShowControls(!showControls)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Live Video Feed */}
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-white/20">
          {isOnline && snapshotUrl && !imageError ? (
            <>
              <img
                key={imageKey}
                src={snapshotUrl}
                alt="Live Camera Feed"
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.log('Image failed to load:', snapshotUrl);
                  setImageError(true);
                }}
                onLoad={() => {
                  console.log('Image loaded successfully');
                  setImageError(false);
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent">
                <div className="absolute bottom-2 left-2 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-white text-xs font-medium">LIVE</span>
                  {deviceStatus.recording === 'enabled' && (
                    <Circle className="w-3 h-3 text-red-500 fill-current" />
                  )}
                </div>
                <div className="absolute top-2 right-2 flex space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                    onClick={refreshImage}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                    onClick={openStreamUrl}
                  >
                    <Maximize className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-white/70">
                <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm mb-2">
                  {!isOnline ? 'Camera Offline' : imageError ? 'Image Load Failed' : 'Loading...'}
                </p>
                {isOnline && imageError && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                    onClick={refreshImage}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        {isOnline && (
          <div className="grid grid-cols-3 gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="text-white border-white/20 hover:bg-white/10"
              onClick={openStreamUrl}
              disabled={!deviceStatus.rtsp_main}
            >
              <Eye className="w-4 h-4 mr-2" />
              Stream
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-white border-white/20 hover:bg-white/10"
              onClick={openSnapshotUrl}
              disabled={!deviceStatus.http_snapshot}
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Snapshot
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-white border-white/20 hover:bg-white/10"
              onClick={refreshImage}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        )}

        {/* Collapsible Controls */}
        {showControls && isOnline && (
          <div className="space-y-4 border-t border-white/10 pt-4">
            {/* PTZ Controls */}
            {capabilities.ptz_commands && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-blue-200">PTZ Controls</h4>
                
                {/* Directional Controls */}
                <div className="grid grid-cols-3 gap-2 max-w-32 mx-auto">
                  <div></div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-white hover:bg-white/20"
                    onClick={() => handlePtzCommand('tilt_up')}
                    disabled={isUpdating}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <div></div>
                  
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-white hover:bg-white/20"
                    onClick={() => handlePtzCommand('pan_left')}
                    disabled={isUpdating}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-white hover:bg-white/20"
                    onClick={() => handlePtzCommand('stop')}
                    disabled={isUpdating}
                  >
                    <Square className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-white hover:bg-white/20"
                    onClick={() => handlePtzCommand('pan_right')}
                    disabled={isUpdating}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  
                  <div></div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-white hover:bg-white/20"
                    onClick={() => handlePtzCommand('tilt_down')}
                    disabled={isUpdating}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                  <div></div>
                </div>
                
                {/* Zoom Controls */}
                <div className="flex justify-center space-x-2">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-white hover:bg-white/20"
                    onClick={() => handlePtzCommand('zoom_in')}
                    disabled={isUpdating}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-white hover:bg-white/20"
                    onClick={() => handlePtzCommand('zoom_out')}
                    disabled={isUpdating}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Preset Controls */}
            {capabilities.ptz_commands && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-blue-200">Preset Positions</h4>
                <div className="flex items-center space-x-2">
                  <select 
                    value={selectedPreset} 
                    onChange={(e) => setSelectedPreset(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                      <option key={num} value={num.toString()} className="bg-gray-800">
                        Preset {num}
                      </option>
                    ))}
                  </select>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-white hover:bg-white/20"
                    onClick={handlePresetGoto}
                    disabled={isUpdating}
                  >
                    Go To
                  </Button>
                </div>
              </div>
            )}

            {/* Night Vision Control */}
            {capabilities.night_vision_commands && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-blue-200">Night Vision</h4>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="w-full text-white hover:bg-white/20 justify-start"
                  onClick={handleNightVisionToggle}
                  disabled={isUpdating}
                >
                  {deviceStatus.night_vision === 'on' ? (
                    <Moon className="w-4 h-4 mr-2" />
                  ) : deviceStatus.night_vision === 'off' ? (
                    <Sun className="w-4 h-4 mr-2" />
                  ) : (
                    <Eye className="w-4 h-4 mr-2" />
                  )}
                  {deviceStatus.night_vision === 'on' ? 'On' : deviceStatus.night_vision === 'off' ? 'Off' : 'Auto'}
                </Button>
              </div>
            )}

            {/* Status Information */}
            <div className="space-y-1 text-xs text-blue-300">
              <div className="flex justify-between">
                <span>Position:</span>
                <span>
                  P: {deviceStatus.ptz_position?.pan || 0}° T: {deviceStatus.ptz_position?.tilt || 0}° Z: {deviceStatus.ptz_position?.zoom || 1}x
                </span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="text-green-400">Online</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
