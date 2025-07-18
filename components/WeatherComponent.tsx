'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  Wind, 
  Droplets, 
  Thermometer,
  Eye,
  MapPin,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WeatherData {
  location: {
    name: string;
    country: string;
  };
  current: {
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    visibility: number;
    feelsLike: number;
    uvIndex: number;
  };
  forecast?: {
    date: string;
    high: number;
    low: number;
    condition: string;
  }[];
}

interface GeolocationCoords {
  latitude: number;
  longitude: number;
}

const WEATHER_ICONS = {
  'clear': Sun,
  'sunny': Sun,
  'partly-cloudy': Cloud,
  'cloudy': Cloud,
  'overcast': Cloud,
  'rain': CloudRain,
  'drizzle': CloudRain,
  'snow': CloudSnow,
  'thunderstorm': CloudLightning,
  'fog': Cloud,
  'mist': Cloud,
} as const;

const DEMO_WEATHER: WeatherData = {
  location: {
    name: 'Demo Location',
    country: 'Earth',
  },
  current: {
    temperature: 22,
    condition: 'Partly Cloudy',
    humidity: 65,
    windSpeed: 12,
    visibility: 10,
    feelsLike: 24,
    uvIndex: 5,
  },
};

export default function WeatherComponent() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<GeolocationCoords | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);

  // Get weather icon component
  const getWeatherIcon = useCallback((condition: string) => {
    const normalizedCondition = condition.toLowerCase();
    
    if (normalizedCondition.includes('rain') || normalizedCondition.includes('drizzle')) {
      return CloudRain;
    }
    if (normalizedCondition.includes('snow')) {
      return CloudSnow;
    }
    if (normalizedCondition.includes('thunder') || normalizedCondition.includes('storm')) {
      return CloudLightning;
    }
    if (normalizedCondition.includes('cloud')) {
      return Cloud;
    }
    if (normalizedCondition.includes('clear') || normalizedCondition.includes('sunny')) {
      return Sun;
    }
    
    return Cloud; // Default
  }, []);

  // Get user's location
  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      setWeather(DEMO_WEATHER);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setError(null);
      },
      (error) => {
        console.warn('Geolocation error:', error);
        setError('Unable to get your location. Showing demo data.');
        setWeather(DEMO_WEATHER);
        setLoading(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  }, []);

  // Fetch weather data
  const fetchWeather = useCallback(async (coords: GeolocationCoords) => {
    try {
      setLoading(true);
      setError(null);

      // Since we don't have a real API key, we'll simulate weather data
      // In a real app, you would call a weather API like OpenWeatherMap
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

      // Generate realistic weather data based on location
      const mockWeather: WeatherData = {
        location: {
          name: 'Your Location',
          country: 'Local',
        },
        current: {
          temperature: Math.round(15 + Math.random() * 20), // 15-35°C
          condition: ['Clear', 'Partly Cloudy', 'Cloudy', 'Light Rain'][Math.floor(Math.random() * 4)],
          humidity: Math.round(40 + Math.random() * 40), // 40-80%
          windSpeed: Math.round(5 + Math.random() * 20), // 5-25 km/h
          visibility: Math.round(8 + Math.random() * 7), // 8-15 km
          feelsLike: Math.round(15 + Math.random() * 20), // Similar to temperature
          uvIndex: Math.round(1 + Math.random() * 10), // 1-11
        },
      };

      setWeather(mockWeather);
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError('Failed to fetch weather data. Showing demo data.');
      setWeather(DEMO_WEATHER);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize component
  useEffect(() => {
    setMounted(true);
    getUserLocation();
  }, [getUserLocation]);

  // Fetch weather when location is available
  useEffect(() => {
    if (location && mounted) {
      fetchWeather(location);
    }
  }, [location, mounted, fetchWeather]);

  // Refresh weather data
  const handleRefresh = useCallback(() => {
    if (location) {
      fetchWeather(location);
    } else {
      getUserLocation();
    }
  }, [location, fetchWeather, getUserLocation]);

  if (!mounted) {
    return <WeatherSkeleton />;
  }

  if (loading) {
    return <WeatherSkeleton />;
  }

  if (!weather) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Unable to load weather data. Please try again.
            </AlertDescription>
          </Alert>
          <Button onClick={handleRefresh} className="w-full mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const WeatherIcon = getWeatherIcon(weather.current.condition);

  return (
    <Card className="w-full max-w-md bg-card/50 backdrop-blur-sm border border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="truncate">{weather.location.name}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="h-8 w-8 p-0"
            disabled={loading}
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert className="py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Current Weather */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <WeatherIcon className="w-12 h-12 text-primary" />
            <div>
              <div className="text-3xl font-bold tabular-nums">
                {weather.current.temperature}°C
              </div>
              <div className="text-sm text-muted-foreground">
                {weather.current.condition}
              </div>
            </div>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <div>Feels like</div>
            <div className="font-semibold">{weather.current.feelsLike}°C</div>
          </div>
        </div>

        {/* Weather Details */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/50">
          <div className="flex items-center space-x-2">
            <Droplets className="w-4 h-4 text-blue-500" />
            <div className="text-sm">
              <div className="text-muted-foreground">Humidity</div>
              <div className="font-semibold">{weather.current.humidity}%</div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Wind className="w-4 h-4 text-gray-500" />
            <div className="text-sm">
              <div className="text-muted-foreground">Wind</div>
              <div className="font-semibold">{weather.current.windSpeed} km/h</div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4 text-purple-500" />
            <div className="text-sm">
              <div className="text-muted-foreground">Visibility</div>
              <div className="font-semibold">{weather.current.visibility} km</div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Sun className="w-4 h-4 text-yellow-500" />
            <div className="text-sm">
              <div className="text-muted-foreground">UV Index</div>
              <div className="font-semibold">{weather.current.uvIndex}</div>
            </div>
          </div>
        </div>

        {/* Location Info */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border/50">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
}

function WeatherSkeleton() {
  return (
    <Card className="w-full max-w-md bg-card/50 backdrop-blur-sm border border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-muted animate-pulse rounded" />
            <div className="h-5 w-24 bg-muted animate-pulse rounded" />
          </div>
          <div className="w-8 h-8 bg-muted animate-pulse rounded" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-muted animate-pulse rounded" />
            <div className="space-y-2">
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-16 bg-muted animate-pulse rounded" />
            <div className="h-4 w-12 bg-muted animate-pulse rounded" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-muted animate-pulse rounded" />
              <div className="space-y-1">
                <div className="h-3 w-12 bg-muted animate-pulse rounded" />
                <div className="h-4 w-8 bg-muted animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}