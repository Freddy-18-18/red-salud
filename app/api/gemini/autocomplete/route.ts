import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyAt9v_eTe0-oFMEZa0A6pMiooZmy2dPajY");

export async function POST(request: NextRequest) {
  try {
    const { context, currentLine, paciente } = await request.json();

    if (!currentLine || currentLine.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Texto muy corto para autocompletar" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Eres un asistente médico de RED-SALUD. Proporciona sugerencias de autocompletado para notas médicas.

CONTEXTO DEL PACIENTE:
- Edad: ${paciente.edad || "No especificada"}
- Género: ${paciente.genero === "M" ? "Masculino" : paciente.genero === "F" ? "Femenino" : "No especificado"}

CONTEXTO DE LA NOTA (últimas líneas):
${context}

LÍNEA ACTUAL QUE EL MÉDICO ESTÁ ESCRIBIENDO:
"${currentLine}"

Proporciona 5 sugerencias de autocompletado relevantes y específicas para completar la línea actual. Las sugerencias deben:
1. Ser médicamente apropiadas y específicas
2. Considerar el contexto de la nota
3. Ser frases completas o términos médicos comunes
4. Estar en español
5. Ser breves (máximo 10 palabras)

Responde SOLO con un array JSON de strings:
["sugerencia 1", "sugerencia 2", "sugerencia 3", "sugerencia 4", "sugerencia 5"]

Ejemplos:
- Si escribe "Paciente refiere do" → ["dolor abdominal", "dolor torácico", "dolor de cabeza", "dolor lumbar", "dolor articular"]
- Si escribe "Signos Vitales: PA" → ["PA: 120/80 mmHg", "PA: 110/70 mmHg", "PA: 130/85 mmHg", "PA: 140/90 mmHg", "PA: 100/60 mmHg"]
- Si escribe "Al examen físico se evidencia" → ["abdomen blando, depresible, no doloroso", "ruidos cardíacos rítmicos, sin soplos", "murmullo vesicular conservado", "pupilas isocóricas reactivas a la luz", "extremidades sin edema"]`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Extraer array JSON de la respuesta
    let jsonMatch = text.match(/\[[\s\S]*?\]/);
    if (!jsonMatch) {
      throw new Error("No se pudo extraer sugerencias de la respuesta");
    }

    const suggestions = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      success: true,
      data: {
        suggestions: Array.isArray(suggestions) ? suggestions.slice(0, 5) : [],
      },
    });
  } catch (error: any) {
    console.error("Error generating autocomplete:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error al generar sugerencias",
      },
      { status: 500 }
    );
  }
}
