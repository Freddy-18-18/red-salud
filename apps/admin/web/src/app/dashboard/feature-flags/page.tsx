import { requirePermission } from '@/lib/rbac';
import { listFlags } from '@/lib/feature-flags/actions';
import { FlagsManager } from './flags-manager';

export const metadata = { title: 'Feature flags — Red Salud Admin' };
export const dynamic = 'force-dynamic';

export default async function FlagsPage() {
  const session = await requirePermission('feature_flags.view');
  const flags = await listFlags();
  const canToggle = session.permissions.has('feature_flags.toggle');

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Feature flags</h1>
        <p className="text-sm text-zinc-400 mt-1">
          {flags.filter((f) => f.enabled).length} habilitada(s) de {flags.length} ·
          rollout granular por app y por rol
        </p>
      </header>
      <FlagsManager flags={flags} canToggle={canToggle} />
    </div>
  );
}
