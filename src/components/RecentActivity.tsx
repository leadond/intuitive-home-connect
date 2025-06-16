
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock } from "lucide-react";
import { useSmartHomeData } from "@/hooks/useSmartHomeData";
import { formatDistanceToNow } from "date-fns";

export const RecentActivity = () => {
  const { activityLogs, isLoading } = useSmartHomeData();

  const getActivityColor = (action: string) => {
    if (action.includes('automation') || action.includes('scheduled')) {
      return "bg-blue-600 hover:bg-blue-600";
    }
    if (action.includes('manual') || action.includes('user')) {
      return "bg-green-600 hover:bg-green-600";
    }
    if (action.includes('alert') || action.includes('motion') || action.includes('alarm')) {
      return "bg-red-600 hover:bg-red-600";
    }
    return "bg-gray-600 hover:bg-gray-600";
  };

  const getActivityType = (action: string) => {
    if (action.includes('automation') || action.includes('scheduled')) {
      return 'automation';
    }
    if (action.includes('manual') || action.includes('user')) {
      return 'manual';
    }
    if (action.includes('alert') || action.includes('motion') || action.includes('alarm')) {
      return 'alert';
    }
    return 'system';
  };

  if (isLoading) {
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
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-16 bg-white/10 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

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
          {activityLogs.length === 0 ? (
            <p className="text-blue-300 text-center py-4">No recent activity</p>
          ) : (
            activityLogs.map((activity) => (
              <div 
                key={activity.id}
                className="flex items-start space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200"
              >
                <div className="p-1 rounded-full bg-white/10 mt-1">
                  <Clock className="w-3 h-3 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{activity.action}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {activity.device_name}
                    </Badge>
                    <Badge className={`text-xs ${getActivityColor(activity.action)}`}>
                      {getActivityType(activity.action)}
                    </Badge>
                  </div>
                  <p className="text-xs text-blue-300 mt-1">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
