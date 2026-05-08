'use client';

import { PageHeader } from '@/components/shell';

/**
 * SACS verification page.
 * Venezuelan medical registry verification for doctors.
 * Uses the doctor-verification-service for SACS integration.
 */
export default function VerificacionPage() {
  return (
    <div className="space-y-6">
      <PageHeader>
        <PageHeader.Title>Verificación SACS</PageHeader.Title>
        <PageHeader.Meta>Próximamente — esta sección está en desarrollo</PageHeader.Meta>
      </PageHeader>

      {/* TODO: SACS verification status display */}
      {/* TODO: Verification form (cédula, MPPS number) */}
      {/* TODO: Verification result display */}
      {/* TODO: Uses doctor-verification-service from @/lib/services/ */}

      <div className="p-8 border-2 border-dashed rounded-lg text-center text-gray-400">
        <p>Verificación SACS</p>
        <p className="text-sm mt-2">
          Verifica tu registro en el Sistema Autónomo de Contraloría Sanitaria
        </p>
      </div>
    </div>
  );
}
