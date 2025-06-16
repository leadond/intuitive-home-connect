
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const ClearPlatformData = () => {
  const { toast } = useToast();

  const clearAllPlatformData = async () => {
    try {
      // Clear all smart home platforms
      const { error: platformsError } = await supabase
        .from('smart_home_platforms')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

      if (platformsError) throw platformsError;

      // Clear all devices
      const { error: devicesError } = await supabase
        .from('smart_home_devices')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

      if (devicesError) throw devicesError;

      // Clear all activity logs
      const { error: logsError } = await supabase
        .from('device_activity_logs')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

      if (logsError) throw logsError;

      toast({
        title: "Data Cleared",
        description: "All platform and device data has been cleared. You can now connect platforms fresh.",
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

  return (
    <Button 
      variant="destructive" 
      onClick={clearAllPlatformData}
      className="mb-6"
    >
      <AlertTriangle className="w-4 h-4 mr-2" />
      Clear All Platform Data
    </Button>
  );
};
