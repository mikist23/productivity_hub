import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  typescript: {
    ignoreBuildErrors: true
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion']
  },
  poweredByHeader: false,
  generateEtags: false,
  compress: true,
  
  // Turbopack configuration for compatibility
  turbopack: {
    // Add any turbopack-specific configurations here
  }
};

export default nextConfig;
