
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
  Sparkles,
  Zap
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardStats } from "@/components/DashboardStats";
import { DeviceQuickActions } from "@/components/DeviceQuickActions";
import { RecentActivity } from "@/components/RecentActivity";
import { useSmartHomeData } from "@/hooks/useSmartHomeData";

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const { platforms } = useSmartHomeData();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Ccircle cx="7" cy="7" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] animate-pulse"></div>
        <div className="relative">
          <div className="animate-spin rounded-full h-32 w-32 border-4 border-blue-400/30 border-t-blue-400"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-32 w-32 border-4 border-blue-400/20"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.02"%3E%3Ccircle cx="7" cy="7" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10 animate-pulse"></div>
      
      {/* Floating orbs */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-blue-400/20 rounded-full blur-xl animate-bounce"></div>
      <div className="absolute bottom-20 right-20 w-24 h-24 bg-purple-400/20 rounded-full blur-xl animate-bounce" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-10 w-16 h-16 bg-cyan-400/20 rounded-full blur-xl animate-bounce" style={{ animationDelay: '2s' }}></div>

      {/* Header */}
      <header className="relative border-b border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Home className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/50 to-purple-400/50 rounded-xl blur-sm animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-300 via-cyan-300 to-purple-300 bg-clip-text text-transparent">
                SmartHub Pro
              </h1>
              <p className="text-blue-200 text-sm flex items-center">
                <Sparkles className="w-3 h-3 mr-1" />
                Unified Smart Home Control
              </p>
            </div>
          </div>
          <nav className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-white bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20">
              <User className="w-4 h-4 text-blue-300" />
              <span className="text-sm font-medium">{user.email}</span>
            </div>
            <Link to="/admin">
              <Button variant="ghost" className="text-white hover:bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105">
                <Settings className="w-4 h-4 mr-2" />
                Admin
              </Button>
            </Link>
            <Link to="/reports">
              <Button variant="ghost" className="text-white hover:bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105">
                <BarChart3 className="w-4 h-4 mr-2" />
                Reports
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              className="text-white hover:bg-red-500/20 backdrop-blur-sm border border-red-400/20 hover:border-red-400/40 transition-all duration-300 hover:scale-105" 
              onClick={signOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="relative container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent mb-4">
            Welcome Back
          </h2>
          <p className="text-blue-200 text-lg flex items-center justify-center">
            <Zap className="w-5 h-5 mr-2 text-blue-400" />
            Your smart home is running smoothly. Here's what's happening.
          </p>
        </div>

        {/* Dashboard Stats */}
        <div className="mb-8">
          <DashboardStats />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
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
        <Card className="bg-white/5 backdrop-blur-xl border-white/20 text-white shadow-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-b border-white/10">
            <CardTitle className="flex items-center">
              <div className="relative">
                <Wifi className="w-6 h-6 mr-3 text-green-400" />
                <div className="absolute -inset-1 bg-green-400/30 rounded-full blur-sm animate-pulse"></div>
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent">
                  Connected Platforms
                </span>
                <div className="text-xs text-green-200 mt-1">Integration Status Dashboard</div>
              </div>
            </CardTitle>
            <CardDescription className="text-blue-200">
              Integration status across all your smart home platforms
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {platforms.length === 0 ? (
              <div className="text-center py-12">
                <div className="mb-6">
                  <Wifi className="w-16 h-16 mx-auto text-blue-400 opacity-50" />
                </div>
                <p className="text-blue-300 mb-6 text-lg">No platforms connected yet</p>
                <Link to="/admin">
                  <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-400/30">
                    <Settings className="w-4 h-4 mr-2" />
                    Connect Platforms
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {platforms.map((platform, index) => (
                  <div 
                    key={platform.id} 
                    className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 hover:border-white/40 transition-all duration-500 hover:scale-105 hover:shadow-xl p-4 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Status indicator */}
                    <div className={`absolute top-0 left-0 right-0 h-1 ${
                      platform.is_connected ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-red-400 to-rose-500'
                    } transition-all duration-500`}></div>
                    
                    <div className="text-center">
                      <Badge 
                        variant={platform.is_connected ? "default" : "secondary"}
                        className={`mb-3 ${
                          platform.is_connected 
                            ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-400/30" 
                            : "bg-gradient-to-r from-gray-500 to-gray-600 shadow-lg shadow-gray-400/30"
                        } transition-all duration-300 border-0`}
                      >
                        {platform.is_connected ? "connected" : "disconnected"}
                      </Badge>
                      <div>
                        <p className="font-bold text-white text-lg group-hover:text-blue-200 transition-colors duration-300">
                          {platform.platform_name}
                        </p>
                        <p className="text-xs text-blue-200/80 mt-1">
                          {platform.last_sync ? `Last sync: ${new Date(platform.last_sync).toLocaleDateString()}` : 'Never synced'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Index;
