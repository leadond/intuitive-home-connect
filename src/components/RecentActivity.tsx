import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, AlertTriangle, Check, Clock, Info, RefreshCw } from "lucide-react";
import { useSmartHomeData } from "@/hooks/useSmartHomeData";

export const RecentActivity = () => {
  const { activityLogs, isLoading } = useSmartHomeData();

  useEffect(() => {
    console.log('RecentActivity - activityLogs:', activityLogs);
  }, [activityLogs]);

  // Function to get icon based on activity type
  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'device_state_change':
        return <Check className="w-4 h-4 text-green-400" />;
      case 'device_brightness_change':
      case 'device_color_change':
      case 'thermostat_temperature_change':
      case 'thermostat_mode_change':
        return <RefreshCw className="w-4 h-4 text-blue-400" />;
      case 'camera_ptz_command':
      case 'camera_night_vision_change':
        return <Info className="w-4 h-4 text-purple-400" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default:
        return <Activity className="w-4 h-4 text-blue-400" />;
    }
  };

  // Function to format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} min${diffMins === 1 ? '' : 's'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white h-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-400" />
            Recent Activity
          </CardTitle>
          <CardDescription className="text-blue-200">
            Loading activity logs...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="w-5 h-5 mr-2 text-blue-400" />
          Recent Activity
        </CardTitle>
        <CardDescription className="text-blue-200">
          Latest actions in your smart home
          {activityLogs.length > 0 ? ` (${activityLogs.length} logs found)` : ' (No activity logs found)'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activityLogs.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-blue-300 mx-auto mb-4 opacity-50" />
            <p className="text-blue-300">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activityLogs.map((log) => (
              <div key={log.id} className="flex items-start space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200">
                <div className="p-2 rounded-full bg-white/10">
                  {getActivityIcon(log.activity_type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{log.description}</p>
                  <p className="text-xs text-blue-300 mt-1">{formatTimestamp(log.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
