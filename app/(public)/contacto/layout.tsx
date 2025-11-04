import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Ponte en contacto con nuestro equipo de Red-Salus",
};

export default function ContactoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
