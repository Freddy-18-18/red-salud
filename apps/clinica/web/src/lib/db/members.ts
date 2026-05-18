import type {
  InviteMemberInput,
  OrganizationInvite,
  OrganizationMember,
  OrganizationMemberWithUser,
  OrganizationRole,
} from '@red-salud/types';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export async function listMembers(organizationId: string): Promise<OrganizationMemberWithUser[]> {
  const { data, error } = await supabase
    .from('organization_members')
    .select(
      `
      *,
      user:user_id (email, raw_user_meta_data),
      location:location_id (name)
    `,
    )
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .order('role');
  if (error) throw error;

  return (data ?? []).map((m: {
    user?: { email?: string; raw_user_meta_data?: { full_name?: string } };
    location?: { name?: string };
  } & OrganizationMember) => ({
    ...m,
    user_email: m.user?.email ?? null,
    user_full_name: m.user?.raw_user_meta_data?.full_name ?? null,
    location_name: m.location?.name ?? null,
  })) as OrganizationMemberWithUser[];
}

export async function getCurrentUserMembership(
  organizationId: string,
): Promise<OrganizationMember | null> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;

  const { data, error } = await supabase
    .from('organization_members')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('user_id', userData.user.id)
    .eq('is_active', true)
    .order('role')
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data as OrganizationMember | null) ?? null;
}

export async function updateMemberRole(
  memberId: string,
  role: OrganizationRole,
): Promise<OrganizationMember> {
  const { data, error } = await supabase
    .from('organization_members')
    .update({ role })
    .eq('id', memberId)
    .select()
    .single();
  if (error) throw error;
  return data as OrganizationMember;
}

export async function deactivateMember(memberId: string): Promise<void> {
  const { error } = await supabase
    .from('organization_members')
    .update({ is_active: false })
    .eq('id', memberId);
  if (error) throw error;
}

function generateInviteToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function inviteMember(input: InviteMemberInput): Promise<OrganizationInvite> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Usuario no autenticado');

  const token = generateInviteToken();

  const { data, error } = await supabase
    .from('organization_invites')
    .insert({
      organization_id: input.organization_id,
      email: input.email.toLowerCase().trim(),
      role: input.role,
      location_id: input.location_id ?? null,
      token,
      message: input.message ?? null,
      invited_by: userData.user.id,
    })
    .select()
    .single();
  if (error) throw error;
  return data as OrganizationInvite;
}

export async function listPendingInvites(organizationId: string): Promise<OrganizationInvite[]> {
  const { data, error } = await supabase
    .from('organization_invites')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as OrganizationInvite[];
}

export async function revokeInvite(inviteId: string): Promise<void> {
  const { error } = await supabase
    .from('organization_invites')
    .update({ status: 'revoked' })
    .eq('id', inviteId);
  if (error) throw error;
}
