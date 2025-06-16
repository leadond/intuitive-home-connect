
import { Card, CardContent } from "@/components/ui/card";
import { 
  Lightbulb, 
  Thermometer, 
  Shield, 
  Camera, 
  Lock, 
  Activity,
  Zap,
  Home
} from "lucide-react";

export const DashboardStats = () => {
  const stats = [
    {
      title: "Smart Lights",
      value: "24",
      subtitle: "18 on, 6 off",
      icon: Lightbulb,
      color: "text-yellow-400",
      bgColor: "bg-yellow-400/20"
    },
    {
      title: "Climate Control",
      value: "72°F",
      subtitle: "Auto mode",
      icon: Thermometer,
      color: "text-blue-400",
      bgColor: "bg-blue-400/20"
    },
    {
      title: "Security",
      value: "Armed",
      subtitle: "All sensors active",
      icon: Shield,
      color: "text-green-400",
      bgColor: "bg-green-400/20"
    },
    {
      title: "Cameras",
      value: "8",
      subtitle: "All recording",
      icon: Camera,
      color: "text-purple-400",
      bgColor: "bg-purple-400/20"
    },
    {
      title: "Smart Locks",
      value: "4",
      subtitle: "All locked",
      icon: Lock,
      color: "text-red-400",
      bgColor: "bg-red-400/20"
    },
    {
      title: "Energy Usage",
      value: "2.4kW",
      subtitle: "Below average",
      icon: Zap,
      color: "text-orange-400",
      bgColor: "bg-orange-400/20"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-blue-200 mb-1">{stat.title}</p>
              <p className="text-xs text-blue-300">{stat.subtitle}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
