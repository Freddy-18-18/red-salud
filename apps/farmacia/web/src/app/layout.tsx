import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Red Salud Farmacia — La plataforma que digitaliza tu farmacia',
  description:
    'Gestion de inventario, punto de venta, recetas digitales, integracion BCV y mas. La plataforma integral para farmacias venezolanas.',
  keywords: [
    'farmacia',
    'venezuela',
    'gestion farmacia',
    'punto de venta farmacia',
    'inventario farmacia',
    'recetas digitales',
    'tasa BCV',
    'software farmacia',
    'red salud',
  ],
  openGraph: {
    title: 'Red Salud Farmacia — Digitaliza tu farmacia',
    description:
      'Inventario, POS, recetas digitales, tasa BCV automatica y mas. Todo en una plataforma.',
    type: 'website',
    locale: 'es_VE',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className="antialiased">{children}</body>
    </html>
  );
}
