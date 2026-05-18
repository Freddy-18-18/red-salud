import type {
  CreateOrganizationLocationInput,
  OrganizationLocation,
  UpdateOrganizationLocationInput,
} from '@red-salud/types';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export async function listLocations(organizationId: string): Promise<OrganizationLocation[]> {
  const { data, error } = await supabase
    .from('organization_locations')
    .select('*')
    .eq('organization_id', organizationId)
    .order('is_main', { ascending: false })
    .order('name');
  if (error) throw error;
  return (data ?? []) as OrganizationLocation[];
}

export async function getLocation(id: string): Promise<OrganizationLocation | null> {
  const { data, error } = await supabase
    .from('organization_locations')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return (data as OrganizationLocation | null) ?? null;
}

export async function createLocation(input: CreateOrganizationLocationInput): Promise<OrganizationLocation> {
  if (input.is_main) {
    await supabase
      .from('organization_locations')
      .update({ is_main: false })
      .eq('organization_id', input.organization_id)
      .eq('is_main', true);
  }

  const { data, error } = await supabase
    .from('organization_locations')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as OrganizationLocation;
}

export async function updateLocation(
  id: string,
  input: UpdateOrganizationLocationInput,
): Promise<OrganizationLocation> {
  if (input.is_main) {
    const current = await getLocation(id);
    if (current && !current.is_main) {
      await supabase
        .from('organization_locations')
        .update({ is_main: false })
        .eq('organization_id', current.organization_id)
        .eq('is_main', true);
    }
  }

  const { data, error } = await supabase
    .from('organization_locations')
    .update(input)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as OrganizationLocation;
}

export async function deactivateLocation(id: string): Promise<void> {
  const { error } = await supabase
    .from('organization_locations')
    .update({ is_active: false })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteLocation(id: string): Promise<void> {
  const { error } = await supabase.from('organization_locations').delete().eq('id', id);
  if (error) throw error;
}
