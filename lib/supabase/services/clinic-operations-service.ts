/**
 * Servicio para gestión de operaciones clínicas
 * 
 * Maneja recursos, turnos, métricas y alertas operacionales
 */

import { createClient } from '@/lib/supabase/client';
import type {
  ClinicResource,
  StaffShift,
  OperationalMetrics,
  ResourceFilters,
  ResourceUtilization,
  ClinicAlert,
} from '@/lib/types/clinic.types';

const supabase = createClient();

// ============ Recursos Clínicos ============

export async function getClinicResources(filters: ResourceFilters): Promise<ClinicResource[]> {
  let query = supabase.from('clinic_resources').select('*');

  if (filters.location_ids && filters.location_ids.length > 0) {
    query = query.in('location_id', filters.location_ids);
  }

  if (filters.resource_type && filters.resource_type.length > 0) {
    query = query.in('type', filters.resource_type);
  }

  if (filters.resource_status && filters.resource_status.length > 0) {
    query = query.in('status', filters.resource_status);
  }

  if (filters.department) {
    query = query.eq('department', filters.department);
  }

  query = query.order('priority', { ascending: false }).order('name');

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

export async function getResourceById(resourceId: string): Promise<ClinicResource | null> {
  const { data, error } = await supabase
    .from('clinic_resources')
    .select('*')
    .eq('id', resourceId)
    .single();

  if (error) throw error;
  return data;
}

export async function createResource(
  resource: Omit<ClinicResource, 'id' | 'created_at' | 'updated_at'>
): Promise<ClinicResource> {
  const { data, error } = await supabase
    .from('clinic_resources')
    .insert(resource)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateResource(
  resourceId: string,
  updates: Partial<ClinicResource>
): Promise<ClinicResource> {
  const { data, error } = await supabase
    .from('clinic_resources')
    .update(updates)
    .eq('id', resourceId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateResourceStatus(
  resourceId: string,
  status: ClinicResource['status']
): Promise<ClinicResource> {
  return updateResource(resourceId, { status });
}

export async function getAvailableResources(
  locationId: string,
  resourceType?: string
): Promise<ClinicResource[]> {
  let query = supabase
    .from('clinic_resources')
    .select('*')
    .eq('location_id', locationId)
    .eq('status', 'available');

  if (resourceType) {
    query = query.eq('type', resourceType);
  }

  query = query.order('priority', { ascending: false });

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

/**
 * Obtiene utilización de recursos en un período
 */
export async function getResourceUtilization(
  locationIds: string[],
  dateFrom: string,
  dateTo: string
): Promise<ResourceUtilization[]> {
  // Esta función requiere lógica adicional para calcular horas ocupadas
  // Por ahora retorna estructura básica
  const resources = await getClinicResources({ location_ids: locationIds });

  return resources.map((resource) => ({
    resource_id: resource.id,
    resource_name: resource.name,
    resource_type: resource.type,
    total_hours: 0, // TODO: calcular desde appointments/reservations
    occupied_hours: 0,
    utilization_rate: 0,
    revenue_generated: 0,
  }));
}

// ============ Turnos de Personal ============

export async function getStaffShifts(
  locationId: string,
  dateFrom: string,
  dateTo: string
): Promise<StaffShift[]> {
  const { data, error } = await supabase
    .from('clinic_staff_shifts')
    .select(`
      *,
      staff:staff_id (email, raw_user_meta_data)
    `)
    .eq('location_id', locationId)
    .gte('shift_date', dateFrom)
    .lte('shift_date', dateTo)
    .order('shift_date')
    .order('start_time');

  if (error) throw error;
  return data || [];
}

export async function createStaffShift(
  shift: Omit<StaffShift, 'id' | 'created_at' | 'updated_at'>
): Promise<StaffShift> {
  const { data, error } = await supabase
    .from('clinic_staff_shifts')
    .insert(shift)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateStaffShift(
  shiftId: string,
  updates: Partial<StaffShift>
): Promise<StaffShift> {
  const { data, error } = await supabase
    .from('clinic_staff_shifts')
    .update(updates)
    .eq('id', shiftId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function cancelStaffShift(shiftId: string): Promise<StaffShift> {
  return updateStaffShift(shiftId, { status: 'cancelled' });
}

export async function getActiveShifts(locationId: string): Promise<StaffShift[]> {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('clinic_staff_shifts')
    .select(`
      *,
      staff:staff_id (email, raw_user_meta_data)
    `)
    .eq('location_id', locationId)
    .eq('shift_date', today)
    .in('status', ['scheduled', 'active'])
    .order('start_time');

  if (error) throw error;
  return data || [];
}

// ============ Métricas Operacionales ============

export async function getOperationalMetrics(
  locationId: string,
  dateFrom: string,
  dateTo: string
): Promise<OperationalMetrics[]> {
  const { data, error } = await supabase
    .from('clinic_operational_metrics')
    .select('*')
    .eq('location_id', locationId)
    .gte('metric_date', dateFrom)
    .lte('metric_date', dateTo)
    .order('metric_date', { ascending: false })
    .order('metric_hour', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function recordOperationalMetrics(
  metrics: Omit<OperationalMetrics, 'id' | 'created_at' | 'updated_at'>
): Promise<OperationalMetrics> {
  const { data, error } = await supabase
    .from('clinic_operational_metrics')
    .upsert(metrics, {
      onConflict: 'location_id,metric_date,metric_hour',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getDailyMetricsSummary(
  locationIds: string[],
  date: string
): Promise<{
  total_appointments: number;
  completed_appointments: number;
  cancelled_appointments: number;
  average_occupancy: number;
  total_revenue: number;
  total_patients: number;
}> {
  const { data, error } = await supabase
    .from('clinic_operational_metrics')
    .select('*')
    .in('location_id', locationIds)
    .eq('metric_date', date);

  if (error) throw error;

  if (!data || data.length === 0) {
    return {
      total_appointments: 0,
      completed_appointments: 0,
      cancelled_appointments: 0,
      average_occupancy: 0,
      total_revenue: 0,
      total_patients: 0,
    };
  }

  return {
    total_appointments: data.reduce((sum, m) => sum + m.total_appointments, 0),
    completed_appointments: data.reduce((sum, m) => sum + m.completed_appointments, 0),
    cancelled_appointments: data.reduce((sum, m) => sum + m.cancelled_appointments, 0),
    average_occupancy:
      data.reduce((sum, m) => sum + (m.occupancy_rate || 0), 0) / data.length,
    total_revenue: data.reduce((sum, m) => sum + m.revenue_amount, 0),
    total_patients: data.reduce((sum, m) => sum + m.patient_count, 0),
  };
}

// ============ Alertas Operacionales ============

/**
 * Genera alertas basadas en umbrales operacionales
 */
export async function generateOperationalAlerts(
  clinicId: string,
  locationIds: string[]
): Promise<ClinicAlert[]> {
  const alerts: ClinicAlert[] = [];
  const today = new Date().toISOString().split('T')[0];

  // Verificar capacidad de recursos
  for (const locationId of locationIds) {
    const resources = await getClinicResources({
      location_ids: [locationId],
      resource_status: ['available'],
    });

    const totalBeds = resources.filter((r) => r.type === 'bed').length;
    const availableBeds = resources.filter(
      (r) => r.type === 'bed' && r.status === 'available'
    ).length;

    if (totalBeds > 0 && availableBeds / totalBeds < 0.2) {
      // Menos del 20% de camas disponibles
      alerts.push({
        id: `capacity-${locationId}-${Date.now()}`,
        type: 'capacity',
        severity: 'critical',
        title: 'Capacidad Crítica de Camas',
        message: `Solo ${availableBeds} de ${totalBeds} camas disponibles`,
        location_id: locationId,
        created_at: new Date().toISOString(),
        resolved: false,
      });
    }

    // Verificar quirófanos
    const operatingRooms = resources.filter((r) => r.type === 'operating_room');
    const availableOR = operatingRooms.filter((r) => r.status === 'available').length;

    if (operatingRooms.length > 0 && availableOR === 0) {
      alerts.push({
        id: `or-${locationId}-${Date.now()}`,
        type: 'operational',
        severity: 'warning',
        title: 'Sin Quirófanos Disponibles',
        message: 'Todos los quirófanos están ocupados o en mantenimiento',
        location_id: locationId,
        created_at: new Date().toISOString(),
        resolved: false,
      });
    }
  }

  // Verificar métricas operacionales
  const metrics = await supabase
    .from('clinic_operational_metrics')
    .select('*')
    .in('location_id', locationIds)
    .eq('metric_date', today);

  if (metrics.data) {
    for (const metric of metrics.data) {
      // Alta tasa de no-shows
      if (metric.no_show_appointments > metric.total_appointments * 0.15) {
        alerts.push({
          id: `no-show-${metric.location_id}-${Date.now()}`,
          type: 'operational',
          severity: 'warning',
          title: 'Alta Tasa de Inasistencias',
          message: `${metric.no_show_appointments} pacientes no asistieron hoy`,
          location_id: metric.location_id,
          created_at: new Date().toISOString(),
          resolved: false,
        });
      }

      // Baja ocupación
      if (metric.occupancy_rate && metric.occupancy_rate < 50) {
        alerts.push({
          id: `occupancy-${metric.location_id}-${Date.now()}`,
          type: 'operational',
          severity: 'info',
          title: 'Baja Ocupación',
          message: `Ocupación del ${metric.occupancy_rate.toFixed(1)}% hoy`,
          location_id: metric.location_id,
          created_at: new Date().toISOString(),
          resolved: false,
        });
      }
    }
  }

  return alerts;
}

/**
 * Obtiene departamentos únicos de una clínica
 */
export async function getClinicDepartments(locationIds: string[]): Promise<string[]> {
  const { data, error } = await supabase
    .from('clinic_resources')
    .select('department')
    .in('location_id', locationIds)
    .not('department', 'is', null);

  if (error) throw error;

  const departments = new Set(data?.map((r) => r.department).filter(Boolean) || []);
  return Array.from(departments).sort();
}
