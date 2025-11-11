import { supabase } from '@mobile/services/supabaseClient';

export interface Cita {
  id: string;
  tipo: string;
  fecha: string; // ISO
}

export async function getCitasPaciente(userId: string): Promise<Cita[]> {
  const { data, error } = await supabase
    .from('citas')
    .select('id, tipo, fecha')
    .eq('paciente_id', userId)
    .order('fecha', { ascending: true });
  if (error) throw error;
  return (data || []) as Cita[];
}
