/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  distDir: "out",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // Disable features that don't work with static export
  experimental: {
    appDir: true,
  },
};

module.exports = nextConfig;
