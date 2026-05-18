'use client';

import { createContext, useContext, useMemo } from 'react';
import type {
  Organization,
  OrganizationLocation,
  OrganizationMember,
  ModuleCatalogEntry,
  OrganizationRole,
} from '@red-salud/types';

interface OrganizationContextValue {
  organization: Organization;
  locations: OrganizationLocation[];
  enabledModules: ModuleCatalogEntry[];
  membership: OrganizationMember | null;
  role: OrganizationRole;
  isOwner: boolean;
  isAdmin: boolean;
  hasModule: (key: string) => boolean;
}

const OrganizationContext = createContext<OrganizationContextValue | null>(null);

export interface OrganizationProviderProps {
  organization: Organization;
  locations: OrganizationLocation[];
  enabledModules: ModuleCatalogEntry[];
  membership: OrganizationMember | null;
  children: React.ReactNode;
}

export function OrganizationProvider({
  organization,
  locations,
  enabledModules,
  membership,
  children,
}: OrganizationProviderProps) {
  const value = useMemo<OrganizationContextValue>(() => {
    const role: OrganizationRole = membership?.role ?? 'viewer';
    const moduleKeys = new Set(enabledModules.map((m) => m.key));
    return {
      organization,
      locations,
      enabledModules,
      membership,
      role,
      isOwner: role === 'owner',
      isAdmin: role === 'owner' || role === 'admin',
      hasModule: (key: string) => moduleKeys.has(key),
    };
  }, [organization, locations, enabledModules, membership]);

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>;
}

export function useOrganizationContext(): OrganizationContextValue {
  const ctx = useContext(OrganizationContext);
  if (!ctx) {
    throw new Error('useOrganizationContext must be used inside <OrganizationProvider>');
  }
  return ctx;
}
