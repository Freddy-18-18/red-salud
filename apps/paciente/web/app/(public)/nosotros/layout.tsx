import type { Metadata } from "next";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Nosotros",
  description: "Conoce a Red-Salud, la startup venezolana transformando la salud digital. Nuestra misión, visión, valores y el equipo detrás de la plataforma.",
  keywords: [
    "Red-Salud",
    "startup salud Venezuela",
    "telemedicina Venezuela",
    "salud digital",
    "atención médica online",
    "plataforma médica",
  ],
  openGraph: {
    title: `Nosotros | ${APP_NAME}`,
    description: "Conoce a Red-Salud, la startup venezolana transformando la salud digital.",
    type: "website",
    locale: "es_VE",
  },
  twitter: {
    card: "summary_large_image",
    title: `Nosotros | ${APP_NAME}`,
    description: "Conoce a Red-Salud, la startup venezolana transformando la salud digital.",
  },
};

export default function NosotrosLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return <>{children}</>;
}
