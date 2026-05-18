import { requireAdmin } from '@/lib/rbac';
import { getLiveKpis } from '@/lib/metrics/live';
import { KpiCard } from '@/components/dashboard/kpi-card';
import {
  Users, UserPlus, Stethoscope, ShieldCheck,
  Calendar, CalendarClock, DollarSign, Coins,
  AlertTriangle, AlertOctagon,
} from 'lucide-react';

export const metadata = { title: 'Dashboard — Red Salud Admin' };
export const dynamic = 'force-dynamic';

const fmtUsd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const fmtVes = new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES', maximumFractionDigits: 0 });
const fmtNum = new Intl.NumberFormat('es-VE');

export default async function DashboardPage() {
  const session = await requireAdmin();
  const kpis = await getLiveKpis();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Hola, {session.email.split('@')[0]}</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Estado general del ecosistema. Datos en vivo · auditados.
        </p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard icon={Users}         label="Usuarios totales"
                 value={fmtNum.format(kpis.total_users)}
                 hint={`+${fmtNum.format(kpis.new_users_today)} hoy`} />
        <KpiCard icon={UserPlus}      label="Nuevos hoy"
                 value={fmtNum.format(kpis.new_users_today)} />
        <KpiCard icon={Stethoscope}   label="Médicos activos (30d)"
                 value={fmtNum.format(kpis.doctors_active_30d)} />
        <KpiCard icon={ShieldCheck}   label="Médicos SACS verif."
                 value={fmtNum.format(kpis.doctors_sacs_verified)} />
        <KpiCard icon={Calendar}      label="Citas hoy"
                 value={fmtNum.format(kpis.appointments_today)} />
        <KpiCard icon={CalendarClock} label="Citas pendientes"
                 value={fmtNum.format(kpis.appointments_pending)} />
        <KpiCard icon={DollarSign}    label="Ingresos mes (USD)"
                 value={fmtUsd.format(kpis.revenue_month_usd)} />
        <KpiCard icon={Coins}         label="Ingresos mes (VES)"
                 value={fmtVes.format(kpis.revenue_month_ves)} />
        <KpiCard
          icon={kpis.alerts_critical > 0 ? AlertOctagon : AlertTriangle}
          label="Alertas activas"
          value={fmtNum.format(kpis.alerts_open)}
          hint={kpis.alerts_critical > 0 ? `${kpis.alerts_critical} crítica(s)` : 'Sistema OK'}
        />
      </section>

      <section className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 className="text-sm font-medium text-zinc-300 mb-2">Próximos pasos del MVP</h2>
        <ul className="text-sm text-zinc-400 space-y-1.5 list-disc list-inside">
          <li>Instrumentar eventos en paciente_web (track de booking funnel)</li>
          <li>Configurar cron Edge Functions: metrics-aggregate (diario) + metrics-alerts (5 min)</li>
          <li>Construir audit log viewer y feature flags</li>
          <li>Daily digest IA por email</li>
        </ul>
      </section>
    </div>
  );
}
