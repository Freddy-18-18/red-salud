'use server';

import 'server-only';
import { revalidatePath } from 'next/cache';
import { adminSupabase } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/rbac';
import { getAuditContext, withAudit } from '@/lib/audit';

export type AnnouncementRow = {
  id:           string;
  title:        string;
  content:      string;
  type:         string | null;
  target_app:   string | null;
  is_active:    boolean | null;
  priority:     string | null;
  starts_at:    string | null;
  expires_at:   string | null;
  created_at:   string | null;
  updated_at:   string | null;
  published_by: string | null;
};

export const ANNOUNCEMENT_TYPES = ['info', 'warning', 'success', 'maintenance'] as const;
export const APP_TARGETS = [
  'all', 'paciente', 'medico', 'farmacia', 'clinica', 'laboratorio',
  'secretaria', 'seguro', 'ambulancia', 'academia',
] as const;
export const PRIORITIES = ['low', 'normal', 'high'] as const;

export async function listAnnouncements(): Promise<AnnouncementRow[]> {
  await requirePermission('announcements.view');
  const admin = adminSupabase();
  const { data, error } = await admin
    .from('system_announcements')
    .select('id,title,content,type,target_app,is_active,priority,starts_at,expires_at,created_at,updated_at,published_by')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) throw new Error(`listAnnouncements: ${error.message}`);
  return (data ?? []) as AnnouncementRow[];
}

export type AnnouncementInput = {
  title:      string;
  content:    string;
  type:       string;
  target_app: string;
  priority:   string;
  starts_at?: string | null;
  expires_at?: string | null;
  is_active:  boolean;
};

export async function createAnnouncement(input: AnnouncementInput) {
  const session = await requirePermission('announcements.publish');
  const ctx = await getAuditContext(session);
  const admin = adminSupabase();
  return await withAudit(
    ctx,
    { action: 'announcement.create', resourceType: 'system_announcement', payload: { target_app: input.target_app, type: input.type } },
    async () => {
      const { data, error } = await admin
        .from('system_announcements')
        .insert({ ...input, published_by: session.userId, updated_at: new Date().toISOString() })
        .select('id')
        .single();
      if (error) return { ok: false as const, error: error.message };
      revalidatePath('/dashboard/announcements');
      return { ok: true as const, id: data.id };
    },
  ).catch((err) => ({ ok: false as const, error: err instanceof Error ? err.message : 'error' }));
}

export async function toggleAnnouncement(id: string, is_active: boolean) {
  const session = await requirePermission('announcements.publish');
  const ctx = await getAuditContext(session);
  const admin = adminSupabase();
  return await withAudit(
    ctx,
    { action: is_active ? 'announcement.activate' : 'announcement.deactivate', resourceType: 'system_announcement', resourceId: id },
    async () => {
      const { error } = await admin
        .from('system_announcements')
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) return { ok: false as const, error: error.message };
      revalidatePath('/dashboard/announcements');
      return { ok: true as const };
    },
  ).catch((err) => ({ ok: false as const, error: err instanceof Error ? err.message : 'error' }));
}
