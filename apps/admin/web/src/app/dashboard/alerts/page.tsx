import { requireAdmin } from '@/lib/rbac';
import { listAlerts } from '@/lib/alerts/actions';
import { AlertsList } from './alerts-list';

export const metadata = { title: 'Alertas — Red Salud Admin' };
export const dynamic = 'force-dynamic';

export default async function AlertsPage() {
  await requireAdmin();
  const [openAlerts, recent] = await Promise.all([
    listAlerts({ onlyOpen: true, limit: 100 }),
    listAlerts({ limit: 50 }),
  ]);
  const resolved = recent.filter((a) => a.resolved_at).slice(0, 20);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Alertas</h1>
        <p className="text-sm text-zinc-400 mt-1">
          {openAlerts.length} abierta(s) · cron corre cada 5 min
        </p>
      </header>

      <AlertsList title="Abiertas" alerts={openAlerts} resolvable />
      {resolved.length > 0 && (
        <AlertsList title="Resueltas (últimas 20)" alerts={resolved} />
      )}
    </div>
  );
}
