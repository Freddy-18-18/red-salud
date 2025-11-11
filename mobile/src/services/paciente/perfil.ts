import { supabase } from '@mobile/services/supabaseClient';

export interface PerfilBasico {
  id: string;
  nombre: string | null;
}

export async function getPerfilBasico(userId: string): Promise<PerfilBasico | null> {
  // Ajustar a tu tabla real de perfiles de paciente.
  const { data, error } = await supabase
    .from('perfiles')
    .select('id, nombre')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data as PerfilBasico;
}
