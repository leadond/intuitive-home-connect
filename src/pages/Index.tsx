import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Settings, 
  BarChart3, 
  Lightbulb, 
  Shield, 
  Thermometer,
  Camera,
  Lock,
  Wifi,
  Activity,
  LogOut,
  User,
  RefreshCw,
  Power,
  AlertTriangle
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardStats } from "@/components/DashboardStats";
import { DeviceQuickActions } from "@/components/DeviceQuickActions";
import { RecentActivity } from "@/components/RecentActivity";
import { SmartThingsSync } from "@/components/SmartThingsSync";
import { KonnectedSync } from "@/components/KonnectedSync";
import { ReoLinkSync } from "@/components/ReoLinkSync";
import { DeleteAromatherapyDevice } from "@/components/DeleteArromatherapyDevice";
import { useSmartHomeData } from "@/hooks/useSmartHomeData";
import { SmartHomePlatform } from "@/hooks/useSmartHomeData";
import { DebugPanel } from "@/components/DebugPanel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [isInitialized, setIsInitialized] = useState(false);
  const [platforms, setPlatforms] = useState<SmartHomePlatform[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [showTurnOffDialog, setShowTurnOffDialog] = useState(false);
  
  // Initialize the hook outside of any conditions to maintain hook order
  const smartHomeData = useSmartHomeData();
  
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
    
    if (!loading && user) {
      setIsInitialized(true);
    }
  }, [user, loading, navigate]);
  
  // Use the data from smartHomeData only when initialized
  useEffect(() => {
    if (isInitialized && smartHomeData) {
      console.log('Index - Setting platforms from smartHomeData:', smartHomeData.platforms);
      setPlatforms(smartHomeData.platforms);
    }
  }, [isInitialized, smartHomeData?.platforms]);

  const handleRefreshData = async () => {
    if (!smartHomeData || isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      console.log('Manually refreshing all data...');
      await smartHomeData.fetchAllData();
      console.log('Data refresh complete');
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleTurnOffAllLights = async () => {
    setShowTurnOffDialog(true);
  };

  const confirmTurnOffAllLights = async () => {
    if (!smartHomeData) return;
    
    try {
      const lightDevices = smartHomeData.devices.filter(device => 
        device.device_type === 'light' && device.status?.state === 'on'
      );
      
      for (const device of lightDevices) {
        await smartHomeData.toggleDeviceState(device);
      }
      
      // Log a single activity for turning off all lights
      await smartHomeData.logActivity(
        null,
        null,
        'all_lights_off',
        'All lights turned off',
        { count: lightDevices.length }
      );
      
      setShowTurnOffDialog(false);
    } catch (error) {
      console.error('Error turning off all lights:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!user || !isInitialized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Delete aromatherapy device component - runs once on load */}
      <DeleteAromatherapyDevice />
      
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg flex items-center justify-center">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">SmartHub Pro</h1>
              <p className="text-blue-200 text-sm">Unified Smart Home Control</p>
            </div>
          </div>
          <nav className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              className="text-white hover:bg-white/10" 
              onClick={handleRefreshData}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10"
              onClick={() => setShowDebug(!showDebug)}
            >
              <Shield className="w-4 h-4 mr-2" />
              {showDebug ? "Hide Debug" : "Debug"}
            </Button>
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10"
              onClick={handleTurnOffAllLights}
            >
              <Power className="w-4 h-4 mr-2" />
              Turn All Lights Off
            </Button>
            <div className="flex items-center space-x-2 text-white">
              <User className="w-4 h-4" />
              <span className="text-sm">{user.email}</span>
            </div>
            <Link to="/admin">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <Settings className="w-4 h-4 mr-2" />
                Admin
              </Button>
            </Link>
            <Link to="/reports">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <BarChart3 className="w-4 h-4 mr-2" />
                Reports
              </Button>
            </Link>
            <Button variant="ghost" className="text-white hover:bg-white/10" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-blue-200">Your smart home is running smoothly. Here's what's happening.</p>
        </div>

        {/* Debug Panel (conditionally shown) */}
        {showDebug && (
          <div className="mb-8">
            <DebugPanel />
          </div>
        )}

        {/* Dashboard Stats */}
        <DashboardStats />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Device Quick Actions */}
          <div className="lg:col-span-2">
            <DeviceQuickActions />
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <RecentActivity />
          </div>
        </div>

        {/* Platform Management Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <SmartThingsSync />
          <KonnectedSync />
          <ReoLinkSync />
        </div>

        {/* Platform Status */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wifi className="w-5 h-5 mr-2 text-green-400" />
              Connected Platforms
            </CardTitle>
            <CardDescription className="text-blue-200">
              Integration status across all your smart home platforms
              {platforms.length > 0 ? ` (${platforms.length} platforms found)` : ' (No platforms found)'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {platforms.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-blue-300 mb-4">No platforms connected yet</p>
                <Link to="/admin">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Settings className="w-4 h-4 mr-2" />
                    Connect Platforms
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {platforms.map((platform) => (
                  <div key={platform.id} className="text-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200">
                    <Badge 
                      variant={platform.is_connected ? "default" : "secondary"}
                      className={platform.is_connected ? "bg-green-600 hover:bg-green-600" : ""}
                    >
                      {platform.is_connected ? "connected" : "disconnected"}
                    </Badge>
                    <div className="mt-2">
                      <p className="font-medium text-sm">{platform.platform_name}</p>
                      <p className="text-xs text-blue-200">
                        {platform.last_sync ? `Last sync: ${new Date(platform.last_sync).toLocaleDateString()}` : 'Never synced'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Turn Off All Lights Confirmation Dialog */}
      <Dialog open={showTurnOffDialog} onOpenChange={setShowTurnOffDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Turn Off All Lights
            </DialogTitle>
            <DialogDescription className="text-blue-200">
              Are you sure you want to turn off all lights in your home?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTurnOffDialog(false)} className="border-white/20 text-white hover:bg-white/10">
              Cancel
            </Button>
            <Button onClick={confirmTurnOffAllLights} className="bg-red-600 hover:bg-red-700">
              Turn Off All Lights
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
