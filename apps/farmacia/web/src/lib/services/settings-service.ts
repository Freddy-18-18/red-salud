import { createClient } from "@/lib/supabase/client";

// ============================================================================
// Types
// ============================================================================

export interface PharmacySettings {
  id: string;
  pharmacy_id: string;
  default_tax_rate: number;
  currency_display: "usd" | "bs" | "both";
  auto_update_exchange_rate: boolean;
  low_stock_threshold: number;
  expiry_warning_days: number;
  fiscal_printer_enabled: boolean;
  fiscal_printer_model: string | null;
  receipt_header: string | null;
  receipt_footer: string | null;
  delivery_enabled: boolean;
  loyalty_enabled: boolean;
}

export interface PharmacyDetails {
  id: string;
  name: string;
  rif: string;
  license_number: string | null;
  pharmacy_type: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  email: string | null;
  operating_hours: Record<string, { open: string; close: string } | null> | null;
}

export interface UpdateSettingsInput {
  default_tax_rate?: number;
  currency_display?: "usd" | "bs" | "both";
  auto_update_exchange_rate?: boolean;
  low_stock_threshold?: number;
  expiry_warning_days?: number;
  fiscal_printer_enabled?: boolean;
  fiscal_printer_model?: string;
  receipt_header?: string;
  receipt_footer?: string;
  delivery_enabled?: boolean;
  loyalty_enabled?: boolean;
}

// ============================================================================
// Settings Queries
// ============================================================================

export async function getPharmacySettings(
  pharmacyId: string
): Promise<PharmacySettings | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("pharmacy_settings")
    .select("*")
    .eq("pharmacy_id", pharmacyId)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching pharmacy settings:", error);
    return null;
  }

  return data;
}

export async function updatePharmacySettings(
  pharmacyId: string,
  updates: UpdateSettingsInput
): Promise<boolean> {
  const supabase = createClient();

  // Check if settings exist
  const { data: existing } = await supabase
    .from("pharmacy_settings")
    .select("id")
    .eq("pharmacy_id", pharmacyId)
    .limit(1)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("pharmacy_settings")
      .update(updates)
      .eq("pharmacy_id", pharmacyId);

    if (error) {
      console.error("Error updating pharmacy settings:", error);
      return false;
    }
  } else {
    const { error } = await supabase
      .from("pharmacy_settings")
      .insert({
        pharmacy_id: pharmacyId,
        ...updates,
      });

    if (error) {
      console.error("Error creating pharmacy settings:", error);
      return false;
    }
  }

  return true;
}

// ============================================================================
// Pharmacy Details (from pharmacy_details or pharmacies table)
// ============================================================================

export async function getPharmacyDetails(
  pharmacyId: string
): Promise<PharmacyDetails | null> {
  const supabase = createClient();

  // Try pharmacy_details first, fall back to pharmacies
  const { data, error } = await supabase
    .from("pharmacy_details")
    .select("*")
    .eq("id", pharmacyId)
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    // Fallback
    const { data: fallback } = await supabase
      .from("pharmacies")
      .select("*")
      .eq("id", pharmacyId)
      .limit(1)
      .maybeSingle();

    if (!fallback) return null;

    return {
      id: fallback.id,
      name: fallback.name || "",
      rif: fallback.rif || "",
      license_number: fallback.license_number || null,
      pharmacy_type: fallback.pharmacy_type || null,
      address: fallback.address || null,
      city: fallback.city || null,
      state: fallback.state || null,
      phone: fallback.phone || null,
      email: fallback.email || null,
      operating_hours: fallback.operating_hours || null,
    };
  }

  return {
    id: data.id,
    name: data.name || "",
    rif: data.rif || "",
    license_number: data.license_number || null,
    pharmacy_type: data.pharmacy_type || null,
    address: data.address || null,
    city: data.city || null,
    state: data.state || null,
    phone: data.phone || null,
    email: data.email || null,
    operating_hours: data.operating_hours || null,
  };
}

// ============================================================================
// Get current user's pharmacy_id
// ============================================================================

export async function getCurrentPharmacyId(): Promise<string | null> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Check pharmacy_staff for the user
  const { data: staff } = await supabase
    .from("pharmacy_staff")
    .select("pharmacy_id")
    .eq("profile_id", user.id)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (staff) return staff.pharmacy_id;

  // Fallback: check if user has pharmacy_id in profile metadata
  const meta = user.user_metadata;
  if (meta?.pharmacy_id) return meta.pharmacy_id as string;

  return null;
}
