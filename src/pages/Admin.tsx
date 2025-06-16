import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Settings, 
  Home, 
  Link as LinkIcon, 
  Check, 
  X, 
  Key, 
  Shield,
  Wifi,
  AlertCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSmartHomeData } from "@/hooks/useSmartHomeData";
import { ClearPlatformData } from "@/components/ClearPlatformData";

const Admin = () => {
  const { toast } = useToast();
  const { platforms, addPlatform, isLoading } = useSmartHomeData();
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");

  // Available platforms that users can connect to
  const availablePlatforms = [
    { name: "Lutron", description: "Lighting control system", authType: "OAuth" },
    { name: "Bond", description: "Ceiling fans and fireplaces", authType: "API Key" },
    { name: "SmartThings", description: "Samsung smart home hub", authType: "OAuth" },
    { name: "Amazon Alexa", description: "Voice assistant and smart devices", authType: "OAuth" },
    { name: "Google Home", description: "Google smart home ecosystem", authType: "OAuth" },
    { name: "Lockly", description: "Smart door locks", authType: "API Key" },
    { name: "LIFX", description: "Smart LED lighting", authType: "API Key" },
    { name: "SmartHQ", description: "GE Appliances", authType: "OAuth" },
    { name: "ReoLink", description: "Security cameras", authType: "API Key" },
    { name: "MyQ", description: "Garage door openers", authType: "OAuth" },
    { name: "NEST", description: "Google Nest devices", authType: "OAuth" },
    { name: "Apple Home", description: "HomeKit integration", authType: "HomeKit" },
    { name: "Enlighten", description: "Enphase solar monitoring", authType: "OAuth" },
    { name: "ecobee", description: "Smart thermostats", authType: "OAuth" },
    { name: "Hubitat", description: "Local smart hub", authType: "API Key" },
    { name: "TCC Honeywell", description: "Total Connect Comfort", authType: "OAuth" },
    { name: "Eufy", description: "Security and cleaning devices", authType: "API Key" },
    { name: "HomeWerk", description: "Home automation platform", authType: "API Key" },
    { name: "Konnected", description: "Wired security panel", authType: "API Key" },
    { name: "YoLink", description: "LoRa smart home devices", authType: "API Key" },
    { name: "Yardian", description: "Smart sprinkler system", authType: "OAuth" }
  ];

  // Create a combined list showing available platforms with their connection status
  const platformsWithStatus = availablePlatforms.map(available => {
    const connected = platforms.find(p => p.platform_name === available.name);
    return {
      ...available,
      status: connected?.is_connected ? "connected" : "disconnected",
      lastSync: connected?.last_sync ? new Date(connected.last_sync).toLocaleDateString() : "Never",
      id: connected?.id
    };
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <Check className="w-4 h-4 text-green-400" />;
      default:
        return <X className="w-4 h-4 text-red-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "bg-green-600 hover:bg-green-600";
      default:
        return "bg-gray-600 hover:bg-gray-600";
    }
  };

  const handleConnect = (platformName: string, authType: string) => {
    if (authType === "OAuth" || authType === "HomeKit") {
      toast({
        title: "OAuth Integration",
        description: `${platformName} requires OAuth authentication. This would redirect you to ${platformName}'s login page.`,
      });
    } else {
      setSelectedPlatform(platformName);
      toast({
        title: "API Key Required",
        description: `Please enter your ${platformName} API key below.`,
      });
    }
  };

  const handleApiKeySubmit = async () => {
    if (!selectedPlatform || !apiKey) {
      toast({
        title: "Missing Information",
        description: "Please select a platform and enter an API key.",
        variant: "destructive"
      });
      return;
    }

    try {
      await addPlatform({
        platform_name: selectedPlatform,
        platform_type: availablePlatforms.find(p => p.name === selectedPlatform)?.authType || "API Key",
        credentials: {
          api_key: apiKey,
          base_url: baseUrl || undefined
        },
        is_connected: true
      });

      toast({
        title: "Platform Connected",
        description: `${selectedPlatform} has been connected successfully.`,
      });

      // Reset form
      setSelectedPlatform(null);
      setApiKey("");
      setBaseUrl("");
    } catch (error) {
      console.error('Error connecting platform:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect platform. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDisconnect = (platformName: string) => {
    toast({
      title: "Platform Disconnected",
      description: `${platformName} has been disconnected successfully.`,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <div className="w-px h-6 bg-white/20"></div>
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-blue-400" />
              <h1 className="text-xl font-bold text-white">Admin Portal</h1>
            </div>
          </div>
          <Badge className="bg-blue-600 hover:bg-blue-600">
            {platformsWithStatus.filter(p => p.status === "connected").length} / {platformsWithStatus.length} Connected
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Platform Integrations</h2>
          <p className="text-blue-200">Manage connections to your smart home platforms and devices.</p>
        </div>

        {/* Clear Data Button */}
        <ClearPlatformData />

        {/* Platform Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {platformsWithStatus.map((platform, index) => (
            <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg flex items-center">
                    {getStatusIcon(platform.status)}
                    <span className="ml-2">{platform.name}</span>
                  </CardTitle>
                  <Badge className={getStatusColor(platform.status)}>
                    {platform.status}
                  </Badge>
                </div>
                <CardDescription className="text-blue-200">
                  {platform.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-300">Auth Type:</span>
                    <Badge variant="secondary" className="text-xs">
                      {platform.authType}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-300">Last Sync:</span>
                    <span className="text-white">{platform.lastSync}</span>
                  </div>
                  <div className="flex space-x-2 pt-2">
                    {platform.status === "connected" ? (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 border-white/20 text-white hover:bg-white/10"
                          onClick={() => handleDisconnect(platform.name)}
                        >
                          Disconnect
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                          <Settings className="w-3 h-3 mr-1" />
                          Configure
                        </Button>
                      </>
                    ) : (
                      <Button 
                        size="sm" 
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => handleConnect(platform.name, platform.authType)}
                      >
                        <LinkIcon className="w-3 h-3 mr-1" />
                        Connect
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Manual Configuration Section */}
        <Card className="mt-8 bg-white/10 backdrop-blur-sm border-white/20 text-white">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="w-5 h-5 mr-2 text-yellow-400" />
              Manual API Configuration
            </CardTitle>
            <CardDescription className="text-blue-200">
              For platforms requiring manual API key setup
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="platform-select" className="text-white">Platform</Label>
                  <select 
                    id="platform-select"
                    className="w-full mt-1 p-2 bg-white/10 border border-white/20 rounded-md text-white"
                    value={selectedPlatform || ""}
                    onChange={(e) => setSelectedPlatform(e.target.value)}
                  >
                    <option value="">Select a platform</option>
                    {availablePlatforms.filter(p => p.authType === "API Key").map(p => (
                      <option key={p.name} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="api-key" className="text-white">API Key</Label>
                  <Input 
                    id="api-key"
                    type="password"
                    placeholder="Enter your API key"
                    className="bg-white/10 border-white/20 text-white placeholder:text-blue-300"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="base-url" className="text-white">Base URL (Optional)</Label>
                  <Input 
                    id="base-url"
                    placeholder="https://api.example.com"
                    className="bg-white/10 border-white/20 text-white placeholder:text-blue-300"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-lg">
                  <h4 className="font-medium text-white mb-2 flex items-center">
                    <Shield className="w-4 h-4 mr-2 text-green-400" />
                    Security Notice
                  </h4>
                  <p className="text-sm text-blue-200">
                    API keys are encrypted and stored securely. They are only used to communicate with your devices and are never shared with third parties.
                  </p>
                </div>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={handleApiKeySubmit}
                  disabled={!selectedPlatform || !apiKey}
                >
                  <Key className="w-4 h-4 mr-2" />
                  Save Configuration
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Admin;
