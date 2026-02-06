"use server";

import { createClient } from "@/lib/supabase/server";
import speakeasy from "speakeasy";
import QRCode from "qrcode";

export async function generateTwoFactorSecretAction() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { error: "No autorizado" };
        }

        const secret = speakeasy.generateSecret({
            name: "Red Salud",
            issuer: "RedSalud",
        });

        if (!secret.otpauth_url) {
            return { error: "Error generando URL de autenticación" };
        }

        const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

        return {
            secret: secret.base32,
            qrCodeUrl,
        };
    } catch (error) {
        console.error("Error generating 2FA secret:", error);
        return { error: "Error al generar configuración 2FA" };
    }
}

export async function verifyAndEnableTwoFactorAction(secret: string, token: string) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { error: "No autorizado" };
        }

        const verified = speakeasy.totp.verify({
            secret,
            encoding: "base32",
            token,
            window: 1, // Permite +/- 30 segundos
        });

        if (!verified) {
            return { error: "Código incorrecto" };
        }

        // Actualizar perfil
        const { error } = await supabase
            .from("profiles")
            .update({
                two_factor_secret: secret,
                two_factor_enabled: true,
            })
            .eq("id", user.id);

        if (error) throw error;

        return { success: true };
    } catch (error) {
        console.error("Error enabling 2FA:", error);
        return { error: "Error al activar 2FA" };
    }
}

export async function disableTwoFactorAction() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { error: "No autorizado" };
        }

        const { error } = await supabase
            .from("profiles")
            .update({
                two_factor_secret: null,
                two_factor_enabled: false,
            })
            .eq("id", user.id);

        if (error) throw error;

        return { success: true };
    } catch (error) {
        console.error("Error disabling 2FA:", error);
        return { error: "Error al desactivar 2FA" };
    }
}

export async function verifyTwoFactorForAction(token: string) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { error: "No autorizado" };
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("two_factor_secret, two_factor_enabled")
            .eq("id", user.id)
            .single();

        if (!profile?.two_factor_enabled || !profile?.two_factor_secret) {
            return { error: "2FA no activado" };
        }

        const verified = speakeasy.totp.verify({
            secret: profile.two_factor_secret,
            encoding: "base32",
            token,
            window: 1,
        });

        if (!verified) {
            return { error: "Código incorrecto" };
        }

        return { success: true };
    } catch (error) {
        console.error("Error verifying 2FA:", error);
        return { error: "Error de verificación" };
    }
}
