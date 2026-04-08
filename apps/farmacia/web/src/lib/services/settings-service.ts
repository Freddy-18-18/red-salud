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
  sms_notifications_enabled: boolean;
  email_notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface PharmacyDetails {
  id: string;
  profile_id: string;
  business_name: string;
  pharmacy_license: string | null;
  pharmacy_type: string | null;
  office_hours: Record<string, { open: string; close: string } | null> | null;
  servicios: string[] | null;
  accepts_digital_prescriptions: boolean;
  rif: string | null;
  direccion: string | null;
  ciudad: string | null;
  estado: string | null;
  latitud: number | null;
  longitud: number | null;
  created_at: string;
  updated_at: string;
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
  sms_notifications_enabled?: boolean;
  email_notifications_enabled?: boolean;
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
// Pharmacy Details (from pharmacy_details table)
// ============================================================================

export async function getPharmacyDetails(
  pharmacyId: string
): Promise<PharmacyDetails | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("pharmacy_details")
    .select("*")
    .eq("id", pharmacyId)
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    profile_id: data.profile_id,
    business_name: data.business_name || "",
    pharmacy_license: data.pharmacy_license || null,
    pharmacy_type: data.pharmacy_type || null,
    office_hours: data.office_hours || null,
    servicios: data.servicios || null,
    accepts_digital_prescriptions: data.accepts_digital_prescriptions ?? false,
    rif: data.rif || null,
    direccion: data.direccion || null,
    ciudad: data.ciudad || null,
    estado: data.estado || null,
    latitud: data.latitud || null,
    longitud: data.longitud || null,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

// ============================================================================
// Update pharmacy details
// ============================================================================

export interface UpdatePharmacyDetailsInput {
  business_name?: string;
  pharmacy_license?: string;
  pharmacy_type?: string;
  rif?: string;
  direccion?: string;
  ciudad?: string;
  estado?: string;
  office_hours?: Record<string, { open: string; close: string } | null>;
}

export async function updatePharmacyDetails(
  pharmacyId: string,
  updates: UpdatePharmacyDetailsInput
): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from("pharmacy_details")
    .update(updates)
    .eq("id", pharmacyId);

  if (error) {
    console.error("Error updating pharmacy details:", error);
    return false;
  }

  return true;
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

  // Check pharmacy_staff for the user (employee)
  const { data: staff } = await supabase
    .from("pharmacy_staff")
    .select("pharmacy_id")
    .eq("profile_id", user.id)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (staff) return staff.pharmacy_id;

  // Check if user owns a pharmacy via pharmacy_details
  const { data: owned } = await supabase
    .from("pharmacy_details")
    .select("id")
    .eq("profile_id", user.id)
    .limit(1)
    .maybeSingle();

  if (owned) return owned.id;

  return null;
}
