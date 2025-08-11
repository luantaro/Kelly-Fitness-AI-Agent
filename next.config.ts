import type { NextConfig } from "next";

// Check if we're in development mode
const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  // 🚀 Firebase Hosting deployment - use static export only for specific builds
  // For normal deployment, use standard Next.js build
  ...(process.env.NEXT_PUBLIC_STATIC_EXPORT === "true"
    ? {
        output: "export",
        trailingSlash: true,
        images: {
          unoptimized: true,
        },
      }
    : {}),

  // 🔄 For development - proxy to local functions
  ...(isDev
    ? {
        async rewrites() {
          return [
            {
              source: "/api/:path*",
              destination:
                "https://us-central1-kelly-fitness-93e58.cloudfunctions.net/nextjsApp/api/:path*",
            },
          ];
        },
      }
    : {}),

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

  // 🔒 Security Headers Configuration (production only)
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
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=31536000; includeSubDomains",
                },
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=31536000; includeSubDomains",
                },
                {
                  key: "Content-Security-Policy",
                  value: [
                    "default-src 'self'",
                    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://apis.google.com",
                    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                    "font-src 'self' https://fonts.gstatic.com",
                    "img-src 'self' data: blob: https:",
                    "connect-src 'self' https://api.openai.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://kelly-fitness-93e58.firebaseapp.com https://*.cloudfunctions.net",
                    "frame-src 'self' https://kelly-fitness-93e58.firebaseapp.com",
                    "object-src 'none'",
                    "base-uri 'self'",
                    "form-action 'self'",
                    "manifest-src 'self'",
                  ].join("; "),
                },
              ],
            },
          ];
        },

        async redirects() {
          return [
            {
              source: "/dashboard",
              destination: "/",
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
    ignoreBuildErrors: false,
  },

  // 📦 ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
  },

  // 🔧 Build configuration
  poweredByHeader: false,
};

export default nextConfig;
