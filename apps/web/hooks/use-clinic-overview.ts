/**
 * Hook para gestión del overview/panel principal de clínica
 * 
 * Orquesta datos de stats, alertas y métricas principales
 */

'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getUserClinics,
  getClinicById,
  getClinicLocations,
  getClinicOverviewStats,
  getUserClinicRoles,
} from '@/lib/supabase/services/clinics-service';
import { generateOperationalAlerts } from '@/lib/supabase/services/clinic-operations-service';
import type { ClinicAlert, ClinicLocation } from '@red-salud/types';

type UserClinicRole = {
  clinic_id: string;
  role: string;
};

type ClinicRow = {
  id: string;
  is_main?: boolean;
};

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

  // Obtener roles de clínicas
  const {
    data: userRoles,
    isLoading: loadingRoles,
  } = useQuery({
    queryKey: ['user-clinic-roles'],
    queryFn: getUserClinicRoles,
  });

  // Obtener roles del usuario
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
      return (locations as ClinicLocation[]).find((l: ClinicLocation) => l.id === locationId);
    }
    const locationList = locations as ClinicLocation[];
    return locationList.find((l: ClinicLocation) => !!l.is_main) || locationList[0];
  };

  const hasRole = (roles: string[]): boolean => {
    if (!userRoles || !clinicId) return false;
    return userRoles.some(
      (ur: UserClinicRole) => ur.clinic_id === clinicId && roles.includes(ur.role)
    );
  };

  const canManageFinance = () => hasRole(['owner', 'admin', 'finance']);
  const canManageOperations = () => hasRole(['owner', 'admin', 'manager', 'operations']);
  const canViewReports = () => hasRole(['owner', 'admin', 'finance', 'manager', 'auditor']);

  const criticalAlerts = ((alerts as ClinicAlert[] | undefined)?.filter((a) => a.severity === 'critical')) || [];
  const warningAlerts = ((alerts as ClinicAlert[] | undefined)?.filter((a) => a.severity === 'warning')) || [];

  return {
    // Data
    clinics,
    currentClinic,
    locations,
    stats,
    alerts,
    userRoles,

    // Loading states
    isLoading: loadingClinics || loadingClinic || loadingLocations || loadingStats || loadingRoles,
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
    const roleList = userRoles as UserClinicRole[];
    const clinicsList = clinics as ClinicRow[];
    const clinicIds = roleList
      .filter((ur: UserClinicRole) => ur.role === role)
      .map((ur: UserClinicRole) => ur.clinic_id);
    return clinicsList.filter((c: ClinicRow) => clinicIds.includes(c.id));
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
