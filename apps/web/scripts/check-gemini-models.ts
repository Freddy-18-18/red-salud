
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config({ path: ".env.local" });

async function checkModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ No GEMINI_API_KEY found in .env.local");
        process.exit(1);
    }

    console.log(`🔑 Testing with API Key ending in ...${apiKey.slice(-4)}`);

    try {
        const genAI = new GoogleGenerativeAI(apiKey);

        // Testing specific variants that might exist
        const modelsToTest = [
            "gemini-1.5-flash-001",
            "gemini-1.5-flash-002",
            "gemini-1.5-flash-8b",
            "gemini-1.5-pro-001",
            "gemini-1.5-pro-002",
            "gemini-pro-vision"
        ];

        for (const modelName of modelsToTest) {
            console.log(`\n🧪 Testing model: ${modelName}`);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Say Hello");
                const response = result.response;
                console.log(`✅ SUCCESS: ${modelName} responded: "${response.text().trim()}"`);
            } catch (error: any) {
                console.log(`❌ FAILED: ${modelName}`);
                if (error.message) {
                    const status = error.message.match(/\[(\d+) /)?.[1];
                    const msg = error.message.split('\n')[0];
                    console.log(`   Status: ${status || 'Unknown'} - ${msg}`);
                }
            }
        }

    } catch (error) {
        console.error("Error checking models:", error);
    }
}

checkModels();
