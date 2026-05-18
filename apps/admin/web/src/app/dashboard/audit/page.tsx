import { requirePermission } from '@/lib/rbac';
import { listAuditLog } from '@/lib/audit/query';
import { AuditTable } from './audit-table';

export const metadata = { title: 'Auditoría — Red Salud Admin' };
export const dynamic = 'force-dynamic';

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; status?: string; actor?: string; offset?: string }>;
}) {
  await requirePermission('audit.view');
  const params = await searchParams;
  const offset = Math.max(0, Number(params.offset ?? 0));

  const { rows, total } = await listAuditLog({
    action:     params.action,
    actorEmail: params.actor,
    status:     params.status as 'success' | 'denied' | 'error' | undefined,
    offset,
    limit:      100,
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Auditoría</h1>
        <p className="text-sm text-zinc-400 mt-1">
          {new Intl.NumberFormat('es-VE').format(total)} eventos registrados ·
          mostrando {offset + 1}–{Math.min(offset + rows.length, total)}
        </p>
      </header>
      <AuditTable rows={rows} total={total} offset={offset} filters={params} />
    </div>
  );
}
