
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Activity } from "lucide-react";

export const DeviceUsageChart = () => {
  const data = [
    { category: "Lighting", devices: 24, activeHours: 168 },
    { category: "Climate", devices: 6, activeHours: 720 },
    { category: "Security", devices: 12, activeHours: 672 },
    { category: "Entertainment", devices: 8, activeHours: 45 },
    { category: "Locks", devices: 4, activeHours: 12 },
    { category: "Cameras", devices: 8, activeHours: 720 }
  ];

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="w-5 h-5 mr-2 text-blue-400" />
          Device Usage by Category
        </CardTitle>
        <CardDescription className="text-blue-200">
          Total active hours this month by device type
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="category" 
                stroke="#93c5fd"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
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
                formatter={(value, name) => [
                  `${value} hours`,
                  name === "activeHours" ? "Active Hours" : name
                ]}
              />
              <Bar 
                dataKey="activeHours" 
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
