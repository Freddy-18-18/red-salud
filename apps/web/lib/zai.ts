import OpenAI from "openai";

/**
 * Z.ai Client Wrapper using OpenAI-compatible SDK
 * Configured according to the Model API specification.
 */

if (!process.env.ZAI_API_KEY) {
    console.warn("ZAI_API_KEY is not defined in environment variables. ChatBot functions may fail.");
}

export const zai = new OpenAI({
    apiKey: process.env.ZAI_API_KEY || "dummy-key",
    baseURL: "https://api.z.ai/api/paas/v4/",
});

export const ZAI_MODEL = "glm-4.7";

/**
 * Helper to generate chat completions with streaming
 */
export async function createZaiChatCompletion(messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[], stream = true) {
    return zai.chat.completions.create({
        model: ZAI_MODEL,
        messages,
        stream,
        temperature: 0.7,
        max_tokens: 1500,
    });
}
