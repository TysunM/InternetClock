'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" size="sm" className="w-10 h-10 p-0">
        <div className="w-4 h-4 bg-muted animate-pulse rounded" />
      </Button>
    );
  }

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    if (theme === 'system') {
      return <Monitor className="w-4 h-4" />;
    }
    
    if (resolvedTheme === 'dark') {
      return <Moon className="w-4 h-4" />;
    }
    
    return <Sun className="w-4 h-4" />;
  };

  const getLabel = () => {
    if (theme === 'system') {
      return 'System theme';
    }
    
    if (resolvedTheme === 'dark') {
      return 'Dark theme';
    }
    
    return 'Light theme';
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={cycleTheme}
      className={cn(
        "w-10 h-10 p-0 transition-all duration-200",
        "hover:scale-105 active:scale-95"
      )}
      title={getLabel()}
      aria-label={getLabel()}
    >
      <div className="transition-transform duration-200 hover:rotate-12">
        {getIcon()}
      </div>
    </Button>
  );
}