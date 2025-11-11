import { NextRequest, NextResponse } from "next/server";
import { suggestICD11Codes } from "@/lib/services/gemini-service";

export async function POST(request: NextRequest) {
  try {
    const { diagnostico } = await request.json();

    if (!diagnostico || typeof diagnostico !== "string") {
      return NextResponse.json(
        { 
          success: false, 
          error: "Se requiere un diagnóstico en texto" 
        },
        { status: 400 }
      );
    }

    const suggestions = await suggestICD11Codes(diagnostico);

    return NextResponse.json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    console.error("Error en API de sugerencias ICD-11:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: "Error al sugerir códigos ICD-11",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
