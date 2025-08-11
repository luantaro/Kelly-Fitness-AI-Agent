import type { NextConfig } from "next";

// Check if we're in development mode
const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  // 🚀 Only use static export for production builds
  ...(isDev
    ? {}
    : {
        output: "export",
        trailingSlash: true,
        images: {
          unoptimized: true,
        },
      }),

  // 🔒 Security: Hide source maps in production
  productionBrowserSourceMaps: false,

  // 🔧 Webpack configuration to handle Node.js modules in Edge Runtime
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Handle Node.js polyfills for client-side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        process: false,
      };
    }
    return config;
  },

  // 🔒 Security Headers Configuration (only for production)
  ...(!isDev
    ? {
        async headers() {
          return [
            {
              source: "/(.*)",
              headers: [
                {
                  key: "X-Content-Type-Options",
                  value: "nosniff",
                },
                {
                  key: "X-Frame-Options",
                  value: "DENY",
                },
                {
                  key: "X-XSS-Protection",
                  value: "1; mode=block",
                },
                {
                  key: "Referrer-Policy",
                  value: "strict-origin-when-cross-origin",
                },
                {
                  key: "Permissions-Policy",
                  value: "camera=(), microphone=(), geolocation=()",
                },
              ],
            },
          ];
        },

        async redirects() {
          return [
            {
              source: "/api/:path*",
              destination: "/404",
              permanent: false,
            },
          ];
        },
      }
    : {}),

  // 🔧 External packages for server components
  serverExternalPackages: ["firebase-admin"],

  // ⚗️ Experimental features
  experimental: {
    turbo: {
      rules: {
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
      },
    },
  },

  // 🌐 TypeScript configuration
  typescript: {
    // ⚠️ Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: false,
  },

  // 📦 ESLint configuration
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: false,
  },

  // 🔧 Build configuration
  poweredByHeader: false,
};

export default nextConfig;
