import { NextRequest, NextResponse } from "next/server";
import { searchICD11 } from "@/lib/services/icd-api-service";
import { searchLocalICD11 } from "@/lib/data/icd11-fallback";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query) {
        return NextResponse.json(
            { success: false, message: "Query parameter 'q' is required" },
            { status: 400 }
        );
    }

    console.log(`ICD-11 search request for: "${query}"`);

    try {
        // Intentar buscar en la API de la OMS
        const results = await searchICD11(query);

        if (results && results.length > 0) {
            console.log(`ICD-11 API returned ${results.length} results for "${query}"`);
            return NextResponse.json({
                success: true,
                data: results,
                source: "who_api",
            });
        }

        // Si no hay resultados o falla la API, usar el fallback local
        console.log(`No results from ICD-11 API, using local fallback for "${query}"`);
        const localResults = searchLocalICD11(query);

        return NextResponse.json({
            success: true,
            data: localResults,
            source: "local_fallback",
            message: "No results found in official API, showing local suggestions."
        });

    } catch (error) {
        console.error("Error in ICD-11 API route:", error);

        // En caso de error crítico de la API (como falta de credenciales), 
        // siempre devolver resultados locales para no romper la UX
        console.log(`API error, using local fallback for "${query}"`);
        const localResults = searchLocalICD11(query);

        return NextResponse.json({
            success: true,
            data: localResults,
            source: "local_fallback",
            error: error instanceof Error ? error.message : "Unknown error",
            message: "API error, showing local fallback results."
        });
    }
}
