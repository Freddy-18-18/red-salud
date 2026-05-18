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
// Smart unified search.
// -------------------------------------------------------------------
// Single endpoint backing the only search UI in `/dashboard/buscar-medico`.
// Strategy (cheap-first):
//   1. Normalise text and run direct DB ILIKE matches against doctors,
//      specialties, and city/state. Always fast, always free.
//   2. Decide if Gemini is worth calling: fires ONLY when the text is
//      "symptom-shaped" (some length, contains action verbs / sensations)
//      AND there are few/no local matches. This keeps the free quota safe.
//   3. Memoise responses for 1h via in-memory LRU.
// -------------------------------------------------------------------

const bodySchema = z.object({
  text: z.string().trim().min(1).max(800),
});

interface DoctorHit {
  id: string;
  slug: string | null;
  full_name: string;
  avatar_url: string | null;
  city: string | null;
  state: string | null;
  specialty_name: string | null;
  consultation_fee: number | null;
  average_rating: number | null;
  total_reviews: number | null;
  accepts_telemedicine: boolean | null;
  sacs_verified: boolean | null;
}

interface SpecialtyHit {
  id: string;
  slug: string | null;
  name: string;
  description: string | null;
  doctor_count: number;
}

interface SearchResponse {
  doctors: DoctorHit[];
  specialties: SpecialtyHit[];
  orientation:
    | (OrientationResult & {
        specialties: (OrientationSpecialty & {
          slug: string | null;
          doctor_count: number;
          specialty_id: string | null;
        })[];
      })
    | null;
  /** Diagnostic for the UI badge — tells the caller whether IA was used. */
  used_ai: boolean;
}

// ── In-memory cache ─────────────────────────────────────────────
const CACHE = new Map<string, { value: SearchResponse; at: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000;
const CACHE_MAX = 200;

function normalise(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cacheGet(k: string): SearchResponse | null {
  const e = CACHE.get(k);
  if (!e) return null;
  if (Date.now() - e.at > CACHE_TTL_MS) {
    CACHE.delete(k);
    return null;
  }
  return e.value;
}
function cacheSet(k: string, v: SearchResponse) {
  if (CACHE.size >= CACHE_MAX) {
    const first = CACHE.keys().next().value;
    if (first) CACHE.delete(first);
  }
  CACHE.set(k, { value: v, at: Date.now() });
}

// ── Gemini budget guard ─────────────────────────────────────────
let dailyCount = 0;
let dailyResetAt = nextDayUtc();
function nextDayUtc(): number {
  const n = new Date();
  return Date.UTC(
    n.getUTCFullYear(),
    n.getUTCMonth(),
    n.getUTCDate() + 1,
    0,
    0,
    0,
    0,
  );
}
function canCallAI(): boolean {
  if (Date.now() >= dailyResetAt) {
    dailyCount = 0;
    dailyResetAt = nextDayUtc();
  }
  const cap = Number(process.env.GEMINI_DAILY_REQUEST_BUDGET ?? "400");
  if (dailyCount >= cap) return false;
  dailyCount += 1;
  return true;
}

// "Symptom-shaped" heuristic — Gemini only fires when:
//   - text has at least 4 words, OR
//   - text contains action/sensation verbs in Spanish.
function looksLikeSymptom(text: string): boolean {
  const words = normalise(text).split(/\s+/);
  if (words.length >= 5) return true;
  const sensations = [
    "duele",
    "dolor",
    "siento",
    "tengo",
    "molesta",
    "molestia",
    "ardor",
    "mareo",
    "fiebre",
    "tos",
    "vomito",
    "diarrea",
    "ansied",
    "depresion",
    "presion",
    "palpita",
    "nausea",
    "sangr",
    "hincha",
    "irritac",
    "picazon",
    "perdid",
  ];
  const t = ` ${normalise(text)} `;
  return sensations.some((s) => t.includes(s));
}

export async function POST(request: NextRequest) {
  try {
    const limited = await checkRateLimit(request, "search");
    if (limited) return limited;

    const supabase = await createClient();

    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Texto inválido." },
        { status: 400 },
      );
    }

    const text = parsed.data.text;
    const key = normalise(text);
    const cached = cacheGet(key);
    if (cached) return NextResponse.json(cached);

    // RPCs accent/case-insensitive matching using unaccent extension.
    const [doctorsRpc, specialtiesRpc] = await Promise.all([
      supabase.rpc("search_doctors_unaccent", { p_query: text }),
      supabase.rpc("search_specialties_unaccent", { p_query: text }),
    ]);

    const doctors: DoctorHit[] = (doctorsRpc.data ?? []).map(
      (d: {
        doctor_profile_id: string;
        slug: string | null;
        consultation_fee: number | null;
        accepts_telemedicine: boolean | null;
        sacs_verified: boolean | null;
        average_rating: number | null;
        total_reviews: number | null;
        full_name: string | null;
        avatar_url: string | null;
        city: string | null;
        state: string | null;
        specialty_name: string | null;
      }) => ({
        id: d.doctor_profile_id,
        slug: d.slug ?? null,
        full_name: d.full_name ?? "",
        avatar_url: d.avatar_url ?? null,
        city: d.city ?? null,
        state: d.state ?? null,
        specialty_name: d.specialty_name ?? null,
        consultation_fee: d.consultation_fee ?? null,
        average_rating: d.average_rating ?? null,
        total_reviews: d.total_reviews ?? null,
        accepts_telemedicine: d.accepts_telemedicine ?? null,
        sacs_verified: d.sacs_verified ?? null,
      }),
    );

    const specialtiesRes = { data: specialtiesRpc.data ?? [] };
    const specIds = (specialtiesRes.data ?? []).map(
      (s: { id: string }) => s.id,
    );
    const { data: specCounts } = specIds.length
      ? await supabase
          .from("doctor_profiles")
          .select("specialty_id")
          .in("specialty_id", specIds)
          .eq("verified", true)
      : { data: [] };
    const countBy = new Map<string, number>();
    for (const r of specCounts ?? []) {
      countBy.set(r.specialty_id, (countBy.get(r.specialty_id) ?? 0) + 1);
    }
    const specialties: SpecialtyHit[] = (specialtiesRes.data ?? []).map(
      (s: { id: string; slug: string | null; name: string; description: string | null }) => ({
        id: s.id,
        slug: s.slug ?? null,
        name: s.name,
        description: s.description ?? null,
        doctor_count: countBy.get(s.id) ?? 0,
      }),
    );

    // Decide whether to call Gemini.
    const localStrong = doctors.length > 0 || specialties.length > 0;
    const isSymptom = looksLikeSymptom(text);
    let orientation: SearchResponse["orientation"] = null;
    let used_ai = false;

    if (isSymptom && (!localStrong || specialties.length === 0)) {
      if (canCallAI()) {
        try {
          const raw = await orientPatient(text);
          used_ai = true;

          // Enrich Gemini specialty names with slug + count
          const names = raw.specialties.map((s) => s.name);
          if (names.length > 0) {
            const { data: catalog } = await supabase
              .from("specialties")
              .select("id, name, slug")
              .in("name", names);
            const byName = new Map(
              (catalog ?? []).map((c) => [c.name.toLowerCase(), c]),
            );
            const ids = (catalog ?? []).map((c) => c.id);
            const { data: counts } = ids.length
              ? await supabase
                  .from("doctor_profiles")
                  .select("specialty_id")
                  .in("specialty_id", ids)
                  .eq("verified", true)
              : { data: [] };
            const m = new Map<string, number>();
            for (const r of counts ?? []) {
              m.set(r.specialty_id, (m.get(r.specialty_id) ?? 0) + 1);
            }
            orientation = {
              ...raw,
              specialties: raw.specialties
                .map((s) => {
                  const cat = byName.get(s.name.toLowerCase());
                  return {
                    ...s,
                    slug: cat?.slug ?? null,
                    doctor_count: cat ? m.get(cat.id) ?? 0 : 0,
                    specialty_id: cat?.id ?? null,
                  };
                })
                .sort((a, b) => b.weight - a.weight),
            };
          } else {
            orientation = {
              ...raw,
              specialties: [],
            } as SearchResponse["orientation"];
          }
        } catch (e) {
          if (!(e instanceof GeminiUnavailableError)) {
            console.error("[smart-search] Gemini error", e);
          }
        }
      }
    }

    const out: SearchResponse = {
      doctors,
      specialties,
      orientation,
      used_ai,
    };
    cacheSet(key, out);
    return NextResponse.json(out);
  } catch (e) {
    console.error("[smart-search]", e);
    return NextResponse.json(
      { error: "Error procesando la búsqueda." },
      { status: 500 },
    );
  }
}
