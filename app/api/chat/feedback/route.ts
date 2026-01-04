import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { messageContent, responseContent, isPositive, feedbackText, sessionId, pageUrl } = body;

        if (!messageContent || !responseContent || typeof isPositive !== "boolean") {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const { error } = await supabase.from("chatbot_feedback").insert({
            message_content: messageContent,
            response_content: responseContent,
            is_positive: isPositive,
            feedback_text: feedbackText || null,
            session_id: sessionId || null,
            page_url: pageUrl || null,
        });

        if (error) {
            console.error("Error saving feedback:", error);
            return NextResponse.json(
                { error: "Failed to save feedback" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error in feedback API:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
