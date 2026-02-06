import type { NextConfig } from "next";

const isTauriExport = process.env.TAURI_EXPORT === 'true';

const nextConfig: NextConfig = {
  // Para Tauri: exportación estática
  ...(isTauriExport ? { output: "export" as const } : {}),

  images: {
    unoptimized: isTauriExport,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hwckkfiirldgundbcjsp.supabase.co",
      },
    ],
  },

  // Configuración para Tauri
  ...(isTauriExport && {
    trailingSlash: true,
    distDir: 'out',
  }),

  // Para Tauri: excluir las rutas API que no funcionan con static export
  ...(isTauriExport && {
    // Ignorar errores de tipo durante el build de Tauri
    typescript: {
      ignoreBuildErrors: true,
    },
  }),

  // Headers de seguridad
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()'
          }
        ]
      }
    ];
  },
};

export default nextConfig;
