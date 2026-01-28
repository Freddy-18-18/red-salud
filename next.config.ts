import type { NextConfig } from "next";

const isTauriExport = process.env.TAURI_EXPORT === 'true';

const nextConfig: NextConfig = {
  // Para Tauri: exportación estática
  output: isTauriExport ? 'export' : undefined,

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
    // Ignorar errores de tipo y lint durante el build de Tauri
    typescript: {
      ignoreBuildErrors: true,
    },
    eslint: {
      ignoreDuringBuilds: true,
    },
    // Excluir el directorio api del build (top-level en Next.js 15+)
    outputFileTracingExcludes: {
      '*': ['app/api/**/*'],
    },
  }),
};

export default nextConfig;
