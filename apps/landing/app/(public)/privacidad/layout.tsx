import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad",
};

export default function PrivacidadLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
