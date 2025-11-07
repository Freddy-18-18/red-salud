import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y Condiciones",
};

export default function TerminosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
