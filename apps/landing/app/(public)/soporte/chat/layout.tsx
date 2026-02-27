import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat en Vivo",
  description: "Chatea en tiempo real con nuestro asistente virtual o un agente de soporte de Red-Salud.",
};

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
