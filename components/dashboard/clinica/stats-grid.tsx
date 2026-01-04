/**
 * Componente de tarjetas de estadísticas para overview
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Activity,
  AlertCircle,
  Building2,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    label: string;
    direction: 'up' | 'down' | 'neutral';
  };
  icon?: 'users' | 'revenue' | 'occupancy' | 'alerts' | 'claims' | 'patients' | 'resources';
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const iconMap = {
  users: Users,
  revenue: DollarSign,
  occupancy: Activity,
  alerts: AlertCircle,
  claims: FileText,
  patients: Building2,
  resources: Building2,
};

export function StatCard({
  title,
  value,
  subtitle,
  trend,
  icon = 'users',
  variant = 'default',
}: StatCardProps) {
  const Icon = iconMap[icon];

  const variantStyles = {
    default: 'bg-card text-card-foreground',
    success: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800',
    warning: 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800',
    danger: 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800',
  };

  return (
    <Card className={cn('transition-all hover:shadow-md', variantStyles[variant])}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        {trend && (
          <div
            className={cn(
              'flex items-center text-xs mt-2',
              trend.direction === 'up' && 'text-green-600 dark:text-green-400',
              trend.direction === 'down' && 'text-red-600 dark:text-red-400',
              trend.direction === 'neutral' && 'text-muted-foreground'
            )}
          >
            {trend.direction === 'up' && <TrendingUp className="h-3 w-3 mr-1" />}
            {trend.direction === 'down' && <TrendingDown className="h-3 w-3 mr-1" />}
            <span className="font-medium">{trend.value}%</span>
            <span className="ml-1 text-muted-foreground">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface StatsGridProps {
  stats: {
    todayAppointments: number;
    todayRevenue: number;
    occupancyRate: number;
    activeClaims: number;
    pendingPayments: number;
    internationalPatients: number;
    availableResources: number;
    alertsCount: number;
  };
  currency?: string;
}

export function StatsGrid({ stats, currency = 'MXN' }: StatsGridProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Citas Hoy"
        value={stats.todayAppointments}
        subtitle="Programadas para hoy"
        icon="users"
      />
      
      <StatCard
        title="Ingresos Hoy"
        value={formatCurrency(stats.todayRevenue)}
        subtitle="Facturado en el día"
        icon="revenue"
      />
      
      <StatCard
        title="Ocupación"
        value={`${stats.occupancyRate.toFixed(1)}%`}
        subtitle="Tasa de ocupación actual"
        icon="occupancy"
        variant={stats.occupancyRate > 80 ? 'warning' : 'default'}
      />
      
      <StatCard
        title="Alertas"
        value={stats.alertsCount}
        subtitle="Requieren atención"
        icon="alerts"
        variant={stats.alertsCount > 0 ? 'danger' : 'success'}
      />
      
      <StatCard
        title="Claims Activos"
        value={stats.activeClaims}
        subtitle="En proceso"
        icon="claims"
      />
      
      <StatCard
        title="Pagos Pendientes"
        value={formatCurrency(stats.pendingPayments)}
        subtitle="Por cobrar"
        icon="revenue"
      />
      
      <StatCard
        title="Pacientes Internacionales"
        value={stats.internationalPatients}
        subtitle="En tratamiento"
        icon="patients"
      />
      
      <StatCard
        title="Recursos Disponibles"
        value={stats.availableResources}
        subtitle="Camas, quirófanos, etc."
        icon="resources"
      />
    </div>
  );
}
