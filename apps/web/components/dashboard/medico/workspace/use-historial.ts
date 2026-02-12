import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

interface HistorialItem {
  id: string;
  fecha: string;
  diagnostico: string;
  notas: string;
  doctor: string;
}

interface ProfileData {
  id: string;
}

interface OfflinePatientData {
  notas_medico: string;
  created_at: string;
  doctor: { nombre_completo: string } | { nombre_completo: string }[];
}

interface MedicalNoteData {
  id: string;
  created_at: string;
  diagnosis: string;
  content: string;
  doctor: { nombre_completo: string };
}

export function useHistorial(cedula: string) {
  const [historialClinico, setHistorialClinico] = useState<HistorialItem[]>([]);
  const [selectedHistorial, setSelectedHistorial] = useState<HistorialItem | null>(null);

  useEffect(() => {
    const loadHistorialClinico = async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('cedula', cedula)
          .single();

        const profileData = profile as ProfileData | null;

        if (!profileData) {
          const { data: offline } = await supabase
            .from('offline_patients')
            .select('notas_medico, created_at, doctor:profiles!offline_patients_doctor_id_fkey(nombre_completo)')
            .eq('cedula', cedula)
            .order('created_at', { ascending: false })
            .limit(10);

          const offlineData = offline as unknown as OfflinePatientData[] | null;

          if (offlineData && offlineData.length > 0) {
            const historial: HistorialItem[] = offlineData
              .filter(item => item.notas_medico)
              .map((item) => {
                const doctorName = Array.isArray(item.doctor)
                  ? item.doctor[0]?.nombre_completo
                  : item.doctor?.nombre_completo;

                return {
                  id: crypto.randomUUID(),
                  fecha: item.created_at,
                  diagnostico: 'Consulta previa',
                  notas: item.notas_medico || 'Sin notas',
                  doctor: doctorName || 'Desconocido',
                };
              });
            setHistorialClinico(historial);
          }
          return;
        }

        const { data: notes } = await supabase
          .from('medical_notes')
          .select(`
            id,
            created_at,
            diagnosis,
            content,
            doctor:profiles!medical_notes_doctor_id_fkey(nombre_completo)
          `)
          .eq('patient_id', profileData.id)
          .order('created_at', { ascending: false })
          .limit(10);

        const notasData = notes as unknown as MedicalNoteData[] | null;

        if (notasData && notasData.length > 0) {
          const historial: HistorialItem[] = notasData.map((nota) => ({
            id: nota.id,
            fecha: nota.created_at,
            diagnostico: nota.diagnosis || 'Sin diagnóstico',
            notas: nota.content || 'Sin notas',
            doctor: nota.doctor?.nombre_completo || 'Desconocido',
          }));
          setHistorialClinico(historial);
        }
      } catch (error) {
        console.error('Error loading historial:', error);
      }
    };

    if (cedula) {
      loadHistorialClinico();
    }
  }, [cedula]);

  return {
    historialClinico,
    selectedHistorial,
    setSelectedHistorial,
  };
}
