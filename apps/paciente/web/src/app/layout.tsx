import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';

import { ThemeProvider } from '@/components/theme/theme-provider';
import { CountryProvider } from '@/lib/context/country-context';
import { QueryProvider } from '@/components/providers/query-provider';
import './globals.css';
import './mapbox-overrides.css';

// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: 'Red-Salud - Portal del Paciente',
  description: 'Tu salud en un solo lugar. Busca tu medico, agenda tu cita y cuida tu salud.',
  keywords: ['salud', 'medico', 'citas', 'paciente', 'Venezuela'],
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/icon-192.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/icons/icon-192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Red-Salud',
  },
};

// eslint-disable-next-line react-refresh/only-export-components
export const viewport: Viewport = {
  themeColor: '#10B981',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const country = cookieStore.get('rs-country')?.value ?? 'VE';

  return (
    <html lang="es" suppressHydrationWarning>
      <head />
      <body className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] antialiased">
        <QueryProvider>
          <ThemeProvider>
            <CountryProvider countryCode={country}>
              {children}
            </CountryProvider>
          </ThemeProvider>
        </QueryProvider>
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
