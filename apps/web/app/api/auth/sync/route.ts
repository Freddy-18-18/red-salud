import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate that we have the required tokens
        if (!body.accessToken || !body.refreshToken) {
            return NextResponse.json(
                { error: "Missing required tokens" }, 
                { status: 400 }
            );
        }

        // This is essentially to ensure the server-side cookies are set
        // In many cases with @supabase/ssr, this is handled by middleware
        // but if the provider is calling it, we just return success.

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[API] Auth sync error:", error);
        return NextResponse.json(
            { error: "Invalid request" }, 
            { status: 400 }
        );
    }
}
