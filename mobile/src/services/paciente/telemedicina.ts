import { supabase } from '@mobile/services/supabaseClient';

export interface SesionTelemedicina {
  id: string;
  estado: string;
}

export async function getSesionesTelemedicina(userId: string): Promise<SesionTelemedicina[]> {
  const { data, error } = await supabase
    .from('sesiones_telemedicina')
    .select('id, estado')
    .eq('paciente_id', userId)
    .order('id', { ascending: false });
  if (error) throw error;
  return (data || []) as SesionTelemedicina[];
}
