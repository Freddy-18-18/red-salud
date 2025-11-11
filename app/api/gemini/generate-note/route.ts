import { NextRequest, NextResponse } from "next/server";
import { generateMedicalNote, MedicalNoteInput } from "@/lib/services/gemini-service";

export async function POST(request: NextRequest) {
  try {
    const body: MedicalNoteInput = await request.json();

    // Validar que al menos haya algo de información
    if (!body.motivoConsulta && !body.sintomas) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Se requiere al menos el motivo de consulta o síntomas" 
        },
        { status: 400 }
      );
    }

    const result = await generateMedicalNote(body);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error en API de generación de nota médica:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: "Error al generar la nota médica",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
