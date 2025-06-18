import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Zap } from "lucide-react";

export const EnergyChart = () => {
  const data = [
    { time: "00:00", usage: 2.1, solar: 0 },
    { time: "04:00", usage: 1.8, solar: 0 },
    { time: "08:00", usage: 3.2, solar: 1.2 },
    { time: "12:00", usage: 2.8, solar: 4.5 },
    { time: "16:00", usage: 3.1, solar: 3.8 },
    { time: "20:00", usage: 4.2, solar: 0.5 },
    { time: "24:00", usage: 2.4, solar: 0 }
  ];

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Zap className="w-5 h-5 mr-2 text-yellow-400" />
          Energy Usage vs Solar Production
        </CardTitle>
        <CardDescription className="text-blue-200">
          24-hour energy consumption and solar generation (kW)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="time" 
                stroke="#93c5fd"
                fontSize={12}
              />
              <YAxis 
                stroke="#93c5fd"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  color: "#ffffff"
                }}
              />
              <Line 
                type="monotone" 
                dataKey="usage" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="Usage (kW)"
              />
              <Line 
                type="monotone" 
                dataKey="solar" 
                stroke="#22c55e" 
                strokeWidth={2}
                name="Solar (kW)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
