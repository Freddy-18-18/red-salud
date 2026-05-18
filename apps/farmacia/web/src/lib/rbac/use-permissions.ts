"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { getCurrentPharmacyId } from "@/lib/services/settings-service";
import {
  type PharmacyPermissions,
  type Resource,
  EMPTY_PERMISSIONS,
  isAllowed,
  getScope,
  type Scope,
} from "./types";

// ============================================================================
// React Query hook — fetches the current user's permissions for their
// pharmacy via the Postgres RPC `pharmacy_get_user_permissions`.
// Cached 5 minutes; invalidated when role/permission changes elsewhere.
// ============================================================================

const PERMISSIONS_QUERY_KEY = ["pharmacy", "permissions"] as const;

async function fetchPermissions(): Promise<PharmacyPermissions> {
  const pharmacyId = await getCurrentPharmacyId();
  if (!pharmacyId) return EMPTY_PERMISSIONS;

  const supabase = createClient();
  const { data, error } = await supabase.rpc("pharmacy_get_user_permissions", {
    p_pharmacy_id: pharmacyId,
  });

  if (error || !data) {
    console.error("Failed to fetch pharmacy permissions:", error);
    return EMPTY_PERMISSIONS;
  }

  return data as PharmacyPermissions;
}

export function usePharmacyPermissions() {
  return useQuery({
    queryKey: PERMISSIONS_QUERY_KEY,
    queryFn: fetchPermissions,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

// ============================================================================
// Convenience hooks for the most common checks.
// ============================================================================

type ActionOf<R extends Resource> = keyof PharmacyPermissions["resources"][R];

export function useCan<R extends Resource>(
  resource: R,
  action: ActionOf<R>,
): boolean {
  const { data } = usePharmacyPermissions();
  if (!data) return false;
  const value = data.resources[resource]?.[action];
  return isAllowed(value);
}

export function useScopeFor<R extends Resource>(
  resource: R,
  action: ActionOf<R>,
): Scope {
  const { data } = usePharmacyPermissions();
  if (!data) return "none";
  const value = data.resources[resource]?.[action];
  return getScope(value);
}

export function useFieldHidden<
  R extends "products" | "invoices",
>(resource: R, field: string): boolean {
  const { data } = usePharmacyPermissions();
  if (!data) return false;
  const fields = (data.resources[resource] as { fields_hidden?: string[] })
    ?.fields_hidden;
  return Array.isArray(fields) && fields.includes(field);
}

// Section-level visibility: derived from any non-'none' resource action.
// Used by the sidebar to decide whether to show the link at all.
export function useCanSeeSection(section: string): boolean {
  const { data, isLoading } = usePharmacyPermissions();
  // Optimistic during load: show items, hide them only once we know permissions deny.
  // Avoids sidebar flicker on every navigation.
  if (isLoading || !data) return true;

  // Section -> primary resource(s) it represents
  const SECTION_RESOURCES: Record<string, Resource[]> = {
    dashboard: ["alerts"], // dashboard always visible if user has any access
    inventario: ["products", "batches"],
    caja: ["invoices", "cash_session"],
    recetas: ["prescriptions"],
    entregas: ["deliveries"],
    proveedores: ["suppliers"],
    pedidos: ["purchase_orders"],
    alertas: ["alerts"],
    caducidades: ["batches"],
    fidelizacion: ["loyalty_members"],
    reportes: ["reports"],
    ventas: ["invoices"],
    precios: ["products"],
    personal: ["staff"],
    seguros: ["insurance"],
    configuracion: ["settings"],
  };

  // Dashboard short-circuit: visible if ANY resource has any non-none access
  if (section === "dashboard") {
    return Object.values(data.resources).some((r) => {
      const view = (r as { view?: string }).view;
      return view !== undefined && view !== "none";
    });
  }

  const resources = SECTION_RESOURCES[section];
  if (!resources) return true; // unknown section = visible by default

  return resources.some((res) => {
    const r = data.resources[res] as { view?: string } | undefined;
    return r?.view !== undefined && r.view !== "none";
  });
}
