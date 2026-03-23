import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Red Salud - Gestión de Clínica',
  description: 'Administración integral de clínicas y centros de salud',
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
