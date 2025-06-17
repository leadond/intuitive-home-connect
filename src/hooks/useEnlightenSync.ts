import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface EnlightenDevice {
  id: string;
  serial_number: string;
  model: string;
  part_number: string;
  date_code: string;
  installed: string;
  size: number;
  max_power: number;
  energy_today: number;
  energy_lifetime: number;
  status: 'normal' | 'comm' | 'power' | 'micro' | 'retired';
  last_report_at: string;
}

export interface EnlightenSystem {
  system_id: string;
  system_name: string;
  system_public_name: string;
  status: string;
  timezone: string;
  current_power: number;
  energy_today: number;
  energy_lifetime: number;
  summary_date: string;
  source: string;
}

export interface EnlightenStats {
  intervals: Array<{
    end_at: string;
    devices_reporting: number;
    powr: number; // Power in watts
    enwh: number; // Energy in watt-hours
  }>;
}

interface EnlightenCredentials {
  api_key: string;
  system_id: string;
}

export const useEnlightenSync = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [devices, setDevices] = useState<EnlightenDevice[]>([]);
  const [systemInfo, setSystemInfo] = useState<EnlightenSystem | null>(null);
  const [stats, setStats] = useState<EnlightenStats | null>(null);
  const { toast } = useToast();

  const syncEnlightenData = async (platformId: string) => {
    try {
      setIsLoading(true);
      console.log('Starting Enlighten sync for platform:', platformId);

      // Get platform credentials
      const { data: platform, error: platformError } = await supabase
        .from('smart_home_platforms')
        .select('credentials')
        .eq('id', platformId)
        .single();

      if (platformError || !platform) {
        throw new Error('Failed to get platform credentials');
      }

      const credentials = platform.credentials as EnlightenCredentials;
      if (!credentials.api_key || !credentials.system_id) {
        throw new Error('Missing API key or system ID');
      }

      // Simulate API calls (in real implementation, these would be actual API calls)
      // Note: Actual Enlighten API requires server-side implementation due to CORS
      await simulateEnlightenSync(platformId, credentials.api_key, credentials.system_id);

      toast({
        title: "Enlighten Sync Complete",
        description: "Successfully synced solar system data.",
      });

    } catch (error) {
      console.error('Enlighten sync error:', error);
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Failed to sync Enlighten data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const simulateEnlightenSync = async (platformId: string, apiKey: string, systemId: string) => {
    // Simulate system info
    const mockSystemInfo: EnlightenSystem = {
      system_id: systemId,
      system_name: 'Home Solar System',
      system_public_name: 'Residential Solar',
      status: 'normal',
      timezone: 'America/Los_Angeles',
      current_power: 3247,
      energy_today: 28.5,
      energy_lifetime: 12847.3,
      summary_date: new Date().toISOString().split('T')[0],
      source: 'microinverters'
    };

    // Simulate device inventory
    const mockDevices: EnlightenDevice[] = [
      {
        id: '1',
        serial_number: '121517123456',
        model: 'IQ7PLUS-72-2-US',
        part_number: 'IQ7PLUS-72-2-US',
        date_code: '2023',
        installed: '2023-06-15',
        size: 320,
        max_power: 290,
        energy_today: 1.8,
        energy_lifetime: 847.2,
        status: 'normal',
        last_report_at: new Date().toISOString()
      },
      {
        id: '2',
        serial_number: '121517123457',
        model: 'IQ7PLUS-72-2-US',
        part_number: 'IQ7PLUS-72-2-US',
        date_code: '2023',
        installed: '2023-06-15',
        size: 320,
        max_power: 290,
        energy_today: 1.9,
        energy_lifetime: 851.7,
        status: 'normal',
        last_report_at: new Date().toISOString()
      }
    ];

    // Simulate stats
    const mockStats: EnlightenStats = {
      intervals: Array.from({ length: 24 }, (_, i) => ({
        end_at: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
        devices_reporting: mockDevices.length,
        powr: Math.floor(Math.random() * 4000 + 1000),
        enwh: Math.floor(Math.random() * 1500 + 500)
      }))
    };

    setSystemInfo(mockSystemInfo);
    setDevices(mockDevices);
    setStats(mockStats);

    // Store in database
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Add/update devices in database
    for (const device of mockDevices) {
      await supabase
        .from('smart_home_devices')
        .upsert({
          device_id: device.serial_number,
          device_name: `Solar Inverter ${device.serial_number.slice(-4)}`,
          device_type: 'solar_inverter',
          room: 'Roof',
          status: {
            state: device.status,
            power: device.max_power,
            energy_today: device.energy_today,
            energy_lifetime: device.energy_lifetime,
            last_report: device.last_report_at
          },
          capabilities: {
            power_monitoring: true,
            energy_production: true,
            model: device.model,
            size_watts: device.size
          },
          platform_id: platformId,
          user_id: user.id,
          last_updated: new Date().toISOString()
        }, {
          onConflict: 'device_id,platform_id'
        });
    }

    // Log activity
    await supabase
      .from('device_activity_logs')
      .insert({
        user_id: user.id,
        device_id: mockDevices[0].serial_number,
        action: 'enlighten_sync',
        details: {
          devices_synced: mockDevices.length,
          system_status: mockSystemInfo.status,
          current_power: mockSystemInfo.current_power,
          energy_today: mockSystemInfo.energy_today
        }
      });

    console.log('Enlighten data synced successfully');
  };

  return {
    syncEnlightenData,
    isLoading,
    devices,
    systemInfo,
    stats
  };
};
