'use client';

/**
 * Analytics and statistics page.
 * Practice KPIs, appointment trends, revenue metrics,
 * and specialty-specific analytics.
 *
 * Uses the KPI resolver from the specialty system:
 * - resolveKpis() from @/lib/specialties/data/
 * - Specialty-specific KPI definitions from config.kpiDefinitions
 */
export default function EstadisticasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Estadísticas</h1>
        <p className="text-gray-600 mt-1">
          Métricas y análisis de tu práctica médica
        </p>
      </div>

      {/* TODO: KPI dashboard cards (uses useSpecialtyKpis hook) */}
      {/* TODO: Appointment trends chart */}
      {/* TODO: Patient demographics */}
      {/* TODO: Revenue breakdown */}
      {/* TODO: Specialty-specific metrics from resolveKpis() */}

      <div className="p-8 border-2 border-dashed rounded-lg text-center text-gray-400">
        <p>Dashboard de estadísticas</p>
        <p className="text-sm mt-2">
          KPIs, tendencias de citas, y métricas por especialidad
        </p>
      </div>
    </div>
  );
}
