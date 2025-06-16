
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
  Activity
} from "lucide-react";
import { Link } from "react-router-dom";
import { DashboardStats } from "@/components/DashboardStats";
import { DeviceQuickActions } from "@/components/DeviceQuickActions";
import { RecentActivity } from "@/components/RecentActivity";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
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

        {/* Platform Status */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wifi className="w-5 h-5 mr-2 text-green-400" />
              Connected Platforms
            </CardTitle>
            <CardDescription className="text-blue-200">
              Integration status across all your smart home platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { name: "Lutron", status: "connected", devices: 12 },
                { name: "SmartThings", status: "connected", devices: 25 },
                { name: "Alexa", status: "connected", devices: 18 },
                { name: "Google Home", status: "connected", devices: 15 },
                { name: "LIFX", status: "connected", devices: 8 },
                { name: "Nest", status: "connected", devices: 6 },
                { name: "ecobee", status: "connected", devices: 3 },
                { name: "MyQ", status: "connected", devices: 2 },
                { name: "Lockly", status: "connected", devices: 4 },
                { name: "ReoLink", status: "connected", devices: 7 },
                { name: "Eufy", status: "connected", devices: 5 },
                { name: "Bond", status: "pending", devices: 0 }
              ].map((platform) => (
                <div key={platform.name} className="text-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200">
                  <Badge 
                    variant={platform.status === "connected" ? "default" : "secondary"}
                    className={platform.status === "connected" ? "bg-green-600 hover:bg-green-600" : ""}
                  >
                    {platform.status}
                  </Badge>
                  <div className="mt-2">
                    <p className="font-medium text-sm">{platform.name}</p>
                    <p className="text-xs text-blue-200">{platform.devices} devices</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Index;
