/**
 * Sistema de Notificaciones de Seguridad
 * 
 * Envía alertas cuando:
 * - Hay un nuevo inicio de sesión
 * - Se detecta un dispositivo desconocido
 * - Se cambia la contraseña
 * - Se detecta actividad sospechosa
 */

import { supabase } from "@/lib/supabase/client";

export type NotificationType =
  | "new_login"
  | "unknown_device"
  | "password_changed"
  | "suspicious_activity"
  | "account_locked"
  | "2fa_enabled"
  | "2fa_disabled";

export type NotificationSeverity = "info" | "warning" | "critical";

interface SecurityNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  severity: NotificationSeverity;
  isRead: boolean;
  metadata?: Record<string, any>;
  sentVia: string[];
  createdAt: string;
}

/**
 * Crea una notificación de seguridad
 */
export async function createSecurityNotification(
  type: NotificationType,
  title: string,
  message: string,
  options: {
    severity?: NotificationSeverity;
    metadata?: Record<string, any>;
    sentVia?: string[];
  } = {}
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Usuario no autenticado" };
    }

    const { error } = await supabase.from("security_notifications").insert({
      user_id: user.id,
      type,
      title,
      message,
      severity: options.severity || "info",
      metadata: options.metadata,
      sent_via: options.sentVia || ["email"],
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al crear notificación" };
  }
}

/**
 * Notifica sobre un nuevo inicio de sesión
 */
export async function notifyNewLogin(
  deviceInfo: {
    deviceName?: string;
    browser?: string;
    os?: string;
    location?: string;
    ipAddress?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const location = deviceInfo.location || "Ubicación desconocida";
  const device = deviceInfo.deviceName || `${deviceInfo.browser} en ${deviceInfo.os}`;

  return createSecurityNotification(
    "new_login",
    "Nuevo inicio de sesión",
    `Se ha iniciado sesión en tu cuenta desde ${device} en ${location}`,
    {
      severity: "info",
      metadata: deviceInfo,
      sentVia: ["email"],
    }
  );
}

/**
 * Notifica sobre un dispositivo desconocido
 */
export async function notifyUnknownDevice(
  deviceInfo: {
    deviceName?: string;
    browser?: string;
    os?: string;
    location?: string;
    ipAddress?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const location = deviceInfo.location || "Ubicación desconocida";
  const device = deviceInfo.deviceName || `${deviceInfo.browser} en ${deviceInfo.os}`;

  return createSecurityNotification(
    "unknown_device",
    "⚠️ Dispositivo desconocido detectado",
    `Se detectó un intento de inicio de sesión desde un dispositivo no reconocido: ${device} en ${location}. Si no fuiste tú, cambia tu contraseña inmediatamente.`,
    {
      severity: "warning",
      metadata: deviceInfo,
      sentVia: ["email", "push"],
    }
  );
}

/**
 * Notifica sobre cambio de contraseña
 */
export async function notifyPasswordChanged(): Promise<{
  success: boolean;
  error?: string;
}> {
  return createSecurityNotification(
    "password_changed",
    "Contraseña cambiada",
    "Tu contraseña ha sido cambiada exitosamente. Si no realizaste este cambio, contacta con soporte inmediatamente.",
    {
      severity: "warning",
      sentVia: ["email"],
    }
  );
}

/**
 * Notifica sobre actividad sospechosa
 */
export async function notifySuspiciousActivity(
  details: string,
  riskScore: number
): Promise<{ success: boolean; error?: string }> {
  const severity: NotificationSeverity = riskScore > 70 ? "critical" : "warning";

  return createSecurityNotification(
    "suspicious_activity",
    "🚨 Actividad sospechosa detectada",
    `Se ha detectado actividad inusual en tu cuenta: ${details}. Por seguridad, revisa tu actividad reciente.`,
    {
      severity,
      metadata: { riskScore, details },
      sentVia: ["email", "push"],
    }
  );
}

/**
 * Notifica sobre bloqueo de cuenta
 */
export async function notifyAccountLocked(
  reason: string
): Promise<{ success: boolean; error?: string }> {
  return createSecurityNotification(
    "account_locked",
    "🔒 Cuenta bloqueada",
    `Tu cuenta ha sido bloqueada por seguridad. Razón: ${reason}. Contacta con soporte para desbloquearla.`,
    {
      severity: "critical",
      metadata: { reason },
      sentVia: ["email", "sms"],
    }
  );
}

/**
 * Obtiene las notificaciones de seguridad del usuario
 */
export async function getSecurityNotifications(
  options: {
    unreadOnly?: boolean;
    limit?: number;
  } = {}
): Promise<{
  success: boolean;
  data?: SecurityNotification[];
  error?: string;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Usuario no autenticado" };
    }

    let query = supabase
      .from("security_notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (options.unreadOnly) {
      query = query.eq("is_read", false);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    const notifications: SecurityNotification[] = (data || []).map((item) => ({
      id: item.id,
      type: item.type,
      title: item.title,
      message: item.message,
      severity: item.severity,
      isRead: item.is_read,
      metadata: item.metadata,
      sentVia: item.sent_via,
      createdAt: item.created_at,
    }));

    return { success: true, data: notifications };
  } catch (error) {
    return { success: false, error: "Error al obtener notificaciones" };
  }
}

/**
 * Marca una notificación como leída
 */
export async function markNotificationAsRead(
  notificationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("security_notifications")
      .update({ is_read: true })
      .eq("id", notificationId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al marcar notificación" };
  }
}

/**
 * Marca todas las notificaciones como leídas
 */
export async function markAllNotificationsAsRead(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Usuario no autenticado" };
    }

    const { error } = await supabase
      .from("security_notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al marcar notificaciones" };
  }
}

/**
 * Elimina una notificación
 */
export async function deleteNotification(
  notificationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("security_notifications")
      .delete()
      .eq("id", notificationId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al eliminar notificación" };
  }
}
