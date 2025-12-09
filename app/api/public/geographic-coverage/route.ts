import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const ESTADOS_VENEZUELA = [
  "Amazonas", "Anzoátegui", "Apure", "Aragua", "Barinas", "Bolívar", 
  "Carabobo", "Cojedes", "Delta Amacuro", "Distrito Capital", "Falcón", 
  "Guárico", "Lara", "Mérida", "Miranda", "Monagas", "Nueva Esparta", 
  "Portuguesa", "Sucre", "Táchira", "Trujillo", "La Guaira", "Yaracuy", "Zulia"
];

/**
 * GET /api/public/geographic-coverage
 * 
 * Retorna estadísticas de cobertura geográfica en Venezuela
 */
export async function GET() {
  try {
    // Obtener médicos verificados con su estado
    const { data: doctors, error } = await supabaseAdmin
      .from("doctor_details")
      .select(`
        id,
        profile:profiles(estado)
      `)
      .eq("verified", true);

    if (error) throw error;

    const stateCounts: Record<string, { medicos: number, total: number }> = {};

    // Inicializar contadores
    ESTADOS_VENEZUELA.forEach(estado => {
      stateCounts[estado] = { medicos: 0, total: 0 };
    });

    // Contar médicos por estado
    doctors?.forEach((doc: any) => {
      const estado = doc.profile?.estado;
      if (estado && ESTADOS_VENEZUELA.includes(estado)) {
        stateCounts[estado].medicos++;
        stateCounts[estado].total++;
      }
    });

    // Calcular estadísticas
    const estadosConCobertura = Object.values(stateCounts).filter(s => s.total > 0).length;
    const totalEstados = ESTADOS_VENEZUELA.length;
    const porcentajePenetracion = Math.round((estadosConCobertura / totalEstados) * 100);

    const serviciosPorEstado = Object.entries(stateCounts)
      .filter(([_, counts]) => counts.total > 0)
      .map(([estado, counts]) => ({
        estado,
        codigo: estado.substring(0, 2).toUpperCase(), // Código dummy
        total: counts.total,
        medicos: counts.medicos,
        clinicas: 0,
        farmacias: 0,
        laboratorios: 0,
        seguros: 0,
      }))
      .sort((a, b) => b.total - a.total);

    return NextResponse.json({
      success: true,
      data: {
        totalEstados,
        estadosConCobertura,
        porcentajePenetracion,
        serviciosPorEstado,
      },
    });

  } catch (error) {
    console.error("Error al obtener cobertura geográfica:", error);
    return NextResponse.json({
      success: false,
      error: "Error al procesar la solicitud",
    }, { status: 500 });
  }
}
