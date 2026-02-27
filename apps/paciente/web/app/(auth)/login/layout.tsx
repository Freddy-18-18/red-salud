import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar Sesión",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
