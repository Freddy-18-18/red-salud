import type { Metadata, Viewport } from 'next';
import './globals.css';

// Force dynamic rendering for all pages since they require Supabase auth
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Red Salud - Portal del Paciente',
  description: 'Tu salud en un solo lugar. Busca tu medico, agenda tu cita y cuida tu salud.',
  keywords: ['salud', 'medico', 'citas', 'paciente', 'Venezuela'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Red Salud',
  },
};

export const viewport: Viewport = {
  themeColor: '#10B981',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.log('SW registration failed:', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
