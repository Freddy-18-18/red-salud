'use client';

import { useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getOrganizationBySlug, getOrganizationOverview } from '@/lib/db/organizations';
import { getCurrentUserMembership } from '@/lib/db/members';
import { OrganizationProvider } from '@/lib/providers/organization-provider';
import { BrandingProvider } from '@/lib/providers/branding-provider';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';

export default function OrganizationLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const { data: org, isLoading: orgLoading } = useQuery({
    queryKey: ['organizations', 'by-slug', slug],
    queryFn: () => getOrganizationBySlug(slug),
    enabled: !!slug,
  });

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['organizations', org?.id, 'overview'],
    queryFn: () => getOrganizationOverview(org!.id),
    enabled: !!org?.id,
  });

  const { data: membership } = useQuery({
    queryKey: ['members', org?.id, 'me'],
    queryFn: () => getCurrentUserMembership(org!.id),
    enabled: !!org?.id,
  });

  useEffect(() => {
    if (orgLoading) return;
    if (!org) {
      router.replace('/dashboard');
      return;
    }
    if (!org.onboarding_completed) {
      router.replace('/onboarding');
    }
  }, [org, orgLoading, router]);

  const isLoading = orgLoading || overviewLoading || !overview;

  const content = useMemo(() => {
    if (isLoading || !org || !overview) {
      return (
        <div className="min-h-screen flex items-center justify-center text-slate-500 text-sm">
          Cargando panel...
        </div>
      );
    }

    return (
      <BrandingProvider branding={org.branding}>
        <OrganizationProvider
          organization={org}
          locations={overview.locations}
          enabledModules={overview.enabled_modules}
          membership={membership ?? null}
        >
          <DashboardShell>{children}</DashboardShell>
        </OrganizationProvider>
      </BrandingProvider>
    );
  }, [isLoading, org, overview, membership, children]);

  return content;
}
