/**
 * Script to index all knowledge documents into the vector database
 * Run with: npx tsx scripts/index-knowledge-base.ts
 */

import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { knowledgeDocuments } from "../lib/data/knowledge-base";

// Initialize clients
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("❌ Missing GEMINI_API_KEY");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function getEmbedding(text: string): Promise<number[]> {
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent(text);
    return result.embedding.values;
}

async function clearExistingDocuments() {
    console.log("🗑️  Clearing existing documents...");
    const { error } = await supabase
        .from("documents")
        .delete()
        .neq("id", 0); // Delete all documents

    if (error) {
        console.error("Error clearing documents:", error);
        throw error;
    }
    console.log("✅ Cleared existing documents");
}

async function indexDocuments() {
    console.log("📚 Starting to index knowledge base...");
    console.log(`Total documents to index: ${knowledgeDocuments.length}`);

    let indexed = 0;
    let failed = 0;

    for (const doc of knowledgeDocuments) {
        try {
            // Create searchable text combining title, content and keywords
            const searchableText = `${doc.metadata.title}\n${doc.content}\n${doc.metadata.keywords.join(", ")}`;

            // Generate embedding
            console.log(`  📝 Indexing: ${doc.metadata.title}...`);
            const embedding = await getEmbedding(searchableText);

            // Insert into database
            const { error } = await supabase.from("documents").insert({
                content: doc.content,
                metadata: doc.metadata,
                embedding: embedding,
                category: doc.metadata.category,
            });

            if (error) {
                console.error(`  ❌ Error indexing "${doc.metadata.title}":`, error);
                failed++;
                continue;
            }

            indexed++;
            console.log(`  ✅ Indexed: ${doc.metadata.title}`);

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 200));

        } catch (error) {
            console.error(`  ❌ Failed to index "${doc.metadata.title}":`, error);
            failed++;
        }
    }

    console.log("\n" + "=".repeat(50));
    console.log(`📊 Indexing complete!`);
    console.log(`   ✅ Successfully indexed: ${indexed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log("=".repeat(50));
}

async function verifyIndex() {
    console.log("\n🔍 Verifying indexed documents...");

    const { data, error } = await supabase
        .from("documents")
        .select("id, metadata->title, category")
        .limit(10);

    if (error) {
        console.error("Error verifying:", error);
        return;
    }

    console.log(`Found ${data?.length || 0} documents in database:`);
    data?.forEach((doc: Record<string, unknown>) => {
        console.log(`  - ${doc.title as string} (${doc.category as string})`);
    });
}

async function testSearch(query: string) {
    console.log(`\n🔎 Testing search for: "${query}"`);

    const embedding = await getEmbedding(query);

    const { data, error } = await supabase.rpc("match_documents", {
        query_embedding: embedding,
        match_threshold: 0.5,
        match_count: 3,
    });

    if (error) {
        console.error("Error searching:", error);
        return;
    }

    console.log(`Found ${data?.length || 0} matching documents:`);
    data?.forEach((doc: Record<string, unknown>, i: number) => {
        const metadata = doc.metadata as { title: string };
        const similarity = doc.similarity as number;
        console.log(`  ${i + 1}. [${(similarity * 100).toFixed(1)}%] ${metadata.title}`);
    });
}

async function main() {
    console.log("\n" + "=".repeat(50));
    console.log("🚀 Red-Salud Knowledge Base Indexer");
    console.log("=".repeat(50) + "\n");

    try {
        // Clear and reindex
        await clearExistingDocuments();
        await indexDocuments();
        await verifyIndex();

        // Test some queries
        await testSearch("cuánto cuesta");
        await testSearch("cómo agendo una cita");
        await testSearch("telemedicina");

        console.log("\n✨ All done!\n");
    } catch (error) {
        console.error("Fatal error:", error);
        process.exit(1);
    }
}

main();
