import { NextRequest, NextResponse } from "next/server";
import { generateChatResponse } from "@/lib/services/chatbot-service";

export const runtime = "nodejs"; // Or 'edge' if Supabase client supports it and no node-specifics

export async function POST(req: NextRequest) {
    try {
        const { messages } = await req.json();

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json(
                { error: "Messages array is required" },
                { status: 400 }
            );
        }

        const lastMessage = messages[messages.length - 1];
        const history = messages.slice(0, -1);

        if (lastMessage.role !== "user") {
            return NextResponse.json(
                { error: "Last message must be from user" },
                { status: 400 }
            );
        }

        const stream = await generateChatResponse(history, lastMessage.content);

        // Create a ReadableStream from the Gemini stream
        const readableStream = new ReadableStream({
            async start(controller) {
                for await (const chunk of stream) {
                    const text = chunk.text();
                    if (text) {
                        controller.enqueue(text);
                    }
                }
                controller.close();
            },
        });

        return new NextResponse(readableStream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
            },
        });
    } catch (error: any) {
        console.error("Error in chat API:", error);
        return NextResponse.json(
            { error: "Error processing chat request", details: error.message },
            { status: 500 }
        );
    }
}
