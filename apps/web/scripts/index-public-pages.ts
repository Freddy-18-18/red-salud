
import fs from "fs/promises";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { getEmbedding } from "../lib/services/gemini-service";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // We need service role for writing

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const PUBLIC_DIR = path.join(process.cwd(), "app", "(public)");
const BASE_URL = "https://red-salud.com"; // Replace with actual domain if known

async function indexPublicPages() {
    console.log("Starting indexing of public pages...");

    try {
        const files = await getPageFiles(PUBLIC_DIR);
        console.log(`Found ${files.length} pages to index.`);

        for (const file of files) {
            const relativePath = path.relative(PUBLIC_DIR, file);
            const urlPath = relativePath.replace(/\\/g, "/").replace("/page.tsx", "");
            const fullUrl = `${BASE_URL}/${urlPath === "page.tsx" ? "" : urlPath}`;

            console.log(`Processing: ${file} -> ${fullUrl}`);

            const content = await fs.readFile(file, "utf-8");

            // Simple extraction: remove imports and export default
            // A better way would be to render the component or use a specialized parser,
            // but for now we'll strip known React patterns and keep text.
            const cleanText = extractTextFromReact(content);

            if (cleanText.length < 50) {
                console.log("Skipping (text too short)");
                continue;
            }

            console.log(`Extracted ${cleanText.length} characters.`);

            // Generate embedding
            const embedding = await getEmbedding(cleanText);

            // Store in Supabase
            const { error } = await supabase.from("documents").insert({
                content: cleanText,
                metadata: {
                    url: fullUrl,
                    path: relativePath,
                    type: "public-page"
                },
                embedding,
            });

            if (error) {
                console.error(`Error saving ${fullUrl}:`, error);
            } else {
                console.log(`Saved ${fullUrl} to vector db.`);
            }
        }

        console.log("Indexing complete!");
    } catch (error) {
        console.error("Indexing failed:", error);
    }
}

async function getPageFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...(await getPageFiles(fullPath)));
        } else if (entry.name === "page.tsx") {
            files.push(fullPath);
        }
    }

    return files;
}

function extractTextFromReact(code: string): string {
    // Very basic regex-based extraction. 
    // It removes imports, typical code blocks, and tries to keep string literals and JSX text.
    // This is not perfect but serves as a quick implementation without setting up a full build process.

    let text = code;

    // Remove imports
    text = text.replace(/import .* from .*/g, "");

    // Remove interface definitions
    text = text.replace(/interface .* \{[\s\S]*?\}/g, "");

    // Remove console logs
    text = text.replace(/console\.log\(.*\);/g, "");

    // Remove generic tags to leave content (naive)
    // This regex tries to match >Content<
    const contentMatches = text.match(/>([^<]+)</g);

    if (contentMatches) {
        return contentMatches
            .map(m => m.replace(/^>|<$/g, "").trim())
            .filter(t => t.length > 5 && !t.includes("{")) // Filter out short strings and likely code variables
            .join("\n");
    }

    return "";
}

indexPublicPages();
