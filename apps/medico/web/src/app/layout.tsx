import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Red Salud — Consultorio Médico Digital',
  description:
    'La primera plataforma clínica que se adapta a tu especialidad. Agenda, consultas, recetas, historia clínica e inteligencia artificial para médicos venezolanos.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.variable} font-sans bg-zinc-950 text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
