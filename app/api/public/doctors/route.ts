import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const specialtyId = searchParams.get("specialtyId");
  const featuredOnly = searchParams.get("featured") === "true";
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10) || 0, 1), 24) : undefined;

  try {
    let query = supabaseAdmin
      .from("doctor_details")
      .select(
        `
        id,
        especialidad_id,
        licencia_medica,
        anos_experiencia,
        biografia,
        tarifa_consulta,
        verified,
        acepta_seguros,
        created_at,
        updated_at,
        profile:profiles(
          id,
          nombre_completo,
          email,
          avatar_url,
          telefono,
          direccion,
          ciudad,
          estado
        ),
        specialty:specialties(
          id,
          name,
          description,
          icon,
          created_at
        )
      `
      )
      .eq("verified", true)
      .order("created_at", { ascending: true });

    if (specialtyId) {
      query = query.eq("especialidad_id", specialtyId);
    }

    // Filtrar por destacados si hay configuración (tabla o columna). Fallback seguro.
    if (featuredOnly) {
      try {
        const { data: featured, error: fErr } = await supabaseAdmin
          .from("featured_doctors")
          .select("doctor_profile_id");

        if (!fErr && Array.isArray(featured) && featured.length > 0) {
          const ids = featured.map((f: any) => f.doctor_profile_id).filter(Boolean);
          if (ids.length > 0) {
            // @ts-ignore - in() está disponible en el cliente de Supabase
            query = query.in("id", ids);
          }
        } else {
          // Si no hay tabla o no hay destacados, ignoramos el filtro y devolvemos los más recientes
          // Esto asegura que la UI no se quede vacía
          console.warn("No featured doctors found or table missing, returning latest verified doctors.");
        }
      } catch (e) {
        // Tabla no existe u otro error: ignoramos el filtro
        console.warn("Error checking featured_doctors, returning latest verified doctors.", e);
      }
    }

    const { data, error } = await query;

    if (error) throw error;

    let doctors = (data || []).map((row: any) => {
      const profile = row.profile
        ? {
            id: row.profile.id,
            nombre_completo: row.profile.nombre_completo,
            email: row.profile.email,
            avatar_url: row.profile.avatar_url,
          }
        : undefined;

      return {
        id: row.id,
        specialty_id: row.especialidad_id,
        license_number: row.licencia_medica,
        anos_experiencia: row.anos_experiencia || 0,
        biografia: row.biografia || undefined,
        tarifa_consulta: row.tarifa_consulta
          ? Number(row.tarifa_consulta)
          : undefined,
        consultation_duration: 30, // Default value as it's missing in DB
        verified: row.verified,
        created_at: row.created_at,
        updated_at: row.updated_at,
        profile,
        specialty:
          row.specialty || {
            id: row.especialidad_id || "",
            name: "Medicina General",
            description: "",
            icon: "stethoscope",
            created_at: row.created_at,
          },
      };
    });

    if (limit) {
      doctors = doctors.slice(0, limit);
    }

    return NextResponse.json({ success: true, data: doctors });
  } catch (error) {
    console.error("[public-doctors] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
