/**
 * @file route.ts
 * @description API endpoint para mejorar biografías profesionales usando IA.
 * Reformula el texto sin inventar datos, solo mejora gramática y estructura.
 * @module API/AI/ImproveBio
 */

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

/** Cliente OpenAI configurado para OpenRouter */
const openai = new OpenAI({
    baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
});

/**
 * POST /api/ai/improve-bio
 * Mejora la biografía profesional de un médico usando IA
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { biografia, nombre, especialidad } = body;

        // Validar entrada
        if (!biografia || typeof biografia !== "string") {
            return NextResponse.json(
                { error: "La biografía es requerida" },
                { status: 400 }
            );
        }

        if (biografia.length < 20) {
            return NextResponse.json(
                { error: "La biografía debe tener al menos 20 caracteres" },
                { status: 400 }
            );
        }

        // Prompt del sistema para mejorar biografías
        const systemPrompt = `Eres un editor profesional especializado en perfiles médicos. Tu tarea es mejorar la biografía de un médico siguiendo estas reglas estrictas:

REGLAS ABSOLUTAS:
1. NO INVENTES información que no esté en el texto original
2. NO AGREGUES títulos, experiencias o logros ficticios
3. NO EXAGERES los logros o capacidades del médico
4. MANTÉN todos los datos originales (años, instituciones, especialidades)
5. SOLO mejora la gramática, puntuación, estructura y claridad
6. USA un tono profesional pero cercano
7. RESPETA el idioma original (español)
8. MÁXIMO 3-4 párrafos cortos
9. Si el texto original es muy breve, no lo alargues artificialmente

OBJETIVO: Hacer el texto más profesional y legible, sin cambiar el contenido ni inventar nada.`;

        const userPrompt = `Mejora esta biografía profesional de un médico:

Nombre: ${nombre || "Doctor/a"}
Especialidad: ${especialidad || "Medicina"}

Biografía original:
"${biografia}"

Devuelve SOLO la biografía mejorada, sin explicaciones ni comentarios adicionales.`;

        // Llamar a la API de OpenRouter
        const completion = await openai.chat.completions.create({
            model: "google/gemini-2.0-flash-exp:free",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
            temperature: 0.3, // Baja temperatura para respuestas más consistentes
            max_tokens: 500,
        });

        const improvedBio = completion.choices[0]?.message?.content?.trim();

        if (!improvedBio) {
            return NextResponse.json(
                { error: "No se pudo generar la mejora" },
                { status: 500 }
            );
        }

        // Limpiar comillas si las tiene
        const cleanedBio = improvedBio
            .replace(/^["']|["']$/g, "") // Quitar comillas al inicio/final
            .replace(/^Biografía mejorada:\s*/i, "") // Quitar prefijos comunes
            .trim();

        return NextResponse.json({
            improved_bio: cleanedBio,
            original_length: biografia.length,
            improved_length: cleanedBio.length,
        });

    } catch (error: any) {
        console.error("[API/AI/ImproveBio] Error:", error);

        // Manejar errores específicos de la API
        if (error.status === 401) {
            return NextResponse.json(
                { error: "Error de autenticación con el servicio de IA" },
                { status: 500 }
            );
        }

        if (error.status === 429) {
            return NextResponse.json(
                { error: "Límite de solicitudes alcanzado. Intenta más tarde." },
                { status: 429 }
            );
        }

        return NextResponse.json(
            { error: "Error al procesar la solicitud" },
            { status: 500 }
        );
    }
}
