import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Clock, CloudSun, Thermometer } from 'lucide-react';

// Dynamic imports for better performance
const ClockComponent = dynamic(() => import('@/components/ClockComponent'), {
  loading: () => <ClockSkeleton />,
  ssr: true,
});

const WeatherComponent = dynamic(() => import('@/components/WeatherComponent'), {
  loading: () => <WeatherSkeleton />,
  ssr: false, // Weather data is client-side only
});

const ThemeToggle = dynamic(() => import('@/components/ThemeToggle'), {
  loading: () => <div className="w-10 h-10 rounded-md bg-muted animate-pulse" />,
  ssr: false,
});

function ClockSkeleton() {
  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="w-64 h-64 rounded-full bg-muted animate-pulse" />
      <div className="h-12 w-48 bg-muted animate-pulse rounded" />
      <div className="h-6 w-32 bg-muted animate-pulse rounded" />
    </div>
  );
}

function WeatherSkeleton() {
  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-6 space-y-4">
      <div className="flex items-center space-x-2">
        <CloudSun className="w-5 h-5 text-muted-foreground" />
        <div className="h-5 w-20 bg-muted animate-pulse rounded" />
      </div>
      <div className="space-y-2">
        <div className="h-8 w-24 bg-muted animate-pulse rounded" />
        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
        <div className="h-4 w-28 bg-muted animate-pulse rounded" />
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 transition-colors duration-300">
      {/* Header */}
      <header className="relative z-10 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Clock className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Internet Clock</h1>
          </div>
          <Suspense fallback={<div className="w-10 h-10 rounded-md bg-muted animate-pulse" />}>
            <ThemeToggle />
          </Suspense>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
          
          {/* Clock Section */}
          <div className="lg:col-span-2 flex justify-center">
            <div className="w-full max-w-2xl">
              <Suspense fallback={<ClockSkeleton />}>
                <ClockComponent />
              </Suspense>
            </div>
          </div>

          {/* Weather Section */}
          <div className="space-y-6">
            <div className="text-center lg:text-left">
              <h2 className="text-xl font-semibold text-foreground mb-2 flex items-center justify-center lg:justify-start space-x-2">
                <Thermometer className="w-5 h-5 text-primary" />
                <span>Weather</span>
              </h2>
              <p className="text-muted-foreground text-sm">
                Current conditions for your location
              </p>
            </div>
            
            <Suspense fallback={<WeatherSkeleton />}>
              <WeatherComponent />
            </Suspense>
          </div>
        </div>

        {/* Features Section */}
        <section className="mt-16 sm:mt-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A modern clock application with beautiful design and useful features
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
              <Clock className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Real-time Clock</h3>
              <p className="text-muted-foreground text-sm">
                Accurate time display with smooth animations and multiple formats
              </p>
            </div>
            
            <div className="text-center p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
              <CloudSun className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Weather Integration</h3>
              <p className="text-muted-foreground text-sm">
                Current weather conditions based on your location
              </p>
            </div>
            
            <div className="text-center p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
              <Thermometer className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Multiple Themes</h3>
              <p className="text-muted-foreground text-sm">
                Light and dark themes with system preference detection
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            © 2025 Internet Clock. Built with Next.js and modern web technologies.
          </p>
        </div>
      </footer>
    </main>
  );
}