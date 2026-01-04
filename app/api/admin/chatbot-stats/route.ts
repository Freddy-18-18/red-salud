import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req: NextRequest) {
    try {
        // 1. Get total feedback count
        const { count: totalCount, error: countError } = await supabase
            .from("chatbot_feedback")
            .select("*", { count: "exact", head: true });

        if (countError) throw countError;

        // 2. Get positive feedback count
        const { count: positiveCount, error: positiveError } = await supabase
            .from("chatbot_feedback")
            .select("*", { count: "exact", head: true })
            .eq("is_positive", true);

        if (positiveError) throw positiveError;

        // 3. Get negative feedback count
        const { count: negativeCount, error: negativeError } = await supabase
            .from("chatbot_feedback")
            .select("*", { count: "exact", head: true })
            .eq("is_positive", false);

        if (negativeError) throw negativeError;

        // 4. Get recent feedback entries
        const { data: recentFeedback, error: recentError } = await supabase
            .from("chatbot_feedback")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(10);

        if (recentError) throw recentError;

        // Calculate resolution rate (Positive / Total) * 100
        const resolutionRate = totalCount ? Math.round((positiveCount! / totalCount) * 100) : 0;

        return NextResponse.json({
            metrics: {
                total: totalCount || 0,
                positive: positiveCount || 0,
                negative: negativeCount || 0,
                resolutionRate,
            },
            recentFeedback: recentFeedback || []
        });

    } catch (error: any) {
        console.error("Error fetching chatbot stats:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
