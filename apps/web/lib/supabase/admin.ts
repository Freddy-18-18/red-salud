/**
 * Cliente de Supabase para uso exclusivo en el servidor (Admin API)
 * NUNCA expongas la Service Role Key en el cliente.
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Faltan variables de entorno para Supabase Admin (URL o SERVICE_ROLE_KEY)");
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
