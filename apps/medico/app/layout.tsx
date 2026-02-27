import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";
import { SupabaseAuthProvider } from "@red-salud/identity";
import { AppProviders } from "@/components/providers/app-providers";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `Médico | ${APP_NAME} - Panel Profesional`,
    template: `%s | Médico | ${APP_NAME}`,
  },
  description: "Plataforma integral para gestión de consultas, especialidades médicas y atención de pacientes.",
  keywords: [
    "salud",
    "telemedicina",
    "consulta médica",
    "servicios de salud",
    "atención médica online",
  ],
  authors: [{ name: APP_NAME }],
  creator: APP_NAME,
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "/",
    title: APP_NAME,
    description: APP_DESCRIPTION,
    siteName: APP_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: APP_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${montserrat.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <AppProviders>
          <SupabaseAuthProvider>
            {children}
          </SupabaseAuthProvider>
        </AppProviders>
        <SpeedInsights />
      </body>
    </html>
  );
}
