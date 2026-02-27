import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Estado del Sistema",
  description: "Monitoreo en tiempo real del estado de todos los servicios de Red-Salud. Consulta uptime, incidentes y mantenimientos programados.",
};

export default function EstadoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
