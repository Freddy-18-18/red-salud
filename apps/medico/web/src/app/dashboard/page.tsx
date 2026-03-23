'use client';

import { useEffect, useState } from 'react';
import {
  getSpecialtyExperienceConfig,
  getSpecialtyMenuGroups,
  type SpecialtyConfig,
} from '@/lib/specialties';

/**
 * Main doctor dashboard page.
 *
 * Loads the specialty-aware configuration to render the appropriate
 * dashboard variant (generic, odontology, cardiology, etc.).
 *
 * The specialty system detects the doctor's specialty from their profile
 * and returns a tailored configuration with modules, KPIs, and widgets.
 */
export default function DashboardPage() {
  const [config, setConfig] = useState<SpecialtyConfig | null>(null);

  useEffect(() => {
    // TODO: Fetch doctor profile from Supabase and pass specialty context
    // Example:
    // const profile = await getDoctorProfile(userId);
    // const config = getSpecialtyExperienceConfig({
    //   specialtySlug: profile.specialty_slug,
    //   specialtyName: profile.specialty_name,
    //   sacsEspecialidad: profile.sacs_especialidad,
    // });
    const defaultConfig = getSpecialtyExperienceConfig({});
    setConfig(defaultConfig);
  }, []);

  if (!config) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Cargando dashboard...</p>
      </div>
    );
  }

  const menuGroups = getSpecialtyMenuGroups(config);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Dashboard — {config.name || 'Médico'}
        </h1>
        <p className="text-gray-600 mt-1">
          Variante: {config.dashboardVariant} | Categoría: {config.category}
        </p>
      </div>

      {/* KPI Cards */}
      {config.prioritizedKpis.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Indicadores Clave</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {config.prioritizedKpis.slice(0, 4).map((kpi) => {
              const def = config.kpiDefinitions?.[kpi];
              return (
                <div key={kpi} className="p-4 border rounded-lg bg-white">
                  <p className="text-sm text-gray-500">{def?.label || kpi}</p>
                  <p className="text-2xl font-bold mt-1">—</p>
                  {/* TODO: Resolve KPIs via resolveKpis() from specialty data layer */}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Specialty Module Groups */}
      {menuGroups.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Módulos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {menuGroups.map((group) => (
              <div key={group.label} className="p-4 border rounded-lg bg-white">
                <h3 className="font-medium text-gray-700 mb-2">{group.label}</h3>
                <ul className="space-y-1">
                  {group.items.map((item) => (
                    <li key={item.key}>
                      <a
                        href={item.route}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
