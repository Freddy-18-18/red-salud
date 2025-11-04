import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Autenticación",
  description: "Inicia sesión o regístrate en Red-Salud",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-teal-50">
      {children}
    </div>
  );
}
