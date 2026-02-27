import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
    try {
        const { query, threshold = 0.5, count = 5 } = await req.json();

        if (!query) {
            return NextResponse.json({ error: "Query is required" }, { status: 400 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Needs service role for full access or anon if RLS is public
        const geminiKey = process.env.GEMINI_API_KEY!;

        if (!geminiKey) {
            console.error("Missing GEMINI_API_KEY");
            return NextResponse.json({ error: "Internal server error" }, { status: 500 });
        }

        // Initialize Gemini for embeddings
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const result = await model.embedContent(query);
        const embedding = result.embedding.values;

        // Search in Supabase using the RPC
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data, error } = await supabase.rpc("match_documents", {
            query_embedding: embedding,
            match_threshold: threshold,
            match_count: count,
        });

        if (error) throw error;

        return NextResponse.json({ results: data });
    } catch (error) {
        console.error("Search API error:", error);
        return NextResponse.json({ error: "Failed to search knowledge base" }, { status: 500 });
    }
}
