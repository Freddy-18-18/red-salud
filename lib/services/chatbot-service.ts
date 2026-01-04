import { createClient } from "@supabase/supabase-js";
import { getEmbedding } from "./gemini-service";
import { knowledgeDocuments } from "@/lib/data/knowledge-base";
import OpenAI from "openai";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize OpenAI client for OpenRouter
const openai = new OpenAI({
    baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
    dangerouslyAllowBrowser: true // Determine if this is needed based on usage (server vs client)
});

export interface ChatMessage {
    role: "user" | "assistant" | "system";
    content: string;
}

/**
 * Search for relevant documents using Hybrid approach (Vector + Keyword)
 */
async function searchDocuments(query: string) {
    try {
        const uniqueDocs = new Map<string, any>();
        
        // 1. Vector Search (Semantic)
        try {
            const embedding = await getEmbedding(query);
            const { data: vectorDocs, error } = await supabase.rpc("match_documents", {
                query_embedding: embedding,
                match_threshold: 0.30, // Relaxed threshold
                match_count: 4,
            });

            if (!error && vectorDocs) {
                vectorDocs.forEach((doc: any) => {
                    uniqueDocs.set(doc.content, { ...doc, source: 'vector' });
                });
            }
        } catch (e) {
            console.error("Vector search failed, falling back to keywords", e);
        }

        // 2. Keyword Search (Exact Match / Fallback)
        const keywordDocs = searchLocalKnowledge(query);
        keywordDocs.forEach((doc: any) => {
            if (!uniqueDocs.has(doc.content)) {
                // Only add if not already present or if score is very high
                uniqueDocs.set(doc.content, { ...doc, source: 'keyword' });
            }
        });

        // 3. Convert map to array and take top results
        // If we have both, vector results usually have better semantic relevance, 
        // but keyword results are good for exact specific terms.
        const combined = Array.from(uniqueDocs.values());
        
        // Return top 5
        return combined.slice(0, 5);
    } catch (error) {
        console.error("Error in searchDocuments:", error);
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
/**
 * Generate a streaming response from the chatbot
 */
export async function generateChatResponse(
    history: ChatMessage[],
    userMessage: string,
    context?: any
) {
    // 0. Tier 1: Strict Spam/Malicious Filter (Rule-based)
    // Only block obvious spam, profanity, or malicious attempts.
    // We do NOT block off-topic queries here (like football) to allow semantic matching to decide.
    const forbiddenPatterns = [
        /\b(sex|porn|xxx)\b/i,
        /\b(viagra|casino|betting)\b/i,
        /\b(ignore all previous instructions)\b/i
    ];

    if (forbiddenPatterns.some(pattern => pattern.test(userMessage))) {
        const stream = new ReadableStream({
            start(controller) {
                controller.enqueue({ choices: [{ delta: { content: "Lo siento, no puedo procesar tu mensaje." } }] });
                controller.close();
            }
        });
        return { [Symbol.asyncIterator]: async function* () { const r = stream.getReader(); while (true) { const { done, value } = await r.read(); if (done) break; yield value; } } };
    }

    // 1. Search for context
    const relevantDocs = await searchDocuments(userMessage);

    // Tier 2: Relevance Check
    // If no documents found, we assume it's off-topic.
    // We allow greetings to pass through.
    if (!relevantDocs || relevantDocs.length === 0) {
        // Fallback for short greetings that might not match docs well but should be answered
        if (/^(hola|buenos días|buenas tardes|hi|hello|hey|saludos)$/i.test(userMessage.trim())) {
            // Let it pass to LLM to handle greeting
        } else {
            // Static off-topic response
            const staticResponse = "¡Hola! 👋 Como asistente inteligente de Red Salud, mi especialidad es ayudarte con todo lo relacionado a nuestra plataforma médica. \n\nPuedo responder dudas sobre:\n- 🏥 Servicios y especialidades\n- 💰 Planes y precios\n- 📅 Agendamiento de citas\n- 👨‍⚕️ Funcionalidades para médicos y pacientes\n\nPor el momento no tengo información sobre otros temas, ¡pero estaré encantado de ayudarte con cualquier consulta sobre Red Salud!";

            const stream = new ReadableStream({
                start(controller) {
                    controller.enqueue({ choices: [{ delta: { content: staticResponse } }] });
                    controller.close();
                }
            });
            return { [Symbol.asyncIterator]: async function* () { const r = stream.getReader(); while (true) { const { done, value } = await r.read(); if (done) break; yield value; } } };
        }
    }

    const contextText = relevantDocs
        .map((doc: any) => `## ${doc.metadata?.title}\n${doc.content}`)
        .join("\n\n");

    // 2. Advanced System Prompt
    // Injected current page context to steer the model
    let pageContextInstructions = "";
    if (context?.page) {
        pageContextInstructions = `\nCONTEXTO DE NAVEGACIÓN: El usuario está viendo la página: ${context.page}.\nUsa esto para desambiguar (ej. "precio" en /medicos se refiere al plan médico).`;
    }

    const systemPrompt = `Eres el asistente virtual oficial de Red Salud. Tu objetivo es ayudar a pacientes, médicos y personal administrativo a usar la plataforma.

DIRECTRICES:
1.  **Fuente de Verdad**: Responde ÚNICAMENTE basándote en el CONTEXTO proporcionado abajo. Si la respuesta no está en el contexto, admite cortésmente que no tienes esa información y sugiere contactar a soporte. NO inventes datos.
2.  **Tono**: Profesional, empático, claro y conciso.
3.  **Formato**: Usa Markdown para listas, negritas y enlaces. Si mencionas pasos, usa listas numeradas.
4.  **Idioma**: Responde en el mismo idioma que el usuario (principalmente Español).
5.  **Precios**: Sé preciso con los costos (Plan Médico: $20/mes anual o $30/mes mensual). Pacientes: GRATIS.

CONTEXTO RECUPERADO:
${contextText}

${pageContextInstructions}

INFORMACIÓN CRÍTICA DE RESPALDO:
- Pacientes: Plan GRATIS siempre.
- Médicos: $20/mes (pago anual) o $30/mes. 30 días prueba gratis.
- Soporte: Chat 24/7, Email soporte@red-salud.com.
`;

    // 3. Limit History and Construct Messages
    // Only take last 4 messages to save context window and tokens
    const recentHistory = history.slice(-4);

    const messages: ChatMessage[] = [
        { role: "system", content: systemPrompt },
        ...recentHistory.map(msg => ({
            role: (msg.role === 'assistant' || msg.role === 'system') ? msg.role : 'user',
            content: msg.content
        })) as ChatMessage[],
        { role: "user", content: userMessage }
    ];

    // 4. Call OpenRouter API
    const response = await openai.chat.completions.create({
        model: "google/gemini-2.0-flash-exp:free", // Free model
        messages: messages as any,
        stream: true,
        temperature: 0.3, // Lower temperature for more deterministic/factual answers
        max_tokens: 500,  // Limit output tokens
    });

    return response;
}


