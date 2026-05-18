import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/rbac';
import { Sidebar } from '@/components/shell/sidebar';
import { Topbar } from '@/components/shell/topbar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) redirect('/auth/login');

  return (
    <div className="min-h-screen flex bg-zinc-950">
      <Sidebar permissions={session.permissions} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar email={session.email} roles={session.roles} />
        <main className="flex-1 overflow-y-auto px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
