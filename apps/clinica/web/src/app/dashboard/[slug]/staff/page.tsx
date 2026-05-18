'use client';

import { useState } from 'react';
import { ROLE_LABELS, type OrganizationRole } from '@red-salud/types';
import { useOrganizationContext } from '@/lib/providers/organization-provider';
import {
  useMembers,
  useInviteMember,
  usePendingInvites,
  useRevokeInvite,
  useDeactivateMember,
} from '@/lib/hooks/use-members';
import { ModuleGuard } from '@/components/dashboard/module-guard';
import { InviteDialog } from '@/components/staff/invite-dialog';

export default function StaffPage() {
  const { organization, isAdmin } = useOrganizationContext();
  const { data: members } = useMembers(organization.id);
  const { data: invites } = usePendingInvites(organization.id);
  const inviteMember = useInviteMember(organization.id);
  const revokeInvite = useRevokeInvite(organization.id);
  const deactivate = useDeactivateMember(organization.id);
  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <ModuleGuard moduleKey="staff">
      <div className="space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 uppercase tracking-wide">Personal</p>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              {members?.length ?? 0} miembros
            </h1>
          </div>
          {isAdmin && (
            <button
              onClick={() => setInviteOpen(true)}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[rgb(var(--brand-primary))] hover:opacity-90 transition shadow-sm"
            >
              + Invitar miembro
            </button>
          )}
        </header>

        <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <Th>Miembro</Th>
                <Th>Rol</Th>
                <Th>Sede</Th>
                <Th>Desde</Th>
                <Th>{''}</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(members ?? []).map((m) => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <Td>
                    <div className="font-medium text-slate-900">
                      {m.user_full_name ?? m.user_email ?? '—'}
                    </div>
                    {m.user_full_name && m.user_email && (
                      <div className="text-xs text-slate-500">{m.user_email}</div>
                    )}
                  </Td>
                  <Td>
                    <RoleBadge role={m.role} />
                  </Td>
                  <Td>{m.location_name ?? 'Todas'}</Td>
                  <Td>{new Date(m.joined_at).toLocaleDateString('es-VE')}</Td>
                  <Td>
                    {isAdmin && m.role !== 'owner' && (
                      <button
                        onClick={() => deactivate.mutate(m.id)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Desactivar
                      </button>
                    )}
                  </Td>
                </tr>
              ))}
              {(!members || members.length === 0) && (
                <tr>
                  <Td colSpan={5}>
                    <div className="py-8 text-center text-sm text-slate-500">
                      No hay miembros activos.
                    </div>
                  </Td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {invites && invites.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-slate-900 mb-3">
              Invitaciones pendientes ({invites.length})
            </h2>
            <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
              {invites.map((inv) => (
                <div key={inv.id} className="p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-900">{inv.email}</p>
                    <p className="text-xs text-slate-500">
                      <RoleBadge role={inv.role} /> · expira{' '}
                      {new Date(inv.expires_at).toLocaleDateString('es-VE')}
                    </p>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => revokeInvite.mutate(inv.id)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Revocar
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {inviteOpen && (
          <InviteDialog
            onClose={() => setInviteOpen(false)}
            onSubmit={async (input) => {
              await inviteMember.mutateAsync(input);
              setInviteOpen(false);
            }}
          />
        )}
      </div>
    </ModuleGuard>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500 px-4 py-2.5">
      {children}
    </th>
  );
}

function Td({ children, colSpan }: { children: React.ReactNode; colSpan?: number }) {
  return (
    <td className="px-4 py-3 text-sm text-slate-700" colSpan={colSpan}>
      {children}
    </td>
  );
}

function RoleBadge({ role }: { role: OrganizationRole }) {
  const tone =
    role === 'owner'
      ? 'bg-amber-100 text-amber-800'
      : role === 'admin'
      ? 'bg-purple-100 text-purple-800'
      : 'bg-slate-100 text-slate-700';
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase tracking-wide ${tone}`}>
      {ROLE_LABELS[role]}
    </span>
  );
}
