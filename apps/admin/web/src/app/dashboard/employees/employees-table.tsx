'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import { ShieldCheck, Trash2, Loader2 } from 'lucide-react';
import { revokeAdminRole, type EmployeeRow } from '@/lib/employees/actions';
import { ADMIN_ROLE_LABELS, type AdminRoleType } from '@/lib/rbac/types';

export function EmployeesTable({
  employees, canManage, currentUserId,
}: {
  employees: EmployeeRow[];
  canManage: boolean;
  currentUserId: string;
}) {
  if (employees.length === 0) {
    return (
      <p className="text-sm text-zinc-500 rounded-lg border border-zinc-800 bg-zinc-900/40 p-6 text-center">
        Sin empleados todavía.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-800">
      <table className="w-full text-sm">
        <thead className="bg-zinc-900/60 text-xs uppercase tracking-wide text-zinc-400">
          <tr>
            <th className="px-3 py-2 text-left font-medium">Empleado</th>
            <th className="px-3 py-2 text-left font-medium">Roles</th>
            <th className="px-3 py-2 text-left font-medium">Otorgado</th>
            <th className="px-3 py-2 text-left font-medium">Notas</th>
            {canManage && <th className="px-3 py-2"></th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {employees.map((e) => (
            <EmployeeRowItem
              key={e.user_id}
              employee={e}
              canManage={canManage}
              isSelf={e.user_id === currentUserId}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmployeeRowItem({
  employee, canManage, isSelf,
}: {
  employee: EmployeeRow;
  canManage: boolean;
  isSelf: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function onRevoke(role: AdminRoleType) {
    if (!confirm(`¿Revocar ${ADMIN_ROLE_LABELS[role]} de ${employee.email}?`)) return;
    startTransition(async () => {
      const res = await revokeAdminRole(employee.user_id, role);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success('Rol revocado');
    });
  }

  return (
    <tr className="align-top">
      <td className="px-3 py-2.5">
        <p className="text-zinc-100">{employee.full_name ?? '—'}</p>
        <p className="text-xs text-zinc-500">{employee.email}</p>
        {isSelf && <span className="text-[10px] uppercase tracking-wide text-emerald-300">vos</span>}
      </td>
      <td className="px-3 py-2.5">
        <div className="flex flex-wrap gap-1">
          {employee.roles.map((r) => (
            <span
              key={r}
              className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded border border-zinc-700 text-zinc-200"
            >
              <ShieldCheck className="h-3 w-3" />
              {ADMIN_ROLE_LABELS[r]}
              {canManage && !(isSelf && r === 'super_admin') && (
                <button
                  onClick={() => onRevoke(r)} disabled={isPending}
                  className="ml-1 text-zinc-500 hover:text-red-300 transition"
                  title="Revocar"
                >
                  {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                </button>
              )}
            </span>
          ))}
        </div>
      </td>
      <td className="px-3 py-2.5 text-xs text-zinc-400">
        {new Date(employee.granted_at).toLocaleDateString('es-VE')}
      </td>
      <td className="px-3 py-2.5 text-xs text-zinc-400 max-w-xs truncate">
        {employee.notes ?? '—'}
      </td>
      {canManage && <td className="px-3 py-2.5"></td>}
    </tr>
  );
}
