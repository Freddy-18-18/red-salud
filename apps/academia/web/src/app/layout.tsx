import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Red Salud - Academia Red Salud',
  description: 'Educación continua para profesionales de salud',
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
