import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Precios y Planes",
  description: "Elige el plan que mejor se adapte a tus necesidades de salud",
};

export default function PreciosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
