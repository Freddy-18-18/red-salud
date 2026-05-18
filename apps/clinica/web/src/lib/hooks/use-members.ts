'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { InviteMemberInput, OrganizationRole } from '@red-salud/types';
import {
  deactivateMember,
  getCurrentUserMembership,
  inviteMember,
  listMembers,
  listPendingInvites,
  revokeInvite,
  updateMemberRole,
} from '@/lib/db/members';

export function useMembers(organizationId: string | undefined) {
  return useQuery({
    queryKey: ['members', organizationId],
    queryFn: () => listMembers(organizationId as string),
    enabled: !!organizationId,
  });
}

export function useCurrentMembership(organizationId: string | undefined) {
  return useQuery({
    queryKey: ['members', organizationId, 'me'],
    queryFn: () => getCurrentUserMembership(organizationId as string),
    enabled: !!organizationId,
  });
}

export function useInviteMember(organizationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<InviteMemberInput, 'organization_id'>) =>
      inviteMember({ ...input, organization_id: organizationId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invites', organizationId] });
    },
  });
}

export function usePendingInvites(organizationId: string | undefined) {
  return useQuery({
    queryKey: ['invites', organizationId],
    queryFn: () => listPendingInvites(organizationId as string),
    enabled: !!organizationId,
  });
}

export function useRevokeInvite(organizationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: string) => revokeInvite(inviteId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invites', organizationId] });
    },
  });
}

export function useUpdateMemberRole(organizationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: OrganizationRole }) =>
      updateMemberRole(memberId, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['members', organizationId] });
    },
  });
}

export function useDeactivateMember(organizationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => deactivateMember(memberId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['members', organizationId] });
    },
  });
}
