import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Red Salud - Portal del Paciente',
  description: 'Tu salud en un solo lugar - citas, historial, mensajería con tu doctor',
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
