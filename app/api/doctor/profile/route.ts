import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId es requerido" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ 
      cookies: async () => cookieStore 
    });

    // Obtener datos del perfil con doctor_details y specialty
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select(`
        *,
        doctor_details!inner (
          id,
          anos_experiencia,
          biografia,
          licencia_medica,
          professional_phone,
          professional_email,
          idiomas,
          especialidad_id,
          verified,
          sacs_verified,
          sacs_data
        )
      `)
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return NextResponse.json(
        { error: "Error al obtener el perfil" },
        { status: 500 }
      );
    }

    // Obtener especialidad si existe
    let especialidadNombre = profile.sacs_especialidad || "";
    if (profile.doctor_details?.especialidad_id) {
      const { data: specialty } = await supabase
        .from("specialties")
        .select("name")
        .eq("id", profile.doctor_details.especialidad_id)
        .single();
      
      if (specialty) {
        especialidadNombre = specialty.name;
      }
    }

    // Extraer datos SACS si existen
    const sacsData = profile.doctor_details?.sacs_data || {};

    // Combinar datos
    const combinedData = {
      nombre_completo: profile.nombre_completo || sacsData.nombre_completo || "",
      email: profile.email,
      telefono: profile.telefono || profile.doctor_details?.professional_phone || "",
      cedula: profile.cedula || sacsData.cedula || "",
      mpps: profile.doctor_details?.licencia_medica || sacsData.matricula_principal || profile.sacs_matricula || "",
      especialidad: especialidadNombre || sacsData.especialidad_display || "",
      universidad: "",
      anos_experiencia: profile.doctor_details?.anos_experiencia || 0,
      bio: profile.doctor_details?.biografia || "",
      subespecialidades: "",
      certificaciones: "",
      idiomas: Array.isArray(profile.doctor_details?.idiomas)
        ? profile.doctor_details.idiomas.join(", ")
        : "",
    };

    return NextResponse.json(combinedData);
  } catch (error) {
    console.error("Error in GET /api/doctor/profile:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
