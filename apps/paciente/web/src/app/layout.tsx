import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Red Salud - Portal del Paciente',
  description: 'Tu salud en un solo lugar. Busca tu medico, agenda tu cita y cuida tu salud.',
  keywords: ['salud', 'medico', 'citas', 'paciente', 'Venezuela'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
