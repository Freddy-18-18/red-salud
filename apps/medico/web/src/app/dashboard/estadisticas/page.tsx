'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useDoctorProfile } from '@/hooks/use-doctor-profile';
import {
  getSpecialtyExperienceConfig,
  type SpecialtyConfig,
} from '@/lib/specialties';
import { useSpecialtyKpis } from '@/hooks/dashboard/use-specialty-kpis';
import {
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Star,
  Clock,
  XCircle,
  CheckCircle2,
  Activity,
  RefreshCw,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface MonthlyStats {
  month: string;
  total: number;
  completed: number;
  cancelled: number;
  no_show: number;
}

interface DiagnosisCount {
  diagnosis: string;
  count: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function EstadisticasPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [specialtyConfig, setSpecialtyConfig] = useState<SpecialtyConfig | null>(null);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
  const [topDiagnoses, setTopDiagnoses] = useState<DiagnosisCount[]>([]);
  const [loading, setLoading] = useState(true);

  // Init
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: details } = await supabase
        .from('doctor_details')
        .select(`
          especialidad:specialties(name, slug),
          profile:profiles!doctor_details_profile_id_fkey(sacs_especialidad)
        `)
        .eq('profile_id', user.id)
        .maybeSingle();

      const especialidad = Array.isArray(details?.especialidad)
        ? details.especialidad[0]
        : details?.especialidad;
      const profileData = Array.isArray(details?.profile)
        ? details.profile[0]
        : details?.profile;
      const config = getSpecialtyExperienceConfig({
        specialtySlug: especialidad?.slug ?? undefined,
        specialtyName: especialidad?.name ?? undefined,
        sacsEspecialidad: profileData?.sacs_especialidad ?? undefined,
      });
      setSpecialtyConfig(config);
    }
    init();
  }, []);

  const { profile, stats } = useDoctorProfile(userId ?? undefined);

  // KPIs from specialty system
  const kpiKeys = useMemo(
    () => specialtyConfig?.prioritizedKpis ?? ['pacientes-atendidos', 'satisfaccion', 'tasa-no-show', 'ingresos'],
    [specialtyConfig],
  );

  const kpis = useSpecialtyKpis({
    doctorId: userId ?? '',
    kpiKeys,
    enabled: !!userId,
  });

  // Fetch monthly appointment stats
  useEffect(() => {
    if (!userId) return;

    async function fetchStats() {
      setLoading(true);

      try {
        // Get last 6 months of appointments
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const { data: appointments } = await supabase
          .from('appointments')
          .select('fecha_hora, status')
          .eq('medico_id', userId)
          .gte('fecha_hora', sixMonthsAgo.toISOString());

        if (appointments) {
          // Group by month
          const monthMap = new Map<string, MonthlyStats>();

          for (const apt of appointments) {
            const month = apt.fecha_hora.slice(0, 7); // YYYY-MM
            const existing = monthMap.get(month) ?? {
              month,
              total: 0,
              completed: 0,
              cancelled: 0,
              no_show: 0,
            };
            existing.total++;
            if (apt.status === 'completed') existing.completed++;
            if (apt.status === 'cancelled') existing.cancelled++;
            if (apt.status === 'no_show') existing.no_show++;
            monthMap.set(month, existing);
          }

          setMonthlyStats(
            Array.from(monthMap.values()).sort((a, b) => a.month.localeCompare(b.month)),
          );
        }

        // Get top diagnoses
        const { data: records } = await supabase
          .from('medical_records')
          .select('diagnosis')
          .eq('doctor_id', userId)
          .not('diagnosis', 'is', null)
          .order('created_at', { ascending: false })
          .limit(100);

        if (records) {
          const diagMap = new Map<string, number>();
          for (const r of records) {
            if (r.diagnosis) {
              const count = diagMap.get(r.diagnosis) ?? 0;
              diagMap.set(r.diagnosis, count + 1);
            }
          }
          setTopDiagnoses(
            Array.from(diagMap.entries())
              .map(([diagnosis, count]) => ({ diagnosis, count }))
              .sort((a, b) => b.count - a.count)
              .slice(0, 10),
          );
        }
      } catch {
        // Graceful degradation
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [userId]);

  const themeColor = specialtyConfig?.theme?.primaryColor ?? '#3B82F6';

  // Calculate key metrics from stats
  const totalPatients = (stats as Record<string, number>)?.totalPatients ?? 0;
  const avgRating = (stats as Record<string, number>)?.averageRating ?? 0;
  const completedTotal = (stats as Record<string, number>)?.completedAppointments ?? 0;
  const cancelledTotal = (stats as Record<string, number>)?.cancelledAppointments ?? 0;
  const noShowRate = completedTotal + cancelledTotal > 0
    ? ((cancelledTotal / (completedTotal + cancelledTotal)) * 100).toFixed(1)
    : '0';

  // Max value for chart scaling
  const maxMonthly = Math.max(...monthlyStats.map((m) => m.total), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Estadísticas</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Métricas y análisis de tu práctica médica
          </p>
        </div>
        <button
          onClick={() => kpis.refresh()}
          disabled={kpis.isRefreshing}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${kpis.isRefreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* Specialty KPIs from resolver */}
      {kpiKeys.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpiKeys.slice(0, 4).map((key) => {
            const kpiDef = specialtyConfig?.kpiDefinitions?.[key];
            const value = kpis.values[key];
            const isResolved = value !== undefined;
            const label = kpiDef?.label ?? formatKpiLabel(key);
            const format = kpiDef?.format ?? 'number';

            return (
              <div key={key} className="p-4 bg-white rounded-xl border border-gray-200">
                <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {kpis.isLoading
                    ? '...'
                    : isResolved
                      ? formatValue(value, format)
                      : '--'
                  }
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Overview cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total pacientes" value={totalPatients} color={themeColor} />
        <StatCard icon={CheckCircle2} label="Consultas completadas" value={completedTotal} color="#10B981" />
        <StatCard icon={Star} label="Calificación promedio" value={avgRating ? `${avgRating.toFixed(1)}/5` : '--'} color="#F59E0B" />
        <StatCard icon={XCircle} label="Tasa de cancelación" value={`${noShowRate}%`} color="#EF4444" />
      </div>

      {/* Monthly chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Consultas por mes</h2>
        {loading ? (
          <div className="h-48 flex items-center justify-center">
            <div className="h-6 w-6 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : monthlyStats.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <BarChart3 className="h-10 w-10 mx-auto text-gray-300 mb-2" />
              <p className="text-sm">Sin datos suficientes para graficar</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {monthlyStats.map((month) => {
              const completedWidth = (month.completed / maxMonthly) * 100;
              const cancelledWidth = (month.cancelled / maxMonthly) * 100;
              const monthLabel = new Date(`${month.month}-01`).toLocaleDateString('es-VE', {
                month: 'short',
                year: '2-digit',
              });

              return (
                <div key={month.month} className="flex items-center gap-3">
                  <span className="w-16 text-xs font-medium text-gray-500 text-right">
                    {monthLabel}
                  </span>
                  <div className="flex-1 flex gap-0.5">
                    <div
                      className="h-6 rounded-l-sm"
                      style={{ width: `${completedWidth}%`, backgroundColor: themeColor, minWidth: month.completed > 0 ? '4px' : '0' }}
                      title={`Completadas: ${month.completed}`}
                    />
                    <div
                      className="h-6 rounded-r-sm bg-red-300"
                      style={{ width: `${cancelledWidth}%`, minWidth: month.cancelled > 0 ? '4px' : '0' }}
                      title={`Canceladas: ${month.cancelled}`}
                    />
                  </div>
                  <span className="w-10 text-xs font-semibold text-gray-700 text-right">
                    {month.total}
                  </span>
                </div>
              );
            })}
            <div className="flex items-center gap-4 mt-2 pt-2 border-t border-gray-100 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: themeColor }} />
                Completadas
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-sm bg-red-300" />
                Canceladas
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Two columns: Diagnoses + Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top diagnoses */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Diagnósticos más frecuentes</h2>
          {topDiagnoses.length === 0 ? (
            <div className="py-8 text-center text-gray-400">
              <Activity className="h-8 w-8 mx-auto text-gray-300 mb-2" />
              <p className="text-sm">Sin diagnósticos registrados</p>
            </div>
          ) : (
            <div className="space-y-2">
              {topDiagnoses.map((diag, idx) => {
                const width = (diag.count / topDiagnoses[0].count) * 100;
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="w-5 text-xs font-semibold text-gray-400 text-right">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-sm text-gray-700 truncate">{diag.diagnosis}</p>
                        <span className="text-xs font-semibold text-gray-500 ml-2">{diag.count}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full">
                        <div
                          className="h-1.5 rounded-full transition-all"
                          style={{ width: `${width}%`, backgroundColor: themeColor }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* No-show / appointment stats */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Rendimiento de citas</h2>
          <div className="space-y-4">
            <MetricRow
              label="Tasa de completación"
              value={completedTotal + cancelledTotal > 0
                ? `${((completedTotal / (completedTotal + cancelledTotal)) * 100).toFixed(1)}%`
                : '--'}
              icon={CheckCircle2}
              color="#10B981"
            />
            <MetricRow
              label="Tasa de inasistencia"
              value={`${noShowRate}%`}
              icon={XCircle}
              color="#EF4444"
            />
            <MetricRow
              label="Promedio citas/día"
              value={monthlyStats.length > 0
                ? (monthlyStats.reduce((sum, m) => sum + m.total, 0) / (monthlyStats.length * 22)).toFixed(1)
                : '--'}
              icon={Calendar}
              color="#3B82F6"
            />
            <MetricRow
              label="Duración promedio"
              value={profile?.consultation_duration ? `${profile.consultation_duration} min` : '30 min'}
              icon={Clock}
              color="#8B5CF6"
            />
          </div>
        </div>
      </div>

      {/* Specialty-specific note */}
      {specialtyConfig && specialtyConfig.id !== 'default' && kpis.unresolved.length > 0 && (
        <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-400">
          Algunas métricas específicas de {specialtyConfig.name} no están disponibles todavía:
          {' '}{kpis.unresolved.join(', ')}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Users;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className="p-4 bg-white rounded-xl border border-gray-200">
      <div className="flex items-center gap-2 mb-2">
        <div
          className="h-8 w-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

function MetricRow({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: typeof Activity;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" style={{ color }} />
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <span className="text-sm font-bold text-gray-900">{value}</span>
    </div>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

function formatKpiLabel(key: string): string {
  return key
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatValue(value: number, format: string): string {
  switch (format) {
    case 'percentage':
      return `${value.toFixed(1)}%`;
    case 'currency':
      return new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES', minimumFractionDigits: 0 }).format(value);
    case 'duration':
      return `${value} min`;
    default:
      return new Intl.NumberFormat('es-VE').format(value);
  }
}
