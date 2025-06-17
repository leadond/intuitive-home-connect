
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Wifi, 
  CheckCircle, 
  XCircle, 
  Clock,
  Video,
  Globe,
  Shield,
  Activity
} from "lucide-react";
import { usePortScanner } from "@/hooks/usePortScanner";

interface PortScannerProps {
  defaultIp?: string;
}

export const PortScanner = ({ defaultIp = '' }: PortScannerProps) => {
  const [ipAddress, setIpAddress] = useState(defaultIp);
  const { scanPorts, isScanning, scanResults } = usePortScanner();

  const handleScan = () => {
    if (ipAddress.trim()) {
      scanPorts(ipAddress.trim());
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'closed':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'timeout':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const getServiceIcon = (service: string) => {
    if (service.includes('RTSP') || service.includes('RTMP')) {
      return <Video className="w-4 h-4 text-purple-400" />;
    }
    if (service.includes('HTTPS')) {
      return <Shield className="w-4 h-4 text-blue-400" />;
    }
    if (service.includes('HTTP')) {
      return <Globe className="w-4 h-4 text-green-400" />;
    }
    return <Wifi className="w-4 h-4 text-gray-400" />;
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Search className="w-5 h-5 mr-2 text-blue-400" />
          ReoLink Port Scanner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Input
            placeholder="Enter camera IP address (e.g., 192.168.0.115)"
            value={ipAddress}
            onChange={(e) => setIpAddress(e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder-white/50"
          />
          <Button
            onClick={handleScan}
            disabled={isScanning || !ipAddress.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isScanning ? (
              <Activity className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Search className="w-4 h-4 mr-2" />
            )}
            {isScanning ? 'Scanning...' : 'Scan'}
          </Button>
        </div>

        {scanResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-blue-200">Scan Results</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {scanResults.map((result) => (
                <div 
                  key={result.port}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {getServiceIcon(result.service)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm">Port {result.port}</span>
                        {result.hasVideo && (
                          <Badge variant="secondary" className="text-xs bg-purple-600 hover:bg-purple-700">
                            Video
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-blue-300">{result.service}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {result.responseTime && (
                      <span className="text-xs text-gray-400">
                        {result.responseTime}ms
                      </span>
                    )}
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(result.status)}
                      <span className="text-xs capitalize">{result.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {scanResults.filter(r => r.status === 'open' && r.hasVideo).length > 0 && (
              <div className="mt-4 p-3 rounded-lg bg-green-900/20 border border-green-500/20">
                <h5 className="text-sm font-medium text-green-400 mb-2">Video Ports Found</h5>
                <div className="text-xs text-green-300 space-y-1">
                  {scanResults
                    .filter(r => r.status === 'open' && r.hasVideo)
                    .map(r => (
                      <div key={r.port}>
                        • Port {r.port}: {r.service}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {isScanning && (
          <div className="text-center py-4">
            <Activity className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-400" />
            <p className="text-sm text-blue-300">Scanning ports...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
