import { zai } from "@/lib/zai";

/**
 * Service to generate vector embeddings for text.
 * Uses the configured OpenAI-compatible client (Z.ai).
 */
export class EmbeddingService {
    private model = "embedding-2"; // Updated to Z.ai supported model

    constructor() { }

    /**
     * Generates an embedding vector for a given text.
     * @param text The text to embed.
     * @returns Array of numbers representing the vector.
     */
    async generateEmbedding(text: string): Promise<number[]> {
        try {
            // Clean text to avoid issues with newlines
            const cleanText = text.replace(/\n/g, " ");

            const response = await zai.embeddings.create({
                model: this.model,
                input: cleanText,
            });

            const embedding = response.data[0]?.embedding;
            if (!embedding) {
                throw new Error("Embedding response is empty");
            }

            return embedding;
        } catch (error) {
            console.error("Error generating embedding:", error);
            throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
}

export const embeddingService = new EmbeddingService();
