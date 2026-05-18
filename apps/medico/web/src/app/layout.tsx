import { ThemeProvider } from '@red-salud/design-system';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';

import { ServiceWorkerRegistrar } from '@/lib/offline/service-worker-registrar';

import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Red-Salud — Consultorio Médico Digital',
  description:
    'La primera plataforma clínica que se adapta a tu especialidad. Agenda, consultas, recetas, historia clínica e inteligencia artificial para médicos venezolanos.',
  manifest: '/manifest.webmanifest',
  applicationName: 'Red Salud',
  appleWebApp: {
    capable: true,
    title: 'Red Salud',
    statusBarStyle: 'black-translucent',
  },
};

export const viewport: Viewport = {
  themeColor: '#0a1628',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider defaultTheme="system">
          {children}
          {/*
            App-wide toast surface. Mounted at root so any client component
            (UserMenuDropdown logout failure, future feedback flows, etc.) can
            call `toast(...)` without per-page wiring. `richColors` lights up
            success/error/warning variants; `closeButton` adds a manual dismiss
            for sticky toasts; `top-right` keeps it clear of the bottom nav on
            mobile.
          */}
          <Toaster richColors closeButton position="top-right" />
          {/*
            PWA service worker registrar. Mounted at root so the SW is
            available across every page, not just /dashboard. Skips
            registration in dev unless NEXT_PUBLIC_FORCE_SW=1 so HMR
            keeps working cleanly.
          */}
          <ServiceWorkerRegistrar />
        </ThemeProvider>
      </body>
    </html>
  );
}
