
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function testDirectApi() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ NO API KEY FOUND");
        return;
    }

    const model = "gemini-1.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    console.log(`🔄 Testing URL: ${url.replace(apiKey, 'HIDDEN_KEY')}`);

    const payload = {
        contents: [{
            parts: [{ text: "Hello, answer with just 'OK'" }]
        }]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("\n❌ HTTP ERROR " + response.status);
            console.error(JSON.stringify(data, null, 2));
        } else {
            console.log("\n✅ SUCCESS (Direct HTTP Request):");
            console.log(JSON.stringify(data, null, 2));
        }

    } catch (error: any) {
        console.error("\n❌ NETWORK ERROR:");
        console.error(error.message);
    }
}

testDirectApi();
