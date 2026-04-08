import type { Metadata } from "next";

import { EmergencyProfileClient } from "./client";

// --- Metadata ---

export const metadata: Metadata = {
  title: "Perfil Medico de Emergencia — Red Salud",
  description:
    "Informacion medica de emergencia del paciente. Grupo sanguineo, alergias, medicamentos, contactos de emergencia.",
  openGraph: {
    title: "Perfil Medico de Emergencia",
    description:
      "Informacion medica critica del paciente accesible en emergencias.",
    siteName: "Red Salud",
    type: "website",
  },
  robots: {
    index: false, // Don't index individual patient profiles
    follow: false,
  },
};

// --- Page ---

export default async function EmergenciaPublicPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return <EmergencyProfileClient token={token} />;
}
