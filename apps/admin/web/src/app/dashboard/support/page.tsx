import { requireAdmin } from '@/lib/rbac';
import { listTickets } from '@/lib/support/actions';
import { TicketsManager } from './tickets-manager';

export const metadata = { title: 'Soporte — Red Salud Admin' };
export const dynamic = 'force-dynamic';

export default async function SupportPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; priority?: string; q?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const tickets = await listTickets(params);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Soporte</h1>
        <p className="text-sm text-zinc-400 mt-1">
          {tickets.length} ticket(s) — {tickets.filter((t) => t.status === 'NUEVO').length} sin abrir
        </p>
      </header>
      <TicketsManager tickets={tickets} filters={params} />
    </div>
  );
}
