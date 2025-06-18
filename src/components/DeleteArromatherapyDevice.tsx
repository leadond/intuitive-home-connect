import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const DeleteAromatherapyDevice = () => {
  const { toast } = useToast();

  useEffect(() => {
    const deleteAromatherapyDevice = async () => {
      try {
        console.log('Searching for Aromatherapy machine to delete...');
        
        // Find the aromatherapy device
        const { data: devices, error: fetchError } = await supabase
          .from('smart_home_devices')
          .select('*')
          .ilike('device_name', '%aromatherapy%');

        if (fetchError) {
          console.error('Error fetching aromatherapy device:', fetchError);
          return;
        }

        if (devices && devices.length > 0) {
          console.log(`Found ${devices.length} aromatherapy device(s) to delete:`, devices);
          
          for (const device of devices) {
            // Delete the device
            const { error: deleteError } = await supabase
              .from('smart_home_devices')
              .delete()
              .eq('id', device.id);

            if (deleteError) {
              console.error('Error deleting aromatherapy device:', deleteError);
            } else {
              console.log(`Successfully deleted aromatherapy device: ${device.device_name}`);
              toast({
                title: "Device Removed",
                description: `${device.device_name} has been removed from your smart home.`,
              });
            }
          }
        } else {
          console.log('No aromatherapy devices found to delete');
        }
      } catch (error) {
        console.error('Error in delete operation:', error);
      }
    };

    deleteAromatherapyDevice();
  }, [toast]);

  return null; // This component doesn't render anything
};
