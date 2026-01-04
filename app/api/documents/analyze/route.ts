/**
 * @file route.ts
 * @description API para analizar documentos con OCR usando Gemini 1.5 Flash.
 * Extrae información de títulos, certificados y documentos profesionales.
 * @module API/Documents/Analyze
 * 
 * @example
 * POST /api/documents/analyze
 * Body: { documentId: "uuid", imageBase64: "base64..." }
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { updateDocumentExtractedData } from "@/lib/supabase/services/doctor-documents-service";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Estructura de datos extraídos del documento
 */
interface ExtractedData {
    document_type_detected: string;
    institution: string | null;
    full_name: string | null;
    issue_date: string | null;
    specialty: string | null;
    registration_number: string | null;
    raw_text: string;
    confidence: number;
}

/**
 * POST - Analiza un documento con OCR usando Gemini
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Verificar autenticación
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: "No autenticado" },
                { status: 401 }
            );
        }

        // Obtener datos del body
        const body = await request.json();
        const { documentId, imageBase64, mimeType } = body;

        if (!documentId || !imageBase64) {
            return NextResponse.json(
                { success: false, error: "Faltan parámetros requeridos" },
                { status: 400 }
            );
        }

        // Verificar que el documento pertenece al usuario
        const { data: doc, error: docError } = await supabase
            .from("doctor_documents")
            .select("id, document_type, document_name")
            .eq("id", documentId)
            .eq("user_id", user.id)
            .single();

        if (docError || !doc) {
            return NextResponse.json(
                { success: false, error: "Documento no encontrado" },
                { status: 404 }
            );
        }

        // Obtener datos del perfil para comparación
        const { data: profile } = await supabase
            .from("profiles")
            .select("nombre_completo, cedula")
            .eq("id", user.id)
            .single();

        // Configurar modelo Gemini con visión
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Prompt especializado para documentos médicos
        const prompt = `Eres un experto en análisis de documentos profesionales médicos de Venezuela. 
Analiza la imagen de este documento y extrae la siguiente información en formato JSON:

TIPO DE DOCUMENTO ESPERADO: ${doc.document_type}
NOMBRE DEL ARCHIVO: ${doc.document_name}

INSTRUCCIONES:
1. Identifica qué tipo de documento es (título universitario, certificado MPPS, cédula de identidad, certificado de especialidad, diploma de curso, póliza de seguro)
2. Extrae el texto visible del documento
3. Identifica los datos clave según el tipo de documento

RESPONDE EXACTAMENTE CON ESTE FORMATO JSON (sin markdown, solo el JSON):
{
  "document_type_detected": "titulo|mpps|cedula|especialidad|curso|seguro|otro",
  "institution": "Nombre de la institución que emite el documento (universidad, MPPS, etc.)",
  "full_name": "Nombre completo del profesional como aparece en el documento",
  "issue_date": "Fecha de emisión en formato YYYY-MM-DD si es legible, null si no",
  "specialty": "Especialidad médica si aplica, null si no",
  "registration_number": "Número de registro/cédula profesional si aparece, null si no",
  "raw_text": "Transcripción del texto principal del documento (máximo 500 caracteres)",
  "confidence": 0.85
}

NOTAS IMPORTANTES:
- Si un campo no es legible o no aplica, usa null
- El campo confidence debe ser un número entre 0 y 1 indicando tu confianza en la extracción
- Para documentos de identidad (cédula), extrae el número y nombre completo
- Para títulos, identifica la universidad y la carrera/especialidad
- Para MPPS, busca el número de registro

${profile ? `DATOS DEL PERFIL PARA COMPARACIÓN:
- Nombre registrado: ${profile.nombre_completo || "No disponible"}
- Cédula registrada: ${profile.cedula || "No disponible"}` : ""}`;

        // Preparar imagen para Gemini
        const imagePart = {
            inlineData: {
                data: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
                mimeType: mimeType || "image/jpeg",
            },
        };

        // Ejecutar análisis
        console.log("[OCR] Analizando documento:", doc.document_name);
        const result = await model.generateContent([prompt, imagePart]);
        const response = result.response;
        const text = response.text();

        console.log("[OCR] Respuesta de Gemini:", text);

        // Extraer JSON de la respuesta
        let extractedData: ExtractedData;
        try {
            // Intentar parsear directamente
            extractedData = JSON.parse(text);
        } catch {
            // Si falla, buscar JSON en el texto
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                console.error("[OCR] No se pudo extraer JSON:", text);
                return NextResponse.json(
                    { success: false, error: "No se pudo analizar el documento" },
                    { status: 500 }
                );
            }
            extractedData = JSON.parse(jsonMatch[0]);
        }

        // Comparar con datos del perfil
        let nameMatch = false;
        let cedulaMatch = false;

        if (profile) {
            if (extractedData.full_name && profile.nombre_completo) {
                // Comparación flexible de nombres (ignorando tildes y mayúsculas)
                const normalize = (s: string) =>
                    s.toLowerCase()
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .trim();
                nameMatch = normalize(extractedData.full_name).includes(
                    normalize(profile.nombre_completo).split(" ")[0]
                );
            }

            if (extractedData.registration_number && profile.cedula) {
                // Comparar números de cédula (solo dígitos)
                const onlyDigits = (s: string) => s.replace(/\D/g, "");
                cedulaMatch =
                    onlyDigits(extractedData.registration_number) ===
                    onlyDigits(profile.cedula);
            }
        }

        // Guardar datos extraídos en la base de datos
        const updateResult = await updateDocumentExtractedData(
            documentId,
            user.id,
            {
                ...extractedData,
                analyzed_at: new Date().toISOString(),
            }
        );

        if (!updateResult.success) {
            console.error("[OCR] Error al guardar datos:", updateResult.error);
        }

        return NextResponse.json({
            success: true,
            data: {
                ...extractedData,
                validation: {
                    name_matches_profile: nameMatch,
                    cedula_matches_profile: cedulaMatch,
                },
            },
        });
    } catch (error: any) {
        console.error("[OCR] Error en análisis:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Error al analizar el documento",
            },
            { status: 500 }
        );
    }
}
