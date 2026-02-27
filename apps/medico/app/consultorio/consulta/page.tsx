"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { ConsultationPatientSearch, PatientOption } from "@/components/dashboard/medico/consulta/consultation-patient-search";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@red-salud/design-system";
import { Stethoscope } from "lucide-react";
import { ActiveConsultationsWidget } from "@/components/dashboard/medico/consulta/widgets/active-consultations";
import { TodaysAppointmentsWidget } from "@/components/dashboard/medico/consulta/widgets/todays-appointments";
import { RecentPatientsWidget } from "@/components/dashboard/medico/consulta/widgets/recent-patients";
import { FastStatsWidget } from "@/components/dashboard/medico/consulta/widgets/fast-stats-widget";

export default function ConsultaPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<PatientOption[]>([]);

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

            if (!patientData) return null;

            return {
              id: patientData.id,
              nombre_completo: patientData.nombre_completo,
              email: patientData.email,
              cedula: patientData.cedula || null,
              type: "registered" as const,
            };
          }).filter(Boolean) as PatientOption[] || []),
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
      }
    };

    loadPatients();
  }, []);

  const handlePatientFound = (patient: PatientOption) => {
    if (patient.type === "registered") {
      router.push(`/consultorio/pacientes/consulta?paciente_id=${patient.id}`);
    } else {
      router.push(`/consultorio/pacientes/offline/${patient.id}`);
    }
  };

  const handleCnePatientFound = (cedula: string, nombre: string) => {
    const params = new URLSearchParams();
    params.set("cedula", cedula);
    params.set("nombre", nombre);
    router.push(`/consultorio/pacientes/nuevo/consulta?${params.toString()}`);
  };

  return (
    <div className="h-[calc(100vh-4rem)] p-4 md:p-6 overflow-hidden flex flex-col gap-4">
      {/* Header Compacto */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-sm border border-primary/20">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Panel de Consulta</h1>
            <p className="text-xs text-muted-foreground">Gestión rápida de pacientes</p>
          </div>
        </div>

        {/* Aquí podría ir un reloj o timer en el futuro */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-full min-h-0">
        {/* Columna Principal - Izquierda (7 cols) */}
        <div className="md:col-span-8 flex flex-col gap-4 h-full min-h-0">
          {/* 1. Widget de Consultas Activas (Si existe, empuja lo demás) */}
          <div className="shrink-0">
            <ActiveConsultationsWidget />
          </div>

          {/* 2. Centro de Comando (Búsqueda) - Hero Section */}
          <Card className="border-2 shadow-sm shrink-0 bg-gradient-to-br from-card to-secondary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Nueva Atención</CardTitle>
              <CardDescription>
                Ingrese la cédula del paciente para comenzar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConsultationPatientSearch
                patients={patients}
                onPatientFound={handlePatientFound}
                onCnePatientFound={handleCnePatientFound}
              />
            </CardContent>
          </Card>

          {/* 3. Stats Rápidos */}
          <div className="h-24 shrink-0">
            <FastStatsWidget />
          </div>

          {/* Espacio flexible si queremos agregar más cosas abajo o dejar aire */}
          <div className="flex-1 min-h-0" />
        </div>

        {/* Columna Lateral - Derecha (5 cols) */}
        <div className="md:col-span-4 flex flex-col gap-4 h-full min-h-0">
          {/* Agenda del Día (50% altura) */}
          <div className="flex-1 min-h-0 basis-1/2">
            <TodaysAppointmentsWidget />
          </div>

          {/* Pacientes Recientes (50% altura) */}
          <div className="flex-1 min-h-0 basis-1/2">
            <RecentPatientsWidget />
          </div>
        </div>
      </div>
    </div>
  );
}
