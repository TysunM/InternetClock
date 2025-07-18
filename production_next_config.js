/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
  // Performance optimizations
  compress: true,
  productionBrowserSourceMaps: false,
  optimizeFonts: true,
  swcMinify: true,
  poweredByHeader: false,
  generateEtags: true, // Enable for better caching
  reactStrictMode: true, // Essential for production

  // Enhanced experimental features for Next.js 15
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    webVitalsAttribution: ['CLS', 'LCP', 'FID', 'FCP', 'TTFB'],
    optimizeCss: true,
    serverComponentsExternalPackages: [], // For external packages
    typedRoutes: true, // Type-safe routing
  },

  // Image optimization configuration - FIXED
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.openweathermap.org',
        port: '',
        pathname: '/data/**',
      },
      {
        protocol: 'https',
        hostname: 'openweathermap.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: false, // Ensure optimization is enabled
  },

  // Webpack configuration for performance - CORRECTED
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Handle SVG files optimally
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            memo: true,
            svgoConfig: {
              plugins: [
                { name: 'removeViewBox', active: false },
                { name: 'removeDimensions', active: true },
                { name: 'cleanupIds', active: true },
              ],
            },
          },
        },
      ],
    })

    // Advanced bundle optimization - FIXED
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          cacheGroups: {
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: -10,
              chunks: 'all',
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              enforce: true,
            },
            ui: {
              test: /[\\/]components[\\/][Uu]i[\\/]/,
              name: 'ui-components',
              chunks: 'all',
              priority: 10,
            },
            ads: {
              test: /[\\/]components[\\/].*Ad\.(jsx|tsx)$/,
              name: 'ad-components',
              chunks: 'all',
              priority: 5,
            },
            radix: {
              test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
              name: 'radix-ui',
              chunks: 'all',
              priority: 8,
            },
          },
        },
      }

      // Tree shaking optimization
      config.optimization.usedExports = true
      config.optimization.sideEffects = false
    }

    // Performance optimizations
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }

    return config
  },

  // Environment variables - SECURE
  env: {
    // Only expose non-sensitive variables
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version || '1.0.0',
  },

  // Enhanced security headers - PRODUCTION READY
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline';
              style-src 'self' 'unsafe-inline';
              img-src 'self' data: https:;
              font-src 'self';
              connect-src 'self' https://api.openweathermap.org;
            `.replace(/\s+/g, ' ').trim(),
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },

  // Compiler optimizations - ENHANCED
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
    reactRemoveProperties: process.env.NODE_ENV === 'production' ? {
      properties: ['^data-testid$'],
    } : false,
  },

  // SEO and performance redirects
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/clock',
        destination: '/',
        permanent: true,
      },
    ]
  },

  // API rewrites for better organization
  async rewrites() {
    return [
      {
        source: '/api/weather/:path*',
        destination: '/api/weather/:path*',
      },
    ]
  },

  // Build output optimization
  output: 'standalone',
  
  // TypeScript configuration - STRICT
  typescript: {
    ignoreBuildErrors: false,
    tsconfigPath: './tsconfig.json',
  },

  // ESLint configuration - ENFORCED
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['app', 'components', 'lib', 'hooks'],
  },

  // Development optimizations
  ...(process.env.NODE_ENV === 'development' && {
    experimental: {
      ...nextConfig.experimental,
      turbo: {
        rules: {
          '*.svg': {
            loaders: ['@svgr/webpack'],
            as: '*.js',
          },
        },
        resolveAlias: {
          '@': '.',
        },
      },
    },
    // Faster development builds
    webpack: (config, options) => {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
      return nextConfig.webpack(config, options)
    },
  }),

  // Static export configuration (if needed)
  trailingSlash: false,
  skipMiddlewareUrlNormalize: false,
  skipTrailingSlashRedirect: false,

  // Logging configuration
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // OnDemand optimization - ADJUSTED
  onDemandEntries: {
    maxInactiveAge: 60 * 1000, // Increased for better performance
    pagesBufferLength: 5,
  },

  // HTTP keep alive
  httpAgentOptions: {
    keepAlive: true,
  },
}

module.exports = withBundleAnalyzer(nextConfig)