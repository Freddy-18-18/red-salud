import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guías y Tutoriales",
  description: "Aprende a usar Red-Salud con nuestras guías paso a paso, tutoriales en video y artículos detallados.",
};

export default function GuiasLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}