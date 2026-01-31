import { createClient } from "./client";
import { type LoginFormData } from "@red-salud/core/validations";

export async function signIn(data: LoginFormData) {
    const supabase = createClient();
    try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
        });

        if (authError) {
            return {
                success: false,
                error: authError.message,
            };
        }

        if (!authData.user) {
            return {
                success: false,
                error: "No se pudo iniciar sesión",
            };
        }

        return {
            success: true,
            user: authData.user,
            session: authData.session,
        };
    } catch (error) {
        console.error("Error en signIn:", error);
        return {
            success: false,
            error: "Error inesperado al iniciar sesión.",
        };
    }
}

export async function signOut() {
    const supabase = createClient();
    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Error en signOut:", error);
            return { success: false, error: error.message };
        }
        return { success: true };
    } catch (error) {
        console.error("Error en signOut:", error);
        return { success: false, error: "Error inesperado" };
    }
}
