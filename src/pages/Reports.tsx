
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  Home, 
  TrendingUp, 
  TrendingDown,
  Zap,
  Clock,
  Calendar,
  Download
} from "lucide-react";
import { Link } from "react-router-dom";
import { EnergyChart } from "@/components/EnergyChart";
import { DeviceUsageChart } from "@/components/DeviceUsageChart";
import { SecurityReport } from "@/components/SecurityReport";

const Reports = () => {
  const insights = [
    {
      title: "Energy Savings",
      value: "$127",
      change: "+15%",
      period: "vs last month",
      trend: "up",
      icon: Zap,
      color: "text-green-400"
    },
    {
      title: "Device Uptime",
      value: "99.2%",
      change: "+0.3%",
      period: "vs last month",
      trend: "up",
      icon: Clock,
      color: "text-blue-400"
    },
    {
      title: "Automation Triggers",
      value: "1,247",
      change: "-8%",
      period: "vs last month",
      trend: "down",
      icon: Calendar,
      color: "text-purple-400"
    }
  ];

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
              <BarChart3 className="w-5 h-5 text-green-400" />
              <h1 className="text-xl font-bold text-white">Analytics & Reports</h1>
            </div>
          </div>
          <Button className="bg-green-600 hover:bg-green-700">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Smart Home Analytics</h2>
          <p className="text-blue-200">Insights and metrics from your connected devices and automations.</p>
        </div>

        {/* Key Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {insights.map((insight, index) => (
            <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-white/10`}>
                    <insight.icon className={`w-6 h-6 ${insight.color}`} />
                  </div>
                  <Badge className={insight.trend === "up" ? "bg-green-600 hover:bg-green-600" : "bg-red-600 hover:bg-red-600"}>
                    {insight.trend === "up" ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {insight.change}
                  </Badge>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white mb-1">{insight.value}</p>
                  <p className="text-sm text-blue-200">{insight.title}</p>
                  <p className="text-xs text-blue-300">{insight.period}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <EnergyChart />
          <DeviceUsageChart />
        </div>

        {/* Security Report */}
        <SecurityReport />

        {/* Detailed Reports */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
              <CardTitle>Platform Performance</CardTitle>
              <CardDescription className="text-blue-200">
                Response times and reliability by platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { platform: "Lutron", responseTime: "120ms", uptime: "99.8%", status: "excellent" },
                  { platform: "SmartThings", responseTime: "340ms", uptime: "98.2%", status: "good" },
                  { platform: "ecobee", responseTime: "580ms", uptime: "97.1%", status: "fair" },
                  { platform: "ReoLink", responseTime: "890ms", uptime: "96.8%", status: "poor" }
                ].map((platform, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div>
                      <p className="font-medium">{platform.platform}</p>
                      <p className="text-sm text-blue-300">Uptime: {platform.uptime}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{platform.responseTime}</p>
                      <Badge 
                        className={
                          platform.status === "excellent" ? "bg-green-600 hover:bg-green-600" :
                          platform.status === "good" ? "bg-blue-600 hover:bg-blue-600" :
                          platform.status === "fair" ? "bg-yellow-600 hover:bg-yellow-600" :
                          "bg-red-600 hover:bg-red-600"
                        }
                      >
                        {platform.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
              <CardTitle>Top Automations</CardTitle>
              <CardDescription className="text-blue-200">
                Most frequently triggered automations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Evening Lighting", triggers: 247, efficiency: "95%" },
                  { name: "Security Arm/Disarm", triggers: 186, efficiency: "98%" },
                  { name: "Climate Schedule", triggers: 124, efficiency: "92%" },
                  { name: "Morning Routine", triggers: 98, efficiency: "89%" }
                ].map((automation, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div>
                      <p className="font-medium">{automation.name}</p>
                      <p className="text-sm text-blue-300">{automation.triggers} triggers this month</p>
                    </div>
                    <Badge className="bg-blue-600 hover:bg-blue-600">
                      {automation.efficiency}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Reports;
