import { createClient } from "@/lib/supabase/server";
import { getEmbedding } from "./gemini-service";
import { knowledgeDocuments } from "@/lib/data/knowledge-base";

export interface KnowledgeDocument {
    content: string;
    metadata: {
        title: string;
        category: string;
        url: string;
        keywords: string[];
    };
    similarity?: number;
    source: 'vector' | 'keyword';
}

/**
 * Perform Hybrid Search: Semantic (Vector) + Keyword
 */
export async function searchHybridKnowledge(query: string, limit = 5): Promise<KnowledgeDocument[]> {
    const supabase = await createClient();
    const uniqueDocs = new Map<string, KnowledgeDocument>();

    try {
        // 1. Vector Search
        const embedding = await getEmbedding(query);
        const { data: vectorDocs, error } = await supabase.rpc("match_documents", {
            query_embedding: embedding,
            match_threshold: 0.4,
            match_count: limit,
        });

        if (!error && vectorDocs) {
            vectorDocs.forEach((doc: Record<string, unknown>) => {
                uniqueDocs.set(doc.content as string, {
                    content: doc.content as string,
                    metadata: doc.metadata as KnowledgeDocument['metadata'],
                    similarity: doc.similarity as number,
                    source: 'vector'
                });
            });
        }
    } catch (_e) {
        console.error("[Vector Search Error]:", _e);
    }

    // 2. Keyword Search (Fallback and Boost)
    const keywords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    if (keywords.length > 0) {
        knowledgeDocuments.forEach(doc => {
            const contentToSearch = (doc.content + " " + doc.metadata.title + " " + doc.metadata.keywords.join(" ")).toLowerCase();
            const matches = keywords.filter(kw => contentToSearch.includes(kw)).length;

            if (matches > 0) {
                const keywordScore = matches / keywords.length;
                if (!uniqueDocs.has(doc.content) || (uniqueDocs.get(doc.content)?.similarity || 0) < keywordScore) {
                    uniqueDocs.set(doc.content, {
                        ...doc,
                        similarity: keywordScore,
                        source: 'keyword'
                    });
                }
            }
        });
    }

    // Sort by similarity and return limit
    return Array.from(uniqueDocs.values())
        .sort((a, b) => (b.similarity || 0) - (a.similarity || 0))
        .slice(0, limit);
}
