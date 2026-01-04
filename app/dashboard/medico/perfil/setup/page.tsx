"use client";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { useProfileSetup } from "@/components/dashboard/medico/profile-setup/hooks/useProfileSetup";
import { VerificationSection } from "@/components/dashboard/medico/profile-setup/verification-section";
import { ProfileForm } from "@/components/dashboard/medico/profile-setup/profile-form";

export default function DoctorSetupPage() {
  const router = useRouter();
  const { state, actions } = useProfileSetup();
  const { step, loading, cedula, tipoDocumento, verificationResult, verifying, specialties, filteredSpecialties, specialtyId, specialtySearch, recommendedSpecialty, yearsExperience } = state as any;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            <div className={`flex items-center gap-2 ${step >= 1 ? "text-blue-600" : "text-gray-400"}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200"}`}>{step > 1 ? <CheckCircle className="h-6 w-6" /> : "1"}</div>
              <span className="font-medium hidden sm:inline">Verificación SACS</span>
            </div>
            <div className="w-16 h-1 bg-gray-200"><div className={`h-full transition-all ${step >= 2 ? "bg-blue-600 w-full" : "w-0"}`} /></div>
            <div className={`flex items-center gap-2 ${step >= 2 ? "text-blue-600" : "text-gray-400"}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200"}`}>2</div>
              <span className="font-medium hidden sm:inline">Información Profesional</span>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <VerificationSection
                cedula={cedula}
                tipoDocumento={tipoDocumento}
                verificationResult={verificationResult}
                verifying={verifying}
                onCedulaChange={actions.setCedula}
                onTipoChange={actions.setTipoDocumento}
                onVerify={actions.handleVerifySACS}
                onContinue={() => actions.setStep(2)}
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <ProfileForm
                verificationData={verificationResult?.data}
                specialties={specialties}
                filteredSpecialties={filteredSpecialties}
                specialtyId={specialtyId}
                specialtySearch={specialtySearch}
                recommendedSpecialty={recommendedSpecialty}
                yearsExperience={yearsExperience}
                loading={loading}
                onBack={() => actions.setStep(1)}
                onComplete={async () => { await actions.handleCompleteSetup(); router.push("/dashboard/medico"); }}
                onSelectSpecialtyId={actions.setSpecialtyId}
                onSetSpecialtySearch={actions.setSpecialtySearch}
                onSetYearsExperience={actions.setYearsExperience}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

