export interface SeniatCaptchaResponse {
    session: string;
    captchaUrl: string;
}

export interface SeniatValidationResponse {
    success: boolean;
    businessName?: string;
    error?: string;
}

const SENIAT_URL = "http://contribuyente.seniat.gob.ve/BuscaRif/BuscaRif.jsp";
const CAPTCHA_URL = "http://contribuyente.seniat.gob.ve/BuscaRif/Captcha.jsp";
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36";

export class SeniatService {
    static async getNewSession(baseUrl: string): Promise<SeniatCaptchaResponse> {
        console.log("[SeniatService] Fetching initial page for session...");
        const response = await fetch(SENIAT_URL, {
            headers: { "User-Agent": USER_AGENT }
        });

        const setCookie = response.headers.get("set-cookie") || "";
        const jSessionId = setCookie.split(";")[0] || "";

        if (!jSessionId) {
            throw new Error("No se pudo obtener la sesión del SENIAT");
        }

        return {
            session: jSessionId,
            captchaUrl: `${baseUrl}?captcha_proxy=true&session=${encodeURIComponent(jSessionId)}`
        };
    }

    static async proxyCaptcha(session: string): Promise<Response> {
        console.log("[SeniatService] Proxying captcha image...");
        const imgRes = await fetch(CAPTCHA_URL, {
            headers: {
                "Cookie": session,
                "User-Agent": USER_AGENT
            }
        });

        if (!imgRes.ok) throw new Error("Error al descargar captcha");

        const buffer = await imgRes.arrayBuffer();
        return new Response(buffer, {
            headers: { "Content-Type": "image/jpeg", "Cache-Control": "no-cache" }
        });
    }

    static async validateRif(rif: string, captcha: string, session: string): Promise<SeniatValidationResponse> {
        console.log(`[SeniatService] Validating RIF: ${rif}`);

        const cleanRif = rif.trim().replace(/-/g, "").toUpperCase();

        const params = new URLSearchParams();
        params.append("p_rif", cleanRif);
        params.append("codigo", captcha);
        params.append("busca", " Buscar ");

        const response = await fetch(SENIAT_URL, {
            method: "POST",
            headers: {
                "Cookie": session,
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": USER_AGENT,
                "Referer": SENIAT_URL
            },
            body: params.toString()
        });

        const html = await response.text();

        if (html.includes("incorrecto")) {
            return { success: false, error: "Código de seguridad incorrecto" };
        }

        // Precise Regex to capture business name
        const nameMatch = html.match(/Nombre\s+o\s+Raz..n\s+Social:.*?<b[^>]*>(.*?)<\/b>/si);
        let businessName = nameMatch ? nameMatch[1].trim() : null;

        if (businessName) {
            businessName = businessName
                .replace(/&quot;/g, '"')
                .replace(/&amp;/g, '&')
                .replace(/\s+/g, ' ');
            return { success: true, businessName };
        }

        return { success: false, error: "Contribuyente no encontrado o error en el portal" };
    }
}
