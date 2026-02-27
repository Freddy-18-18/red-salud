import { supabase } from "../client";

async function logActivity(
  userId: string,
  activityType: string,
  description: string
) {
  try {
    const { error } = await supabase.from("user_activity_log").insert({
      user_id: userId,
      activity_type: activityType,
      description,
      status: "success",
    });
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}
export interface UserPreferences {
  language: string;
  timezone: string;
  dark_mode: boolean;
  desktop_notifications: boolean;
  sound_notifications: boolean;
  preferred_contact_method: string;
  newsletter_subscribed: boolean;
  promotions_subscribed: boolean;
  surveys_subscribed: boolean;
}

export interface PrivacySettings {
  profile_public: boolean;
  share_medical_history: boolean;
  show_profile_photo: boolean;
  share_location: boolean;
  anonymous_data_research: boolean;
  analytics_cookies: boolean;
}

export interface NotificationSettings {
  login_alerts: boolean;
  account_changes: boolean;
  appointment_reminders: boolean;
  lab_results: boolean;
  doctor_messages: boolean;
}

// ==================== PREFERENCIAS ====================
export async function getUserPreferences(userId: string) {
  try {
    const { data, error } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code === "PGRST116") {
      const { data: newData, error: insertError } = await supabase
        .from("user_preferences")
        .insert({ user_id: userId })
        .select()
        .single();

      if (insertError) throw insertError;
      return { success: true, data: newData };
    }

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return { success: false, error };
  }
}

export async function updateUserPreferences(
  userId: string,
  preferences: Partial<UserPreferences>
) {
  try {
    const { error } = await supabase
      .from("user_preferences")
      .upsert({
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (error) throw error;

    await logActivity(userId, "preferences_update", "Preferencias actualizadas");

    return { success: true };
  } catch (error) {
    console.error("Error updating preferences:", error);
    return { success: false, error };
  }
}

// ==================== PRIVACIDAD ====================
export async function getPrivacySettings(userId: string) {
  try {
    const { data, error } = await supabase
      .from("privacy_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code === "PGRST116") {
      const { data: newData, error: insertError } = await supabase
        .from("privacy_settings")
        .insert({ user_id: userId })
        .select()
        .single();

      if (insertError) throw insertError;
      return { success: true, data: newData };
    }

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching privacy settings:", error);
    return { success: false, error };
  }
}

export async function updatePrivacySettings(
  userId: string,
  settings: Partial<PrivacySettings>
) {
  try {
    const { error } = await supabase
      .from("privacy_settings")
      .upsert({
        user_id: userId,
        ...settings,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (error) throw error;

    await logActivity(
      userId,
      "privacy_update",
      "Configuración de privacidad actualizada"
    );

    return { success: true };
  } catch (error) {
    console.error("Error updating privacy settings:", error);
    return { success: false, error };
  }
}

// ==================== NOTIFICACIONES ====================
export async function getNotificationSettings(userId: string) {
  try {
    const { data, error } = await supabase
      .from("notification_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code === "PGRST116") {
      const { data: newData, error: insertError } = await supabase
        .from("notification_settings")
        .insert({ user_id: userId })
        .select()
        .single();

      if (insertError) throw insertError;
      return { success: true, data: newData };
    }

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching notification settings:", error);
    return { success: false, error };
  }
}

export async function updateNotificationSettings(
  userId: string,
  settings: Partial<NotificationSettings>
) {
  try {
    const { error } = await supabase
      .from("notification_settings")
      .upsert({
        user_id: userId,
        ...settings,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (error) throw error;

    await logActivity(
      userId,
      "notifications_update",
      "Configuración de notificaciones actualizada"
    );

    return { success: true };
  } catch (error) {
    console.error("Error updating notification settings:", error);
    return { success: false, error };
  }
}
