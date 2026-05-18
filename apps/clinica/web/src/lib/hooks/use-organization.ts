'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CreateOrganizationInput,
  Organization,
  UpdateOrganizationInput,
} from '@red-salud/types';
import {
  completeOnboarding,
  createOrganizationRpc,
  getOrganizationById,
  getOrganizationOverview,
  getOrganizationKPIs,
  isSlugAvailable,
  listMyOrganizations,
  setOnboardingStep,
  updateOrganization,
} from '@/lib/db/organizations';

export function useMyOrganizations() {
  return useQuery({
    queryKey: ['organizations', 'mine'],
    queryFn: listMyOrganizations,
  });
}

export function useOrganization(organizationId: string | undefined) {
  return useQuery({
    queryKey: ['organizations', organizationId],
    queryFn: () => getOrganizationById(organizationId as string),
    enabled: !!organizationId,
  });
}

export function useOrganizationOverview(organizationId: string | undefined) {
  return useQuery({
    queryKey: ['organizations', organizationId, 'overview'],
    queryFn: () => getOrganizationOverview(organizationId as string),
    enabled: !!organizationId,
  });
}

export function useOrganizationKPIs(organizationId: string | undefined) {
  return useQuery({
    queryKey: ['organizations', organizationId, 'kpis'],
    queryFn: () => getOrganizationKPIs(organizationId as string),
    enabled: !!organizationId,
  });
}

export function useSlugAvailable(slug: string | undefined) {
  return useQuery({
    queryKey: ['organizations', 'slug-available', slug],
    queryFn: () => isSlugAvailable(slug as string),
    enabled: !!slug && slug.length >= 3,
    staleTime: 0,
  });
}

export function useCreateOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateOrganizationInput) => createOrganizationRpc(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['organizations', 'mine'] });
    },
  });
}

export function useUpdateOrganization(organizationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateOrganizationInput): Promise<Organization> =>
      updateOrganization(organizationId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['organizations', organizationId] });
      qc.invalidateQueries({ queryKey: ['organizations', 'mine'] });
    },
  });
}

export function useSetOnboardingStep(organizationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (step: number) => setOnboardingStep(organizationId, step),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['organizations', organizationId] });
    },
  });
}

export function useCompleteOnboarding(organizationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => completeOnboarding(organizationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['organizations', organizationId] });
      qc.invalidateQueries({ queryKey: ['organizations', 'mine'] });
    },
  });
}
