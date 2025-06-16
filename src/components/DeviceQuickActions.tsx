
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Lightbulb, 
  Fan, 
  Thermometer, 
  Camera, 
  Lock, 
  Tv,
  Volume2,
  Wifi
} from "lucide-react";

export const DeviceQuickActions = () => {
  const deviceCategories = [
    {
      name: "Living Room",
      devices: [
        { name: "Main Lights", type: "light", status: "on", icon: Lightbulb, platform: "Lutron" },
        { name: "Ceiling Fan", type: "fan", status: "off", icon: Fan, platform: "Bond" },
        { name: "Smart TV", type: "entertainment", status: "on", icon: Tv, platform: "SmartThings" },
        { name: "Sound System", type: "audio", status: "on", icon: Volume2, platform: "Alexa" }
      ]
    },
    {
      name: "Bedroom",
      devices: [
        { name: "Bedside Lamps", type: "light", status: "on", icon: Lightbulb, platform: "LIFX" },
        { name: "Thermostat", type: "climate", status: "auto", icon: Thermometer, platform: "ecobee" },
        { name: "Door Lock", type: "security", status: "locked", icon: Lock, platform: "Lockly" }
      ]
    },
    {
      name: "Kitchen",
      devices: [
        { name: "Under Cabinet", type: "light", status: "off", icon: Lightbulb, platform: "Lutron" },
        { name: "Security Camera", type: "security", status: "recording", icon: Camera, platform: "ReoLink" }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on":
      case "recording":
      case "locked":
        return "bg-green-600 hover:bg-green-600";
      case "off":
        return "bg-gray-600 hover:bg-gray-600";
      case "auto":
        return "bg-blue-600 hover:bg-blue-600";
      default:
        return "bg-gray-600 hover:bg-gray-600";
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Wifi className="w-5 h-5 mr-2 text-blue-400" />
          Device Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {deviceCategories.map((category, index) => (
            <div key={index}>
              <h3 className="text-lg font-semibold text-blue-200 mb-3">{category.name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {category.devices.map((device, deviceIndex) => (
                  <div 
                    key={deviceIndex}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-white/10">
                        <device.icon className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{device.name}</p>
                        <p className="text-xs text-blue-300">{device.platform}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(device.status)}>
                        {device.status}
                      </Badge>
                      <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                        Toggle
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
