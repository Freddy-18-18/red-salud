'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMyOrganizations } from '@/lib/hooks/use-organization';

export default function DashboardRedirect() {
  const router = useRouter();
  const { data: orgs, isLoading } = useMyOrganizations();

  useEffect(() => {
    if (isLoading) return;

    if (!orgs || orgs.length === 0) {
      router.replace('/onboarding');
      return;
    }

    const completed = orgs.find((o) => o.onboarding_completed);
    if (completed) {
      router.replace(`/dashboard/${completed.slug}`);
      return;
    }

    router.replace('/onboarding');
  }, [orgs, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-slate-500 text-sm">
      Cargando...
    </div>
  );
}
