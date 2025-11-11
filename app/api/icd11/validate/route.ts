import { NextRequest, NextResponse } from "next/server";
import { validateICD11Code, searchICD11ByCode } from "@/lib/services/icd-api-service";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { error: "Query parameter 'code' is required" },
        { status: 400 }
      );
    }

    const result = await searchICD11ByCode(code);

    if (!result) {
      return NextResponse.json({
        success: false,
        valid: false,
        message: "Código ICD-11 no encontrado",
      });
    }

    return NextResponse.json({
      success: true,
      valid: true,
      data: result,
    });
  } catch (error) {
    console.error("Error in ICD-11 validation API:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: "Error al validar código ICD-11",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
