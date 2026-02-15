"use client";

import { useRouter } from "next/navigation";
import { useProfileSetup } from "@/components/dashboard/medico/profile-setup/hooks/useProfileSetup";
import { VerificationSection } from "@/components/dashboard/medico/profile-setup/verification-section";

export default function DoctorSetupPage() {
  const router = useRouter();
  const { state, actions } = useProfileSetup();
  const {
    loading,
    cedula,
    tipoDocumento,
    verificationResult,
    verifying,
    specialties,
    yearsExperience,
  } = state;

  const handleComplete = async () => {
    await actions.handleCompleteSetup();
    router.push("/dashboard/medico");
  };

  const handleCompleteManual = async (data: {
    nombre_completo: string;
    cedula: string;
    tipo_documento: string;
    especialidad_id: string;
    anos_experiencia: number;
  }) => {
    await actions.handleCompleteManual(data);
    router.push("/dashboard/medico");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <VerificationSection
          cedula={cedula}
          tipoDocumento={tipoDocumento}
          verificationResult={verificationResult}
          verifying={verifying}
          yearsExperience={yearsExperience}
          loading={loading}
          specialties={specialties}
          onCedulaChange={actions.setCedula}
          onTipoChange={actions.setTipoDocumento}
          onVerify={actions.handleVerifySACS}
          onSetYearsExperience={actions.setYearsExperience}
          onComplete={handleComplete}
          onCompleteManual={handleCompleteManual}
        />
      </div>
    </div>
  );
}

