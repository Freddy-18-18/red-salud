import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agendar Videollamada",
  description: "Agenda una videollamada con nuestro equipo de soporte para recibir ayuda personalizada.",
};

export default function AgendarLlamadaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
