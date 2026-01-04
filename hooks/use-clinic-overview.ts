/**
 * Hook para gestión del overview/panel principal de clínica
 * 
 * Orquesta datos de stats, alertas y métricas principales
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUserClinics,
  getClinicById,
  getClinicLocations,
  getClinicOverviewStats,
  getUserClinicRoles,
} from '@/lib/supabase/services/clinics-service';
import { generateOperationalAlerts } from '@/lib/supabase/services/clinic-operations-service';
import type { Clinic, ClinicLocation, ClinicOverviewStats, ClinicAlert } from '@/lib/types/clinic.types';

export function useClinicOverview(clinicId?: string, locationIds?: string[]) {
  const queryClient = useQueryClient();

  // Obtener clínicas del usuario
  const {
    data: clinics,
    isLoading: loadingClinics,
    error: clinicsError,
  } = useQuery({
    queryKey: ['user-clinics'],
    queryFn: getUserClinics,
  });

  // Obtener roles del usuario
  const {
    data: userRoles,
    isLoading: loadingRoles,
  } = useQuery({
    queryKey: ['user-clinic-roles'],
    queryFn: getUserClinicRoles,
  });

  // Obtener clínica actual
  const {
    data: currentClinic,
    isLoading: loadingClinic,
    error: clinicError,
  } = useQuery({
    queryKey: ['clinic', clinicId],
    queryFn: () => (clinicId ? getClinicById(clinicId) : null),
    enabled: !!clinicId,
  });

  // Obtener sedes de la clínica
  const {
    data: locations,
    isLoading: loadingLocations,
    error: locationsError,
  } = useQuery({
    queryKey: ['clinic-locations', clinicId],
    queryFn: () => (clinicId ? getClinicLocations(clinicId) : []),
    enabled: !!clinicId,
  });

  // Obtener estadísticas generales
  const {
    data: stats,
    isLoading: loadingStats,
    error: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['clinic-overview-stats', clinicId, locationIds],
    queryFn: () =>
      clinicId ? getClinicOverviewStats(clinicId, locationIds) : null,
    enabled: !!clinicId,
    refetchInterval: 60000, // Refrescar cada minuto
  });

  // Obtener alertas operacionales
  const {
    data: alerts,
    isLoading: loadingAlerts,
    refetch: refetchAlerts,
  } = useQuery({
    queryKey: ['clinic-alerts', clinicId, locationIds],
    queryFn: () => {
      if (!clinicId || !locationIds || locationIds.length === 0) return [];
      return generateOperationalAlerts(clinicId, locationIds);
    },
    enabled: !!clinicId && !!locationIds && locationIds.length > 0,
    refetchInterval: 120000, // Refrescar cada 2 minutos
  });

  // Helpers
  const getActiveLocation = (locationId?: string): ClinicLocation | undefined => {
    if (!locations) return undefined;
    if (locationId) {
      return locations.find((l) => l.id === locationId);
    }
    return locations.find((l) => l.is_main) || locations[0];
  };

  const hasRole = (roles: string[]): boolean => {
    if (!userRoles || !clinicId) return false;
    return userRoles.some(
      (ur) => ur.clinic_id === clinicId && roles.includes(ur.role)
    );
  };

  const canManageFinance = () => hasRole(['owner', 'admin', 'finance']);
  const canManageOperations = () => hasRole(['owner', 'admin', 'manager', 'operations']);
  const canViewReports = () => hasRole(['owner', 'admin', 'finance', 'manager', 'auditor']);

  const criticalAlerts = alerts?.filter((a) => a.severity === 'critical') || [];
  const warningAlerts = alerts?.filter((a) => a.severity === 'warning') || [];

  return {
    // Data
    clinics,
    currentClinic,
    locations,
    stats,
    alerts,
    userRoles,

    // Loading states
    isLoading: loadingClinics || loadingClinic || loadingLocations || loadingStats,
    loadingClinics,
    loadingClinic,
    loadingLocations,
    loadingStats,
    loadingAlerts,

    // Errors
    error: clinicsError || clinicError || locationsError || statsError,

    // Helpers
    getActiveLocation,
    hasRole,
    canManageFinance,
    canManageOperations,
    canViewReports,
    criticalAlerts,
    warningAlerts,

    // Actions
    refetchStats,
    refetchAlerts,
    refresh: () => {
      queryClient.invalidateQueries({ queryKey: ['clinic-overview-stats'] });
      queryClient.invalidateQueries({ queryKey: ['clinic-alerts'] });
    },
  };
}

export function useClinicSelector() {
  const { clinics, userRoles } = useClinicOverview();

  const getClinicsByRole = (role: string) => {
    if (!clinics || !userRoles) return [];
    const clinicIds = userRoles
      .filter((ur) => ur.role === role)
      .map((ur) => ur.clinic_id);
    return clinics.filter((c) => clinicIds.includes(c.id));
  };

  const getOwnedClinics = () => getClinicsByRole('owner');
  const getManagedClinics = () => getClinicsByRole('manager');

  return {
    clinics,
    userRoles,
    getClinicsByRole,
    getOwnedClinics,
    getManagedClinics,
  };
}
