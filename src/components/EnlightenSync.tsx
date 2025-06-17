
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Zap, Sun, Battery, TrendingUp, Loader2 } from "lucide-react";
import { useEnlightenSync } from "@/hooks/useEnlightenSync";
import { useSmartHomeData } from "@/hooks/useSmartHomeData";

export const EnlightenSync = () => {
  const { platforms } = useSmartHomeData();
  const { syncEnlightenData, isLoading, devices, systemInfo, stats } = useEnlightenSync();

  const enlightenPlatform = platforms.find(p => p.platform_name === 'Enlighten');

  if (!enlightenPlatform) {
    return (
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sun className="w-5 h-5 mr-2 text-yellow-400" />
            Enlighten Solar Integration
          </CardTitle>
          <CardDescription className="text-blue-200">
            Connect your Enphase solar system to monitor energy production
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-blue-300">Please connect your Enlighten platform first in the Admin section.</p>
        </CardContent>
      </Card>
    );
  }

  const handleSync = () => {
    syncEnlightenData(enlightenPlatform.id);
  };

  const getTodayStats = () => {
    if (!stats?.intervals.length) return null;
    
    const today = stats.intervals.slice(-24);
    const totalEnergyToday = today.reduce((sum, interval) => sum + interval.enwh, 0) / 1000; // Convert to kWh
    const currentPower = today[today.length - 1]?.powr || 0;
    const peakPower = Math.max(...today.map(i => i.powr));
    
    return {
      totalEnergyToday: totalEnergyToday.toFixed(1),
      currentPower: (currentPower / 1000).toFixed(2),
      peakPower: (peakPower / 1000).toFixed(2)
    };
  };

  const todayStats = getTodayStats();

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Sun className="w-5 h-5 mr-2 text-yellow-400" />
              <div>
                <CardTitle>Enlighten Solar System</CardTitle>
                <CardDescription className="text-blue-200">
                  {systemInfo?.system_name || 'Solar Energy Monitoring'}
                </CardDescription>
              </div>
            </div>
            {enlightenPlatform.is_connected && (
              <Badge className="bg-green-600 hover:bg-green-600">
                Connected
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Button 
              onClick={handleSync}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Sync Solar Data
                </>
              )}
            </Button>
            
            {systemInfo && (
              <div className="text-sm text-blue-200">
                Last updated: {new Date(systemInfo.summary_date).toLocaleDateString()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {systemInfo && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-200">Current Power</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {todayStats?.currentPower || (systemInfo.current_power / 1000).toFixed(2)} kW
                  </p>
                </div>
                <Zap className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-200">Energy Today</p>
                  <p className="text-2xl font-bold text-green-400">
                    {todayStats?.totalEnergyToday || systemInfo.energy_today} kWh
                  </p>
                </div>
                <Sun className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-200">Lifetime Energy</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {(systemInfo.energy_lifetime / 1000).toFixed(1)} MWh
                  </p>
                </div>
                <Battery className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {devices.length > 0 && (
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
              Solar Inverters ({devices.length})
            </CardTitle>
            <CardDescription className="text-blue-200">
              Individual microinverter performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {devices.map((device, index) => (
                <div key={device.id} className="p-4 rounded-lg bg-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium">Inverter {device.serial_number.slice(-4)}</p>
                      <p className="text-sm text-blue-300">{device.model}</p>
                    </div>
                    <Badge className={
                      device.status === 'normal' ? "bg-green-600 hover:bg-green-600" : 
                      device.status === 'comm' ? "bg-yellow-600 hover:bg-yellow-600" :
                      "bg-red-600 hover:bg-red-600"
                    }>
                      {device.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-blue-300">Max Power</p>
                      <p className="font-medium">{device.max_power}W</p>
                    </div>
                    <div>
                      <p className="text-blue-300">Today</p>
                      <p className="font-medium">{device.energy_today} kWh</p>
                    </div>
                    <div>
                      <p className="text-blue-300">Lifetime</p>
                      <p className="font-medium">{device.energy_lifetime} kWh</p>
                    </div>
                    <div>
                      <p className="text-blue-300">Efficiency</p>
                      <p className="font-medium">
                        {((device.energy_today / (device.max_power / 1000)) * 100 / 8).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-blue-300">Performance</span>
                      <span>{((device.energy_today / (device.max_power / 1000)) * 100 / 8).toFixed(0)}%</span>
                    </div>
                    <Progress 
                      value={Math.min(100, (device.energy_today / (device.max_power / 1000)) * 100 / 8)} 
                      className="h-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {stats && (
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
          <CardHeader>
            <CardTitle>Production Statistics</CardTitle>
            <CardDescription className="text-blue-200">
              24-hour power generation overview
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <p className="text-sm text-blue-300">Peak Power</p>
                <p className="text-lg font-bold text-yellow-400">
                  {todayStats?.peakPower} kW
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-blue-300">Avg. Reporting</p>
                <p className="text-lg font-bold text-green-400">
                  {Math.round(stats.intervals.reduce((sum, i) => sum + i.devices_reporting, 0) / stats.intervals.length)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-blue-300">System Status</p>
                <p className="text-lg font-bold text-blue-400">
                  {systemInfo?.status || 'Normal'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-blue-300">Timezone</p>
                <p className="text-lg font-bold text-white">
                  {systemInfo?.timezone?.split('/')[1] || 'Local'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
