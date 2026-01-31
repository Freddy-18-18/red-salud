/**
 * @file dashboard-skeleton.tsx
 * @description Componentes de carga (skeleton) para el dashboard médico.
 * Proporcionan feedback visual mientras se cargan los datos.
 *
 * @module Dashboard
 */

import { cn } from "@red-salud/core/utils";

interface DashboardSkeletonProps {
  /** Clases adicionales */
  className?: string;
}

/** Skeleton para un widget individual */
export function WidgetSkeleton({ className }: DashboardSkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-muted/50 border border-border/50 p-4",
        "animate-pulse",
        className,
      )}
    >
      {/* Header del widget */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-muted" />
          <div className="h-4 w-24 rounded bg-muted" />
        </div>
        <div className="w-16 h-6 rounded-full bg-muted" />
      </div>

      {/* Contenido del skeleton */}
      <div className="space-y-3">
        <div className="h-8 w-full rounded-lg bg-muted" />
        <div className="h-6 w-3/4 rounded-lg bg-muted" />
      </div>
    </div>
  );
}

/** Skeleton para la grilla completa del dashboard */
export function DashboardGridSkeleton() {
  return (
    <div
      className={cn(
        "grid gap-3",
        "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
        "auto-rows-[minmax(170px,auto)]",
      )}
    >
      {/* 7 widgets en modo simple */}
      {Array.from({ length: 7 }).map((_, i) => (
        <WidgetSkeleton key={i} />
      ))}
    </div>
  );
}

/** Skeleton para el header del dashboard */
export function DashboardHeaderSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 w-64 rounded-lg bg-muted" />
      <div className="flex items-center gap-4">
        <div className="h-5 w-32 rounded bg-muted" />
        <div className="h-5 w-24 rounded bg-muted" />
        <div className="h-5 w-20 rounded bg-muted" />
      </div>
    </div>
  );
}

/** Skeleton de carga completa para el dashboard */
export function FullDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <DashboardHeaderSkeleton />
      <DashboardGridSkeleton />
    </div>
  );
}

/** Spinner de carga compacto */
export function LoadingSpinner({ size = "default" }: { size?: "small" | "default" | "large" }) {
  const sizeClasses = {
    small: "w-4 h-4",
    default: "w-8 h-8",
    large: "w-12 h-12",
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={cn(
          "rounded-full border-2 border-primary border-t-transparent animate-spin",
          sizeClasses[size],
        )}
      />
    </div>
  );
}
