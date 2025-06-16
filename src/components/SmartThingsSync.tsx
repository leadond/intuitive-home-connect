
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Smartphone, MapPin } from "lucide-react";
import { useSmartThingsSync } from "@/hooks/useSmartThingsSync";
import { useSmartHomeData } from "@/hooks/useSmartHomeData";

export const SmartThingsSync = () => {
  const { syncSmartThingsDevices, isSyncing, fetchSmartThingsRooms, isFetchingRooms } = useSmartThingsSync();
  const { fetchAllData } = useSmartHomeData();

  const handleSync = async () => {
    try {
      await syncSmartThingsDevices();
      await fetchAllData(); // Refresh the dashboard data
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  const handleFetchRooms = async () => {
    try {
      const rooms = await fetchSmartThingsRooms();
      console.log('Room mapping for DeviceQuickActions:');
      console.log('const roomMappings: Record<string, string> = {');
      rooms.forEach(room => {
        console.log(`  '${room.id}': '${room.name}',`);
      });
      console.log('};');
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Smartphone className="w-5 h-5 mr-2 text-blue-400" />
          SmartThings Management
        </CardTitle>
        <CardDescription className="text-blue-200">
          Sync devices and fetch room information from your SmartThings platform
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
          {isSyncing ? 'Syncing...' : 'Sync SmartThings Devices'}
        </Button>
        
        <Button 
          onClick={handleFetchRooms}
          disabled={isFetchingRooms}
          variant="outline"
          className="w-full border-white/20 text-white hover:bg-white/10"
        >
          {isFetchingRooms ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <MapPin className="w-4 h-4 mr-2" />
          )}
          {isFetchingRooms ? 'Fetching...' : 'Fetch Room Names'}
        </Button>
      </CardContent>
    </Card>
  );
};
