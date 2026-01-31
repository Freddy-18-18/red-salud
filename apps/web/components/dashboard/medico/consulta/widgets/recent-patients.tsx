"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@red-salud/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@red-salud/ui";
import { Button } from "@red-salud/ui";
import { Loader2, Clock, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface RecentPatient {
  id: string;
  nombre_completo: string;
  cedula: string | null;
  last_visit: string;
  type: "registered" | "offline";
  avatar_url?: string | null;
}

export function RecentPatientsWidget() {
  const router = useRouter();
  const [patients, setPatients] = useState<RecentPatient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentPatients = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Obtener últimas 20 citas para extraer pacientes únicos recientes
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from("appointments")
          .select(`
            fecha_hora,
            paciente_id,
            offline_patient_id
          `)
          .eq("medico_id", user.id)
          .order("fecha_hora", { ascending: false })
          .limit(20);

        if (appointmentsError) throw appointmentsError;

        if (!appointmentsData || appointmentsData.length === 0) {
            setPatients([]);
            return;
        }

        // Obtener IDs
        const patientIds = Array.from(new Set(appointmentsData.map(a => a.paciente_id).filter(Boolean))) as string[];
        const offlineIds = Array.from(new Set(appointmentsData.map(a => a.offline_patient_id).filter(Boolean))) as string[];

        // Fetch related
        const [patientsRes, offlineRes] = await Promise.all([
            patientIds.length > 0
                ? supabase.from("profiles").select("id, nombre_completo, cedula, avatar_url").in("id", patientIds)
                : Promise.resolve({ data: [], error: null }),
            offlineIds.length > 0
                ? supabase.from("offline_patients").select("id, nombre_completo, cedula").in("id", offlineIds)
                : Promise.resolve({ data: [], error: null })
        ]);

        const patientsMap = new Map(patientsRes.data?.map(p => [p.id, p]));
        const offlineMap = new Map(offlineRes.data?.map(p => [p.id, p]));

        const uniquePatientsMap = new Map<string, RecentPatient>();

        appointmentsData.forEach((apt: any) => {
            if (apt.paciente_id) {
                if (!uniquePatientsMap.has(apt.paciente_id)) {
                    const profile = patientsMap.get(apt.paciente_id);
                    if (profile) {
                        uniquePatientsMap.set(apt.paciente_id, {
                            id: apt.paciente_id,
                            nombre_completo: profile.nombre_completo,
                            cedula: profile.cedula,
                            last_visit: apt.fecha_hora,
                            type: "registered",
                            avatar_url: profile.avatar_url
                        });
                    }
                }
            } else if (apt.offline_patient_id) {
                if (!uniquePatientsMap.has(apt.offline_patient_id)) {
                    const offlineP = offlineMap.get(apt.offline_patient_id);
                    if (offlineP) {
                        uniquePatientsMap.set(apt.offline_patient_id, {
                            id: apt.offline_patient_id,
                            nombre_completo: offlineP.nombre_completo,
                            cedula: offlineP.cedula,
                            last_visit: apt.fecha_hora,
                            type: "offline"
                        });
                    }
                }
            }
        });

        setPatients(Array.from(uniquePatientsMap.values()).slice(0, 5));
      } catch (err) {
        console.error("Error fetching recent patients:", JSON.stringify(err, null, 2));
      } finally {
        setLoading(false);
      }
    };

    fetchRecentPatients();
  }, []);

  const handlePatientClick = (patient: RecentPatient) => {
      // Navegar al perfil del paciente o iniciar nueva consulta?
      // El usuario quiere "moverse a otras secciones... y volver".
      // Lo mejor es ir al detalle del paciente donde hay opción de "Nueva Consulta"
      if (patient.type === "registered") {
          // Asumiendo ruta de perfil de paciente
           router.push(`/dashboard/medico/pacientes/${patient.id}`);
      } else {
           router.push(`/dashboard/medico/pacientes/offline/${patient.id}`);
      }
  };

  if (loading) {
      return (
          <Card className="bg-muted/50 border-dashed h-full min-h-[200px] flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </Card>
      );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Pacientes Recientes
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        {patients.length === 0 ? (
             <div className="text-center py-8 text-muted-foreground text-sm">
                No hay pacientes recientes.
            </div>
        ) : (
            patients.map((patient) => (
                <div 
                    key={patient.id} 
                    className="flex items-center justify-between group cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors -mx-2"
                    onClick={() => handlePatientClick(patient)}
                >
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border">
                            <AvatarImage src={patient.avatar_url || undefined} />
                            <AvatarFallback>{patient.nombre_completo.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm font-medium leading-none group-hover:text-primary transition-colors">{patient.nombre_completo}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNow(new Date(patient.last_visit), { addSuffix: true, locale: es })}
                            </p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <User className="h-4 w-4" />
                    </Button>
                </div>
            ))
        )}
      </CardContent>
    </Card>
  );
}
