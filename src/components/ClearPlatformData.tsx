
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const ClearPlatformData = () => {
  const { toast } = useToast();

  const clearAllPlatformData = async () => {
    try {
      console.log('Starting platform data cleanup...');
      
      // Get all devices first to ensure we have the IDs
      const { data: allDevices, error: devicesListError } = await supabase
        .from('smart_home_devices')
        .select('id');

      if (devicesListError) {
        console.error('Error fetching devices:', devicesListError);
        throw devicesListError;
      }

      const deviceIds = allDevices?.map(device => device.id) || [];
      console.log('Found devices:', deviceIds.length);

      // Step 1: Delete ALL activity logs first
      if (deviceIds.length > 0) {
        const { error: logsError } = await supabase
          .from('device_activity_logs')
          .delete()
          .in('device_id', deviceIds);

        if (logsError) {
          console.error('Error deleting activity logs:', logsError);
          throw logsError;
        }
        console.log('Activity logs cleared for devices');
      }

      // Also delete any orphaned activity logs
      const { error: allLogsError } = await supabase
        .from('device_activity_logs')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (allLogsError) {
        console.error('Error deleting all activity logs:', allLogsError);
        throw allLogsError;
      }
      console.log('All activity logs cleared');

      // Step 2: Delete ALL energy usage data
      if (deviceIds.length > 0) {
        const { error: energyError } = await supabase
          .from('energy_usage')
          .delete()
          .in('device_id', deviceIds);

        if (energyError) {
          console.error('Error deleting energy usage:', energyError);
          throw energyError;
        }
        console.log('Energy usage cleared for devices');
      }

      // Also delete any orphaned energy usage
      const { error: allEnergyError } = await supabase
        .from('energy_usage')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (allEnergyError) {
        console.error('Error deleting all energy usage:', allEnergyError);
        throw allEnergyError;
      }
      console.log('All energy usage data cleared');

      // Step 3: Delete ALL devices
      const { error: devicesError } = await supabase
        .from('smart_home_devices')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (devicesError) {
        console.error('Error deleting devices:', devicesError);
        throw devicesError;
      }
      console.log('All devices cleared');

      // Step 4: Finally delete ALL platforms
      const { error: platformsError } = await supabase
        .from('smart_home_platforms')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (platformsError) {
        console.error('Error deleting platforms:', platformsError);
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

      if (deviceIds.length > 0) {
        // Delete ALL activity logs for these devices
        const { error: logsError } = await supabase
          .from('device_activity_logs')
          .delete()
          .in('device_id', deviceIds);

        if (logsError) {
          console.error('Error deleting activity logs:', logsError);
          throw logsError;
        }
        console.log(`Activity logs cleared for ${platformName} devices`);

        // Delete ALL energy usage for these devices
        const { error: energyError } = await supabase
          .from('energy_usage')
          .delete()
          .in('device_id', deviceIds);

        if (energyError) {
          console.error('Error deleting energy usage:', energyError);
          throw energyError;
        }
        console.log(`Energy usage cleared for ${platformName} devices`);

        // Delete ALL the devices
        const { error: deleteDevicesError } = await supabase
          .from('smart_home_devices')
          .delete()
          .eq('platform_id', platformId);

        if (deleteDevicesError) {
          console.error('Error deleting devices:', deleteDevicesError);
          throw deleteDevicesError;
        }
        console.log(`${platformName} devices deleted`);
      }

      // Finally delete the platform
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
