
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const ClearPlatformData = () => {
  const { toast } = useToast();

  const clearAllPlatformData = async () => {
    try {
      console.log('Starting complete platform data cleanup...');
      
      // Step 1: Delete ALL activity logs first (no conditions)
      const { error: allLogsError } = await supabase
        .from('device_activity_logs')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // This will delete all rows

      if (allLogsError) {
        console.error('Error deleting all activity logs:', allLogsError);
        throw allLogsError;
      }
      console.log('All activity logs cleared');

      // Step 2: Delete ALL energy usage data (no conditions)
      const { error: allEnergyError } = await supabase
        .from('energy_usage')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // This will delete all rows

      if (allEnergyError) {
        console.error('Error deleting all energy usage:', allEnergyError);
        throw allEnergyError;
      }
      console.log('All energy usage data cleared');

      // Step 3: Delete ALL devices (no conditions)
      const { error: devicesError } = await supabase
        .from('smart_home_devices')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // This will delete all rows

      if (devicesError) {
        console.error('Error deleting all devices:', devicesError);
        throw devicesError;
      }
      console.log('All devices cleared');

      // Step 4: Delete ALL platforms (no conditions)
      const { error: platformsError } = await supabase
        .from('smart_home_platforms')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // This will delete all rows

      if (platformsError) {
        console.error('Error deleting all platforms:', platformsError);
        throw platformsError;
      }
      console.log('All platforms cleared');

      toast({
        title: "Data Cleared",
        description: "All platform and device data has been cleared successfully.",
      });

      // Refresh the page to show the updated state
      window.location.reload();
    } catch (error) {
      console.error('Error clearing platform data:', error);
      toast({
        title: "Error",
        description: "Failed to clear platform data. Please try again.",
        variant: "destructive"
      });
    }
  };

  const clearSpecificPlatform = async (platformName: string) => {
    try {
      console.log(`Starting cleanup for ${platformName} platform...`);
      
      // First, get the platform ID
      const { data: platforms, error: platformError } = await supabase
        .from('smart_home_platforms')
        .select('id')
        .eq('platform_name', platformName);

      if (platformError) throw platformError;
      
      if (!platforms || platforms.length === 0) {
        console.log(`No ${platformName} platform found`);
        toast({
          title: "Platform Not Found",
          description: `No ${platformName} platform found to remove.`,
        });
        return;
      }

      const platformId = platforms[0].id;
      console.log(`Found ${platformName} platform with ID:`, platformId);

      // Get ALL devices for this platform
      const { data: devices, error: devicesError } = await supabase
        .from('smart_home_devices')
        .select('id')
        .eq('platform_id', platformId);

      if (devicesError) throw devicesError;

      const deviceIds = devices?.map(device => device.id) || [];
      console.log(`Found ${deviceIds.length} devices for ${platformName}`);

      // Step 1: Delete ALL activity logs for these devices
      if (deviceIds.length > 0) {
        console.log('Deleting activity logs for device IDs:', deviceIds);
        const { error: logsError } = await supabase
          .from('device_activity_logs')
          .delete()
          .in('device_id', deviceIds);

        if (logsError) {
          console.error('Error deleting activity logs:', logsError);
          throw logsError;
        }
        console.log(`Activity logs cleared for ${platformName} devices`);
      }

      // Step 2: Delete ALL energy usage for these devices
      if (deviceIds.length > 0) {
        console.log('Deleting energy usage for device IDs:', deviceIds);
        const { error: energyError } = await supabase
          .from('energy_usage')
          .delete()
          .in('device_id', deviceIds);

        if (energyError) {
          console.error('Error deleting energy usage:', energyError);
          throw energyError;
        }
        console.log(`Energy usage cleared for ${platformName} devices`);
      }

      // Step 3: Delete ALL the devices for this platform
      const { error: deleteDevicesError } = await supabase
        .from('smart_home_devices')
        .delete()
        .eq('platform_id', platformId);

      if (deleteDevicesError) {
        console.error('Error deleting devices:', deleteDevicesError);
        throw deleteDevicesError;
      }
      console.log(`${platformName} devices deleted`);

      // Step 4: Finally delete the platform
      const { error: deletePlatformError } = await supabase
        .from('smart_home_platforms')
        .delete()
        .eq('id', platformId);

      if (deletePlatformError) {
        console.error('Error deleting platform:', deletePlatformError);
        throw deletePlatformError;
      }
      console.log(`${platformName} platform deleted`);

      toast({
        title: "Platform Removed",
        description: `${platformName} and all associated data has been removed successfully.`,
      });

      // Refresh the page to show the updated state
      window.location.reload();
    } catch (error) {
      console.error(`Error removing ${platformName}:`, error);
      toast({
        title: "Error",
        description: `Failed to remove ${platformName}. Please try again.`,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4 mb-6">
      <Button 
        variant="destructive" 
        onClick={clearAllPlatformData}
        className="w-full"
      >
        <AlertTriangle className="w-4 h-4 mr-2" />
        Clear All Platform Data
      </Button>
      
      <Button 
        variant="outline" 
        onClick={() => clearSpecificPlatform('SmartThings')}
        className="w-full border-orange-500 text-orange-600 hover:bg-orange-50"
      >
        <AlertTriangle className="w-4 h-4 mr-2" />
        Remove SmartThings Only
      </Button>
    </div>
  );
};
