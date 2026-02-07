import { config } from "dotenv";
import fs from "fs";
import path from "path";

// Define service variables at top level scope
// let embeddingService: any;
interface VectorStore {
    addDocument: (doc: {
        content: string;
        metadata: {
            source: string;
            title: string;
            url: string;
            page: number;
        };
        embedding?: number[];
    }) => Promise<void>;
}

let vectorStore: VectorStore | null = null;

// Load environment variables
const envPath = path.resolve(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
    console.log(`Loading env from ${envPath}`);
    const result = config({ path: envPath });
    if (result.error) {
        console.error("Error loading .env file:", result.error);
    }
} else {
    console.warn("No .env.local file found at", envPath);
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
        return this._splitText(text, this.separators);
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
                if (currentLength + split.length + separator.length > this.chunkSize) {
                    if (currentLength > 0) {
                        const doc = currentChunk.join(separator);
                        if (doc.length > this.chunkSize && newSeparators.length > 0) {
                            const subDocs = this._splitText(doc, newSeparators);
                            finalChunks.push(...subDocs);
                        } else {
                            finalChunks.push(doc);
                        }
                        currentChunk = [];
                        currentLength = 0;
                    }
                }
                currentChunk.push(split);
                currentLength += split.length + separator.length;
            } else {
                if (currentLength > 0) {
                    finalChunks.push(currentChunk.join(separator));
                    currentChunk = [];
                    currentLength = 0;
                }
                if (newSeparators.length > 0) {
                    finalChunks.push(...this._splitText(split, newSeparators));
                } else {
                    finalChunks.push(split);
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
        if (!chunkContent.trim()) continue;

        console.log(`  - Embed/Store chunk ${i + 1}/${chunks.length} (${chunkContent.length} chars)`);

        try {
            if (!vectorStore) {
                throw new Error("Services not initialized");
            }

            // Skip embedding generation for now as Z.ai model is unavailable
            // const embedding = await embeddingService.generateEmbedding(chunkContent);
            const embedding = undefined;

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
        } catch (err: unknown) {
            if (err instanceof Error) {
                console.error(`  - Failed to process chunk ${i}:`, err.message);
            }
        }
    }
}

async function main() {
    console.log("Checking credentials in main...");
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.error("CRITICAL: No Supabase keys found in env.");
        return;
    }

    // Import services dynamically
    try {
        // const embeddingModule = await import("../lib/supabase/services/chat/embedding-service");
        const vectorModule = await import("../lib/supabase/services/chat/vector-store");
        // embeddingService = embeddingModule.embeddingService;
        vectorStore = vectorModule.vectorStore;
        console.log("Services initialized successfully.");
    } catch (e) {
        console.error("Failed to import services:", e);
        return;
    }

    // Docs are in root/docs. From apps/web/scripts, this is ../../../docs
    const docsDir = path.resolve(__dirname, "../../../docs");

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
