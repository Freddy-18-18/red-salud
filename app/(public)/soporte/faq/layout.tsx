import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Preguntas Frecuentes",
  description: "Encuentra respuestas a las preguntas más comunes sobre Red-Salud. FAQ sobre citas, telemedicina, pagos, seguridad y más.",
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}