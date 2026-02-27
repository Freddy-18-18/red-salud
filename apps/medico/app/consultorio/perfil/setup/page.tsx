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
  } = state;

  const handleComplete = async () => {
    await actions.handleCompleteSetup();
    router.push("/consultorio");
  };

  const handleCompleteManual = async (data: {
    nombre_completo: string;
    cedula: string;
    tipo_documento: string;
    especialidad_id: string;
  }) => {
    await actions.handleCompleteManual(data);
    router.push("/consultorio");
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <VerificationSection
          cedula={cedula}
          tipoDocumento={tipoDocumento}
          verificationResult={verificationResult}
          verifying={verifying}
          loading={loading}
          specialties={specialties}
          onCedulaChange={actions.setCedula}
          onTipoChange={actions.setTipoDocumento}
          onVerify={actions.handleVerifySACS}
          onComplete={handleComplete}
          onCompleteManual={handleCompleteManual}
        />
      </div>
    </div>
  );
}

