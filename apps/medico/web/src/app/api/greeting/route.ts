import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import {
  bucketForHour,
  fallbackGreeting,
  type TimeBucket,
} from '@/lib/greeting/time-bucket';

/**
 * POST /api/greeting
 *
 * Returns a short, warm greeting for the logged-in doctor. When a Gemini API
 * key is configured, asks Gemini for a context-aware line. Falls back to a
 * deterministic static greeting otherwise.
 *
 * Body: { hour?: number }
 *   - hour: client's local hour 0-23. Defaults to server-side UTC hour
 *     converted to America/Caracas if not provided.
 *
 * Response:
 *   {
 *     greeting: string,
 *     bucket: TimeBucket,
 *     source: 'gemini' | 'fallback',
 *     firstName: string,
 *   }
 */

interface GreetingRequest {
  hour?: number;
}

interface GreetingResponse {
  greeting: string;
  bucket: TimeBucket;
  source: 'gemini' | 'fallback';
  firstName: string;
}

function caracasHour(): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    hour12: false,
    timeZone: 'America/Caracas',
  });
  const formatted = formatter.format(new Date());
  return Number.parseInt(formatted, 10);
}

function firstNameFromFullName(fullName: string | null | undefined): string {
  if (!fullName) return 'Doctor';
  const cleaned = fullName.trim();
  if (!cleaned) return 'Doctor';
  // Capitalize: "MARIANELLA SUAREZ" -> "Marianella"
  const first = cleaned.split(/\s+/)[0];
  return first
    .toLowerCase()
    .replace(/^./, (c) => c.toUpperCase());
}

// Project-wide canonical env name is GOOGLE_GEMINI_API_KEY (already configured
// in apps/paciente/web/.env.local). Fallback to a couple of other common names
// for resilience but the canonical one is preferred.
const GEMINI_API_KEY =
  process.env.GOOGLE_GEMINI_API_KEY ??
  process.env.GEMINI_API_KEY ??
  process.env.GOOGLE_API_KEY ??
  '';

// Match the model used by paciente/web's Gemini integration. Override per env
// with GOOGLE_GEMINI_MODEL if you want a different family (e.g. pro for tasks).
const GEMINI_MODEL = process.env.GOOGLE_GEMINI_MODEL ?? 'gemini-2.5-flash';

async function geminiGreeting(bucket: TimeBucket, firstName: string): Promise<string | null> {
  if (!GEMINI_API_KEY) return null;

  const prompt = `Generá UN saludo CORTO (máximo 8 palabras), AMIGABLE y CÁLIDO para un médico llamado ${firstName}.
Hora del día: ${bucket}.
Tono: profesional pero humano, en español rioplatense (uso de "vos" cuando aplique).
NO uses emojis. UNA sola línea. SIN signos de exclamación finales.
Variá entre estos patrones (elegí uno):
- "Buenos días, Dr. ${firstName}"
- "Buen ${bucket === 'mañana' ? 'inicio' : bucket === 'tarde' ? 'medio' : 'cierre'} de día, Dr. ${firstName}"
- "Hola Dr. ${firstName}, espero estés bien"
- Otros similares contextuales a la hora.

Respondé SOLO con el saludo, sin comillas, sin prefijos, sin explicación.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.85,
            maxOutputTokens: 40,
          },
        }),
        // Don't hang the dashboard waiting on the LLM.
        signal: AbortSignal.timeout(4000),
      },
    );

    if (!response.ok) return null;

    const data = (await response.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) return null;
    // Defensive: strip wrapping quotes and trailing punctuation just in case.
    return text.replace(/^["'"]|["'"]$/g, '').replace(/[!.]+$/, '').trim();
  } catch {
    return null;
  }
}

export async function POST(request: Request): Promise<NextResponse<GreetingResponse>> {
  const body = (await request.json().catch(() => ({}))) as GreetingRequest;
  const hourFromClient =
    typeof body.hour === 'number' && body.hour >= 0 && body.hour <= 23
      ? body.hour
      : null;
  const hour = hourFromClient ?? caracasHour();
  const bucket = bucketForHour(hour);

  // Pull the doctor's first name from profiles. If we can't read the session,
  // we still return a generic greeting — keeps the endpoint resilient.
  let firstName = 'Doctor';
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle();
      firstName = firstNameFromFullName(data?.full_name ?? user.email);
    }
  } catch {
    // Soft fail — use the default firstName.
  }

  const geminiText = await geminiGreeting(bucket, firstName);
  if (geminiText) {
    return NextResponse.json({
      greeting: geminiText,
      bucket,
      source: 'gemini',
      firstName,
    });
  }

  return NextResponse.json({
    greeting: fallbackGreeting(bucket, firstName),
    bucket,
    source: 'fallback',
    firstName,
  });
}
