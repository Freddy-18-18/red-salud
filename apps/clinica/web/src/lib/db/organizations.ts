/**
 * Organization data layer (client-side via Supabase + RLS).
 *
 * NO usa service_role. RLS hace el trabajo de aislamiento por tenant.
 */

import type {
  CreateOrganizationInput,
  ModuleCatalogEntry,
  Organization,
  OrganizationKPIs,
  OrganizationOverview,
  OrganizationType,
  UpdateOrganizationInput,
} from '@red-salud/types';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export async function listMyOrganizations(): Promise<Organization[]> {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Organization[];
}

export async function getOrganizationById(id: string): Promise<Organization | null> {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return (data as Organization | null) ?? null;
}

export async function getOrganizationBySlug(slug: string): Promise<Organization | null> {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return (data as Organization | null) ?? null;
}

export async function isSlugAvailable(slug: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();
  if (error && error.code !== 'PGRST116') throw error;
  return !data;
}

export async function createOrganizationRpc(input: CreateOrganizationInput): Promise<string> {
  const { data, error } = await supabase.rpc('create_organization', {
    p_name: input.name,
    p_slug: input.slug,
    p_type: input.type,
    p_primary_specialty: input.primary_specialty ?? null,
  });
  if (error) throw error;
  return data as string;
}

export async function updateOrganization(
  id: string,
  input: UpdateOrganizationInput,
): Promise<Organization> {
  const { data, error } = await supabase
    .from('organizations')
    .update(input)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Organization;
}

export async function completeOnboarding(id: string): Promise<void> {
  const { error } = await supabase
    .from('organizations')
    .update({
      onboarding_completed: true,
      onboarding_step: 100,
      status: 'active',
    })
    .eq('id', id);
  if (error) throw error;
}

export async function setOnboardingStep(id: string, step: number): Promise<void> {
  const { error } = await supabase
    .from('organizations')
    .update({ onboarding_step: step })
    .eq('id', id);
  if (error) throw error;
}

export async function getOrganizationOverview(id: string): Promise<OrganizationOverview | null> {
  const org = await getOrganizationById(id);
  if (!org) return null;

  const [locationsRes, modulesRes, membersRes, currentRoleRes] = await Promise.all([
    supabase
      .from('organization_locations')
      .select('*')
      .eq('organization_id', id)
      .order('is_main', { ascending: false })
      .order('name'),
    supabase
      .from('organization_modules')
      .select('*, catalog:module_catalog!module_key (*)')
      .eq('organization_id', id)
      .eq('is_enabled', true),
    supabase
      .from('organization_members')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', id)
      .eq('is_active', true),
    supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', id)
      .eq('is_active', true)
      .order('role')
      .limit(1)
      .maybeSingle(),
  ]);

  if (locationsRes.error) throw locationsRes.error;
  if (modulesRes.error) throw modulesRes.error;

  const moduleRows = (modulesRes.data ?? []) as Array<{ catalog: ModuleCatalogEntry | null }>;
  const enabledModules: ModuleCatalogEntry[] = moduleRows
    .map((row) => row.catalog)
    .filter((c): c is ModuleCatalogEntry => c !== null)
    .sort((a, b) => a.display_order - b.display_order);

  return {
    organization: org,
    locations: locationsRes.data ?? [],
    enabled_modules: enabledModules,
    member_count: membersRes.count ?? 0,
    current_user_role: (currentRoleRes.data?.role ?? 'viewer') as OrganizationOverview['current_user_role'],
  };
}

export async function getOrganizationKPIs(id: string): Promise<OrganizationKPIs> {
  const [locationsRes, membersRes, orgRes] = await Promise.all([
    supabase
      .from('organization_locations')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', id)
      .eq('is_active', true),
    supabase
      .from('organization_members')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', id)
      .eq('is_active', true),
    supabase
      .from('organizations')
      .select('trial_ends_at, plan')
      .eq('id', id)
      .single(),
  ]);

  let trialDaysRemaining: number | null = null;
  if (orgRes.data?.plan === 'trial' && orgRes.data?.trial_ends_at) {
    const ends = new Date(orgRes.data.trial_ends_at).getTime();
    const now = Date.now();
    trialDaysRemaining = Math.max(0, Math.ceil((ends - now) / (1000 * 60 * 60 * 24)));
  }

  return {
    organization_id: id,
    total_locations: locationsRes.count ?? 0,
    total_members: membersRes.count ?? 0,
    total_appointments_today: 0,
    total_revenue_today: 0,
    occupancy_rate: null,
    trial_days_remaining: trialDaysRemaining,
  };
}

export const ORGANIZATION_TYPE_OPTIONS: Array<{ value: OrganizationType; label: string }> = [
  { value: 'specialty_clinic', label: 'Clinica Especializada' },
  { value: 'multi_specialty_clinic', label: 'Clinica Multi-Especialidad' },
  { value: 'hospital_network', label: 'Red Hospitalaria' },
  { value: 'medical_center', label: 'Centro Medico' },
  { value: 'diagnostic_center', label: 'Centro de Diagnostico' },
  { value: 'rehabilitation_center', label: 'Centro de Rehabilitacion' },
];
