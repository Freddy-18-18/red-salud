'use client';

/**
 * Prescription management page.
 * Create, preview, and manage medical prescriptions with digital signature.
 *
 * Uses:
 * - Recipe components from @/components/dashboard/recetas/
 * - Recipe utils from @/lib/recetas/
 * - Recipe schema from @/lib/schemas/recipe.ts
 * - Prescriptions service from @/lib/services/prescriptions-advanced/
 */
export default function RecetasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Recetas</h1>
        <p className="text-gray-600 mt-1">
          Creación y gestión de prescripciones médicas
        </p>
      </div>

      {/* TODO: Prescription creation form */}
      {/* TODO: Medication search (uses MedicationInput component) */}
      {/* TODO: Patient selector (uses PatientSelector component) */}
      {/* TODO: Recipe preview and PDF generation */}
      {/* TODO: Digital signature requirement */}
      {/* TODO: Prescription history list */}

      <div className="p-8 border-2 border-dashed rounded-lg text-center text-gray-400">
        <p>Gestión de recetas médicas</p>
        <p className="text-sm mt-2">
          Requiere firma digital para emisión. Usa componentes de recetas migrados.
        </p>
      </div>
    </div>
  );
}
