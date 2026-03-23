'use client';

import {
  TrendingUp,
  TrendingDown,
  Minus,
  type LucideIcon,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface KpiCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  format?: 'number' | 'currency' | 'percentage' | 'duration';
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  themeColor?: string;
  isLoading?: boolean;
}

// ============================================================================
// FORMAT HELPERS
// ============================================================================

function formatKpiValue(value: number | string, format: KpiCardProps['format'] = 'number'): string {
  if (typeof value === 'string') return value;

  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('es-VE', {
        style: 'currency',
        currency: 'VES',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    case 'percentage':
      return `${value.toFixed(1)}%`;
    case 'duration':
      return `${value} min`;
    case 'number':
    default:
      return new Intl.NumberFormat('es-VE').format(value);
  }
}

// ============================================================================
// LOADING SKELETON
// ============================================================================

function KpiSkeleton() {
  return (
    <div className="p-5 bg-white rounded-xl border border-gray-200 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 w-24 bg-gray-200 rounded" />
        <div className="h-10 w-10 bg-gray-200 rounded-lg" />
      </div>
      <div className="h-8 w-20 bg-gray-200 rounded mt-1" />
      <div className="h-3 w-16 bg-gray-100 rounded mt-2" />
    </div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export function KpiCard({
  label,
  value,
  icon: Icon,
  format = 'number',
  trend,
  trendValue,
  themeColor = '#3B82F6',
  isLoading = false,
}: KpiCardProps) {
  if (isLoading) return <KpiSkeleton />;

  const TrendIcon = trend === 'up'
    ? TrendingUp
    : trend === 'down'
      ? TrendingDown
      : Minus;

  const trendColor = trend === 'up'
    ? 'text-emerald-600'
    : trend === 'down'
      ? 'text-red-500'
      : 'text-gray-400';

  return (
    <div className="p-5 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <div
          className="h-10 w-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${themeColor}15` }}
        >
          <Icon className="h-5 w-5" style={{ color: themeColor }} />
        </div>
      </div>

      <p className="text-2xl font-bold text-gray-900">
        {formatKpiValue(value, format)}
      </p>

      {trend && (
        <div className={`flex items-center gap-1 mt-2 ${trendColor}`}>
          <TrendIcon className="h-3.5 w-3.5" />
          {trendValue && (
            <span className="text-xs font-medium">{trendValue}</span>
          )}
        </div>
      )}
    </div>
  );
}
