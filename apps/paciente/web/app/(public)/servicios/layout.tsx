import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Servicios Médicos",
  description: "Descubre nuestra amplia gama de servicios médicos especializados disponibles 24/7",
};

export default function ServiciosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
