'use client';

/**
 * Medical consultation page.
 * SOAP notes, clinical examination, diagnoses (ICD-11),
 * and specialty-specific record forms.
 */
export default function ConsultaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Consulta Médica</h1>
        <p className="text-gray-600 mt-1">
          Notas clínicas, diagnósticos y examen médico
        </p>
      </div>

      {/* TODO: SOAP notes editor */}
      {/* TODO: ICD-11 diagnosis search (uses /api/gemini/suggest-icd11 and /api/icd11/search) */}
      {/* TODO: Specialty-specific record form (uses SpecialtyRecordForm component) */}
      {/* TODO: Vital signs input */}
      {/* TODO: Medical templates (from @/lib/templates/) */}

      <div className="p-8 border-2 border-dashed rounded-lg text-center text-gray-400">
        <p>Formulario de consulta médica</p>
        <p className="text-sm mt-2">
          Integra notas SOAP, diagnósticos ICD-11, y formularios por especialidad
        </p>
      </div>
    </div>
  );
}
