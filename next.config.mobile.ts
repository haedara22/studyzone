import type { NextConfig } from "next";

// Configuration for Mobile Static Export
const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'out',
  
  // Disable features not supported in static export
  images: {
    unoptimized: true,
  },

  // Disable server-side features
  trailingSlash: true,
  
  // Environment variables for build time
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
};

export default nextConfig;
