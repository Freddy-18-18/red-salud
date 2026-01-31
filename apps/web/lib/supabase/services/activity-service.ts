import { supabase } from "../client";

export async function logActivity(
  userId: string,
  activityType: string,
  description: string,
  metadata?: any
) {
  try {
    const { error } = await supabase.from("user_activity_log").insert({
      user_id: userId,
      activity_type: activityType,
      description,
      metadata,
      status: "success",
    });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error logging activity:", error);
    return { success: false, error };
  }
}

export async function getUserActivity(userId: string, limit = 20) {
  try {
    const { data, error } = await supabase
      .from("user_activity_log")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching activity:", error);
    return { success: false, error };
  }
}

export async function getUserSessions(userId: string) {
  try {
    const { data, error } = await supabase
      .from("user_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("last_active_at", { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return { success: false, error };
  }
}

export async function terminateSession(sessionId: string) {
  try {
    const { error } = await supabase
      .from("user_sessions")
      .delete()
      .eq("id", sessionId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error terminating session:", error);
    return { success: false, error };
  }
}
