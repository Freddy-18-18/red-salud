import { requirePermission } from '@/lib/rbac';
import { listAnnouncements } from '@/lib/announcements/actions';
import { AnnouncementsManager } from './announcements-manager';

export const metadata = { title: 'Anuncios — Red Salud Admin' };
export const dynamic = 'force-dynamic';

export default async function AnnouncementsPage() {
  const session = await requirePermission('announcements.view');
  const announcements = await listAnnouncements();
  const canPublish = session.permissions.has('announcements.publish');

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Anuncios</h1>
        <p className="text-sm text-zinc-400 mt-1">
          {announcements.filter((a) => a.is_active).length} activo(s) ·
          broadcast a las apps cliente
        </p>
      </header>
      <AnnouncementsManager announcements={announcements} canPublish={canPublish} />
    </div>
  );
}
