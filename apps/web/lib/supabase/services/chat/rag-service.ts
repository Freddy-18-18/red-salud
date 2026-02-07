import { vectorStore } from "./vector-store";
import { createZaiChatCompletion } from "@/lib/zai";
import { RagContext } from "../../types/chat.types";
import OpenAI from "openai";

export class RagService {
    constructor() { }

    /**
     * Retrieves relevant context for a given query.
     */
    async retrieveContext(query: string): Promise<RagContext> {
        try {
            // LEXICAL RAG FALLBACK (due to missing Z.ai embedding model)
            // 1. Skip embedding generation
            // const queryEmbedding = await embeddingService.generateEmbedding(query);

            // 2. Search using Keyword Match (Full Text Search)
            // const chunks = await vectorStore.searchSimilarDocuments(queryEmbedding);
            console.log(`Searching for context with keyword: "${query}"`);
            const chunks = await vectorStore.searchKeywordDocuments(query);

            // 3. (Optional) Reranking could go here (as per skill), keeping it simple for v1
            // In v2 we could use a cross-encoder to rerank.

            return {
                chunks,
                // Create a summary string for the prompt
                summary: chunks.map(c => c.content).join("\n\n---\n\n"),
            };
        } catch (error) {
            console.error("Error retrieving context:", error);
            // Fallback: return empty context rather than crashing, 
            // allowing the bot to try answering with general knowledge (or refuse based on prompt)
            return { chunks: [], summary: "" };
        }
    }

    /**
     * Generates a response using RAG.
     */
    async generateResponse(
        messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
        contextMetadata: {
            current_url?: string;
            page_title?: string;
            user_role?: string;
        }
    ) {
        const userMessage = messages[messages.length - 1] as OpenAI.Chat.Completions.ChatCompletionUserMessageParam; // Assume last message is user query
        const query = typeof userMessage.content === 'string' ? userMessage.content : "";

        // 1. Retrieve Context
        const context = await this.retrieveContext(query);

        // 2. Construct System Prompt
        const systemPrompt = this.buildSystemPrompt(context.summary || "", contextMetadata);

        // 3. Prepare Messages for LLM
        // Replace the original system prompt or append ours
        const systemMessage: OpenAI.Chat.Completions.ChatCompletionSystemMessageParam = { role: "system", content: systemPrompt };
        const finalMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
            systemMessage,
            ...messages.filter(m => m.role !== 'system') // Filter out existing system prompts to avoid confusion
        ];

        // 4. Call LLM
        return createZaiChatCompletion(finalMessages, true);
    }

    private buildSystemPrompt(contextText: string, metadata: { current_url?: string; page_title?: string; user_role?: string }): string {
        return `
Eres un asistente inteligente de Red Salud.
Tu objetivo es ayudar al usuario basándote EXCLUSIVAMENTE en el contexto proporcionado.

CONTEXTO DE NAVEGACIÓN DEL USUARIO:
- URL actual: ${metadata.current_url || 'Desconocida'}
- Título de página: ${metadata.page_title || 'Desconocido'}
- Rol del usuario: ${metadata.user_role || 'Visitante'}

INFORMACIÓN RECUPERADA (BASE DE CONOCIMIENTO):
---------------------
${contextText}
---------------------

INSTRUCCIONES:
1. Usa la "INFORMACIÓN RECUPERADA" para responder. Si la respuesta está ahí, cítala o parafraseala.
2. Si la información NO está en el contexto, di educadamente: "Lo siento, no tengo información sobre eso en mi base de conocimientos actual."
3. NO inventes información.
4. Ten en cuenta el "CONTEXTO DE NAVEGACIÓN". Por ejemplo, si el usuario está en "Recetas" y pregunta "¿Cómo creo una?", asume que habla de recetas médicas.
5. Sé conciso y profesional.
`.trim();
    }
}

export const ragService = new RagService();
