import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Red Salud - Central de Emergencias',
  description: 'Despacho y seguimiento de unidades de emergencia',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
