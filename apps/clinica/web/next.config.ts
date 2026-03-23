import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@red-salud/types',
    '@red-salud/contracts',
    '@red-salud/ui',
    '@red-salud/core',
    '@red-salud/auth-sdk',
    '@red-salud/api-client',
  ],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: '*.supabase.in' },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
