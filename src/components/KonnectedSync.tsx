
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Shield } from "lucide-react";
import { useKonnectedSync } from "@/hooks/useKonnectedSync";
import { useSmartHomeData } from "@/hooks/useSmartHomeData";

export const KonnectedSync = () => {
  const { syncKonnectedDevices, isSyncing } = useKonnectedSync();
  const { fetchAllData } = useSmartHomeData();

  const handleSync = async () => {
    try {
      await syncKonnectedDevices();
      await fetchAllData(); // Refresh the dashboard data
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="w-5 h-5 mr-2 text-orange-400" />
          Konnected Management
        </CardTitle>
        <CardDescription className="text-blue-200">
          Sync devices and sensors from your Konnected security panel
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          onClick={handleSync}
          disabled={isSyncing}
          className="w-full bg-orange-600 hover:bg-orange-700"
        >
          {isSyncing ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          {isSyncing ? 'Syncing...' : 'Sync Konnected Devices'}
        </Button>
      </CardContent>
    </Card>
  );
};
