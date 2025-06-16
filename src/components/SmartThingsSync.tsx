
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Smartphone } from "lucide-react";
import { useSmartThingsSync } from "@/hooks/useSmartThingsSync";
import { useSmartHomeData } from "@/hooks/useSmartHomeData";

export const SmartThingsSync = () => {
  const { syncSmartThingsDevices, isSyncing } = useSmartThingsSync();
  const { fetchAllData } = useSmartHomeData();

  const handleSync = async () => {
    try {
      await syncSmartThingsDevices();
      await fetchAllData(); // Refresh the dashboard data
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Smartphone className="w-5 h-5 mr-2 text-blue-400" />
          SmartThings Device Sync
        </CardTitle>
        <CardDescription className="text-blue-200">
          Fetch and sync devices from your connected SmartThings platform
        </CardDescription>
      </CardHeader>
      <CardContent>
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
          {isSyncing ? 'Syncing...' : 'Sync SmartThings Devices'}
        </Button>
      </CardContent>
    </Card>
  );
};
