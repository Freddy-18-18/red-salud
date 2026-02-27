// ============================================
// SPECIALTY DASHBOARD LOADER
// Dynamically loads and renders specialty-specific dashboards
// ============================================

"use client";

import React, { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@red-salud/design-system';
import type { SpecialtyConfig } from '@/lib/specialties';
import { SpecialtyDashboardShell } from './specialty';
import { DashboardV2 } from './dashboard-v2/DashboardV2';
import { useSpecialtyDashboard } from '@/hooks/dashboard/use-specialty-dashboard';

/**
 * Dynamic dashboard loader component
 *
 * This component loads the appropriate dashboard based on the specialty config.
 * It uses React.lazy for code splitting and Suspense for loading states.
 */

interface SpecialtyDashboardLoaderProps {
  config: SpecialtyConfig;
  userId?: string;
  subSpecialties?: string[];
  profileName?: string;
}

/**
 * Dynamically imported dashboard components
 * These are lazy-loaded only when needed
 */
const DentalDashboard = lazy(() =>
  import('@/components/dashboard/medico/odontologia/odontologia-dashboard')
);

// Cardiology dashboard
const CardiologyDashboard = lazy(() =>
  import('@/components/dashboard/medico/cardiology/cardiologia-dashboard')
);

// Neurology dashboard
const NeurologyDashboard = lazy(() =>
  import('@/components/dashboard/medico/neurologia/neurologia-dashboard')
);

// Pediatrics dashboard
const PediatricsDashboard = lazy(() =>
  import('@/components/dashboard/medico/pediatria/pediatria-dashboard')
);

// Traumatology dashboard
const TraumatologyDashboard = lazy(() =>
  import('@/components/dashboard/medico/traumatologia/traumatologia-dashboard')
);

// Ophthalmology dashboard
const OphthalmologyDashboard = lazy(() =>
  import('@/components/dashboard/medico/oftalmologia/oftalmologia-dashboard')
);

// Gynecology dashboard
const GynecologyDashboard = lazy(() =>
  import('@/components/dashboard/medico/ginecologia/ginecologia-dashboard')
);

// Fallback for unimplemented specialties - no longer used as primary fallback
const LegacyFallbackDashboard = DashboardV2;

/**
 * Mapping of specialty slugs to their custom dashboard components.
 * Keys MUST match identity.slug (which becomes config.id).
 */
const DASHBOARD_MAP: Record<string, React.ComponentType<any>> = {
  odontologia: DentalDashboard,
  cardiologia: CardiologyDashboard,
  neurologia: NeurologyDashboard,
  pediatria: PediatricsDashboard,
  traumatologia: TraumatologyDashboard,
  oftalmologia: OphthalmologyDashboard,
  ginecologia: GynecologyDashboard,
};

/**
 * Sub-specialties that should use their parent's custom dashboard.
 * Maps child slug → parent slug (which is a key in DASHBOARD_MAP).
 *
 * Sub-specialties NOT listed here will use the generic SpecialtyDashboardShell
 * with inherited theme/widgets from override inheritance.
 */
const PARENT_DASHBOARD_MAP: Record<string, string> = {
  // Dental sub-specialties → use dental dashboard
  ortodoncia: 'odontologia',
  endodoncia: 'odontologia',
  periodoncia: 'odontologia',
  'implantologia-dental': 'odontologia',
  'cirugia-oral-maxilofacial': 'odontologia',
  odontopediatria: 'odontologia',
  'ortopedia-dentomaxilofacial': 'odontologia',
  prostodoncia: 'odontologia',
};

/**
 * Loading skeleton for dashboards
 */
function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-muted rounded w-64" />
      <div className="h-4 bg-muted rounded w-96" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-48 bg-muted rounded-lg" />
        ))}
      </div>
    </div>
  );
}

/**
 * Error component for failed dashboard loads
 */
function DashboardLoadError({ specialtyName }: { specialtyName: string }) {
  return (
    <Alert variant="destructive" className="my-6">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        No se pudo cargar el dashboard de {specialtyName}. Por favor recarga la página.
      </AlertDescription>
    </Alert>
  );
}

/**
 * Specialty Dashboard Loader Component
 *
 * This component:
 * 1. Determines which dashboard component to use
 * 2. Lazy loads it only when needed
 * 3. Shows loading state while loading
 * 4. Falls back to generic dashboard if specialty dashboard not found
 */
export function SpecialtyDashboardLoader({
  config,
  userId,
  subSpecialties,
  profileName,
}: SpecialtyDashboardLoaderProps) {
  // Look up custom dashboard: first direct, then via parent mapping
  const parentId = PARENT_DASHBOARD_MAP[config.id];
  const SpecialtyDashboardComponent =
    DASHBOARD_MAP[config.id] ?? (parentId ? DASHBOARD_MAP[parentId] : undefined);

  // Fetch specialty data via the orchestrator hook
  const dashboardData = useSpecialtyDashboard(userId, config);

  // If no specialty-specific dashboard exists, use the generic shell
  // that renders dynamically from the SpecialtyConfig
  if (!SpecialtyDashboardComponent) {
    return (
      <SpecialtyDashboardShell
        config={config}
        doctorId={userId}
        subSpecialties={subSpecialties}
        kpiValues={dashboardData.kpiValues}
        isLoading={dashboardData.isLoading}
        error={dashboardData.error}
        refreshedAt={dashboardData.refreshedAt}
        onRefresh={dashboardData.refresh}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">
              Cargando dashboard de {config.name}...
            </span>
          </div>
        }
      >
        <div className="error-boundary">
          <SpecialtyDashboardComponent
            doctorId={userId}
            subSpecialties={subSpecialties}
          />
        </div>
      </Suspense>
    </motion.div>
  );
}

/**
 * Error boundary wrapper for dashboards
 */
class DashboardErrorBoundary extends React.Component<
  { children: React.ReactNode; specialtyName: string },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; specialtyName: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[DashboardErrorBoundary]', error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return <DashboardLoadError specialtyName={this.props.specialtyName} />;
    }

    return this.props.children;
  }
}

/**
 * Wrapper component with error boundary
 */
export function SpecialtyDashboardSafe(props: SpecialtyDashboardLoaderProps) {
  return (
    <DashboardErrorBoundary specialtyName={props.config.name}>
      <SpecialtyDashboardLoader {...props} />
    </DashboardErrorBoundary>
  );
}

/**
 * Hook to preload a specialty dashboard.
 * Also checks parent mapping for sub-specialties.
 */
export function preloadSpecialtyDashboard(specialtyId: string): void {
  const resolvedId = PARENT_DASHBOARD_MAP[specialtyId] ?? specialtyId;
  const component = DASHBOARD_MAP[resolvedId];
  if (component && 'preload' in component) {
    (component as any).preload();
  }
}

/**
 * Check if a specialty has a custom dashboard (directly or via parent).
 */
export function hasCustomDashboard(specialtyId: string): boolean {
  if (specialtyId in DASHBOARD_MAP) return true;
  const parentId = PARENT_DASHBOARD_MAP[specialtyId];
  return parentId ? parentId in DASHBOARD_MAP : false;
}

/**
 * Get all available specialty dashboard IDs
 */
export function getAvailableDashboards(): string[] {
  return Object.keys(DASHBOARD_MAP);
}
