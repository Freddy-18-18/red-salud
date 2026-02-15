"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Lista de Espera Page - Redirecciona al hub de citas
 * La funcionalidad de lista de espera ahora está integrada en el tab system
 */
export default function ListaEsperaPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir al hub de citas con el tab de lista de espera
    router.replace("/dashboard/medico/citas?tab=waitlist");
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-muted-foreground">Redirigiendo...</p>
    </div>
  );
}