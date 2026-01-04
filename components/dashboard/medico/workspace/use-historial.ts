import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

interface HistorialItem {
  id: string;
  fecha: string;
  diagnostico: string;
  notas: string;
  doctor: string;
}

export function useHistorial(cedula: string) {
  const [historialClinico, setHistorialClinico] = useState<HistorialItem[]>([]);
  const [selectedHistorial, setSelectedHistorial] = useState<HistorialItem | null>(null);

  useEffect(() => {
    const loadHistorialClinico = async () => {
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id')
          .eq('cedula', cedula)
          .single();

        if (!profileData) {
          const { data: offlineData } = await supabase
            .from('offline_patients')
            .select('notas_medico, created_at, doctor:profiles!offline_patients_doctor_id_fkey(nombre_completo)')
            .eq('cedula', cedula)
            .order('created_at', { ascending: false })
            .limit(10);

          if (offlineData && offlineData.length > 0) {
            const historial: HistorialItem[] = offlineData
              .filter(item => item.notas_medico)
              .map((item: any) => ({
                id: crypto.randomUUID(),
                fecha: item.created_at,
                diagnostico: 'Consulta previa',
                notas: item.notas_medico || 'Sin notas',
                doctor: item.doctor?.nombre_completo || 'Desconocido',
              }));
            setHistorialClinico(historial);
          }
          return;
        }

        const { data: notasData } = await supabase
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

        if (notasData && notasData.length > 0) {
          const historial: HistorialItem[] = notasData.map((nota: any) => ({
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
