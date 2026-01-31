/**
 * Sistema de Seguimiento de Sesiones Activas
 * 
 * Permite a los usuarios ver y gestionar todas sus sesiones activas
 * desde diferentes dispositivos.
 */

import { supabase } from "@/lib/supabase/client";

export interface ActiveSession {
  id: string;
  user_id: string;
  device_info: string;
  ip_address: string;
  last_activity: string;
  created_at: string;
  is_current: boolean;
}

/**
 * Obtiene todas las sesiones activas del usuario
 */
export async function getActiveSessions(): Promise<ActiveSession[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from("active_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("last_activity", { ascending: false });

    if (error) {
      console.error("Error fetching active sessions:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getActiveSessions:", error);
    return [];
  }
}

/**
 * Cierra una sesión específica
 */
export async function terminateSession(sessionId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("active_sessions")
      .delete()
      .eq("id", sessionId);

    if (error) {
      console.error("Error terminating session:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in terminateSession:", error);
    return false;
  }
}

/**
 * Cierra todas las sesiones excepto la actual
 */
export async function terminateAllOtherSessions(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return false;
    }

    // Obtener el ID de la sesión actual
    const currentSessionId = localStorage.getItem("current_session_id");

    const { error } = await supabase
      .from("active_sessions")
      .delete()
      .eq("user_id", user.id)
      .neq("id", currentSessionId || "");

    if (error) {
      console.error("Error terminating other sessions:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in terminateAllOtherSessions:", error);
    return false;
  }
}

/**
 * Actualiza la última actividad de la sesión actual
 */
export async function updateSessionActivity(): Promise<void> {
  try {
    const currentSessionId = localStorage.getItem("current_session_id");
    
    if (!currentSessionId) {
      return;
    }

    await supabase
      .from("active_sessions")
      .update({ last_activity: new Date().toISOString() })
      .eq("id", currentSessionId);
  } catch (error) {
    console.error("Error updating session activity:", error);
  }
}

/**
 * Registra una nueva sesión
 */
export async function registerSession(deviceInfo: string, ipAddress: string): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from("active_sessions")
      .insert({
        user_id: user.id,
        device_info: deviceInfo,
        ip_address: ipAddress,
        last_activity: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error registering session:", error);
      return null;
    }

    // Guardar el ID de la sesión actual
    if (data) {
      localStorage.setItem("current_session_id", data.id);
      return data.id;
    }

    return null;
  } catch (error) {
    console.error("Error in registerSession:", error);
    return null;
  }
}
