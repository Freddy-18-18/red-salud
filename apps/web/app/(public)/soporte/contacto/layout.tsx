import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Contacta con el equipo de soporte de Red-Salud. Estamos aquí para ayudarte con cualquier consulta o problema.",
};

export default function ContactoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
