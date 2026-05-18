'use client';

import { useEffect } from 'react';
import type { OrganizationBranding } from '@red-salud/types';
import { applyBranding } from '@/lib/theming/apply-branding';

export function BrandingProvider({
  branding,
  children,
}: {
  branding: OrganizationBranding;
  children: React.ReactNode;
}) {
  useEffect(() => {
    applyBranding(branding);
  }, [branding]);

  return <>{children}</>;
}
