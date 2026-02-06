import { config } from "dotenv";
import path from "path";
import { OpenAI } from "openai";

const envPath = path.resolve(__dirname, "../.env.local");
config({ path: envPath });

const zai = new OpenAI({
    apiKey: process.env.ZAI_API_KEY,
    baseURL: "https://api.z.ai/api/paas/v4/",
});

async function listModels() {
    console.log("Listing models...");
    try {
        const list = await zai.models.list();
        console.log("Models found:");
        list.data.forEach((m: any) => console.log(`- ${m.id}`));
    } catch (e: any) {
        console.log(`❌ Failed to list models: ${e.message}`);
    }
}

listModels();
