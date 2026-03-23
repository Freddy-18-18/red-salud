'use client';

/**
 * Patient list page.
 * Shows the doctor's patient roster with search, filtering,
 * and access to individual patient records.
 */
export default function PacientesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pacientes</h1>
        <p className="text-gray-600 mt-1">
          Registro y gestión de pacientes
        </p>
      </div>

      {/* TODO: Patient search and filter bar */}
      {/* TODO: Patient list table with pagination */}
      {/* TODO: Quick actions (new patient, view history) */}

      <div className="p-8 border-2 border-dashed rounded-lg text-center text-gray-400">
        <p>Lista de pacientes</p>
        <p className="text-sm mt-2">
          Componente de lista de pacientes pendiente de migración
        </p>
      </div>
    </div>
  );
}
