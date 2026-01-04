/**
 * Servicio principal para gestión de clínicas y sedes
 * 
 * Encapsula todas las operaciones CRUD sobre clinics y clinic_locations
 */

import { createClient } from '@/lib/supabase/client';
import type {
  Clinic,
  ClinicLocation,
  ClinicRoleAssignment,
  CreateClinicInput,
  CreateLocationInput,
  ClinicOverviewStats,
} from '@/lib/types/clinic.types';

const supabase = createClient();

/**
 * Obtiene todas las clínicas donde el usuario tiene rol activo
 */
export async function getUserClinics(): Promise<Clinic[]> {
  const { data, error } = await supabase
    .from('clinics')
    .select('*')
    .order('name');

  if (error) throw error;
  return data || [];
}

/**
 * Obtiene una clínica específica por ID
 */
export async function getClinicById(clinicId: string): Promise<Clinic | null> {
  const { data, error } = await supabase
    .from('clinics')
    .select('*')
    .eq('id', clinicId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Crea una nueva clínica
 */
export async function createClinic(input: CreateClinicInput): Promise<Clinic> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Usuario no autenticado');

  const { data, error } = await supabase
    .from('clinics')
    .insert({
      ...input,
      created_by: user.user.id,
    })
    .select()
    .single();

  if (error) throw error;

  // Asignar automáticamente rol de owner al creador
  await supabase.from('clinic_roles').insert({
    clinic_id: data.id,
    user_id: user.user.id,
    role: 'owner',
    granted_by: user.user.id,
  });

  return data;
}

/**
 * Actualiza una clínica existente
 */
export async function updateClinic(
  clinicId: string,
  updates: Partial<Clinic>
): Promise<Clinic> {
  const { data, error } = await supabase
    .from('clinics')
    .update(updates)
    .eq('id', clinicId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Obtiene todas las sedes de una clínica
 */
export async function getClinicLocations(clinicId: string): Promise<ClinicLocation[]> {
  const { data, error } = await supabase
    .from('clinic_locations')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('is_main', { ascending: false })
    .order('name');

  if (error) throw error;
  return data || [];
}

/**
 * Obtiene una sede específica por ID
 */
export async function getLocationById(locationId: string): Promise<ClinicLocation | null> {
  const { data, error } = await supabase
    .from('clinic_locations')
    .select('*')
    .eq('id', locationId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Crea una nueva sede para una clínica
 */
export async function createLocation(input: CreateLocationInput): Promise<ClinicLocation> {
  const { data, error } = await supabase
    .from('clinic_locations')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Actualiza una sede existente
 */
export async function updateLocation(
  locationId: string,
  updates: Partial<ClinicLocation>
): Promise<ClinicLocation> {
  const { data, error } = await supabase
    .from('clinic_locations')
    .update(updates)
    .eq('id', locationId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Obtiene los roles de un usuario en todas las clínicas
 */
export async function getUserClinicRoles(): Promise<ClinicRoleAssignment[]> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return [];

  const { data, error } = await supabase
    .from('clinic_roles')
    .select(`
      *,
      clinics:clinic_id (name, status),
      locations:location_id (name)
    `)
    .eq('user_id', user.user.id)
    .eq('status', 'active');

  if (error) throw error;
  return data || [];
}

/**
 * Obtiene los roles de una clínica específica
 */
export async function getClinicRoles(clinicId: string): Promise<ClinicRoleAssignment[]> {
  const { data, error } = await supabase
    .from('clinic_roles')
    .select(`
      *,
      user:user_id (email, raw_user_meta_data)
    `)
    .eq('clinic_id', clinicId)
    .order('role')
    .order('granted_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Asigna un rol a un usuario en una clínica
 */
export async function assignClinicRole(
  clinicId: string,
  userId: string,
  role: string,
  locationId?: string
): Promise<ClinicRoleAssignment> {
  const { data: currentUser } = await supabase.auth.getUser();
  if (!currentUser.user) throw new Error('Usuario no autenticado');

  const { data, error } = await supabase
    .from('clinic_roles')
    .insert({
      clinic_id: clinicId,
      user_id: userId,
      role,
      location_id: locationId,
      granted_by: currentUser.user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Revoca un rol de clínica
 */
export async function revokeClinicRole(roleId: string): Promise<void> {
  const { error } = await supabase
    .from('clinic_roles')
    .update({ status: 'revoked' })
    .eq('id', roleId);

  if (error) throw error;
}

/**
 * Obtiene estadísticas generales de una clínica (overview)
 */
export async function getClinicOverviewStats(
  clinicId: string,
  locationIds?: string[]
): Promise<ClinicOverviewStats> {
  const today = new Date().toISOString().split('T')[0];

  // Construir filtros de localización
  let locationFilter = supabase
    .from('clinic_locations')
    .select('id')
    .eq('clinic_id', clinicId);

  if (locationIds && locationIds.length > 0) {
    locationFilter = locationFilter.in('id', locationIds);
  }

  const { data: locations } = await locationFilter;
  const locationIdsList = locations?.map((l) => l.id) || [];

  // Métricas operacionales de hoy
  const { data: metrics } = await supabase
    .from('clinic_operational_metrics')
    .select('*')
    .in('location_id', locationIdsList)
    .eq('metric_date', today);

  // Claims activos
  const { count: activeClaims } = await supabase
    .from('rcm_claims')
    .select('*', { count: 'exact', head: true })
    .eq('clinic_id', clinicId)
    .in('status', ['submitted', 'in_review', 'approved']);

  // Pagos pendientes
  const { data: pendingClaims } = await supabase
    .from('rcm_claims')
    .select('total_amount, paid_amount')
    .eq('clinic_id', clinicId)
    .in('status', ['approved', 'partially_paid']);

  const pendingPayments = pendingClaims?.reduce(
    (sum, claim) => sum + (claim.total_amount - claim.paid_amount),
    0
  ) || 0;

  // Pacientes internacionales activos
  const { count: internationalPatients } = await supabase
    .from('international_patients')
    .select('*', { count: 'exact', head: true })
    .eq('clinic_id', clinicId)
    .in('status', ['confirmed', 'arrived', 'in_treatment']);

  // Recursos disponibles
  const { count: availableResources } = await supabase
    .from('clinic_resources')
    .select('*', { count: 'exact', head: true })
    .in('location_id', locationIdsList)
    .eq('status', 'available');

  const totalAppointments = metrics?.reduce((sum, m) => sum + m.total_appointments, 0) || 0;
  const totalRevenue = metrics?.reduce((sum, m) => sum + m.revenue_amount, 0) || 0;
  const avgOccupancy = metrics?.length
    ? metrics.reduce((sum, m) => sum + (m.occupancy_rate || 0), 0) / metrics.length
    : 0;

  // Obtener nombre de clínica
  const clinic = await getClinicById(clinicId);

  return {
    clinic_id: clinicId,
    clinic_name: clinic?.name || '',
    today_appointments: totalAppointments,
    today_revenue: totalRevenue,
    occupancy_rate: avgOccupancy,
    active_claims: activeClaims || 0,
    pending_payments: pendingPayments,
    international_patients: internationalPatients || 0,
    available_resources: availableResources || 0,
    alerts_count: 0, // TODO: implementar sistema de alertas
  };
}

/**
 * Verifica si el usuario tiene un rol específico en una clínica
 */
export async function hasClinicRole(
  clinicId: string,
  roles: string[]
): Promise<boolean> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return false;

  const { data, error } = await supabase
    .from('clinic_roles')
    .select('role')
    .eq('clinic_id', clinicId)
    .eq('user_id', user.user.id)
    .eq('status', 'active')
    .in('role', roles)
    .maybeSingle();

  if (error) return false;
  return !!data;
}
