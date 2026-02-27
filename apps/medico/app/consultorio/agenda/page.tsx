"use client";

import { Suspense, useEffect } from "react";
import { VerificationGuard } from "@/components/dashboard/medico/features/verification-guard";
import { AppointmentsHub } from "../citas/appointments-hub";

export default function AgendaPage() {
  // Previene el scroll del layout principal (.main / SidebarAwareContent)
  // forzando así que el scroll suceda únicamente dentro del calendario.
  useEffect(() => {
    const mainElement = document.querySelector("main");
    if (mainElement) {
      const originalStyle = mainElement.style.overflowY;
      mainElement.style.overflowY = "hidden";
      return () => {
        mainElement.style.overflowY = originalStyle;
      };
    }
  }, []);

  return (
    <VerificationGuard>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        }
      >
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden w-full">
          <AppointmentsHub />
        </div>
      </Suspense>
    </VerificationGuard>
  );
}
