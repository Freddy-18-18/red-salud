/**
 * Hook para gestión de operaciones clínicas
 * 
 * Maneja recursos, turnos, métricas y alertas operacionales
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getClinicResources,
  getAvailableResources,
  updateResourceStatus,
  getStaffShifts,
  getActiveShifts,
  createStaffShift,
  updateStaffShift,
  cancelStaffShift,
  getOperationalMetrics,
  getDailyMetricsSummary,
  generateOperationalAlerts,
  getClinicDepartments,
} from '@/lib/supabase/services/clinic-operations-service';
import type {
  ResourceFilters,
  ClinicResource,
  StaffShift,
} from '@/lib/types/clinic.types';

export function useClinicOperations(locationIds?: string[]) {
  const queryClient = useQueryClient();

  // Obtener recursos
  const {
    data: resources,
    isLoading: loadingResources,
    refetch: refetchResources,
  } = useQuery({
    queryKey: ['clinic-resources', locationIds],
    queryFn: () => {
      if (!locationIds || locationIds.length === 0) return [];
      const filters: ResourceFilters = { location_ids: locationIds };
      return getClinicResources(filters);
    },
    enabled: !!locationIds && locationIds.length > 0,
  });

  // Obtener departamentos
  const { data: departments } = useQuery({
    queryKey: ['clinic-departments', locationIds],
    queryFn: () => {
      if (!locationIds || locationIds.length === 0) return [];
      return getClinicDepartments(locationIds);
    },
    enabled: !!locationIds && locationIds.length > 0,
  });

  // Obtener turnos activos
  const {
    data: activeShifts,
    isLoading: loadingShifts,
    refetch: refetchShifts,
  } = useQuery({
    queryKey: ['active-shifts', locationIds],
    queryFn: async () => {
      if (!locationIds || locationIds.length === 0) return [];
      const shiftsPromises = locationIds.map((locId) => getActiveShifts(locId));
      const shiftsArrays = await Promise.all(shiftsPromises);
      return shiftsArrays.flat();
    },
    enabled: !!locationIds && locationIds.length > 0,
  });

  // Obtener métricas del día
  const {
    data: todayMetrics,
    isLoading: loadingMetrics,
    refetch: refetchMetrics,
  } = useQuery({
    queryKey: ['daily-metrics', locationIds],
    queryFn: () => {
      if (!locationIds || locationIds.length === 0) return null;
      const today = new Date().toISOString().split('T')[0];
      return getDailyMetricsSummary(locationIds, today);
    },
    enabled: !!locationIds && locationIds.length > 0,
    refetchInterval: 60000, // Cada minuto
  });

  // Mutation: Actualizar estado de recurso
  const updateResourceStatusMutation = useMutation({
    mutationFn: ({
      resourceId,
      status,
    }: {
      resourceId: string;
      status: ClinicResource['status'];
    }) => updateResourceStatus(resourceId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinic-resources'] });
    },
  });

  // Mutation: Crear turno
  const createShiftMutation = useMutation({
    mutationFn: createStaffShift,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-shifts'] });
      queryClient.invalidateQueries({ queryKey: ['staff-shifts'] });
    },
  });

  // Mutation: Cancelar turno
  const cancelShiftMutation = useMutation({
    mutationFn: cancelStaffShift,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-shifts'] });
      queryClient.invalidateQueries({ queryKey: ['staff-shifts'] });
    },
  });

  // Helpers
  const getResourcesByType = (type: ClinicResource['type']) => {
    return resources?.filter((r) => r.type === type) || [];
  };

  const getAvailableResourcesByType = (type: ClinicResource['type']) => {
    return resources?.filter((r) => r.type === type && r.status === 'available') || [];
  };

  const getResourcesByDepartment = (department: string) => {
    return resources?.filter((r) => r.department === department) || [];
  };

  const beds = getResourcesByType('bed');
  const availableBeds = getAvailableResourcesByType('bed');
  const operatingRooms = getResourcesByType('operating_room');
  const availableOperatingRooms = getAvailableResourcesByType('operating_room');
  const consultationRooms = getResourcesByType('consultation_room');
  const availableConsultationRooms = getAvailableResourcesByType('consultation_room');

  const bedOccupancyRate = beds.length > 0
    ? ((beds.length - availableBeds.length) / beds.length) * 100
    : 0;

  return {
    // Data
    resources,
    departments,
    activeShifts,
    todayMetrics,

    // Resources by type
    beds,
    availableBeds,
    operatingRooms,
    availableOperatingRooms,
    consultationRooms,
    availableConsultationRooms,
    bedOccupancyRate,

    // Loading
    isLoading: loadingResources || loadingShifts || loadingMetrics,
    loadingResources,
    loadingShifts,
    loadingMetrics,

    // Actions
    updateResourceStatus: updateResourceStatusMutation.mutateAsync,
    createShift: createShiftMutation.mutateAsync,
    cancelShift: cancelShiftMutation.mutateAsync,

    // Helpers
    getResourcesByType,
    getAvailableResourcesByType,
    getResourcesByDepartment,

    // Refetch
    refetchResources,
    refetchShifts,
    refetchMetrics,
    refresh: () => {
      refetchResources();
      refetchShifts();
      refetchMetrics();
    },
  };
}

export function useResourceSchedule(locationId: string, dateFrom: string, dateTo: string) {
  const {
    data: shifts,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['staff-shifts', locationId, dateFrom, dateTo],
    queryFn: () => getStaffShifts(locationId, dateFrom, dateTo),
    enabled: !!locationId,
  });

  return {
    shifts,
    isLoading,
    refetch,
  };
}

export function useOperationalMetrics(
  locationId: string,
  dateFrom: string,
  dateTo: string
) {
  const {
    data: metrics,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['operational-metrics', locationId, dateFrom, dateTo],
    queryFn: () => getOperationalMetrics(locationId, dateFrom, dateTo),
    enabled: !!locationId,
  });

  // Calcular promedios
  const averages = metrics
    ? {
        avgAppointments:
          metrics.reduce((sum, m) => sum + m.total_appointments, 0) / metrics.length,
        avgCompletionRate:
          metrics.reduce(
            (sum, m) =>
              sum +
              (m.total_appointments > 0
                ? (m.completed_appointments / m.total_appointments) * 100
                : 0),
            0
          ) / metrics.length,
        avgOccupancy:
          metrics.reduce((sum, m) => sum + (m.occupancy_rate || 0), 0) / metrics.length,
        totalRevenue: metrics.reduce((sum, m) => sum + m.revenue_amount, 0),
        totalPatients: metrics.reduce((sum, m) => sum + m.patient_count, 0),
      }
    : null;

  return {
    metrics,
    averages,
    isLoading,
    refetch,
  };
}
