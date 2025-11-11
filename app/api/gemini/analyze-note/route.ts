import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyAt9v_eTe0-oFMEZa0A6pMiooZmy2dPajY");

export async function POST(request: NextRequest) {
  try {
    const { nota, paciente } = await request.json();

    if (!nota || !nota.trim()) {
      return NextResponse.json(
        { success: false, error: "La nota médica es requerida" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Eres un asistente médico experto de RED-SALUD. Analiza la siguiente nota médica y proporciona recomendaciones útiles.

INFORMACIÓN DEL PACIENTE:
- Edad: ${paciente.edad || "No especificada"}
- Género: ${paciente.genero === "M" ? "Masculino" : paciente.genero === "F" ? "Femenino" : "No especificado"}
- Alergias: ${paciente.alergias?.length > 0 ? paciente.alergias.join(", ") : "Ninguna registrada"}
- Condiciones crónicas: ${paciente.condicionesCronicas?.length > 0 ? paciente.condicionesCronicas.join(", ") : "Ninguna registrada"}
- Medicamentos actuales: ${paciente.medicamentosActuales?.length > 0 ? paciente.medicamentosActuales.join(", ") : "Ninguno registrado"}

NOTA MÉDICA:
${nota}

Proporciona:
1. Resumen breve (2-3 oraciones)
2. Recomendaciones prácticas: Qué más preguntar al paciente, qué exámenes considerar, qué información adicional sería útil
3. Alertas: Información faltante importante, signos de alarma a vigilar, interacciones medicamentosas
4. Diagnósticos sugeridos: Basados en síntomas descritos

Responde en formato JSON:
{
  "resumen": "string",
  "recomendaciones": ["Preguntar sobre...", "Considerar examen de...", "Evaluar..."],
  "alertas": ["Falta información sobre...", "Vigilar signos de...", "Considerar..."],
  "diagnosticosSugeridos": ["Diagnóstico 1", "Diagnóstico 2"]
}

IMPORTANTE: 
- Recomendaciones deben ser preguntas específicas o acciones concretas
- Alertas deben ser información faltante o puntos críticos
- Sé breve y directo (máximo 3-4 items por categoría)
- Considera edad, género y condiciones del paciente`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Extraer JSON de la respuesta
    let jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No se pudo extraer JSON de la respuesta");
    }

    const analysis = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      success: true,
      data: {
        resumen: analysis.resumen || "No se pudo generar resumen",
        recomendaciones: analysis.recomendaciones || [],
        alertas: analysis.alertas || [],
        diagnosticosSugeridos: analysis.diagnosticosSugeridos || [],
      },
    });
  } catch (error: any) {
    console.error("Error analyzing note:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error al analizar la nota médica",
      },
      { status: 500 }
    );
  }
}
