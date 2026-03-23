'use client';

/**
 * SACS verification page.
 * Venezuelan medical registry verification for doctors.
 * Uses the doctor-verification-service for SACS integration.
 */
export default function VerificacionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Verificación SACS</h1>
        <p className="text-gray-600 mt-1">
          Verificación del registro médico venezolano
        </p>
      </div>

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
