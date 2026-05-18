'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  bulkEnableModules,
  listEnabledModules,
  listModuleCatalog,
  listOrganizationModules,
  setModuleEnabled,
} from '@/lib/db/modules';

export function useModuleCatalog() {
  return useQuery({
    queryKey: ['module-catalog'],
    queryFn: listModuleCatalog,
    staleTime: 5 * 60_000,
  });
}

export function useOrganizationModules(organizationId: string | undefined) {
  return useQuery({
    queryKey: ['modules', organizationId],
    queryFn: () => listOrganizationModules(organizationId as string),
    enabled: !!organizationId,
  });
}

export function useEnabledModules(organizationId: string | undefined) {
  return useQuery({
    queryKey: ['modules', organizationId, 'enabled'],
    queryFn: () => listEnabledModules(organizationId as string),
    enabled: !!organizationId,
  });
}

export function useSetModuleEnabled(organizationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ key, enabled }: { key: string; enabled: boolean }) =>
      setModuleEnabled(organizationId, key, enabled),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['modules', organizationId] });
    },
  });
}

export function useBulkEnableModules(organizationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (keys: string[]) => bulkEnableModules(organizationId, keys),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['modules', organizationId] });
    },
  });
}
