"use client";

import { VerificationGuard } from "@/components/dashboard/medico/features/verification-guard";
import { MessagingLayout } from "@/components/dashboard/medico/mensajeria/messaging-layout";
import "@/components/dashboard/medico/mensajeria/messaging-animations.css";

export default function DoctorMensajeriaPage() {
  return (
    <VerificationGuard>
      <div className="h-[calc(100vh-64px)] w-full p-0 md:p-2 lg:p-3">
        <MessagingLayout />
      </div>
    </VerificationGuard>
  );
}
