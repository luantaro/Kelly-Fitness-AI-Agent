import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 🚀 Static export for Firebase hosting
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },

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

  // 🔒 Security Headers Configuration
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

  // 🔧 Experimental features
  experimental: {
    serverComponentsExternalPackages: ["@google-cloud/firestore"],
  },

  // 🌍 Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // 📦 Compression
  compress: true,

  // 🔄 Redirects
  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
