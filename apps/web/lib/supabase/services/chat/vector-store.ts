import { createClient } from "@supabase/supabase-js";
import { DocumentChunk } from "../../types/chat.types";
import { Database } from "../../types/database.types"; // Assuming this exists or will be updated
// If Database types don't include documents yet, we might need a partial cast or update imports later.
// For now, we'll use 'any' or generic typed client if needed, but per plan we expect 'documents' table.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // IMPORTANT: Use Service Role Key for server-side vector ops

// We use a separate admin client for RAG operations to bypass RLS if necessary, 
// or standard client if RLS allows. Usually ingestion requires admin rights.
// For the purpose of this demo, we'll assume we can use the service key for ingestion 
// and potentially anon key for search if RLS is set up for public read.
// SECURITY WARNING: Never expose SUPABASE_SERVICE_ROLE_KEY to the client.

// NOTE: Since this code runs on server (API routes and Actions), we should ensure secure client usage.

export class VectorStore {
    private client;

    constructor() {
        // Initialize Supabase client
        // Note: In a real Next.js app, prefer creating the client contextually (e.g. createClient in server components)
        // but for utility services, a static init might be used provided env vars are available.
        if (!supabaseUrl || !supabaseServiceKey) {
            console.warn("Supabase credentials missing for VectorStore");
        }
        this.client = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                persistSession: false,
            },
        });
    }

    /**
     * Adds a document to the vector store.
     * @param chunk The document chunk to add.
     */
    async addDocument(chunk: DocumentChunk): Promise<void> {
        const { content, metadata, embedding } = chunk;

        // Embedding is optional now for Lexical RAG
        // if (!embedding) {
        //     throw new Error("Document chunk must have an embedding before insertion.");
        // }

        const { error } = await this.client
            .from("documents")
            .insert({
                content,
                metadata,
                embedding,
            });

        if (error) {
            console.error("Error adding document to vector store:", error);
            throw new Error(`Supabase Vector Error: ${error.message}`);
        }
    }

    /**
     * Searches for documents using keyword matching (Full Text Search).
     * @param queryText The text to search for.
     * @param limit Maximum number of results to return.
     */
    async searchKeywordDocuments(
        queryText: string,
        limit = 5
    ): Promise<DocumentChunk[]> {
        const { data: documents, error } = await this.client.rpc("match_documents_keyword", {
            query_text: queryText,
            match_count: limit,
        });

        if (error) {
            console.error("Error searching keyword store:", error);
            // Fallback: return empty if FTS fails (e.g. function not exists)
            return [];
        }

        return documents.map((doc: any) => ({
            id: doc.id,
            content: doc.content,
            metadata: doc.metadata,
            similarity: doc.rank, // Use rank as similarity
        }));
    }

    /**
     * Searches for similar documents using a query embedding.
     * @param queryEmbedding The vector embedding of the query.
     * @param threshold Similarity threshold (0-1).
     * @param limit Maximum number of results to return.
     */
    async searchSimilarDocuments(
        queryEmbedding: number[],
        threshold = 0.7,
        limit = 5
    ): Promise<DocumentChunk[]> {
        const { data: documents, error } = await this.client.rpc("match_documents", {
            query_embedding: queryEmbedding,
            match_threshold: threshold,
            match_count: limit,
        });

        if (error) {
            console.error("Error searching vector store:", error);
            throw new Error(`Supabase Search Error: ${error.message}`);
        }

        return documents.map((doc: any) => ({
            id: doc.id,
            content: doc.content,
            metadata: doc.metadata,
            similarity: doc.similarity,
        }));
    }
}

export const vectorStore = new VectorStore();
