import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Centro de Soporte",
    template: "%s | Soporte - Red-Salud",
  },
  description: "Centro de ayuda de Red-Salud. Encuentra guías, tutoriales, preguntas frecuentes y contacta con nuestro equipo de soporte.",
  openGraph: {
    title: "Centro de Soporte - Red-Salud",
    description: "Encuentra ayuda, guías y soporte técnico para Red-Salud",
  },
};

export default function SoporteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
