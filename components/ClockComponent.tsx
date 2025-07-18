'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Settings, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClockProps {
  className?: string;
}

interface TimeState {
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
}

const TIMEZONES = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'New York' },
  { value: 'America/Los_Angeles', label: 'Los Angeles' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
  { value: 'Asia/Shanghai', label: 'Shanghai' },
  { value: 'Australia/Sydney', label: 'Sydney' },
] as const;

const CLOCK_THEMES = [
  { value: 'modern', label: 'Modern', className: 'bg-gradient-to-br from-blue-500 to-purple-600' },
  { value: 'classic', label: 'Classic', className: 'bg-gradient-to-br from-amber-500 to-orange-600' },
  { value: 'minimal', label: 'Minimal', className: 'bg-gradient-to-br from-gray-500 to-gray-700' },
  { value: 'neon', label: 'Neon', className: 'bg-gradient-to-br from-pink-500 to-cyan-500' },
] as const;

export default function ClockComponent({ className }: ClockProps) {
  const [time, setTime] = useState<TimeState>({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });
  const [timezone, setTimezone] = useState<string>('UTC');
  const [format24h, setFormat24h] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [clockTheme, setClockTheme] = useState<string>('modern');
  const [mounted, setMounted] = useState<boolean>(false);

  // Update time with high precision
  const updateTime = useCallback(() => {
    const now = new Date();
    const timeInTimezone = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
    
    setTime({
      hours: timeInTimezone.getHours(),
      minutes: timeInTimezone.getMinutes(),
      seconds: timeInTimezone.getSeconds(),
      milliseconds: timeInTimezone.getMilliseconds(),
    });
  }, [timezone]);

  // Initialize component
  useEffect(() => {
    setMounted(true);
    updateTime();
    
    // Detect user's timezone
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (TIMEZONES.some(tz => tz.value === userTimezone)) {
      setTimezone(userTimezone);
    }
  }, [updateTime]);

  // Timer effect
  useEffect(() => {
    if (!mounted) return;

    const interval = setInterval(updateTime, 100); // Update every 100ms for smooth seconds hand
    return () => clearInterval(interval);
  }, [mounted, updateTime]);

  // Memoized calculations
  const clockAngles = useMemo(() => {
    const secondAngle = (time.seconds + time.milliseconds / 1000) * 6; // 360/60 = 6 degrees per second
    const minuteAngle = (time.minutes + time.seconds / 60) * 6; // 360/60 = 6 degrees per minute
    const hourAngle = ((time.hours % 12) + time.minutes / 60) * 30; // 360/12 = 30 degrees per hour

    return { secondAngle, minuteAngle, hourAngle };
  }, [time]);

  const formattedTime = useMemo(() => {
    if (!mounted) return '00:00:00';
    
    const hours = format24h ? time.hours : time.hours % 12 || 12;
    const ampm = format24h ? '' : time.hours >= 12 ? ' PM' : ' AM';
    
    return `${hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}:${time.seconds.toString().padStart(2, '0')}${ampm}`;
  }, [time, format24h, mounted]);

  const formattedDate = useMemo(() => {
    if (!mounted) return '';
    
    const now = new Date();
    const dateInTimezone = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
    
    return dateInTimezone.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: timezone,
    });
  }, [timezone, time.seconds, mounted]); // Update date every second to handle timezone changes

  const currentTheme = CLOCK_THEMES.find(theme => theme.value === clockTheme) || CLOCK_THEMES[0];

  if (!mounted) {
    return (
      <div className="flex flex-col items-center space-y-6">
        <div className="w-64 h-64 rounded-full bg-muted animate-pulse" />
        <div className="h-12 w-48 bg-muted animate-pulse rounded" />
        <div className="h-6 w-32 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center space-y-6", className)}>
      {/* Settings Toggle */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center space-x-2"
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </Button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <Card className="p-4 w-full max-w-md space-y-4 animate-slide-in">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center space-x-2">
              <Globe className="w-4 h-4" />
              <span>Timezone</span>
            </label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Clock Theme</label>
            <Select value={clockTheme} onValueChange={setClockTheme}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CLOCK_THEMES.map((theme) => (
                  <SelectItem key={theme.value} value={theme.value}>
                    {theme.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="format24h"
              checked={format24h}
              onChange={(e) => setFormat24h(e.target.checked)}
              className="rounded border-border"
            />
            <label htmlFor="format24h" className="text-sm font-medium">
              24-hour format
            </label>
          </div>
        </Card>
      )}

      {/* Analog Clock */}
      <div className="relative">
        <div 
          className={cn(
            "w-64 h-64 rounded-full border-8 border-white/20 shadow-2xl relative overflow-hidden",
            currentTheme.className
          )}
        >
          {/* Clock face gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
          
          {/* Hour markers */}
          {Array.from({ length: 12 }, (_, i) => (
            <div
              key={i}
              className="absolute w-1 h-6 bg-white/80 rounded-full"
              style={{
                top: '10px',
                left: '50%',
                transformOrigin: '50% 118px',
                transform: `translateX(-50%) rotate(${i * 30}deg)`,
              }}
            />
          ))}

          {/* Minute markers */}
          {Array.from({ length: 60 }, (_, i) => {
            if (i % 5 !== 0) {
              return (
                <div
                  key={i}
                  className="absolute w-0.5 h-3 bg-white/40 rounded-full"
                  style={{
                    top: '15px',
                    left: '50%',
                    transformOrigin: '50% 113px',
                    transform: `translateX(-50%) rotate(${i * 6}deg)`,
                  }}
                />
              );
            }
            return null;
          })}

          {/* Hour hand */}
          <div
            className="absolute w-1.5 h-16 bg-white rounded-full shadow-lg will-change-transform"
            style={{
              bottom: '50%',
              left: '50%',
              transformOrigin: '50% 100%',
              transform: `translateX(-50%) rotate(${clockAngles.hourAngle}deg)`,
              transition: 'transform 0.5s ease-out',
            }}
          />

          {/* Minute hand */}
          <div
            className="absolute w-1 h-20 bg-white rounded-full shadow-lg will-change-transform"
            style={{
              bottom: '50%',
              left: '50%',
              transformOrigin: '50% 100%',
              transform: `translateX(-50%) rotate(${clockAngles.minuteAngle}deg)`,
              transition: 'transform 0.5s ease-out',
            }}
          />

          {/* Second hand */}
          <div
            className="absolute w-0.5 h-24 bg-red-400 rounded-full shadow-lg will-change-transform"
            style={{
              bottom: '50%',
              left: '50%',
              transformOrigin: '50% 100%',
              transform: `translateX(-50%) rotate(${clockAngles.secondAngle}deg)`,
              transition: 'transform 0.1s ease-out',
            }}
          />

          {/* Center dot */}
          <div className="absolute w-4 h-4 bg-white rounded-full shadow-lg top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Digital Time Display */}
      <div className="text-center space-y-2">
        <div className="text-4xl sm:text-5xl font-mono font-bold text-foreground tabular-nums">
          {formattedTime}
        </div>
        <div className="text-lg text-muted-foreground">
          {formattedDate}
        </div>
        <div className="text-sm text-muted-foreground flex items-center justify-center space-x-1">
          <Globe className="w-4 h-4" />
          <span>{TIMEZONES.find(tz => tz.value === timezone)?.label || timezone}</span>
        </div>
      </div>
    </div>
  );
}