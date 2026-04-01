import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@red-salud/types',
    '@red-salud/contracts',
    '@red-salud/design-system',
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
  async rewrites() {
    return [
      {
        source: '/favicon.ico',
        destination: '/icons/icon-192.png',
      },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
