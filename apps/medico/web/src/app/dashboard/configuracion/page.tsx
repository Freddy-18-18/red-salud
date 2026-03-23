'use client';

/**
 * Doctor settings page.
 * Profile management, schedule configuration, signature upload,
 * and practice preferences.
 */
export default function ConfiguracionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p className="text-gray-600 mt-1">
          Perfil profesional y preferencias del consultorio
        </p>
      </div>

      {/* TODO: Doctor profile form (uses useDoctorProfile hook) */}
      {/* TODO: Medical profile preview (MedicalProfilePreview component) */}
      {/* TODO: Schedule configuration */}
      {/* TODO: Digital signature management (uses signatures service) */}
      {/* TODO: Notification preferences */}

      <div className="p-8 border-2 border-dashed rounded-lg text-center text-gray-400">
        <p>Configuración del consultorio</p>
        <p className="text-sm mt-2">
          Perfil, horarios, firma digital y preferencias
        </p>
      </div>
    </div>
  );
}
