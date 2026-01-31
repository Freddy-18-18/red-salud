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
    // Ignorar errores de tipo durante el build de Tauri
    typescript: {
      ignoreBuildErrors: true,
    },
  }),
};

export default nextConfig;
