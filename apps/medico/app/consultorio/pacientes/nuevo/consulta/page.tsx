"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { VerificationGuard } from "@/components/dashboard/medico/features/verification-guard";
import { MedicalWorkspace } from "@/components/dashboard/medico/medical-workspace";
import { QuickRegistrationModal } from "@/components/dashboard/medico/pacientes/quick-registration-modal";
import { buildPacienteFromParams } from "../_utils/consulta";
import { OfflinePatient } from "@/components/dashboard/medico/patients/utils";

import { Suspense } from "react";

function ConsultaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Inicialmente construimos desde params, pero podemos actualizarlo tras el registro rápido
  const [paciente, setPaciente] = useState(() => buildPacienteFromParams(searchParams as unknown as URLSearchParams));
  const [showRegistration, setShowRegistration] = useState(false);

  const [alergias, setAlergias] = useState<string[]>([]);
  const [condicionesCronicas, setCondicionesCronicas] = useState<string[]>([]);
  const [medicamentosActuales, setMedicamentosActuales] = useState<string[]>([]);
  const [notasMedicas, setNotasMedicas] = useState("");
  const [diagnosticos, setDiagnosticos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Solo redirigir si faltan datos esenciales
    if (!paciente.cedula || !paciente.nombre_completo) {
      router.replace("/consultorio/pacientes/nuevo");
    }
  }, [paciente, router]);

  const handleRegistrationSuccess = (patientId: string, patientData: OfflinePatient) => {
    // Actualizar el estado del paciente con los datos reales de la BD
    const edad = patientData.fecha_nacimiento && typeof patientData.fecha_nacimiento === 'string'
      ? calculateAge(patientData.fecha_nacimiento)
      : null;

    setPaciente({
      ...paciente,
      id: patientId,
      cedula: patientData.cedula,
      nombre_completo: patientData.nombre_completo,
      genero: patientData.genero || "",
      fecha_nacimiento: patientData.fecha_nacimiento || undefined,
      telefono: patientData.telefono || undefined,
      email: patientData.email || undefined,
      edad,
    });
    setShowRegistration(false);
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const onSave = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login/medico");
        return;
      }

      const notasConDiagnosticos = notasMedicas + (diagnosticos.length > 0 ? `\n\nDiagnósticos:\n${diagnosticos.join("\n")}` : "");

      // Si ya tenemos ID (registrado vía modal), actualizamos
      if (paciente.id) {
        const { error: updateError } = await supabase
          .from("offline_patients")
          .update({
            alergias: alergias.length > 0 ? alergias : null,
            condiciones_cronicas: condicionesCronicas.length > 0 ? condicionesCronicas : null,
            medicamentos_actuales: medicamentosActuales.length > 0 ? medicamentosActuales : null,
            notas_medico: notasConDiagnosticos || null,
          })
          .eq("id", paciente.id);

        if (updateError) throw updateError;
        router.push(`/consultorio/pacientes/offline/${paciente.id}`);
      } else {
        // Fallback original (por si acaso)
        const { data: offlinePatient, error: insertError } = await supabase
          .from("offline_patients")
          .insert({
            doctor_id: user.id,
            cedula: paciente.cedula,
            nombre_completo: paciente.nombre_completo,
            fecha_nacimiento: null,
            genero: paciente.genero || null,
            telefono: null,
            email: null,
            direccion: null,
            alergias: alergias.length > 0 ? alergias : null,
            condiciones_cronicas: condicionesCronicas.length > 0 ? condicionesCronicas : null,
            medicamentos_actuales: medicamentosActuales.length > 0 ? medicamentosActuales : null,
            notas_medico: notasConDiagnosticos || null,
            status: "offline",
          })
          .select()
          .single();
        if (insertError) throw insertError;
        router.push(`/consultorio/pacientes/offline/${offlinePatient.id}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <VerificationGuard>
      <MedicalWorkspace
        paciente={paciente}
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
        onSave={onSave}
        onBack={() => router.push("/consultorio/pacientes/nuevo")}
        loading={loading}
      />

      <QuickRegistrationModal
        open={showRegistration}
        onOpenChange={setShowRegistration}
        cedula={paciente.cedula || ""}
        nombre={paciente.nombre_completo || ""}
        onSuccess={handleRegistrationSuccess}
      />
    </VerificationGuard>
  );
}

export default function ConsultaPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      }
    >
      <ConsultaContent />
    </Suspense>
  );
}
