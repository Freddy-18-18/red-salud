'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateOrganizationLocationInput, UpdateOrganizationLocationInput } from '@red-salud/types';
import {
  createLocation,
  deactivateLocation,
  deleteLocation,
  getLocation,
  listLocations,
  updateLocation,
} from '@/lib/db/locations';

export function useLocations(organizationId: string | undefined) {
  return useQuery({
    queryKey: ['locations', organizationId],
    queryFn: () => listLocations(organizationId as string),
    enabled: !!organizationId,
  });
}

export function useLocation(locationId: string | undefined) {
  return useQuery({
    queryKey: ['locations', 'one', locationId],
    queryFn: () => getLocation(locationId as string),
    enabled: !!locationId,
  });
}

export function useCreateLocation(organizationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<CreateOrganizationLocationInput, 'organization_id'>) =>
      createLocation({ ...input, organization_id: organizationId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['locations', organizationId] });
      qc.invalidateQueries({ queryKey: ['organizations', organizationId] });
    },
  });
}

export function useUpdateLocation(organizationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateOrganizationLocationInput }) =>
      updateLocation(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['locations', organizationId] });
      qc.invalidateQueries({ queryKey: ['locations', 'one'] });
    },
  });
}

export function useDeactivateLocation(organizationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deactivateLocation(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['locations', organizationId] });
    },
  });
}

export function useDeleteLocation(organizationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteLocation(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['locations', organizationId] });
    },
  });
}
