
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function verifyFinal() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error("❌ Error: GEMINI_API_KEY is not defined in .env.local");
        process.exit(1);
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Using the model we just confirmed is available and set in the code: 'gemini-flash-latest'
    const modelName = "gemini-flash-latest";

    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        console.log(`🔄 Final Verification with '${modelName}'...`);
        const result = await model.generateContent("Respond with 'OK' if you can read this.");
        console.log("✅ API SUCCESS! Response:", result.response.text());
    } catch (error: any) {
        console.error(`\n❌ Validation Failed for '${modelName}'`);
        console.error("Error:", error.message);
    }
}

verifyFinal();
