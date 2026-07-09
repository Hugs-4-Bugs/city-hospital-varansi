import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ─── TypeScript ────────────────────────────────────────────────
  typescript: {
    ignoreBuildErrors: true,
  },

  // ─── React ─────────────────────────────────────────────────────
  reactStrictMode: true,

  // ─── Output ────────────────────────────────────────────────────
  // Note: standalone output has issues with Turbopack static file serving.
  // Using default output with `next start` instead.
  // output: 'standalone',

  // ─── Allowed Dev Origins ───────────────────────────────────────
  allowedDevOrigins: [
    'http://21.0.18.62:81',
    'http://21.0.18.62:3000',
    'http://localhost:81',
    'http://localhost:3000',
    'http://preview-chat-ab88c1b0-d6fd-4199-b9d5-ec3a018502fc.space-z.ai',
    'https://preview-chat-ab88c1b0-d6fd-4199-b9d5-ec3a018502fc.space-z.ai',
    // Wildcard for all space-z.ai preview domains
    '.space-z.ai',
  ],

  // ─── Image Optimization ───────────────────────────────────────
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // ─── Compiler Options ─────────────────────────────────────────
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
      ? { exclude: ['error', 'warn'] }
      : false,
  },

  // ─── Modularize Imports (tree-shake large libraries) ───────────
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      'framer-motion',
    ],
  },

  // ─── Headers for Caching Static Assets ─────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)\\.(js|css|woff2?|ttf|otf|eot|ico|svg|png|jpg|jpeg|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/(.*)\\.(json|xml)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
        ],
      },
      // Security headers
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // ─── Redirects ─────────────────────────────────────────────────
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/',
        permanent: true,
      },
      {
        source: '/app',
        destination: '/',
        permanent: true,
      },
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // ─── Turbopack Configuration (Next.js 16 default) ──────────────
  turbopack: {},

  // ─── Webpack Optimization (fallback for non-Turbopack builds) ──
  webpack(config, { dev, isServer }) {
    // Split chunks for better caching
    if (!dev && !isServer) {
      if (!config.optimization) {
        config.optimization = {};
      }
      if (!config.optimization.splitChunks) {
        config.optimization.splitChunks = {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
          },
        };
      }

      const splitChunks = config.optimization.splitChunks as Record<string, unknown>;
      if (typeof splitChunks === 'object' && splitChunks !== null) {
        const cacheGroups = (splitChunks as Record<string, unknown>).cacheGroups as Record<string, unknown> || {};

        // Bundle all framework code together
        (splitChunks as Record<string, unknown>).cacheGroups = {
          ...cacheGroups,
          framework: {
            name: 'framework',
            chunks: 'all',
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
            priority: 40,
            enforce: true,
          },
          // Common vendor libraries
          lib: {
            test: /[\\/]node_modules[\\/]/,
            name(module: { context: string } | null) {
              if (!module?.context) return 'vendor';
              const match = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/);
              if (!match) return 'vendor';
              const packageName = match[1];
              return `vendor.${packageName.replace('@', '')}`;
            },
            priority: 20,
            minChunks: 1,
            reuseExistingChunk: true,
          },
          // Common application code shared between routes
          commons: {
            name: 'commons',
            minChunks: 2,
            priority: 10,
            reuseExistingChunk: true,
          },
        };
      }
    }

    return config;
  },
};

export default nextConfig;
