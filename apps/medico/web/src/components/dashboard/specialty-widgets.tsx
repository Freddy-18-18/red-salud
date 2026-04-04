'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useDoctorAppointments } from '@red-salud/core';
import type { SpecialtyConfig } from '@/lib/specialties';
import { ModuleRenderer } from '@/components/modules/module-renderer';
import { isModuleRegistered } from '@/components/modules/module-registry';
import {
  FlaskConical,
  Share2,
  Bell,
  Syringe,
  TrendingUp,
  HeartPulse,
  Activity,
  Baby,
  Bug,
  Pill,
  Stethoscope,
  FileText,
  AlertTriangle,
  Scan,
  Droplets,
  Scissors,
  ClipboardList,
  Calculator,
  ArrowRight,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface SpecialtyWidgetsProps {
  doctorId: string;
  specialtyConfig: SpecialtyConfig;
  themeColor?: string;
}

interface WidgetItem {
  label: string;
  value: string | number;
  subtext?: string;
}

interface WidgetPanel {
  title: string;
  icon: typeof Activity;
  items: WidgetItem[];
  emptyMessage: string;
}

// ============================================================================
// WIDGET BUILDERS PER SPECIALTY CATEGORY
// ============================================================================

function getWidgetsForSpecialty(
  category: string,
  dashboardVariant: string,
): WidgetPanel[] {
  // Dental / Odontologia
  if (category === 'dental' || dashboardVariant.includes('odontologia')) {
    return [
      {
        title: 'Procedimientos dentales hoy',
        icon: Stethoscope,
        items: [],
        emptyMessage: 'Sin procedimientos registrados hoy',
      },
      {
        title: 'Planes de tratamiento pendientes',
        icon: FileText,
        items: [],
        emptyMessage: 'Todos los planes al día',
      },
      {
        title: 'Cola de imágenes',
        icon: Scan,
        items: [],
        emptyMessage: 'Sin imágenes pendientes',
      },
    ];
  }

  // Cardiology
  if (category === 'medical' && dashboardVariant.includes('cardiologia')) {
    return [
      {
        title: 'Cola de ECG',
        icon: HeartPulse,
        items: [],
        emptyMessage: 'Sin ECG pendientes',
      },
      {
        title: 'Pruebas de esfuerzo esta semana',
        icon: Activity,
        items: [],
        emptyMessage: 'Sin pruebas programadas',
      },
      {
        title: 'Pacientes críticos',
        icon: AlertTriangle,
        items: [],
        emptyMessage: 'Sin pacientes críticos',
      },
    ];
  }

  // Urología
  if (dashboardVariant.includes('urologia')) {
    return [
      {
        title: 'Seguimiento PSA',
        icon: Droplets,
        items: [],
        emptyMessage: 'Sin alertas de PSA pendientes',
      },
      {
        title: 'Cirugías programadas',
        icon: Scissors,
        items: [],
        emptyMessage: 'Sin cirugías programadas',
      },
      {
        title: 'Estudios urodinámicos',
        icon: Activity,
        items: [],
        emptyMessage: 'Sin estudios urodinámicos pendientes',
      },
    ];
  }

  // Medicina Interna + Medicina Crítica
  if (dashboardVariant.includes('medicina-interna')) {
    return [
      {
        title: 'Pacientes crónicos',
        icon: ClipboardList,
        items: [],
        emptyMessage: 'Sin alertas de crónicos pendientes',
      },
      {
        title: 'Laboratorios pendientes',
        icon: FlaskConical,
        items: [],
        emptyMessage: 'Sin resultados de laboratorio pendientes',
      },
      {
        title: 'Scores de riesgo',
        icon: Calculator,
        items: [],
        emptyMessage: 'Sin scores de riesgo calculados',
      },
    ];
  }

  // Infectología Pediátrica
  if (dashboardVariant.includes('infectologia-pediatrica')) {
    return [
      {
        title: 'Infecciones activas',
        icon: Bug,
        items: [],
        emptyMessage: 'Sin infecciones activas registradas',
      },
      {
        title: 'Cultivos pendientes',
        icon: FlaskConical,
        items: [],
        emptyMessage: 'Sin cultivos pendientes',
      },
      {
        title: 'Esquemas antibióticos',
        icon: Pill,
        items: [],
        emptyMessage: 'Sin esquemas antibióticos activos',
      },
    ];
  }

  // Pediatrics
  if (category === 'pediatric' || dashboardVariant.includes('pediatria')) {
    return [
      {
        title: 'Calendario de vacunación',
        icon: Syringe,
        items: [],
        emptyMessage: 'Sin vacunas pendientes hoy',
      },
      {
        title: 'Alertas de crecimiento',
        icon: TrendingUp,
        items: [],
        emptyMessage: 'Sin alertas activas',
      },
      {
        title: 'Distribución por edad',
        icon: Baby,
        items: [],
        emptyMessage: 'Sin datos de pacientes',
      },
    ];
  }

  // Default / General medicine
  return [
    {
      title: 'Resultados de laboratorio recientes',
      icon: FlaskConical,
      items: [],
      emptyMessage: 'Sin resultados pendientes',
    },
    {
      title: 'Remisiones pendientes',
      icon: Share2,
      items: [],
      emptyMessage: 'Sin remisiones pendientes',
    },
    {
      title: 'Recordatorios de seguimiento',
      icon: Bell,
      items: [],
      emptyMessage: 'Sin seguimientos pendientes',
    },
  ];
}

// ============================================================================
// WIDGET CARD COMPONENT
// ============================================================================

function WidgetCard({
  panel,
  themeColor,
}: {
  panel: WidgetPanel;
  themeColor: string;
}) {
  const Icon = panel.icon;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div
          className="h-8 w-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${themeColor}15` }}
        >
          <Icon className="h-4 w-4" style={{ color: themeColor }} />
        </div>
        <h3 className="text-sm font-semibold text-gray-700">{panel.title}</h3>
      </div>

      {panel.items.length === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center">{panel.emptyMessage}</p>
      ) : (
        <ul className="space-y-2">
          {panel.items.map((item, idx) => (
            <li key={idx} className="flex items-center justify-between py-1.5">
              <div>
                <p className="text-sm text-gray-700">{item.label}</p>
                {item.subtext && (
                  <p className="text-xs text-gray-400">{item.subtext}</p>
                )}
              </div>
              <span className="text-sm font-semibold text-gray-900">{item.value}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ============================================================================
// SPECIALTY MODULE SUMMARY WIDGETS
// ============================================================================

interface ModuleSummaryWidget {
  moduleKey: string;
  title: string;
  icon: typeof Activity;
  summary: string;
  detail?: string;
  linkLabel: string;
}

function getModuleSummaries(
  category: string,
  dashboardVariant: string,
): ModuleSummaryWidget[] {
  // Dental / Odontologia — mini odontogram summary
  if (category === 'dental' || dashboardVariant.includes('odontologia')) {
    return [
      {
        moduleKey: 'dental-odontogram',
        title: 'Resumen Odontograma',
        icon: Scan,
        summary: 'Sin odontograma activo',
        detail: 'Seleccione un paciente para ver su odontograma',
        linkLabel: 'Abrir odontograma',
      },
      {
        moduleKey: 'dental-periodontogram',
        title: 'Periodontograma',
        icon: Activity,
        summary: 'Sin evaluación periodontal reciente',
        detail: 'Registre el estado periodontal del paciente',
        linkLabel: 'Abrir periodontograma',
      },
    ];
  }

  // Cardiology — last ECG date/result
  if (category === 'medical' && dashboardVariant.includes('cardiologia')) {
    return [
      {
        moduleKey: 'cardiology-ecg',
        title: 'Último ECG',
        icon: HeartPulse,
        summary: 'Sin ECG registrado',
        detail: 'Registre o revise electrocardiogramas',
        linkLabel: 'Abrir ECG',
      },
    ];
  }

  // Pediatrics — latest growth percentile + vaccination status
  if (category === 'pediatric' || dashboardVariant.includes('pediatria')) {
    return [
      {
        moduleKey: 'pediatrics-growth',
        title: 'Percentil de Crecimiento',
        icon: TrendingUp,
        summary: 'Sin datos de crecimiento',
        detail: 'Registre peso y talla para calcular percentiles',
        linkLabel: 'Ver curvas',
      },
      {
        moduleKey: 'pediatrics-vaccination',
        title: 'Estado de Vacunación',
        icon: Syringe,
        summary: 'Sin esquema cargado',
        detail: 'Verifique el esquema de vacunación del paciente',
        linkLabel: 'Ver vacunas',
      },
    ];
  }

  return [];
}

function ModuleSummaryCard({
  widget,
  themeColor,
}: {
  widget: ModuleSummaryWidget;
  themeColor: string;
}) {
  const Icon = widget.icon;
  const registered = isModuleRegistered(widget.moduleKey);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${themeColor}15` }}
          >
            <Icon className="h-4 w-4" style={{ color: themeColor }} />
          </div>
          <h3 className="text-sm font-semibold text-gray-700">{widget.title}</h3>
        </div>
      </div>

      <p className="text-sm text-gray-600">{widget.summary}</p>
      {widget.detail && (
        <p className="text-xs text-gray-400 mt-1">{widget.detail}</p>
      )}

      {registered && (
        <Link
          href={`/dashboard/modulos/${widget.moduleKey}`}
          className="inline-flex items-center gap-1.5 mt-3 text-xs font-medium transition-colors hover:opacity-80"
          style={{ color: themeColor }}
        >
          {widget.linkLabel}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SpecialtyWidgets({
  doctorId,
  specialtyConfig,
  themeColor = '#3B82F6',
}: SpecialtyWidgetsProps) {
  const [widgets, setWidgets] = useState<WidgetPanel[]>([]);

  // Compute date range for the last 7 days
  const weekRange = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
    return { start: weekAgo, end: today };
  }, []);

  // Fetch recent appointments via core hook
  const {
    appointments: recentAppointments,
    loading,
  } = useDoctorAppointments(supabase, doctorId, { dateRange: weekRange });

  // Collect enabled module keys from the specialty config
  const enabledModuleKeys = useMemo(() => {
    const keys: string[] = [];
    for (const group of Object.values(specialtyConfig.modules)) {
      if (!group) continue;
      for (const mod of group) {
        if (mod.enabledByDefault !== false && isModuleRegistered(mod.key)) {
          keys.push(mod.key);
        }
      }
    }
    return keys;
  }, [specialtyConfig.modules]);

  // Get specialty-specific module summary widgets
  const moduleSummaries = useMemo(
    () => getModuleSummaries(specialtyConfig.category, specialtyConfig.dashboardVariant),
    [specialtyConfig.category, specialtyConfig.dashboardVariant],
  );

  // Derive widget data from appointments
  useEffect(() => {
    const panels = getWidgetsForSpecialty(
      specialtyConfig.category,
      specialtyConfig.dashboardVariant,
    );

    if (recentAppointments.length > 0) {
      const completed = recentAppointments.filter(a => a.status === 'completed').length;
      const pending = recentAppointments.filter(a =>
        a.status !== 'completed' && a.status !== 'cancelled'
      ).length;

      if (panels[0]) {
        panels[0].items = [
          { label: 'Completadas esta semana', value: completed },
          { label: 'Pendientes', value: pending },
          { label: 'Total', value: recentAppointments.length },
        ];
      }
    }

    setWidgets(panels);
  }, [recentAppointments, specialtyConfig.category, specialtyConfig.dashboardVariant]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-8 w-8 bg-gray-200 rounded-lg" />
              <div className="h-4 w-40 bg-gray-200 rounded" />
            </div>
            <div className="space-y-3">
              <div className="h-3 w-full bg-gray-100 rounded" />
              <div className="h-3 w-3/4 bg-gray-100 rounded" />
              <div className="h-3 w-1/2 bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Static specialty widgets ──────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {widgets.map((panel, idx) => (
          <WidgetCard key={idx} panel={panel} themeColor={themeColor} />
        ))}
      </div>

      {/* ── Specialty module summary widgets (quick-view) ──────────── */}
      {moduleSummaries.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {moduleSummaries.map((ms) => (
            <ModuleSummaryCard
              key={ms.moduleKey}
              widget={ms}
              themeColor={themeColor}
            />
          ))}
        </div>
      )}

      {/* ── Dynamic module panels (from registry) ─────────────────── */}
      {enabledModuleKeys.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {enabledModuleKeys.map((moduleKey) => (
            <ModuleRenderer
              key={moduleKey}
              moduleKey={moduleKey}
              doctorId={doctorId}
              specialtySlug={specialtyConfig.slug}
              themeColor={themeColor}
            />
          ))}
        </div>
      )}
    </div>
  );
}
