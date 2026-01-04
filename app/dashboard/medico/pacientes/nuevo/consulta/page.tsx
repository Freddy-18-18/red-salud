"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { VerificationGuard } from "@/components/dashboard/medico/features/verification-guard";
import { MedicalWorkspace } from "@/components/dashboard/medico/medical-workspace";
import { buildPacienteFromParams } from "../_utils/consulta";

export default function ConsultaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paciente = useMemo(() => buildPacienteFromParams(searchParams as unknown as URLSearchParams), [searchParams]);

  const [alergias, setAlergias] = useState<string[]>([]);
  const [condicionesCronicas, setCondicionesCronicas] = useState<string[]>([]);
  const [medicamentosActuales, setMedicamentosActuales] = useState<string[]>([]);
  const [notasMedicas, setNotasMedicas] = useState("");
  const [diagnosticos, setDiagnosticos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!paciente.cedula || !paciente.nombre_completo) {
      router.replace("/dashboard/medico/pacientes/nuevo");
    }
  }, [paciente, router]);

  const onSave = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login/medico");
        return;
      }
      const notasConDiagnosticos = notasMedicas + (diagnosticos.length > 0 ? `\n\nDiagnósticos:\n${diagnosticos.join("\n")}` : "");
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
      await supabase.from("user_activity_log").insert({
        user_id: user.id,
        activity_type: "offline_patient_created",
        description: `Paciente offline registrado: ${paciente.nombre_completo} (${paciente.cedula})`,
        status: "success",
      });
      router.push(`/dashboard/medico/pacientes/offline/${offlinePatient.id}`);
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
        onBack={() => router.push("/dashboard/medico/pacientes/nuevo")}
        loading={loading}
      />
    </VerificationGuard>
  );
}