import { requirePermission } from '@/lib/rbac';
import { listEmployees } from '@/lib/employees/actions';
import { EmployeesTable } from './employees-table';
import { GrantForm } from './grant-form';

export const metadata = { title: 'Empleados — Red Salud Admin' };
export const dynamic = 'force-dynamic';

export default async function EmployeesPage() {
  const session = await requirePermission('employees.view');
  const employees = await listEmployees();
  const canManage = session.permissions.has('employees.manage');

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Empleados</h1>
        <p className="text-sm text-zinc-400 mt-1">
          {employees.length} empleado(s) interno(s). Cada cambio queda auditado.
        </p>
      </header>

      {canManage && <GrantForm />}

      <EmployeesTable employees={employees} canManage={canManage} currentUserId={session.userId} />
    </div>
  );
}
