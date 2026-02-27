import { useMedicoAuth } from "@red-salud/sdk-medico";
import { supabase } from "@/lib/supabase/client";

export function useAuth() {
  return useMedicoAuth(supabase);
}

