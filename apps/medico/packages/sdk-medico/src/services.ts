import { GoogleGenerativeAI } from "@google/generative-ai";
import { SupabaseClient } from "@supabase/supabase-js";

// --- Gemini Types ---
export interface MedicalNoteInput {
    motivoConsulta?: string;
    sintomas?: string;
    duracion?: string;
    intensidad?: string;
    factoresAgravantes?: string;
    factoresAliviantes?: string;
    antecedentesMedicos?: string[];
    alergias?: string[];
    medicamentosActuales?: string[];
}

export interface GeneratedMedicalNote {
    notaCompleta: string;
    diagnosticosSugeridos: string[];
    codigosICD11Sugeridos: Array<{
        codigo: string;
        descripcion: string;
        probabilidad: "alta" | "media" | "baja";
    }>;
    planTratamiento?: string;
    examenesSugeridos?: string[];
}

// --- ICD-11 Types ---
export interface ICD11Code {
    id: string;
    code: string;
    title: string;
    definition?: string;
    chapter?: string;
    score?: number;
}

// --- BCV Types ---
export interface ExchangeRateData {
    rate: number;
    currency: string;
    date: string;
}

export class GeminiService {
    private genAI: GoogleGenerativeAI;

    constructor(apiKey: string) {
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    async generateMedicalNote(input: MedicalNoteInput): Promise<GeneratedMedicalNote> {
        const model = this.genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const prompt = `Eres un asistente médico experto. Genera una nota médica profesional en español basada en la siguiente información del paciente:
    ${JSON.stringify(input, null, 2)}
    Responde en formato JSON...`; // Simplified prompt for brevity in this example, use full prompt in real impl

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("Invalid AI response");
        return JSON.parse(jsonMatch[0]);
    }
}

export class ICDService {
    private clientId: string;
    private clientSecret: string;
    private tokenCache: { token: string; expiresAt: number } | null = null;

    constructor(clientId: string, clientSecret: string) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }

    private async getAccessToken(): Promise<string> {
        if (this.tokenCache && this.tokenCache.expiresAt > Date.now()) {
            return this.tokenCache.token;
        }
        const response = await fetch("https://icdaccessmanagement.who.int/connect/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                client_id: this.clientId,
                client_secret: this.clientSecret,
                scope: "icdapi_access",
                grant_type: "client_credentials",
            }),
        });
        const data = await response.json();
        this.tokenCache = { token: data.access_token, expiresAt: Date.now() + (data.expires_in - 60) * 1000 };
        return data.access_token;
    }

    async search(query: string): Promise<ICD11Code[]> {
        const token = await this.getAccessToken();
        const url = `https://id.who.int/icd/release/11/2025-01/mms/search?q=${encodeURIComponent(query)}&flatResults=true`;
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${token}`, "Accept-Language": "es", "API-Version": "v2" },
        });
        const data = await response.json();
        return (data.destinationEntities || []).map((e: any) => ({
            id: e.id,
            code: e.theCode || "",
            title: e.title.replace(/<[^>]*>/g, ''),
            chapter: e.chapter,
            score: e.score,
        }));
    }
}

export class BCVService {
    constructor(private supabase: SupabaseClient, private serviceUrl: string) { }

    async getRates(): Promise<ExchangeRateData[]> {
        const { data } = await this.supabase
            .from('exchange_rates')
            .select('*')
            .gte('created_at', new Date().toISOString().split('T')[0]);

        if (data && data.length > 1) return data.map(d => ({ rate: parseFloat(d.rate), currency: d.currency_pair.split('_')[0], date: d.created_at }));

        const res = await fetch(`${this.serviceUrl}/rates`);
        const json = await res.json();
        return json.success ? json.rates : [];
    }
}
