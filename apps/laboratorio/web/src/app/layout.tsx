import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Red Salud - Laboratorio',
  description: 'Gestión de órdenes, resultados y control de calidad para laboratorios',
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
