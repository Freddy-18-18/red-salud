import { config } from "dotenv";
import fs from "fs";
import path from "path";
import { embeddingService } from "../apps/web/lib/supabase/services/chat/embedding-service";
import { vectorStore } from "../apps/web/lib/supabase/services/chat/vector-store";
import { createClient } from "@supabase/supabase-js";

// Load environment variables from apps/web/.env.local (assuming that's where keys are)
// We try to load from multiple potential locations
const envPaths = [
    path.resolve(__dirname, "../apps/web/.env.local"),
    path.resolve(__dirname, "../.env.local"),
    path.resolve(__dirname, "../.env"),
];

for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
        console.log(`Loading env from ${envPath}`);
        config({ path: envPath });
        break;
    }
}

// Simple Recursive Character Text Splitter implementation
class RecursiveCharacterTextSplitter {
    private chunkSize: number;
    private chunkOverlap: number;
    private separators: string[];

    constructor({ chunkSize = 1000, chunkOverlap = 200 } = {}) {
        this.chunkSize = chunkSize;
        this.chunkOverlap = chunkOverlap;
        this.separators = ["\n\n", "\n", " ", ""];
    }

    splitText(text: string): string[] {
        const finalChunks: string[] = [];
        let goodChunks: string[] = [];

        // First split by generic separator if possible? 
        // Actually, recursive splitting is slightly more complex. 
        // Simplified version: just split by paragraphs first.

        // Let's implement a simplified iterative approach appropriate for a script
        goodChunks = this._splitText(text, this.separators);
        return goodChunks;
    }

    private _splitText(text: string, separators: string[]): string[] {
        const finalChunks: string[] = [];
        let separator = separators[0];
        let newSeparators: string[] = [];

        for (let i = 0; i < separators.length; i++) {
            if (text.includes(separators[i])) {
                separator = separators[i];
                newSeparators = separators.slice(i + 1);
                break;
            }
        }

        const splits = text.split(separator);
        let currentChunk: string[] = [];
        let currentLength = 0;

        for (const split of splits) {
            if (split.length < this.chunkSize) {
                // If adding this split captures the chunk size
                if (currentLength + split.length + separator.length > this.chunkSize) {
                    // Push current chunk
                    if (currentLength > 0) {
                        const doc = currentChunk.join(separator);
                        // Verify if we need to split further
                        if (doc.length > this.chunkSize && newSeparators.length > 0) {
                            const subDocs = this._splitText(doc, newSeparators);
                            finalChunks.push(...subDocs);
                        } else {
                            finalChunks.push(doc);
                        }

                        // Start overlap
                        // Keep minimal overlap? For simplicity, we just start fresh or keep last generic
                        // Proper overlap logic is complex for this snippet. 
                        // Let's just reset for now and implementation overlap via sliding window if needed.
                        // A simple overlap strategy:
                        while (currentLength > this.chunkOverlap && currentChunk.length > 0) {
                            const removed = currentChunk.shift();
                            currentLength -= (removed?.length || 0) + separator.length;
                        }
                    }
                }
                currentChunk.push(split);
                currentLength += split.length + separator.length;
            } else {
                // Split is larger than chunk size
                // Push current buffer if any
                if (currentLength > 0) {
                    finalChunks.push(currentChunk.join(separator));
                    currentChunk = [];
                    currentLength = 0;
                }
                // Recurse on this big split
                if (newSeparators.length > 0) {
                    finalChunks.push(...this._splitText(split, newSeparators));
                } else {
                    finalChunks.push(split); // Can't split further, just force it
                }
            }
        }

        if (currentChunk.length > 0) {
            finalChunks.push(currentChunk.join(separator));
        }

        return finalChunks;
    }
}

const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1500, chunkOverlap: 200 });

async function processFile(filePath: string) {
    console.log(`Processing ${filePath}...`);
    const content = fs.readFileSync(filePath, "utf-8");
    const filename = path.basename(filePath);

    const chunks = splitter.splitText(content);
    console.log(`- Split into ${chunks.length} chunks.`);

    for (let i = 0; i < chunks.length; i++) {
        const chunkContent = chunks[i];

        // Skip empty chunks
        if (!chunkContent.trim()) continue;

        console.log(`  - Embed/Store chunk ${i + 1}/${chunks.length} (${chunkContent.length} chars)`);

        try {
            const embedding = await embeddingService.generateEmbedding(chunkContent);

            await vectorStore.addDocument({
                content: chunkContent,
                metadata: {
                    source: "file",
                    title: filename,
                    url: `/docs/${filename}`,
                    page: i + 1
                },
                embedding: embedding
            });
        } catch (err: any) {
            console.error(`  - Failed to process chunk ${i}:`, err.message);
        }
    }
}

async function main() {
    const docsDir = path.resolve(__dirname, "../docs");

    if (!fs.existsSync(docsDir)) {
        console.error(`Docs directory not found at ${docsDir}`);
        return;
    }

    const files = fs.readdirSync(docsDir).filter(f => f.endsWith(".md"));

    console.log(`Found ${files.length} markdown files in docs/`);

    for (const file of files) {
        await processFile(path.join(docsDir, file));
    }

    console.log("Ingestion complete!");
}

main().catch(console.error);
