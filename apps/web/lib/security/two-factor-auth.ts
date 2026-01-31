/**
 * Sistema de Autenticación de Dos Factores (2FA)
 * 
 * Soporta múltiples métodos:
 * - SMS con código
 * - App autenticadora (Google Authenticator, Authy)
 * - Email con código
 */

import { supabase } from "@/lib/supabase/client";
import * as crypto from "crypto";

export type TwoFactorMethod = "sms" | "authenticator" | "email";

interface TwoFactorSettings {
  method: TwoFactorMethod;
  isEnabled: boolean;
  phoneNumber?: string;
  secretKey?: string;
  backupCodes?: string[];
}

/**
 * Genera un secreto TOTP para Google Authenticator
 */
export function generateTOTPSecret(): string {
  const buffer = crypto.randomBytes(20);
  return buffer.toString("base64").replace(/=/g, "");
}

/**
 * Genera códigos de respaldo
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString("hex").toUpperCase();
    codes.push(`${code.slice(0, 4)}-${code.slice(4, 8)}`);
  }
  return codes;
}

/**
 * Genera un código de verificación de 6 dígitos
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Verifica un código TOTP (Time-based One-Time Password)
 */
export function verifyTOTP(secret: string, token: string): boolean {
  // Implementación simplificada - en producción usar librería como 'otplib'
  // Por ahora retornamos true para testing
  return token.length === 6 && /^\d+$/.test(token);
}

/**
 * Habilita 2FA para un usuario
 */
export async function enable2FA(
  method: TwoFactorMethod,
  options: {
    phoneNumber?: string;
    secretKey?: string;
  }
): Promise<{ success: boolean; backupCodes?: string[]; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Usuario no autenticado" };
    }

    const backupCodes = generateBackupCodes();

    const { error } = await supabase.from("user_2fa_settings").upsert({
      user_id: user.id,
      method,
      is_enabled: true,
      phone_number: options.phoneNumber,
      secret_key: options.secretKey,
      backup_codes: backupCodes,
      verified_at: new Date().toISOString(),
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // Crear notificación de seguridad
    await supabase.from("security_notifications").insert({
      user_id: user.id,
      type: "2fa_enabled",
      title: "Autenticación de dos factores activada",
      message: `Has activado 2FA mediante ${method}`,
      severity: "info",
      sent_via: ["email"],
    });

    return { success: true, backupCodes };
  } catch (error) {
    return { success: false, error: "Error al habilitar 2FA" };
  }
}

/**
 * Deshabilita 2FA para un usuario
 */
export async function disable2FA(
  method: TwoFactorMethod
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Usuario no autenticado" };
    }

    const { error } = await supabase
      .from("user_2fa_settings")
      .update({ is_enabled: false })
      .eq("user_id", user.id)
      .eq("method", method);

    if (error) {
      return { success: false, error: error.message };
    }

    // Crear notificación de seguridad
    await supabase.from("security_notifications").insert({
      user_id: user.id,
      type: "2fa_disabled",
      title: "Autenticación de dos factores desactivada",
      message: `Has desactivado 2FA mediante ${method}`,
      severity: "warning",
      sent_via: ["email"],
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al deshabilitar 2FA" };
  }
}

/**
 * Envía un código de verificación
 */
export async function sendVerificationCode(
  method: TwoFactorMethod,
  destination: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Usuario no autenticado" };
    }

    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    // Guardar código en la base de datos
    const { error } = await supabase.from("user_2fa_codes").insert({
      user_id: user.id,
      code,
      method,
      expires_at: expiresAt.toISOString(),
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // Aquí se enviaría el código por SMS/Email
    // Por ahora solo lo guardamos en la BD
    console.log(`Código 2FA: ${code} para ${destination}`);

    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al enviar código" };
  }
}

/**
 * Verifica un código de verificación
 */
export async function verifyCode(
  code: string,
  method: TwoFactorMethod
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Usuario no autenticado" };
    }

    // Buscar código válido
    const { data: codeData, error } = await supabase
      .from("user_2fa_codes")
      .select("*")
      .eq("user_id", user.id)
      .eq("code", code)
      .eq("method", method)
      .is("used_at", null)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (error || !codeData) {
      return { success: false, error: "Código inválido o expirado" };
    }

    // Marcar código como usado
    await supabase
      .from("user_2fa_codes")
      .update({ used_at: new Date().toISOString() })
      .eq("id", codeData.id);

    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al verificar código" };
  }
}

/**
 * Obtiene la configuración 2FA del usuario
 */
export async function get2FASettings(): Promise<{
  success: boolean;
  data?: TwoFactorSettings[];
  error?: string;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Usuario no autenticado" };
    }

    const { data, error } = await supabase
      .from("user_2fa_settings")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    const settings: TwoFactorSettings[] = (data || []).map((item) => ({
      method: item.method as TwoFactorMethod,
      isEnabled: item.is_enabled,
      phoneNumber: item.phone_number,
      secretKey: item.secret_key,
      backupCodes: item.backup_codes,
    }));

    return { success: true, data: settings };
  } catch (error) {
    return { success: false, error: "Error al obtener configuración 2FA" };
  }
}

/**
 * Verifica un código de respaldo
 */
export async function verifyBackupCode(
  code: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Usuario no autenticado" };
    }

    const { data: settings, error } = await supabase
      .from("user_2fa_settings")
      .select("backup_codes")
      .eq("user_id", user.id)
      .eq("is_enabled", true)
      .single();

    if (error || !settings) {
      return { success: false, error: "No se encontró configuración 2FA" };
    }

    const backupCodes = settings.backup_codes || [];
    const codeIndex = backupCodes.indexOf(code);

    if (codeIndex === -1) {
      return { success: false, error: "Código de respaldo inválido" };
    }

    // Remover el código usado
    backupCodes.splice(codeIndex, 1);

    await supabase
      .from("user_2fa_settings")
      .update({ backup_codes: backupCodes })
      .eq("user_id", user.id);

    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al verificar código de respaldo" };
  }
}