"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useMemo } from "react";
import { VerificationGuard } from "@/components/dashboard/medico/features/verification-guard";
import { MedicalWorkspace } from "@/components/dashboard/medico/medical-workspace";
import { Loader2 } from "lucide-react";
import { useConsultation } from "@/components/dashboard/medico/consulta/hooks/use-consultation";

function ConsultaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("appointment_id");
  const pacienteId = searchParams.get("paciente_id");
  const fromPage = searchParams.get("from");

  const {
    appointment,
    patient,
    loading,
    saving,
    error,
    lastSaved,
    autoSaving,
    alergias,
    setAlergias,
    condicionesCronicas,
    setCondicionesCronicas,
    medicamentosActuales,
    setMedicamentosActuales,
    notasMedicas,
    setNotasMedicas,
    diagnosticos,
    setDiagnosticos,
    saveConsultation,
  } = useConsultation(appointmentId, pacienteId, fromPage);

  const pacienteData = useMemo(() => ({
    cedula: patient?.cedula || "",
    nombre_completo: patient?.nombre_completo || "",
    edad: patient?.fecha_nacimiento
      ? Math.floor((new Date().getTime() - new Date(patient.fecha_nacimiento).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : null,
    genero: (patient?.genero as string | null) || "",
  }), [patient]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando datos del paciente...</p>
        </div>
      </div>
    );
  }

  if (error || !appointment || !patient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Error al cargar los datos"}</p>
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:underline"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }


  return (
    <VerificationGuard>
      {/* Indicador de autoguardado */}
      {lastSaved && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 text-green-800 px-4 py-2 rounded-lg shadow-lg text-sm flex items-center gap-2">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Guardado automático: {lastSaved.toLocaleTimeString()}
        </div>
      )}
      {autoSaving && (
        <div className="fixed top-4 right-4 z-50 bg-blue-100 text-blue-800 px-4 py-2 rounded-lg shadow-lg text-sm flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Guardando...
        </div>
      )}
      <MedicalWorkspace
        paciente={pacienteData}
        alergias={alergias}
        setAlergias={setAlergias}
        condicionesCronicas={condicionesCronicas}
        setCondicionesCronicas={setCondicionesCronicas}
        medicamentosActuales={medicamentosActuales}
        setMedicamentosActuales={setMedicamentosActuales}
        notasMedicas={notasMedicas}
        setNotasMedicas={setNotasMedicas}
        diagnosticos={diagnosticos}
        setDiagnosticos={setDiagnosticos}
        onSave={saveConsultation}
        onBack={() => router.back()}
        loading={saving}
      />
    </VerificationGuard>
  );
}

export default function ConsultaPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    }>
      <ConsultaContent />
    </Suspense>
  );
}
