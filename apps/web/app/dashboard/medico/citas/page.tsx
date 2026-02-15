"use client";

import { Suspense } from "react";
import { VerificationGuard } from "@/components/dashboard/medico/features/verification-guard";
import { AppointmentsHub } from "./appointments-hub";

export default function DoctorCitasPage() {
  return (
    <VerificationGuard>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        }
      >
        <div className="h-full">
          <AppointmentsHub />
        </div>
      </Suspense>
    </VerificationGuard>
  );
}
