'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { listMyOrganizations } from '@/lib/db/organizations';
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard';

export default function OnboardingPage() {
  const router = useRouter();
  const [bootstrapped, setBootstrapped] = useState(false);

  const { data: orgs, isLoading } = useQuery({
    queryKey: ['organizations', 'mine'],
    queryFn: listMyOrganizations,
  });

  useEffect(() => {
    if (isLoading || bootstrapped) return;
    const ongoing = orgs?.find((o) => !o.onboarding_completed);
    const completed = orgs?.find((o) => o.onboarding_completed);

    if (completed && !ongoing) {
      router.replace(`/dashboard/${completed.slug}`);
      return;
    }
    setBootstrapped(true);
  }, [orgs, isLoading, bootstrapped, router]);

  if (isLoading || !bootstrapped) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Cargando...</p>
      </div>
    );
  }

  const ongoing = orgs?.find((o) => !o.onboarding_completed);
  return <OnboardingWizard existingOrganization={ongoing ?? null} />;
}
