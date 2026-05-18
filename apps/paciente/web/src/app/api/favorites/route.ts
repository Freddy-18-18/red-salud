import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/utils/rate-limit";

// Patient's saved doctors list. RLS-scoped to the authenticated user.

export async function GET(request: NextRequest) {
  try {
    const limited = await checkRateLimit(request, "authenticated");
    if (limited) return limited;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado." }, { status: 401 });
    }

    // Step 1: get the user's saved favorites (RLS-scoped).
    const { data: favRows, error } = await supabase
      .from("patient_doctor_favorites")
      .select("id, doctor_profile_id, note, created_at")
      .eq("patient_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Favorites GET]", error);
      return NextResponse.json({ data: [] });
    }

    // Step 2: hydrate doctor info from the safe public view (no PII columns).
    // See migration create_public_doctor_directory_view (2026-05-08).
    const doctorIds = Array.from(
      new Set(
        (favRows ?? [])
          .map((r) => r.doctor_profile_id)
          .filter((id): id is string => typeof id === "string"),
      ),
    );

    type HydratedDoctor = {
      id: string;
      slug: string | null;
      consultation_fee: number | null;
      accepts_telemedicine: boolean | null;
      accepts_insurance: boolean | null;
      sacs_verified: boolean | null;
      average_rating: number | null;
      total_reviews: number | null;
      profile: {
        full_name: string | null;
        avatar_url: string | null;
        city: string | null;
        state: string | null;
      };
      specialty: { name: string | null };
    };
    const doctorMap = new Map<string, HydratedDoctor>();

    if (doctorIds.length > 0) {
      const { data: viewRows } = await supabase
        .from("public_doctor_directory")
        .select(
          `
          doctor_profile_id, slug, consultation_fee, accepts_telemedicine,
          accepts_insurance, sacs_verified, average_rating, total_reviews,
          full_name, avatar_url, city, state, specialty_id
        `,
        )
        .in("doctor_profile_id", doctorIds);

      const specialtyIds = Array.from(
        new Set(
          (viewRows ?? [])
            .map((r) => r.specialty_id)
            .filter((id): id is string => typeof id === "string"),
        ),
      );
      const specialtyNameMap = new Map<string, string>();
      if (specialtyIds.length > 0) {
        const { data: specs } = await supabase
          .from("specialties")
          .select("id, name")
          .in("id", specialtyIds);
        for (const s of specs ?? []) specialtyNameMap.set(s.id, s.name);
      }

      for (const r of viewRows ?? []) {
        doctorMap.set(r.doctor_profile_id, {
          id: r.doctor_profile_id,
          slug: r.slug,
          consultation_fee: r.consultation_fee,
          accepts_telemedicine: r.accepts_telemedicine,
          accepts_insurance: r.accepts_insurance,
          sacs_verified: r.sacs_verified,
          average_rating: r.average_rating,
          total_reviews: r.total_reviews,
          profile: {
            full_name: r.full_name,
            avatar_url: r.avatar_url,
            city: r.city,
            state: r.state,
          },
          specialty: {
            name: r.specialty_id ? specialtyNameMap.get(r.specialty_id) ?? null : null,
          },
        });
      }
    }

    const data = (favRows ?? []).map((r) => ({
      id: r.id,
      doctor_profile_id: r.doctor_profile_id,
      note: r.note,
      created_at: r.created_at,
      doctor: doctorMap.get(r.doctor_profile_id) ?? null,
    }));

    return NextResponse.json({ data });
  } catch (e) {
    console.error("[Favorites GET]", e);
    return NextResponse.json({ data: [] });
  }
}

const postBody = z.object({
  doctor_profile_id: z.string().uuid(),
  note: z.string().trim().max(280).optional().nullable(),
});

export async function POST(request: NextRequest) {
  try {
    const limited = await checkRateLimit(request, "mutation");
    if (limited) return limited;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado." }, { status: 401 });
    }

    const body = await request.json();
    const parsed = postBody.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos." },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from("patient_doctor_favorites")
      .upsert(
        {
          patient_id: user.id,
          doctor_profile_id: parsed.data.doctor_profile_id,
          note: parsed.data.note ?? null,
        },
        { onConflict: "patient_id,doctor_profile_id" },
      );

    if (error) {
      console.error("[Favorites POST]", error);
      return NextResponse.json({ error: "Error al guardar." }, { status: 500 });
    }
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error("[Favorites POST]", e);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const limited = await checkRateLimit(request, "mutation");
    if (limited) return limited;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const doctorProfileId = searchParams.get("doctor_profile_id");
    if (!doctorProfileId) {
      return NextResponse.json(
        { error: "doctor_profile_id requerido." },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from("patient_doctor_favorites")
      .delete()
      .eq("patient_id", user.id)
      .eq("doctor_profile_id", doctorProfileId);

    if (error) {
      console.error("[Favorites DELETE]", error);
      return NextResponse.json({ error: "Error al borrar." }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[Favorites DELETE]", e);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
