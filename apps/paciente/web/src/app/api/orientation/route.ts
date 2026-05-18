import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/utils/rate-limit";
import {
  orientPatient,
  GeminiUnavailableError,
  type OrientationResult,
  type OrientationSpecialty,
} from "@/lib/services/orientation/gemini-client";

// -------------------------------------------------------------------
// Symptom orientation endpoint — POST { text: string }
// -------------------------------------------------------------------
// Layered defenses to stay within Gemini's free tier:
//   1. Per-user rate limit (mutation bucket).
//   2. In-memory cache by normalised input → 1h TTL.
//   3. Daily request budget counter via Upstash; once exhausted, fallback
//      to a deterministic dictionary mapping (no Gemini call).
//   4. Hard input cap and refusal of trivial inputs.
//
// The endpoint enriches Gemini's specialty names with the slug from
// `specialties` (so the UI can deep-link to /especialidad/[slug]) and
// the live verified-doctor count.

const bodySchema = z.object({
  text: z.string().trim().min(4).max(800),
});

// In-memory LRU-ish cache (per server instance). Keys: SHA-1 of normalised text.
const CACHE = new Map<string, { value: OrientationResult; at: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1h
const CACHE_MAX_ENTRIES = 200;

function cacheKey(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cacheGet(key: string): OrientationResult | null {
  const e = CACHE.get(key);
  if (!e) return null;
  if (Date.now() - e.at > CACHE_TTL_MS) {
    CACHE.delete(key);
    return null;
  }
  return e.value;
}
function cacheSet(key: string, value: OrientationResult) {
  if (CACHE.size >= CACHE_MAX_ENTRIES) {
    const oldest = CACHE.keys().next().value;
    if (oldest) CACHE.delete(oldest);
  }
  CACHE.set(key, { value, at: Date.now() });
}

// Daily request budget (defensive only — server restarts reset this counter
// since we don't yet have a cross-instance store wired here. The Upstash
// rate limiter handles per-user throttling; this is the global cap).
let dailyCount = 0;
let dailyResetAt = startOfNextDayUtc();
function startOfNextDayUtc(): number {
  const now = new Date();
  const next = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
      0,
      0,
      0,
      0,
    ),
  );
  return next.getTime();
}
function tickBudget(): boolean {
  if (Date.now() >= dailyResetAt) {
    dailyCount = 0;
    dailyResetAt = startOfNextDayUtc();
  }
  const cap = Number(process.env.GEMINI_DAILY_REQUEST_BUDGET ?? "400");
  if (dailyCount >= cap) return false;
  dailyCount += 1;
  return true;
}

// Deterministic fallback when Gemini is unavailable / out of budget.
// Cheap keyword match → specialty mapping. Tuned conservative.
function deterministicFallback(text: string): OrientationResult {
  const t = ` ${text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")} `;
  const triggers: { keys: string[]; spec: OrientationSpecialty }[] = [
    {
      keys: [" pecho ", " toracico ", " corazon ", " presion arterial ", " hipertens"],
      spec: { name: "Cardiología", weight: 8, reason: "Síntomas que sugieren evaluación cardiovascular." },
    },
    {
      keys: [" cabeza ", " migraña ", " migrana ", " jaqueca "],
      spec: { name: "Neurología", weight: 6, reason: "Cefaleas frecuentes o intensas suelen evaluarse en Neurología." },
    },
    {
      keys: [" piel ", " mancha ", " brote ", " sarpullido ", " acne "],
      spec: { name: "Dermatología", weight: 8, reason: "Cambios en piel se evalúan en Dermatología." },
    },
    {
      keys: [" embaraz ", " regla ", " menstrua ", " ovari ", " utero "],
      spec: { name: "Ginecología", weight: 9, reason: "Salud reproductiva femenina." },
    },
    {
      keys: [" niño ", " niña ", " hijo ", " hija ", " bebe ", " infant "],
      spec: { name: "Pediatría", weight: 9, reason: "Pacientes pediátricos." },
    },
    {
      keys: [" ansiedad ", " depresion ", " panico ", " tristeza "],
      spec: { name: "Psiquiatría", weight: 7, reason: "Síntomas anímicos persistentes." },
    },
    {
      keys: [" articulacion ", " rodilla ", " espalda ", " lumbar ", " fractura ", " esguince "],
      spec: { name: "Traumatología y Ortopedia", weight: 7, reason: "Lesiones o dolor articular." },
    },
    {
      keys: [" diabetes ", " tiroides ", " peso ", " glucemia "],
      spec: { name: "Endocrinología", weight: 7, reason: "Sospecha de problema hormonal o metabólico." },
    },
    {
      keys: [" ojo ", " vision ", " ver borroso ", " ojos rojos "],
      spec: { name: "Oftalmología", weight: 8, reason: "Síntomas oculares." },
    },
  ];

  const matches = triggers.filter((tr) => tr.keys.some((k) => t.includes(k)));
  const specialties: OrientationSpecialty[] = matches.length
    ? matches.map((m) => m.spec)
    : [
        {
          name: "Medicina General",
          weight: 9,
          reason: "Primera evaluación integral para orientarte al especialista correcto.",
        },
      ];

  return {
    summary:
      "Estamos haciendo una orientación rápida con base en palabras clave de tu mensaje.",
    advice:
      "Si tus síntomas son severos o persistentes, consulta lo antes posible.",
    needs_urgent_attention: false,
    specialties,
  };
}

export async function POST(request: NextRequest) {
  try {
    const limited = await checkRateLimit(request, "mutation");
    if (limited) return limited;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Necesitas iniciar sesión." },
        { status: 401 },
      );
    }

    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            "Escribí un poco más sobre lo que sentís (mínimo 4 caracteres).",
        },
        { status: 400 },
      );
    }

    const text = parsed.data.text;
    const key = cacheKey(text);

    let result: OrientationResult | null = cacheGet(key);
    let source: "cache" | "gemini" | "fallback" = "cache";

    if (!result) {
      if (!tickBudget()) {
        result = deterministicFallback(text);
        source = "fallback";
      } else {
        try {
          result = await orientPatient(text);
          source = "gemini";
          cacheSet(key, result);
        } catch (e) {
          if (e instanceof GeminiUnavailableError) {
            console.warn("[Orientation] Gemini fallback:", e.message);
          } else {
            console.error("[Orientation] Unexpected:", e);
          }
          result = deterministicFallback(text);
          source = "fallback";
        }
      }
    }

    // Enrich with slug + doctor counts
    const names = result.specialties.map((s) => s.name);
    if (names.length > 0) {
      const { data: catalog } = await supabase
        .from("specialties")
        .select("id, name, slug")
        .in("name", names);

      const ids = (catalog ?? []).map((c) => c.id);
      const { data: counts } = ids.length
        ? await supabase
            .from("doctor_profiles")
            .select("specialty_id")
            .in("specialty_id", ids)
            .eq("verified", true)
        : { data: [] };

      const countMap = new Map<string, number>();
      for (const row of counts ?? []) {
        countMap.set(
          row.specialty_id,
          (countMap.get(row.specialty_id) ?? 0) + 1,
        );
      }
      const byName = new Map(
        (catalog ?? []).map((c) => [c.name.toLowerCase(), c]),
      );

      result = {
        ...result,
        specialties: result.specialties
          .map((s) => {
            const cat = byName.get(s.name.toLowerCase());
            return {
              ...s,
              slug: cat?.slug ?? null,
              doctor_count: cat ? countMap.get(cat.id) ?? 0 : 0,
              specialty_id: cat?.id ?? null,
            } as OrientationSpecialty & {
              slug: string | null;
              doctor_count: number;
              specialty_id: string | null;
            };
          })
          .sort((a, b) => b.weight - a.weight),
      };
    }

    return NextResponse.json({ data: result, source });
  } catch (e) {
    console.error("[Orientation]", e);
    return NextResponse.json(
      { error: "No pudimos procesar tu pedido. Probá de nuevo." },
      { status: 500 },
    );
  }
}
