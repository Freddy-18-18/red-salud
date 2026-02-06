import { NextRequest, NextResponse } from "next/server";
import { ragService } from "@/lib/supabase/services/chat/rag-service";
import { sanitizePII } from "@/lib/utils/pii-filter";

export const runtime = "edge";

/**
 * Chat API Endpoint
 * Handles RAG retrieval, PII filtering, and Z.ai streaming responses.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        let { message } = body;
        const { history = [], context = {} } = body;

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        // 1. PII Filtering (Sanitize Input)
        message = sanitizePII(message);

        // 2. Generate RAG Response
        // We pass the full history but the RAG service will handle the system prompt construction
        // and calling the LLM.
        const response = await ragService.generateResponse(
            [
                ...history.slice(-6).map((m: any) => ({
                    role: m.role === 'assistant' || m.role === 'model' ? 'assistant' : 'user',
                    content: sanitizePII(m.content)
                })),
                { role: "user", content: message }
            ],
            {
                current_url: context.currentUrl,
                page_title: context.pageTitle,
                user_role: context.userRole // Assuming frontend sends this
            }
        );

        // 3. Stream the response
        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                try {
                    for await (const chunk of response) {
                        const content = chunk.choices[0]?.delta?.content || "";
                        if (content) {
                            controller.enqueue(encoder.encode(content));
                        }
                    }
                } catch (err) {
                    controller.error(err);
                } finally {
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        });
    } catch (error: any) {
        console.error("[Chat API Error]:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: error.message },
            { status: 500 }
        );
    }
}
