import { NextRequest, NextResponse } from "next/server";
import { searchICD11, getICD11Suggestions } from "@/lib/services/icd-api-service";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");
    const mode = searchParams.get("mode") || "search"; // 'search' o 'suggestions'

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }

    let results;
    
    if (mode === "suggestions") {
      results = await getICD11Suggestions(query);
    } else {
      const useFlexibleSearch = searchParams.get("flexible") !== "false";
      results = await searchICD11(query, useFlexibleSearch);
    }

    return NextResponse.json({
      success: true,
      data: results,
      count: results.length,
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
