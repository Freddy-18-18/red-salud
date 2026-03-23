'use client';

import { useMemo } from 'react';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { getSpecialtyExperienceConfig, type SpecialtyConfig } from '@/lib/specialties';

// ============================================================================
// TYPES
// ============================================================================

interface DashboardShellProps {
  userId: string;
  doctorName: string;
  specialtyName: string;
  specialtySlug: string | null;
  avatarUrl: string | null;
  sacsEspecialidad: string | null;
  children: React.ReactNode;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function DashboardShell({
  userId,
  doctorName,
  specialtyName,
  specialtySlug,
  avatarUrl,
  sacsEspecialidad,
  children,
}: DashboardShellProps) {
  // Compute specialty config on the client side
  const specialtyConfig: SpecialtyConfig = useMemo(() => {
    return getSpecialtyExperienceConfig({
      specialtySlug: specialtySlug ?? undefined,
      specialtyName: specialtyName,
      sacsEspecialidad: sacsEspecialidad ?? undefined,
    });
  }, [specialtySlug, specialtyName, sacsEspecialidad]);

  const themeColor = specialtyConfig.theme?.primaryColor ?? '#3B82F6';

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <DashboardSidebar
        doctorName={doctorName}
        specialtyName={specialtyName}
        avatarUrl={avatarUrl}
        specialtyConfig={specialtyConfig}
      />

      {/* Main content area */}
      <main className="flex-1 min-w-0">
        {/* Top bar (mobile spacing for hamburger) */}
        <div className="lg:hidden h-14" />

        {/* Content */}
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
