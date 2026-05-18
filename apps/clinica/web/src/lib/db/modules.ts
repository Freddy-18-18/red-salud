import type {
  ModuleCatalogEntry,
  OrganizationModule,
  OrganizationModuleWithCatalog,
} from '@red-salud/types';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export async function listModuleCatalog(): Promise<ModuleCatalogEntry[]> {
  const { data, error } = await supabase
    .from('module_catalog')
    .select('*')
    .order('display_order');
  if (error) throw error;
  return (data ?? []) as ModuleCatalogEntry[];
}

export async function listOrganizationModules(
  organizationId: string,
): Promise<OrganizationModuleWithCatalog[]> {
  const { data, error } = await supabase
    .from('organization_modules')
    .select('*, catalog:module_catalog!module_key (*)')
    .eq('organization_id', organizationId);
  if (error) throw error;

  return (data ?? [])
    .filter((row: { catalog: ModuleCatalogEntry | null }) => row.catalog !== null)
    .sort(
      (
        a: { catalog: ModuleCatalogEntry },
        b: { catalog: ModuleCatalogEntry },
      ) => a.catalog.display_order - b.catalog.display_order,
    ) as OrganizationModuleWithCatalog[];
}

export async function listEnabledModules(
  organizationId: string,
): Promise<ModuleCatalogEntry[]> {
  const all = await listOrganizationModules(organizationId);
  return all.filter((m) => m.is_enabled).map((m) => m.catalog);
}

export async function setModuleEnabled(
  organizationId: string,
  moduleKey: string,
  enabled: boolean,
): Promise<OrganizationModule> {
  const { data: existing } = await supabase
    .from('organization_modules')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('module_key', moduleKey)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from('organization_modules')
      .update({ is_enabled: enabled })
      .eq('id', existing.id)
      .select()
      .single();
    if (error) throw error;
    return data as OrganizationModule;
  }

  const { data: userData } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('organization_modules')
    .insert({
      organization_id: organizationId,
      module_key: moduleKey,
      is_enabled: enabled,
      enabled_by: userData.user?.id,
    })
    .select()
    .single();
  if (error) throw error;
  return data as OrganizationModule;
}

export async function bulkEnableModules(
  organizationId: string,
  moduleKeys: string[],
): Promise<void> {
  if (moduleKeys.length === 0) return;
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id ?? null;

  const rows = moduleKeys.map((key) => ({
    organization_id: organizationId,
    module_key: key,
    is_enabled: true,
    enabled_by: userId,
  }));

  const { error } = await supabase
    .from('organization_modules')
    .upsert(rows, { onConflict: 'organization_id,module_key' });
  if (error) throw error;
}
