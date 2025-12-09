import { createClient } from "@supabase/supabase-js";
import { getEmbedding, getGeminiClient } from "./gemini-service";
import { knowledgeDocuments } from "@/lib/data/knowledge-base";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export interface ChatMessage {
    role: "user" | "model";
    content: string;
}

/**
 * Search for relevant documents in the vector database
 */
async function searchDocuments(query: string) {
    try {
        const embedding = await getEmbedding(query);

        const { data: documents, error } = await supabase.rpc("match_documents", {
            query_embedding: embedding,
            match_threshold: 0.4, // Lower threshold for better recall
            match_count: 5,
        });

        if (error) {
            console.error("Error searching documents:", error);
            // Fallback to local knowledge base
            return searchLocalKnowledge(query);
        }

        // If no results from vector DB, use local fallback
        if (!documents || documents.length === 0) {
            return searchLocalKnowledge(query);
        }

        return documents;
    } catch (error) {
        console.error("Error in searchDocuments:", error);
        // Fallback to local knowledge base on any error
        return searchLocalKnowledge(query);
    }
}

/**
 * Fallback search in local knowledge base
 */
function searchLocalKnowledge(query: string) {
    const queryLower = query.toLowerCase();
    const keywords = queryLower.split(/\s+/).filter(w => w.length > 2);

    // Score each document based on keyword matches
    const scored = knowledgeDocuments.map(doc => {
        const content = (doc.content + doc.metadata.title + doc.metadata.keywords.join(" ")).toLowerCase();
        const score = keywords.reduce((acc, keyword) => {
            return acc + (content.includes(keyword) ? 1 : 0);
        }, 0);
        // Boost score for title matches
        const titleScore = keywords.reduce((acc, keyword) => {
            return acc + (doc.metadata.title.toLowerCase().includes(keyword) ? 2 : 0);
        }, 0);
        // Boost for keyword matches
        const keywordScore = doc.metadata.keywords.reduce((acc, kw) => {
            return acc + (keywords.some(q => kw.includes(q) || q.includes(kw)) ? 3 : 0);
        }, 0);
        return { ...doc, score: score + titleScore + keywordScore };
    });

    // Filter and sort by score
    const results = scored
        .filter(doc => doc.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map(doc => ({
            content: doc.content,
            metadata: doc.metadata,
            similarity: doc.score / keywords.length, // Normalize
        }));

    return results;
}

/**
 * Generate a streaming response from the chatbot
 */
export async function generateChatResponse(
    history: ChatMessage[],
    userMessage: string
) {
    const client = getGeminiClient();
    const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });

    // 1. Search for context
    const relevantDocs = await searchDocuments(userMessage);

    const contextText = relevantDocs
        ?.map((doc: any) => `## ${doc.metadata?.title || "Información"}\n${doc.content}`)
        .join("\n\n---\n\n");

    // 2. Construct enhanced system prompt
    const systemPrompt = `Eres el asistente virtual de **Red Salud**, una plataforma de gestión médica integral.

## Tu Identidad
- Nombre: Asistente Red Salud
- Personalidad: Amable, profesional, eficiente y empático
- Idioma: Siempre en español
- Disponibilidad: 24/7

## Base de Conocimiento
${contextText ? `He encontrado la siguiente información relevante para responder:\n\n${contextText}` : "No encontré información específica en la base de conocimiento para esta consulta."}

## Reglas de Respuesta
1. **Usa la información del contexto** cuando esté disponible
2. **Formato Markdown**: Usa negritas, listas y estructura clara
3. **Sé conciso** pero completo (máximo 3-4 párrafos)
4. **Incluye enlaces** relevantes cuando menciones páginas (/precios, /servicios, /soporte)
5. **Si no sabes algo**, admítelo y sugiere contactar soporte
6. **Nunca inventes** información que no esté en el contexto
7. **Para consultas médicas específicas**, recomienda agendar cita con un profesional

## Información Clave de Red Salud
- **Pacientes**: Plan GRATIS con todas las funciones
- **Médicos**: $20/mes (anual) o $30/mes, 30 días prueba gratis
- **Secretarias**: GRATIS, requiere médico suscrito
- **Soporte**: Chat 24/7, email, teléfono Lun-Vie 8am-8pm

## Llamados a la Acción
- Para registrarse: "Puedes crear tu cuenta gratis en [nuestra página de registro](/auth/register)"
- Para precios: "Consulta todos nuestros planes en [la página de precios](/precios)"
- Para soporte: "Contacta a nuestro equipo en [soporte](/soporte)"
`;

    // 3. Start chat session
    const chat = model.startChat({
        history: [
            {
                role: "user",
                parts: [{ text: systemPrompt }],
            },
            {
                role: "model",
                parts: [{ text: "¡Entendido! Estoy listo para ayudar a los usuarios de Red Salud con información precisa y útil. ¿En qué puedo ayudarte?" }],
            },
            ...history.map((msg) => ({
                role: msg.role,
                parts: [{ text: msg.content }],
            })),
        ],
    });

    // 4. Send message and return stream
    const result = await chat.sendMessageStream(userMessage);
    return result.stream;
}

