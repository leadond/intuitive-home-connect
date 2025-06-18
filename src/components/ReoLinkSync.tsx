import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Camera } from "lucide-react";
import { useReoLinkSync } from "@/hooks/useReoLinkSync";
import { useSmartHomeData } from "@/hooks/useSmartHomeData";

export const ReoLinkSync = () => {
  const { syncReoLinkCameras, isSyncing } = useReoLinkSync();
  const { fetchAllData } = useSmartHomeData();

  const handleSync = async () => {
    try {
      await syncReoLinkCameras();
      await fetchAllData(); // Refresh the dashboard data
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Camera className="w-5 h-5 mr-2 text-blue-400" />
          ReoLink Management
        </CardTitle>
        <CardDescription className="text-blue-200">
          Sync and manage your ReoLink security cameras
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          onClick={handleSync}
          disabled={isSyncing}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isSyncing ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          {isSyncing ? 'Syncing...' : 'Sync ReoLink Cameras'}
        </Button>
      </CardContent>
    </Card>
  );
};
