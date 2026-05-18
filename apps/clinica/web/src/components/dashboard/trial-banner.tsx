'use client';

import type { Organization } from '@red-salud/types';

export function TrialBanner({
  organization,
  canManage,
}: {
  organization: Organization;
  canManage: boolean;
}) {
  if (organization.plan !== 'trial' || !organization.trial_ends_at) return null;

  const ends = new Date(organization.trial_ends_at).getTime();
  const now = Date.now();
  const daysRemaining = Math.max(0, Math.ceil((ends - now) / (1000 * 60 * 60 * 24)));

  if (daysRemaining <= 0) {
    return (
      <div className="bg-red-50 border-b border-red-200 px-6 py-2.5 text-sm text-red-800 flex items-center justify-between">
        <span>
          Tu trial termino. Activa un plan para seguir usando todas las funciones.
        </span>
        {canManage && (
          <button className="font-semibold underline hover:no-underline">Ver planes →</button>
        )}
      </div>
    );
  }

  const tone =
    daysRemaining <= 7
      ? 'bg-amber-50 border-amber-200 text-amber-900'
      : 'bg-slate-100 border-slate-200 text-slate-700';

  return (
    <div className={`border-b px-6 py-2 text-xs flex items-center justify-between ${tone}`}>
      <span>
        Trial · te quedan <strong>{daysRemaining}</strong> dia{daysRemaining === 1 ? '' : 's'}
      </span>
      {canManage && (
        <button className="font-medium hover:underline">Activar plan →</button>
      )}
    </div>
  );
}
