"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { ConsultationPatientSearch, PatientOption } from "@/components/dashboard/medico/consulta/consultation-patient-search";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@red-salud/ui";
import { Loader2, Stethoscope } from "lucide-react";
import { ActiveConsultationsWidget } from "@/components/dashboard/medico/consulta/widgets/active-consultations";
import { TodaysAppointmentsWidget } from "@/components/dashboard/medico/consulta/widgets/todays-appointments";
import { RecentPatientsWidget } from "@/components/dashboard/medico/consulta/widgets/recent-patients";

export default function ConsultaPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const [registeredResult, offlineResult] = await Promise.all([
          supabase
            .from("doctor_patients")
            .select(`
              patient_id,
              patient:profiles!doctor_patients_patient_id_fkey(
                id,
                nombre_completo,
                email,
                cedula
              )
            `)
            .eq("doctor_id", user.id),
          supabase
            .from("offline_patients")
            .select("id, nombre_completo, cedula")
            .eq("doctor_id", user.id)
            .eq("status", "offline"),
        ]);

        const allPatients: PatientOption[] = [
          ...(registeredResult.data?.map((rp) => {
            const patient = rp.patient as { id: string; nombre_completo: string; email: string; cedula?: string } | { id: string; nombre_completo: string; email: string; cedula?: string }[];
            const patientData = Array.isArray(patient) ? patient[0] : patient;
            return {
              id: patientData.id,
              nombre_completo: patientData.nombre_completo,
              email: patientData.email,
              cedula: patientData.cedula || null,
              type: "registered" as const,
            };
          }) || []),
          ...(offlineResult.data?.map((op) => ({
            id: op.id,
            nombre_completo: op.nombre_completo,
            email: null,
            cedula: op.cedula,
            type: "offline" as const,
          })) || []),
        ];

        setPatients(allPatients);
      } catch (err) {
        console.error("Error loading patients:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, []);

  const handlePatientFound = (patient: PatientOption) => {
    if (patient.type === "registered") {
        router.push(`/dashboard/medico/pacientes/consulta?paciente_id=${patient.id}`);
    } else {
        router.push(`/dashboard/medico/pacientes/offline/${patient.id}`);
    }
  };

  const handleCnePatientFound = (cedula: string, nombre: string) => {
    const params = new URLSearchParams();
    params.set("cedula", cedula);
    params.set("nombre", nombre);
    router.push(`/dashboard/medico/pacientes/nuevo/consulta?${params.toString()}`);
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
          <Stethoscope className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Consulta</h1>
          <p className="text-muted-foreground">Panel de atención médica</p>
        </div>
      </div>

      {/* Widget de Consultas Activas (Prioridad Alta) */}
      <ActiveConsultationsWidget />

      <div className="grid gap-6 md:grid-cols-12">
        {/* Columna Principal (Buscador + Citas) - 8 columnas */}
        <div className="md:col-span-8 space-y-6">
            <Card className="border-2 shadow-sm">
                <CardHeader>
                <CardTitle>Iniciar Nueva Atención</CardTitle>
                <CardDescription>
                    Busque por cédula para atender a un paciente (Registrado o CNE)
                </CardDescription>
                </CardHeader>
                <CardContent>
                {loading ? (
                    <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <ConsultationPatientSearch 
                    patients={patients}
                    onPatientFound={handlePatientFound}
                    onCnePatientFound={handleCnePatientFound}
                    />
                )}
                </CardContent>
            </Card>

            <TodaysAppointmentsWidget />
        </div>

        {/* Columna Lateral (Pacientes Recientes) - 4 columnas */}
        <div className="md:col-span-4 space-y-6">
             <RecentPatientsWidget />
        </div>
      </div>
    </div>
  );
}
