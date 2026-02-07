import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCORS } from "./utils/cors.ts";
// import { SeniatService } from "./services/seniat.ts";

/**
 * 🕵️‍♂️ RED-SALUD: VERIFICADOR RIF (SENIAT)
 * 
 * Estructura de Microservicio modular para Edge Functions.
 */

const RAILWAY_URL = "https://rif-verification-service-production.up.railway.app";

serve(async (req) => {
    // Manejo de CORS
    const corsRes = handleCORS(req);
    if (corsRes) return corsRes;

    // const url = new URL(req.url);

    try {
        // Procesar JSON para el resto de acciones (POST)
        const body = await req.json().catch(() => ({}));
        const { action, rif, captcha, sessionId, session } = body;
        const finalSessionId = sessionId || session;

        // 1. ACCIÓN: OBTENER CAPTCHA
        if (action === "get-captcha") {
            const backendRes = await fetch(`${RAILWAY_URL}/get-captcha`);
            const data = await backendRes.json();

            if (!backendRes.ok || data.error) {
                return new Response(JSON.stringify({
                    error: data.error || "Error al obtener captcha del backend"
                }), {
                    status: backendRes.status === 200 ? 500 : backendRes.status,
                    headers: { ...corsHeaders, "Content-Type": "application/json" }
                });
            }

            return new Response(JSON.stringify({
                session: data.sessionId, // Mapeo para el frontend
                captchaUrl: data.captchaBase64 // El frontend usa esto como src
            }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        // 2. ACCIÓN: VALIDAR RIF
        if (action === "validate") {
            const backendRes = await fetch(`${RAILWAY_URL}/validate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rif, captcha, sessionId: finalSessionId })
            });
            const result = await backendRes.json();

            if (!backendRes.ok || result.error) {
                return new Response(JSON.stringify({
                    success: false,
                    error: result.error || "Error en el servidor de validación"
                }), {
                    status: backendRes.status === 200 ? 400 : backendRes.status,
                    headers: { ...corsHeaders, "Content-Type": "application/json" }
                });
            }

            return new Response(JSON.stringify(result), {
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        return new Response(JSON.stringify({ error: "Acción no válida" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

    } catch (error) {
        console.error("[Fatal Error]", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
        });
    }
});
