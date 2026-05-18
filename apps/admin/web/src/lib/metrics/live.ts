'use server';

import 'server-only';
import { adminSupabase } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/rbac';
import { getAuditContext, withAudit } from '@/lib/audit';

export type LiveKpis = {
  total_users:           number;
  new_users_today:       number;
  doctors_active_30d:    number;
  doctors_sacs_verified: number;
  appointments_today:    number;
  appointments_pending:  number;
  revenue_month_usd:     number;
  revenue_month_ves:     number;
  alerts_open:           number;
  alerts_critical:       number;
};

const ZERO: LiveKpis = {
  total_users: 0, new_users_today: 0, doctors_active_30d: 0, doctors_sacs_verified: 0,
  appointments_today: 0, appointments_pending: 0, revenue_month_usd: 0, revenue_month_ves: 0,
  alerts_open: 0, alerts_critical: 0,
};

export async function getLiveKpis(): Promise<LiveKpis> {
  const session = await requireAdmin();
  const ctx = await getAuditContext(session);
  const admin = adminSupabase();

  return await withAudit(
    ctx,
    { action: 'dashboard.live_kpis' },
    async () => {
      const { data, error } = await admin.rpc('live_kpis');
      if (error) throw new Error(`live_kpis: ${error.message}`);
      const raw = (data ?? {}) as Record<string, unknown>;
      return {
        total_users:           Number(raw.total_users           ?? 0),
        new_users_today:       Number(raw.new_users_today       ?? 0),
        doctors_active_30d:    Number(raw.doctors_active_30d    ?? 0),
        doctors_sacs_verified: Number(raw.doctors_sacs_verified ?? 0),
        appointments_today:    Number(raw.appointments_today    ?? 0),
        appointments_pending:  Number(raw.appointments_pending  ?? 0),
        revenue_month_usd:     Number(raw.revenue_month_usd     ?? 0),
        revenue_month_ves:     Number(raw.revenue_month_ves     ?? 0),
        alerts_open:           Number(raw.alerts_open           ?? 0),
        alerts_critical:       Number(raw.alerts_critical       ?? 0),
      };
    },
  ).catch(() => ZERO);
}
