
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function listModelsDirect() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ NO API KEY FOUND");
        return;
    }

    // URL to list models
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    console.log(`🔄 Listing Models URL: ${url.replace(apiKey, 'HIDDEN_KEY')}`);

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            console.error("\n❌ HTTP ERROR " + response.status);
            console.error(JSON.stringify(data, null, 2));
        } else {
            console.log("\n✅ AVAILABLE MODELS:");
            if (data.models && Array.isArray(data.models)) {
                data.models.forEach((m: any) => {
                    if (m.name.includes("gemini")) {
                        console.log(` - ${m.name} (${m.version})`);
                    }
                });
            } else {
                console.log("No models found or different structure:", data);
            }
        }

    } catch (error: any) {
        console.error("\n❌ NETWORK ERROR:");
        console.error(error.message);
    }
}

listModelsDirect();
