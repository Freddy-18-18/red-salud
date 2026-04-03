import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// -------------------------------------------------------------------
// AI Health Assistant — Chat API Route
// -------------------------------------------------------------------
// Server-side proxy for the AI assistant. Currently uses a MOCK
// implementation with keyword-based responses. To integrate Gemini,
// replace `generateMockResponse()` with a real Gemini SDK call.
// -------------------------------------------------------------------

// --- Types ---

interface ChatRequestBody {
  message: string;
  context?: {
    conditions: string[];
    medications: string[];
    recentLabs: string[];
  };
}

interface AIResponsePayload {
  response: string;
  suggestions: string[];
}

// --- Rate Limiting ---

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 20;

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  if (entry.count >= MAX_REQUESTS) {
    return true;
  }

  entry.count += 1;
  return false;
}

// --- Mock AI Response Engine ---

interface MockRule {
  keywords: string[];
  response: string;
  suggestions: string[];
}

const MOCK_RULES: MockRule[] = [
  {
    keywords: ["dolor", "cabeza", "cefalea", "migraña", "jaqueca"],
    response:
      "El dolor de cabeza es uno de los síntomas más comunes. Puede estar asociado a tensión muscular, deshidratación, falta de sueño o estrés. Te recomiendo:\n\n" +
      "1. **Hidratación**: Toma al menos 2 litros de agua al día\n" +
      "2. **Descanso**: Asegúrate de dormir 7-8 horas\n" +
      "3. **Relajación**: Evita pantallas prolongadas y toma pausas cada 45 minutos\n" +
      "4. **Analgésicos**: Acetaminofén (500mg) puede aliviar el dolor leve a moderado\n\n" +
      "⚠️ **Consulta médica urgente** si el dolor es súbito e intenso, viene acompañado de fiebre alta, rigidez en el cuello, confusión o cambios en la visión.",
    suggestions: [
      "¿Cuándo debo preocuparme por un dolor de cabeza?",
      "¿Qué alimentos pueden provocar migrañas?",
      "¿Puedo tomar ibuprofeno y acetaminofén juntos?",
    ],
  },
  {
    keywords: ["fiebre", "temperatura", "calentura"],
    response:
      "La fiebre es una respuesta natural del cuerpo ante infecciones. Valores de referencia:\n\n" +
      "- **Normal**: 36.1°C - 37.2°C\n" +
      "- **Febrícula**: 37.3°C - 37.9°C\n" +
      "- **Fiebre**: 38°C o más\n" +
      "- **Fiebre alta**: 39.5°C o más\n\n" +
      "**Recomendaciones inmediatas:**\n" +
      "1. Mantente hidratado con agua, suero oral o caldos\n" +
      "2. Usa ropa ligera y compresas tibias (no frías)\n" +
      "3. Acetaminofén (500-1000mg cada 6-8 horas) para adultos\n" +
      "4. Reposo en ambiente fresco y ventilado\n\n" +
      "⚠️ **Acude a emergencias** si la fiebre supera 40°C, dura más de 3 días, o viene con dificultad para respirar, manchas en la piel o confusión.",
    suggestions: [
      "¿Cuándo debo ir a urgencias por fiebre?",
      "¿Qué diferencia hay entre fiebre viral y bacteriana?",
      "¿Es normal tener fiebre después de una vacuna?",
    ],
  },
  {
    keywords: ["medicamento", "medicina", "pastilla", "dosis", "tomar"],
    response:
      "Para consultas sobre medicamentos, ten en cuenta estas recomendaciones generales:\n\n" +
      "1. **Nunca te automediques** con antibióticos — requieren receta médica\n" +
      "2. **Respeta horarios**: Toma tus medicamentos a la misma hora cada día\n" +
      "3. **No mezcles** medicamentos sin consultar a tu médico o farmacéutico\n" +
      "4. **Alimentos**: Algunos medicamentos deben tomarse con comida y otros en ayunas\n" +
      "5. **Alcohol**: Evita el alcohol mientras estés en tratamiento\n\n" +
      "Si tienes una receta activa, puedo ayudarte a entender las indicaciones. ¿Cuál es el medicamento que te genera dudas?",
    suggestions: [
      "¿Puedo partir las pastillas por la mitad?",
      "¿Qué hago si olvido una dosis?",
      "¿Cuáles son los efectos secundarios comunes del ibuprofeno?",
    ],
  },
  {
    keywords: ["presión", "tensión", "hipertensión", "arterial"],
    response:
      "La presión arterial es un indicador vital de tu salud cardiovascular. Valores de referencia para adultos:\n\n" +
      "| Categoría | Sistólica | Diastólica |\n" +
      "|-----------|-----------|------------|\n" +
      "| Normal | < 120 | < 80 |\n" +
      "| Elevada | 120-129 | < 80 |\n" +
      "| Hipertensión Grado 1 | 130-139 | 80-89 |\n" +
      "| Hipertensión Grado 2 | ≥ 140 | ≥ 90 |\n\n" +
      "**Para mantener una presión saludable:**\n" +
      "- Reduce el consumo de sal (menos de 5g/día)\n" +
      "- Haz ejercicio regular (30 min, 5 veces por semana)\n" +
      "- Mantén un peso saludable\n" +
      "- Limita el alcohol y evita el tabaco\n" +
      "- Controla el estrés con técnicas de relajación",
    suggestions: [
      "¿Cómo me tomo correctamente la presión en casa?",
      "¿Qué alimentos ayudan a bajar la presión?",
      "¿Puedo dejar de tomar mi medicamento si ya me siento bien?",
    ],
  },
  {
    keywords: ["glucosa", "azúcar", "diabetes", "insulina", "glicemia"],
    response:
      "El control de la glucosa es fundamental para prevenir complicaciones. Valores de referencia en ayunas:\n\n" +
      "- **Normal**: 70-100 mg/dL\n" +
      "- **Prediabetes**: 100-125 mg/dL\n" +
      "- **Diabetes**: ≥ 126 mg/dL (en dos mediciones)\n\n" +
      "**Hemoglobina glicosilada (HbA1c):**\n" +
      "- Normal: < 5.7%\n" +
      "- Prediabetes: 5.7% - 6.4%\n" +
      "- Diabetes: ≥ 6.5%\n\n" +
      "**Recomendaciones:**\n" +
      "1. Mantén una dieta equilibrada, baja en azúcares refinados\n" +
      "2. Haz ejercicio regularmente\n" +
      "3. Si tomas insulina, sigue las indicaciones de tu endocrinólogo al pie de la letra\n" +
      "4. Mide tu glucosa según la frecuencia que te indicó tu médico",
    suggestions: [
      "¿Qué síntomas indica una hipoglucemia?",
      "¿Qué frutas puedo comer si soy diabético?",
      "¿Cada cuánto debo hacerme el examen de HbA1c?",
    ],
  },
  {
    keywords: ["gripe", "resfriado", "tos", "estornudo", "nariz", "congestión"],
    response:
      "Los síntomas de resfriado o gripe generalmente se resuelven en 7-10 días. Mientras tanto:\n\n" +
      "**Alivio de síntomas:**\n" +
      "1. **Hidratación abundante**: Agua, caldos, tés con miel y limón\n" +
      "2. **Reposo**: Tu cuerpo necesita energía para combatir la infección\n" +
      "3. **Congestión nasal**: Lavados nasales con solución salina\n" +
      "4. **Tos**: Miel (1 cucharada) puede aliviar la tos en adultos\n" +
      "5. **Dolor/fiebre**: Acetaminofén según indicaciones\n\n" +
      "**NO necesitas antibióticos** — la mayoría de gripes son virales.\n\n" +
      "⚠️ **Consulta médica** si: dificultad para respirar, fiebre > 39°C por más de 3 días, dolor intenso en el pecho, o si eres paciente de riesgo (asma, diabetes, embarazo).",
    suggestions: [
      "¿Cómo distingo una gripe de COVID-19?",
      "¿Cuándo necesito antibióticos para la tos?",
      "¿Puedo hacer ejercicio estando resfriado?",
    ],
  },
  {
    keywords: ["estómago", "digestión", "diarrea", "vómito", "nausea", "gastritis"],
    response:
      "Los problemas digestivos son muy comunes. Aquí te oriento según los síntomas:\n\n" +
      "**Si tienes diarrea:**\n" +
      "- Suero oral para evitar deshidratación\n" +
      "- Dieta blanda: arroz, plátano, galletas de soda, caldo de pollo\n" +
      "- Evita lácteos, grasas y comida picante\n\n" +
      "**Si tienes gastritis o acidez:**\n" +
      "- Come porciones pequeñas y frecuentes\n" +
      "- Evita café, alcohol, cítricos y alimentos muy condimentados\n" +
      "- No te acuestes inmediatamente después de comer\n\n" +
      "**Si tienes náuseas/vómitos:**\n" +
      "- Sorbos pequeños de agua o suero\n" +
      "- Galletas de soda antes de levantarte\n" +
      "- Jengibre en té o caramelos puede ayudar\n\n" +
      "⚠️ **Acude al médico** si hay sangre en las heces o vómito, dolor abdominal intenso, o deshidratación severa.",
    suggestions: [
      "¿Qué dieta debo seguir para la gastritis?",
      "¿Cuándo la diarrea requiere atención médica?",
      "¿El estrés puede causar problemas digestivos?",
    ],
  },
  {
    keywords: ["ansiedad", "estrés", "nervios", "dormir", "insomnio", "sueño"],
    response:
      "La salud mental es tan importante como la física. Si estás experimentando ansiedad o problemas de sueño:\n\n" +
      "**Técnicas inmediatas:**\n" +
      "1. **Respiración 4-7-8**: Inhala 4s, retén 7s, exhala 8s (repite 4 veces)\n" +
      "2. **Grounding 5-4-3-2-1**: Nombra 5 cosas que ves, 4 que tocas, 3 que oyes, 2 que hueles, 1 que saboreas\n" +
      "3. **Actividad física**: Incluso 15 minutos de caminata liberan endorfinas\n\n" +
      "**Para mejorar el sueño:**\n" +
      "- Horario regular de dormir y despertar\n" +
      "- Evita pantallas 1 hora antes de dormir\n" +
      "- Habitación oscura y fresca\n" +
      "- Evita cafeína después de las 2pm\n\n" +
      "💚 **No estás solo/a.** Si los síntomas interfieren con tu vida diaria, un profesional de salud mental puede ayudarte mucho. Buscar ayuda es un acto de fortaleza.",
    suggestions: [
      "¿Cómo encuentro un psicólogo en Red Salud?",
      "¿Qué ejercicios ayudan con la ansiedad?",
      "¿Cuándo debería considerar tratamiento profesional?",
    ],
  },
  {
    keywords: ["resultado", "examen", "laboratorio", "análisis", "hemoglobina", "colesterol"],
    response:
      "Puedo ayudarte a entender tus resultados de laboratorio. Los valores más comunes y sus rangos de referencia son:\n\n" +
      "**Hematología:**\n" +
      "- Hemoglobina: Hombres 13.5-17.5 g/dL | Mujeres 12-16 g/dL\n" +
      "- Leucocitos (glóbulos blancos): 4,500-11,000/μL\n" +
      "- Plaquetas: 150,000-400,000/μL\n\n" +
      "**Química sanguínea:**\n" +
      "- Glucosa en ayunas: 70-100 mg/dL\n" +
      "- Colesterol total: < 200 mg/dL\n" +
      "- Triglicéridos: < 150 mg/dL\n" +
      "- Creatinina: 0.7-1.3 mg/dL\n\n" +
      "Dime qué resultado específico quieres que te explique y su valor, así te doy una orientación más precisa.\n\n" +
      "⚠️ **Importante**: Los rangos pueden variar según el laboratorio. Siempre consulta con tu médico para una interpretación personalizada.",
    suggestions: [
      "¿Qué significa tener el colesterol alto?",
      "¿Cada cuánto debo hacerme exámenes de sangre?",
      "¿Necesito estar en ayunas para todos los exámenes?",
    ],
  },
  {
    keywords: ["cita", "turno", "consulta", "agendar", "médico", "doctor"],
    response:
      "¡Puedo ayudarte con eso! En Red Salud puedes:\n\n" +
      "1. **Buscar médicos** por especialidad, ubicación y disponibilidad\n" +
      "2. **Agendar citas** directamente desde la plataforma\n" +
      "3. **Ver tus citas** próximas y pasadas\n\n" +
      "Para agendar una cita:\n" +
      "- Ve a **\"Agendar Cita\"** en el menú lateral\n" +
      "- Selecciona la especialidad que necesitas\n" +
      "- Elige un médico disponible\n" +
      "- Selecciona fecha y hora\n" +
      "- Confirma tu cita\n\n" +
      "Si no estás seguro de qué especialista necesitas, puedo orientarte según tus síntomas.",
    suggestions: [
      "¿Qué especialista necesito para dolor de espalda?",
      "¿Cómo cancelo o reprogramo una cita?",
      "¿Puedo tener una consulta por telemedicina?",
    ],
  },
];

const DEFAULT_RESPONSE: AIResponsePayload = {
  response:
    "Gracias por tu consulta. Aunque no tengo información específica sobre ese tema, te recomiendo:\n\n" +
    "1. **Si es urgente**: Agenda una cita con un especialista a través de Red Salud\n" +
    "2. **Si es una duda general**: Reformula tu pregunta con más detalle sobre tus síntomas\n" +
    "3. **Si necesitas orientación**: Usa el verificador de síntomas para una evaluación inicial\n\n" +
    "Estoy aquí para ayudarte con consultas sobre salud general, medicamentos, resultados de laboratorio, y orientación sobre especialistas.\n\n" +
    "Recuerda: este asistente es una herramienta de orientación y **no reemplaza** la consulta con un profesional de salud.",
  suggestions: [
    "¿Qué especialista necesito para mi problema?",
    "¿Cómo interpreto mis resultados de laboratorio?",
    "¿Qué debo hacer si tengo fiebre?",
    "¿Cómo agendo una cita médica?",
  ],
};

/**
 * Generate a mock AI response based on keyword matching.
 *
 * To integrate with Gemini, replace this function with:
 *
 * ```ts
 * async function generateAIResponse(
 *   message: string,
 *   context?: ChatRequestBody["context"]
 * ): Promise<AIResponsePayload> {
 *   const { GoogleGenerativeAI } = await import("@google/generative-ai");
 *   const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
 *   const model = genAI.getGenerativeModel({ model: "gemini-pro" });
 *   const result = await model.generateContent(buildPrompt(message, context));
 *   // parse and return
 * }
 * ```
 */
async function generateMockResponse(
  message: string,
  _context?: ChatRequestBody["context"]
): Promise<AIResponsePayload> {
  // Simulate network latency (400-1200ms)
  await new Promise((resolve) => setTimeout(resolve, 400 + Math.random() * 800));

  const normalizedMessage = message.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  for (const rule of MOCK_RULES) {
    const match = rule.keywords.some((keyword) => {
      const normalizedKeyword = keyword.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return normalizedMessage.includes(normalizedKeyword);
    });

    if (match) {
      return { response: rule.response, suggestions: rule.suggestions };
    }
  }

  return DEFAULT_RESPONSE;
}

// --- Route Handler ---

export async function POST(request: NextRequest) {
  try {
    // 1. Validate authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: true, message: "No autenticado. Inicia sesión para continuar." },
        { status: 401 },
      );
    }

    // 2. Rate limit check
    if (isRateLimited(user.id)) {
      return NextResponse.json(
        {
          error: true,
          message: "Has alcanzado el límite de mensajes por minuto. Espera un momento.",
        },
        { status: 429 },
      );
    }

    // 3. Validate request body
    const body = (await request.json()) as ChatRequestBody;

    if (!body.message || typeof body.message !== "string") {
      return NextResponse.json(
        { error: true, message: "El mensaje es requerido." },
        { status: 400 },
      );
    }

    const trimmedMessage = body.message.trim();

    if (trimmedMessage.length === 0) {
      return NextResponse.json(
        { error: true, message: "El mensaje no puede estar vacío." },
        { status: 400 },
      );
    }

    if (trimmedMessage.length > 2000) {
      return NextResponse.json(
        { error: true, message: "El mensaje no puede exceder 2000 caracteres." },
        { status: 400 },
      );
    }

    // 4. Generate AI response
    const aiResponse = await generateMockResponse(trimmedMessage, body.context);

    return NextResponse.json(aiResponse);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: true, message: "Solicitud inválida. Verifica los datos enviados." },
        { status: 400 },
      );
    }

    console.error("[AI Chat] Unexpected error:", error);
    return NextResponse.json(
      { error: true, message: "Error interno del servidor. Intenta nuevamente." },
      { status: 500 },
    );
  }
}
