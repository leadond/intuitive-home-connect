
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock } from "lucide-react";

export const RecentActivity = () => {
  const activities = [
    {
      time: "2 min ago",
      event: "Living room lights turned on",
      platform: "Lutron",
      type: "automation"
    },
    {
      time: "5 min ago",
      event: "Front door unlocked",
      platform: "Lockly",
      type: "manual"
    },
    {
      time: "12 min ago",
      event: "Temperature adjusted to 72°F",
      platform: "ecobee",
      type: "automation"
    },
    {
      time: "18 min ago",
      event: "Security system armed",
      platform: "SmartThings",
      type: "manual"
    },
    {
      time: "25 min ago",
      event: "Kitchen camera motion detected",
      platform: "ReoLink",
      type: "alert"
    },
    {
      time: "32 min ago",
      event: "Bedroom fan turned off",
      platform: "Bond",
      type: "automation"
    }
  ];

  const getActivityColor = (type: string) => {
    switch (type) {
      case "automation":
        return "bg-blue-600 hover:bg-blue-600";
      case "manual":
        return "bg-green-600 hover:bg-green-600";
      case "alert":
        return "bg-red-600 hover:bg-red-600";
      default:
        return "bg-gray-600 hover:bg-gray-600";
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="w-5 h-5 mr-2 text-green-400" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div 
              key={index}
              className="flex items-start space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200"
            >
              <div className="p-1 rounded-full bg-white/10 mt-1">
                <Clock className="w-3 h-3 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{activity.event}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {activity.platform}
                  </Badge>
                  <Badge className={`text-xs ${getActivityColor(activity.type)}`}>
                    {activity.type}
                  </Badge>
                </div>
                <p className="text-xs text-blue-300 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
