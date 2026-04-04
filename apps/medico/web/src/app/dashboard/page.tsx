'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  getSpecialtyExperienceConfig,
  type SpecialtyConfig,
} from '@/lib/specialties';
import { useSpecialtyDashboard } from '@/hooks/dashboard/use-specialty-dashboard';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { TodayAgenda } from '@/components/dashboard/today-agenda';
import { SpecialtyWidgets } from '@/components/dashboard/specialty-widgets';
import { ExchangeRateWidget } from '@/components/dashboard/exchange-rate-widget';
import {
  Users,
  CalendarCheck,
  Stethoscope,
  DollarSign,
  Plus,
  FileText,
  Pill,
  Video,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

// ============================================================================
// QUICK ACTIONS
// ============================================================================

const QUICK_ACTIONS = [
  { label: 'Nueva cita', icon: Plus, href: '/dashboard/agenda', color: '#3B82F6' },
  { label: 'Nueva consulta', icon: Stethoscope, href: '/dashboard/consulta', color: '#10B981' },
  { label: 'Crear receta', icon: Pill, href: '/dashboard/recetas', color: '#8B5CF6' },
  { label: 'Telemedicina', icon: Video, href: '/dashboard/consulta', color: '#F59E0B' },
];

// ============================================================================
// COMPONENT
// ============================================================================

export default function DashboardPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [doctorName, setDoctorName] = useState('');
  const [specialtyConfig, setSpecialtyConfig] = useState<SpecialtyConfig | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // Load user and profile
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);

      const { data: details } = await supabase
        .from('doctor_profiles')
        .select(`
          especialidad:specialties(name, slug),
          profile:profiles!doctor_profiles_profile_id_fkey(
            full_name,
            sacs_especialidad
          )
        `)
        .eq('profile_id', user.id)
        .maybeSingle();

      const especialidad = Array.isArray(details?.especialidad)
        ? details.especialidad[0]
        : details?.especialidad;
      const profileData = Array.isArray(details?.profile)
        ? details.profile[0]
        : details?.profile;
      const name = profileData?.full_name ?? user.email ?? '';
      setDoctorName(name);

      const config = getSpecialtyExperienceConfig({
        specialtySlug: especialidad?.slug ?? undefined,
        specialtyName: especialidad?.name ?? undefined,
        sacsEspecialidad: profileData?.sacs_especialidad ?? undefined,
      });
      setSpecialtyConfig(config);
      setInitialLoading(false);
    }

    init();
  }, []);

  // Use the specialty dashboard hook for KPIs and today's appointments
  const dashboard = useSpecialtyDashboard(userId ?? undefined, specialtyConfig ?? undefined);

  const themeColor = specialtyConfig?.theme?.primaryColor ?? '#3B82F6';

  if (initialLoading) {
    return <DashboardSkeleton />;
  }

  // Build KPI cards from config + resolved values
  const kpiCards = [
    {
      label: 'Pacientes hoy',
      value: dashboard.todayAppointments.total,
      icon: Users,
      format: 'number' as const,
    },
    {
      label: 'Citas pendientes',
      value: dashboard.todayAppointments.pending,
      icon: CalendarCheck,
      format: 'number' as const,
    },
    {
      label: 'Consultas este mes',
      value: dashboard.kpiValues['pacientes-atendidos'] ?? dashboard.kpiValues['citas-completadas'] ?? 0,
      icon: Stethoscope,
      format: 'number' as const,
    },
    {
      label: 'Ingresos del mes',
      value: dashboard.kpiValues['ingresos'] ?? dashboard.kpiValues['revenue'] ?? 0,
      icon: DollarSign,
      format: 'currency' as const,
    },
  ];

  const firstName = doctorName.split(' ')[0] ?? 'Doctor';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Buen{getGreeting()}, Dr. {firstName}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {specialtyConfig?.name ?? 'Medicina General'} &mdash; {formatToday()}
          </p>
        </div>
        <button
          onClick={() => dashboard.refresh()}
          disabled={dashboard.isRefreshing}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${dashboard.isRefreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <KpiCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            icon={kpi.icon}
            format={kpi.format}
            themeColor={themeColor}
            isLoading={dashboard.isLoading}
          />
        ))}
      </div>

      {/* Second Row: Today's Agenda + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Agenda (2/3) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Agenda de hoy</h2>
            {dashboard.todayAppointments.nextAppointmentTime && (
              <span className="text-sm text-gray-500">
                Próxima: {dashboard.todayAppointments.nextAppointmentTime}
              </span>
            )}
          </div>
          {userId && <TodayAgenda doctorId={userId} themeColor={themeColor} />}
        </div>

        {/* Quick Actions + Exchange Rates (1/3) */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones rápidas</h2>
            <div className="space-y-2">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all group"
                  >
                    <div
                      className="h-9 w-9 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${action.color}15` }}
                    >
                      <Icon className="h-4.5 w-4.5" style={{ color: action.color }} />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                      {action.label}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Today summary */}
            <div className="mt-5 pt-4 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Resumen del día
              </p>
              <div className="space-y-1.5">
                <SummaryRow label="Total citas" value={dashboard.todayAppointments.total} />
                <SummaryRow label="Completadas" value={dashboard.todayAppointments.completed} />
                <SummaryRow label="Pendientes" value={dashboard.todayAppointments.pending} />
              </div>
            </div>
          </div>

          {/* Exchange Rates */}
          <ExchangeRateWidget />
        </div>
      </div>

      {/* Third Row: Specialty Widgets */}
      {userId && specialtyConfig && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Módulos de {specialtyConfig.name}
          </h2>
          <SpecialtyWidgets
            doctorId={userId}
            specialtyConfig={specialtyConfig}
            themeColor={themeColor}
          />
        </div>
      )}

      {/* Error display */}
      {dashboard.error && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
          <p className="font-medium">Algunos datos no pudieron cargarse</p>
          <p className="mt-1 text-amber-600">{dashboard.error}</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function SummaryRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold text-gray-800">{value}</span>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-8 w-64 bg-gray-200 rounded" />
        <div className="h-4 w-40 bg-gray-100 rounded mt-2" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-gray-200 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-80 bg-gray-200 rounded-xl" />
        <div className="h-80 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'os días';
  if (hour < 18) return 'as tardes';
  return 'as noches';
}

function formatToday(): string {
  return new Date().toLocaleDateString('es-VE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
