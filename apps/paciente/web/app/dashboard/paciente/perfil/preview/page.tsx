"use client";

import MedicalProfilePreview from "@/components/dashboard/medical-profile-preview";

export default function PreviewPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Vista Previa:</strong> Esta es una demostración del perfil médico con datos de ejemplo.
        </p>
      </div>
      <MedicalProfilePreview />
    </div>
  );
}
