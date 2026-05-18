import { requirePermission } from '@/lib/rbac';
import { UserSearch } from './user-search';

export const metadata = { title: 'Usuarios — Red Salud Admin' };

export default async function UsersPage() {
  await requirePermission('users.search');

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Usuarios</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Buscá por email, nombre, teléfono, cédula, RIF o ID. Toda búsqueda queda registrada.
        </p>
      </header>
      <UserSearch />
    </div>
  );
}
