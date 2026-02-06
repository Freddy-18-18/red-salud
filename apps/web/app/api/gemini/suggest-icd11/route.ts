import { NextRequest, NextResponse } from "next/server";
import { suggestICD11Codes } from "@/lib/services/gemini-service";
import { z } from "zod";

const SuggestionSchema = z.object({
    text: z.string().min(1, "Text field is required"),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validar entrada con Zod
        const validation = SuggestionSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid input",
                    errors: validation.error.errors
                },
                { status: 400 }
            );
        }

        const { text } = validation.data;

        // Usar Gemini para sugerir códigos basados en el texto clínico
        const suggestions = await suggestICD11Codes(text);

        return NextResponse.json({
            success: true,
            suggestions: suggestions,
        });
    } catch (error) {
        console.error("Error in Gemini ICD-11 suggestion route:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Error generating suggestions",
                error: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}
