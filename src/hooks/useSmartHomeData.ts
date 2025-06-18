import { useState, useEffect } from 'react';

// Define types for smart home data
export interface SmartHomeDevice {
  id: string;
  device_name: string;
  device_type: string;
  room: string;
  manufacturer: string;
  model?: string;
  capabilities?: {
    dimmable?: boolean;
    color_control?: boolean;
    energy_monitoring?: boolean;
    ptz?: boolean;
    modes?: string[];
  };
  status?: {
    state?: string;
    brightness?: number;
    color?: string;
    target_temperature?: number;
    current_temperature?: number;
    humidity?: number;
    mode?: string;
    battery?: number;
    power_consumption?: number;
    energy_usage?: number;
    connected_device?: string;
    last_activity?: string;
    security_level?: string;
    resolution?: string;
    stream_url?: string;
    night_vision?: string;
    temperature?: number;
    vehicle_present?: boolean;
  };
}

// Mock data for smart home devices
const mockDevices: SmartHomeDevice[] = [
  // Living Room Lights
  {
    id: 'light-1',
    device_name: 'Living Room Main Light',
    device_type: 'light',
    room: 'Living Room',
    manufacturer: 'Philips Hue',
    capabilities: {
      dimmable: true,
      color_control: true
    },
    status: {
      state: 'on',
      brightness: 80,
      color: '#ffffff'
    }
  },
  {
    id: 'light-2',
    device_name: 'Living Room Lamp',
    device_type: 'light',
    room: 'Living Room',
    manufacturer: 'LIFX',
    capabilities: {
      dimmable: true,
      color_control: true
    },
    status: {
      state: 'on',
      brightness: 60,
      color: '#fff5e0'
    }
  },
  
  // Kitchen Lights
  {
    id: 'light-3',
    device_name: 'Kitchen Ceiling Light',
    device_type: 'light',
    room: 'Kitchen',
    manufacturer: 'Philips Hue',
    capabilities: {
      dimmable: true,
      color_control: false
    },
    status: {
      state: 'on',
      brightness: 100
    }
  },
  {
    id: 'light-4',
    device_name: 'Kitchen Counter Light',
    device_type: 'light',
    room: 'Kitchen',
    manufacturer: 'IKEA Tradfri',
    capabilities: {
      dimmable: true,
      color_control: false
    },
    status: {
      state: 'off',
      brightness: 70
    }
  },
  
  // Bedroom Lights
  {
    id: 'light-5',
    device_name: 'Bedroom Main Light',
    device_type: 'light',
    room: 'Bedroom',
    manufacturer: 'Philips Hue',
    capabilities: {
      dimmable: true,
      color_control: true
    },
    status: {
      state: 'off',
      brightness: 50,
      color: '#f5e1ff'
    }
  },
  {
    id: 'light-6',
    device_name: 'Bedside Lamp',
    device_type: 'light',
    room: 'Bedroom',
    manufacturer: 'LIFX',
    capabilities: {
      dimmable: true,
      color_control: true
    },
    status: {
      state: 'on',
      brightness: 30,
      color: '#ff9e80'
    }
  },
  
  // Bathroom Light
  {
    id: 'light-7',
    device_name: 'Bathroom Light',
    device_type: 'light',
    room: 'Bathroom',
    manufacturer: 'IKEA Tradfri',
    capabilities: {
      dimmable: true,
      color_control: false
    },
    status: {
      state: 'off',
      brightness: 100
    }
  },
  
  // Hallway Light
  {
    id: 'light-8',
    device_name: 'Hallway Light',
    device_type: 'light',
    room: 'Hallway',
    manufacturer: 'Philips Hue',
    capabilities: {
      dimmable: true,
      color_control: false
    },
    status: {
      state: 'off',
      brightness: 70
    }
  },
  
  // Outdoor Lights
  {
    id: 'light-9',
    device_name: 'Porch Light',
    device_type: 'light',
    room: 'Outdoor',
    manufacturer: 'Philips Hue Outdoor',
    capabilities: {
      dimmable: true,
      color_control: false
    },
    status: {
      state: 'on',
      brightness: 90
    }
  },
  {
    id: 'light-10',
    device_name: 'Garden Lights',
    device_type: 'light',
    room: 'Outdoor',
    manufacturer: 'Philips Hue Outdoor',
    capabilities: {
      dimmable: true,
      color_control: true
    },
    status: {
      state: 'on',
      brightness: 70,
      color: '#80ffaa'
    }
  },
  
  // Thermostats
  {
    id: 'thermostat-1',
    device_name: 'Living Room Thermostat',
    device_type: 'thermostat',
    room: 'Living Room',
    manufacturer: 'Nest',
    capabilities: {
      modes: ['cool', 'heat', 'auto', 'off']
    },
    status: {
      mode: 'cool',
      target_temperature: 72,
      current_temperature: 74,
      humidity: 45
    }
  },
  {
    id: 'thermostat-2',
    device_name: 'Bedroom Thermostat',
    device_type: 'thermostat',
    room: 'Bedroom',
    manufacturer: 'Ecobee',
    capabilities: {
      modes: ['cool', 'heat', 'auto', 'off']
    },
    status: {
      mode: 'auto',
      target_temperature: 70,
      current_temperature: 71,
      humidity: 42
    }
  },
  
  // Smart Locks
  {
    id: 'lock-1',
    device_name: 'Front Door Lock',
    device_type: 'lock',
    room: 'Entrance',
    manufacturer: 'August',
    status: {
      state: 'locked',
      battery: 85,
      last_activity: '2023-06-15T08:30:00Z',
      security_level: 'High'
    }
  },
  {
    id: 'lock-2',
    device_name: 'Back Door Lock',
    device_type: 'lock',
    room: 'Back Entrance',
    manufacturer: 'Schlage',
    status: {
      state: 'locked',
      battery: 65,
      last_activity: '2023-06-14T22:15:00Z'
    }
  },
  
  // Smart Plugs
  {
    id: 'plug-1',
    device_name: 'Living Room TV Plug',
    device_type: 'plug',
    room: 'Living Room',
    manufacturer: 'TP-Link Kasa',
    capabilities: {
      energy_monitoring: true
    },
    status: {
      state: 'on',
      power_consumption: 120,
      energy_usage: 0.8,
      connected_device: 'TV'
    }
  },
  {
    id: 'plug-2',
    device_name: 'Kitchen Coffee Maker',
    device_type: 'plug',
    room: 'Kitchen',
    manufacturer: 'Wemo',
    capabilities: {
      energy_monitoring: true
    },
    status: {
      state: 'off',
      power_consumption: 0,
      energy_usage: 0.2,
      connected_device: 'Coffee Maker'
    }
  },
  {
    id: 'plug-3',
    device_name: 'Bedroom Fan',
    device_type: 'plug',
    room: 'Bedroom',
    manufacturer: 'TP-Link Kasa',
    status: {
      state: 'on',
      connected_device: 'Fan'
    }
  },
  {
    id: 'plug-4',
    device_name: 'Office Computer',
    device_type: 'plug',
    room: 'Office',
    manufacturer: 'Wemo',
    capabilities: {
      energy_monitoring: true
    },
    status: {
      state: 'on',
      power_consumption: 210,
      energy_usage: 1.5,
      connected_device: 'Computer'
    }
  },
  
  // Cameras
  {
    id: 'camera-1',
    device_name: 'Front Door Camera',
    device_type: 'camera_view',
    room: 'Entrance',
    manufacturer: 'Ring',
    capabilities: {
      ptz: false
    },
    status: {
      state: 'on',
      resolution: '1080p',
      stream_url: 'https://demo.reolink.com/api/play.cgi?lang=en&token=e4631a5031b04b5&stream=1',
      night_vision: 'auto'
    }
  },
  {
    id: 'camera-2',
    device_name: 'Backyard Camera',
    device_type: 'camera_view',
    room: 'Outdoor',
    manufacturer: 'Reolink',
    capabilities: {
      ptz: true
    },
    status: {
      state: 'on',
      resolution: '4K',
      stream_url: 'https://demo.reolink.com/api/play.cgi?lang=en&token=e4631a5031b04b5&stream=1',
      night_vision: 'on'
    }
  },
  {
    id: 'camera-3',
    device_name: 'Garage Camera',
    device_type: 'camera_view',
    room: 'Garage',
    manufacturer: 'Arlo',
    capabilities: {
      ptz: false
    },
    status: {
      state: 'on',
      resolution: '2K',
      stream_url: 'https://demo.reolink.com/api/play.cgi?lang=en&token=e4631a5031b04b5&stream=1',
      night_vision: 'auto',
      battery: 75
    }
  },
  
  // Sensors
  {
    id: 'sensor-1',
    device_name: 'Living Room Motion Sensor',
    device_type: 'motion_sensor',
    room: 'Living Room',
    manufacturer: 'SmartThings',
    status: {
      state: 'inactive',
      battery: 90,
      last_activity: '2023-06-15T10:45:00Z'
    }
  },
  {
    id: 'sensor-2',
    device_name: 'Front Door Contact Sensor',
    device_type: 'contact_sensor',
    room: 'Entrance',
    manufacturer: 'SmartThings',
    status: {
      state: 'closed',
      battery: 85,
      last_activity: '2023-06-15T08:30:00Z'
    }
  },
  {
    id: 'sensor-3',
    device_name: 'Kitchen Temperature Sensor',
    device_type: 'temperature_sensor',
    room: 'Kitchen',
    manufacturer: 'Aqara',
    status: {
      state: 'active',
      temperature: 73,
      humidity: 48,
      battery: 92
    }
  },
  {
    id: 'sensor-4',
    device_name: 'Bathroom Humidity Sensor',
    device_type: 'humidity_sensor',
    room: 'Bathroom',
    manufacturer: 'Aqara',
    status: {
      state: 'active',
      humidity: 65,
      temperature: 74,
      battery: 88
    }
  },
  {
    id: 'sensor-5',
    device_name: 'Bedroom Motion Sensor',
    device_type: 'motion_sensor',
    room: 'Bedroom',
    manufacturer: 'Philips Hue',
    status: {
      state: 'inactive',
      battery: 78,
      last_activity: '2023-06-15T07:20:00Z'
    }
  },
  {
    id: 'sensor-6',
    device_name: 'Window Contact Sensor',
    device_type: 'contact_sensor',
    room: 'Living Room',
    manufacturer: 'SmartThings',
    status: {
      state: 'closed',
      battery: 92,
      last_activity: '2023-06-14T21:10:00Z'
    }
  },
  {
    id: 'sensor-7',
    device_name: 'Office Temperature Sensor',
    device_type: 'temperature_sensor',
    room: 'Office',
    manufacturer: 'Aqara',
    status: {
      state: 'active',
      temperature: 72,
      humidity: 45,
      battery: 95
    }
  },
  
  // Garage Door
  {
    id: 'garage-1',
    device_name: 'Garage Door',
    device_type: 'garage_door',
    room: 'Garage',
    manufacturer: 'Chamberlain MyQ',
    status: {
      state: 'closed',
      last_activity: '2023-06-15T08:00:00Z',
      vehicle_present: true
    }
  },
  
  // Additional devices
  {
    id: 'light-11',
    device_name: 'Office Desk Lamp',
    device_type: 'light',
    room: 'Office',
    manufacturer: 'LIFX',
    capabilities: {
      dimmable: true,
      color_control: true
    },
    status: {
      state: 'on',
      brightness: 80,
      color: '#f0f8ff'
    }
  },
  {
    id: 'light-12',
    device_name: 'Dining Room Light',
    device_type: 'light',
    room: 'Dining Room',
    manufacturer: 'Philips Hue',
    capabilities: {
      dimmable: true,
      color_control: false
    },
    status: {
      state: 'off',
      brightness: 90
    }
  },
  {
    id: 'thermostat-3',
    device_name: 'Office Thermostat',
    device_type: 'thermostat',
    room: 'Office',
    manufacturer: 'Nest',
    capabilities: {
      modes: ['cool', 'heat', 'auto', 'off']
    },
    status: {
      mode: 'heat',
      target_temperature: 68,
      current_temperature: 67,
      humidity: 40
    }
  },
  {
    id: 'plug-5',
    device_name: 'Bedroom Humidifier',
    device_type: 'plug',
    room: 'Bedroom',
    manufacturer: 'TP-Link Kasa',
    capabilities: {
      energy_monitoring: true
    },
    status: {
      state: 'on',
      power_consumption: 45,
      energy_usage: 0.3,
      connected_device: 'Humidifier'
    }
  },
  {
    id: 'sensor-8',
    device_name: 'Garage Motion Sensor',
    device_type: 'motion_sensor',
    room: 'Garage',
    manufacturer: 'SmartThings',
    status: {
      state: 'inactive',
      battery: 82,
      last_activity: '2023-06-15T08:05:00Z'
    }
  },
  {
    id: 'sensor-9',
    device_name: 'Back Door Contact Sensor',
    device_type: 'contact_sensor',
    room: 'Back Entrance',
    manufacturer: 'SmartThings',
    status: {
      state: 'closed',
      battery: 88,
      last_activity: '2023-06-15T07:45:00Z'
    }
  }
];

export const useSmartHomeData = () => {
  const [devices, setDevices] = useState<SmartHomeDevice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch devices on component mount
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setDevices(mockDevices);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to fetch smart home devices');
        setIsLoading(false);
      }
    };

    fetchDevices();
  }, []);

  // Toggle device state (on/off, locked/unlocked, open/closed)
  const toggleDeviceState = async (device: SmartHomeDevice): Promise<void> => {
    console.log(`Toggling device state for: ${device.id}`);
    setIsUpdating(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update device state based on device type
      const updatedDevices = devices.map(d => {
        if (d.id === device.id) {
          const updatedDevice = { ...d };
          
          if (d.device_type === 'light' || d.device_type === 'plug') {
            updatedDevice.status = {
              ...updatedDevice.status,
              state: updatedDevice.status?.state === 'on' ? 'off' : 'on'
            };
          } else if (d.device_type === 'lock') {
            updatedDevice.status = {
              ...updatedDevice.status,
              state: updatedDevice.status?.state === 'locked' ? 'unlocked' : 'locked',
              last_activity: new Date().toISOString()
            };
          } else if (d.device_type === 'garage_door') {
            updatedDevice.status = {
              ...updatedDevice.status,
              state: updatedDevice.status?.state === 'open' ? 'closed' : 'open',
              last_activity: new Date().toISOString()
            };
          }
          
          return updatedDevice;
        }
        return d;
      });
      
      setDevices(updatedDevices);
    } catch (err) {
      setError('Failed to toggle device state');
      throw new Error('Failed to toggle device state');
    } finally {
      setIsUpdating(false);
    }
  };

  // Set light brightness
  const setDeviceBrightness = async (device: SmartHomeDevice, brightness: number): Promise<void> => {
    console.log(`Setting brightness for ${device.id} to ${brightness}`);
    setIsUpdating(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedDevices = devices.map(d => {
        if (d.id === device.id && d.device_type === 'light') {
          return {
            ...d,
            status: {
              ...d.status,
              brightness
            }
          };
        }
        return d;
      });
      
      setDevices(updatedDevices);
    } catch (err) {
      setError('Failed to set device brightness');
      throw new Error('Failed to set device brightness');
    } finally {
      setIsUpdating(false);
    }
  };

  // Set light color
  const setDeviceColor = async (device: SmartHomeDevice, color: string): Promise<void> => {
    console.log(`Setting color for ${device.id} to ${color}`);
    setIsUpdating(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedDevices = devices.map(d => {
        if (d.id === device.id && d.device_type === 'light') {
          return {
            ...d,
            status: {
              ...d.status,
              color
            }
          };
        }
        return d;
      });
      
      setDevices(updatedDevices);
    } catch (err) {
      setError('Failed to set device color');
      throw new Error('Failed to set device color');
    } finally {
      setIsUpdating(false);
    }
  };

  // Set thermostat temperature
  const setThermostatTemperature = async (device: SmartHomeDevice, temperature: number): Promise<void> => {
    console.log(`Setting temperature for ${device.id} to ${temperature}`);
    setIsUpdating(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedDevices = devices.map(d => {
        if (d.id === device.id && d.device_type === 'thermostat') {
          return {
            ...d,
            status: {
              ...d.status,
              target_temperature: temperature
            }
          };
        }
        return d;
      });
      
      setDevices(updatedDevices);
    } catch (err) {
      setError('Failed to set thermostat temperature');
      throw new Error('Failed to set thermostat temperature');
    } finally {
      setIsUpdating(false);
    }
  };

  // Set thermostat mode
  const setThermostatMode = async (device: SmartHomeDevice, mode: string): Promise<void> => {
    console.log(`Setting mode for ${device.id} to ${mode}`);
    setIsUpdating(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedDevices = devices.map(d => {
        if (d.id === device.id && d.device_type === 'thermostat') {
          return {
            ...d,
            status: {
              ...d.status,
              mode
            }
          };
        }
        return d;
      });
      
      setDevices(updatedDevices);
    } catch (err) {
      setError('Failed to set thermostat mode');
      throw new Error('Failed to set thermostat mode');
    } finally {
      setIsUpdating(false);
    }
  };

  // Execute PTZ command for camera
  const executePtzCommand = async (device: SmartHomeDevice, command: string): Promise<void> => {
    console.log(`Executing PTZ command ${command} for ${device.id}`);
    setIsUpdating(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real implementation, this would send the command to the camera
      // For mock purposes, we'll just update the last_activity timestamp
      const updatedDevices = devices.map(d => {
        if (d.id === device.id && d.device_type === 'camera_view') {
          return {
            ...d,
            status: {
              ...d.status,
              last_activity: new Date().toISOString()
            }
          };
        }
        return d;
      });
      
      setDevices(updatedDevices);
    } catch (err) {
      setError('Failed to execute PTZ command');
      throw new Error('Failed to execute PTZ command');
    } finally {
      setIsUpdating(false);
    }
  };

  // Set night vision mode for camera
  const setNightVisionMode = async (device: SmartHomeDevice, mode: string): Promise<void> => {
    console.log(`Setting night vision mode for ${device.id} to ${mode}`);
    setIsUpdating(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedDevices = devices.map(d => {
        if (d.id === device.id && d.device_type === 'camera_view') {
          return {
            ...d,
            status: {
              ...d.status,
              night_vision: mode
            }
          };
        }
        return d;
      });
      
      setDevices(updatedDevices);
    } catch (err) {
      setError('Failed to set night vision mode');
      throw new Error('Failed to set night vision mode');
    } finally {
      setIsUpdating(false);
    }
  };

  // Turn off all lights
  const turnOffAllLights = async (): Promise<void> => {
    console.log('Turning off all lights');
    setIsUpdating(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedDevices = devices.map(d => {
        if (d.device_type === 'light' && d.status?.state === 'on') {
          return {
            ...d,
            status: {
              ...d.status,
              state: 'off'
            }
          };
        }
        return d;
      });
      
      setDevices(updatedDevices);
    } catch (err) {
      setError('Failed to turn off all lights');
      throw new Error('Failed to turn off all lights');
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    devices,
    isLoading,
    isUpdating,
    error,
    toggleDeviceState,
    setDeviceBrightness,
    setDeviceColor,
    setThermostatTemperature,
    setThermostatMode,
    executePtzCommand,
    setNightVisionMode,
    turnOffAllLights
  };
};
