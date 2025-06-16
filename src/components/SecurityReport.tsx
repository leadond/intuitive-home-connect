
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, CheckCircle, Camera } from "lucide-react";

export const SecurityReport = () => {
  const securityEvents = [
    {
      time: "Today 14:32",
      event: "Front door motion detected",
      severity: "info",
      device: "ReoLink Doorbell"
    },
    {
      time: "Today 09:15",
      event: "Security system armed",
      severity: "success",
      device: "SmartThings Hub"
    },
    {
      time: "Yesterday 23:45",
      event: "Unusual activity detected",
      severity: "warning",
      device: "Backyard Camera"
    },
    {
      time: "Yesterday 18:20",
      event: "Smart lock accessed",
      severity: "info",
      device: "Lockly Front Door"
    }
  ];

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "info":
      default:
        return <Camera className="w-4 h-4 text-blue-400" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "warning":
        return "bg-yellow-600 hover:bg-yellow-600";
      case "success":
        return "bg-green-600 hover:bg-green-600";
      case "info":
      default:
        return "bg-blue-600 hover:bg-blue-600";
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white mb-8">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="w-5 h-5 mr-2 text-green-400" />
          Security & Surveillance Report
        </CardTitle>
        <CardDescription className="text-blue-200">
          Recent security events and system status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 rounded-lg bg-white/5">
            <div className="text-2xl font-bold text-green-400">8</div>
            <div className="text-sm text-blue-200">Active Cameras</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-white/5">
            <div className="text-2xl font-bold text-blue-400">4</div>
            <div className="text-sm text-blue-200">Smart Locks</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-white/5">
            <div className="text-2xl font-bold text-purple-400">12</div>
            <div className="text-sm text-blue-200">Motion Sensors</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-white/5">
            <div className="text-2xl font-bold text-yellow-400">1</div>
            <div className="text-sm text-blue-200">Alerts Today</div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-white">Recent Events</h4>
          {securityEvents.map((event, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200">
              <div className="flex items-center space-x-3">
                {getSeverityIcon(event.severity)}
                <div>
                  <p className="font-medium text-white">{event.event}</p>
                  <p className="text-sm text-blue-300">{event.device}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge className={getSeverityColor(event.severity)}>
                  {event.severity}
                </Badge>
                <p className="text-xs text-blue-300 mt-1">{event.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
