import { NextRequest, NextResponse } from "next/server";
import { improveMedicalNote } from "@/lib/services/gemini-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nota } = body;

    if (!nota || typeof nota !== "string") {
      return NextResponse.json(
        { 
          success: false, 
          error: "Se requiere una nota para mejorar" 
        },
        { status: 400 }
      );
    }

    const notaMejorada = await improveMedicalNote(nota);

    return NextResponse.json({
      success: true,
      data: {
        notaMejorada,
      },
    });
  } catch (error) {
    console.error("Error en API de mejora de nota médica:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: "Error al mejorar la nota médica",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
