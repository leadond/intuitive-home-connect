import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const ClearPlatformData = () => {
  const { toast } = useToast();

  const clearAllPlatformData = async () => {
    try {
      console.log('Starting complete platform data cleanup...');
      
      // Since we now have CASCADE DELETE, we can simply delete all platforms
      // and the database will automatically delete all related data
      const { error: platformsError } = await supabase
        .from('smart_home_platforms')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // This will delete all rows

      if (platformsError) {
        console.error('Error deleting all platforms:', platformsError);
        throw platformsError;
      }
      console.log('All platforms and related data cleared via CASCADE DELETE');

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
      
      // Get the platform ID
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

      // Simply delete the platform - CASCADE DELETE will handle all related data
      const { error: deletePlatformError } = await supabase
        .from('smart_home_platforms')
        .delete()
        .eq('id', platformId);

      if (deletePlatformError) {
        console.error('Error deleting platform:', deletePlatformError);
        throw deletePlatformError;
      }
      console.log(`${platformName} platform and all related data deleted via CASCADE DELETE`);

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
