import { config } from "dotenv";
import path from "path";
import { OpenAI } from "openai";

const envPath = path.resolve(__dirname, "../.env.local");
config({ path: envPath });

const zai = new OpenAI({
    apiKey: process.env.ZAI_API_KEY,
    baseURL: "https://api.z.ai/api/paas/v4/",
});

// Candidate models
const models = [
    "embedding-2",
    "embedding-3",
    "text-embedding-3-small",
    "text-embedding-ada-002",
    "bge-m3" // Some Z.ai implementations might use this
];

async function test() {
    console.log("Testing embedding models...");

    for (const model of models) {
        console.log(`\nTesting model: ${model}`);
        try {
            const res = await zai.embeddings.create({
                model: model,
                input: "Hello world"
            });
            console.log(`✅ Success! Model '${model}' works.`);
            console.log("Vector length:", res.data[0].embedding.length);
            return; // Exit on first success
        } catch (e: unknown) {
            if (e instanceof Error) {
                console.log(`❌ Failed: ${e.message}`);
            } else {
                console.log(`❌ Failed: ${String(e)}`);
            }
        }
    }
    console.log("\nAll models failed.");
}

test();
