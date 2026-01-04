import { NextRequest, NextResponse } from "next/server";
import { searchICD11, getICD11Suggestions } from "@/lib/services/icd-api-service";
import { searchLocalICD11 } from "@/lib/data/icd11-fallback";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");
    const mode = searchParams.get("mode") || "search";

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }

    let results;
    let usedFallback = false;
    
    try {
      // Intentar usar la API oficial de ICD-11
      if (mode === "suggestions") {
        results = await getICD11Suggestions(query);
      } else {
        const useFlexibleSearch = searchParams.get("flexible") !== "false";
        results = await searchICD11(query, useFlexibleSearch);
      }
      
      // Si la API no devuelve resultados, usar fallback
      if (!results || results.length === 0) {
        const localResults = searchLocalICD11(query);
        results = localResults.map(d => ({
          id: d.code,
          code: d.code,
          title: d.title,
          chapter: d.chapter,
        }));
        usedFallback = true;
      }
    } catch (apiError) {
      // Si la API falla, usar base de datos local
      console.log("API de ICD-11 no disponible, usando base de datos local");
      const localResults = searchLocalICD11(query);
      results = localResults.map(d => ({
        id: d.code,
        code: d.code,
        title: d.title,
        chapter: d.chapter,
      }));
      usedFallback = true;
    }

    return NextResponse.json({
      success: true,
      data: results,
      count: results.length,
      source: usedFallback ? "local" : "who-api",
    });
  } catch (error) {
    console.error("Error in ICD-11 search API:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: "Error al buscar en ICD-11",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
