import { createClient } from "@/lib/supabase/client";

// ============================================================================
// Types
// ============================================================================

export interface StaffMember {
  id: string;
  pharmacy_id: string;
  profile_id: string;
  role: StaffRole;
  schedule: WeekSchedule | null;
  hourly_rate_usd: number | null;
  is_active: boolean;
  hired_at: string;
  terminated_at: string | null;
  profile?: {
    full_name: string;
    email: string;
    phone: string | null;
    avatar_url: string | null;
  };
}

export type StaffRole =
  | "owner"
  | "manager"
  | "pharmacist"
  | "assistant"
  | "cashier"
  | "delivery";

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  owner: "Dueno",
  manager: "Gerente",
  pharmacist: "Farmaceutico",
  assistant: "Asistente",
  cashier: "Cajero",
  delivery: "Repartidor",
};

export const STAFF_ROLE_DESCRIPTIONS: Record<StaffRole, string> = {
  owner: "Acceso completo a todas las funciones",
  manager: "Casi acceso completo, no puede eliminar la farmacia",
  pharmacist: "Inventario, POS y recetas",
  assistant: "POS limitado y vista de inventario",
  cashier: "Solo punto de venta",
  delivery: "Solo entregas a domicilio",
};

export interface WeekSchedule {
  [day: string]: { start: string; end: string } | null;
}

export interface CreateStaffInput {
  pharmacy_id: string;
  profile_id: string;
  role: StaffRole;
  schedule?: WeekSchedule;
  hourly_rate_usd?: number;
}

export interface UpdateStaffInput {
  role?: StaffRole;
  schedule?: WeekSchedule;
  hourly_rate_usd?: number;
  is_active?: boolean;
}

// ============================================================================
// Queries
// ============================================================================

export async function getStaffMembers(
  pharmacyId: string
): Promise<StaffMember[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("pharmacy_staff")
    .select(
      "*, profiles:profile_id(full_name, email, phone, avatar_url)"
    )
    .eq("pharmacy_id", pharmacyId)
    .order("hired_at", { ascending: false });

  if (error) {
    console.error("Error fetching staff:", error);
    return [];
  }

  return (data || []).map((s) => ({
    ...s,
    profile: s.profiles as unknown as StaffMember["profile"],
  }));
}

export async function getStaffByRole(
  pharmacyId: string,
  role: StaffRole
): Promise<StaffMember[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("pharmacy_staff")
    .select(
      "*, profiles:profile_id(full_name, email, phone, avatar_url)"
    )
    .eq("pharmacy_id", pharmacyId)
    .eq("role", role)
    .eq("is_active", true);

  if (error) {
    console.error("Error fetching staff by role:", error);
    return [];
  }

  return (data || []).map((s) => ({
    ...s,
    profile: s.profiles as unknown as StaffMember["profile"],
  }));
}

// ============================================================================
// Search user by email (for adding new staff)
// ============================================================================

export async function searchUserByEmail(
  email: string
): Promise<{ id: string; full_name: string; email: string } | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .ilike("email", `%${email}%`)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error searching user:", error);
    return null;
  }

  return data;
}

// ============================================================================
// Mutations
// ============================================================================

export async function createStaffMember(
  input: CreateStaffInput
): Promise<StaffMember | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("pharmacy_staff")
    .insert({
      pharmacy_id: input.pharmacy_id,
      profile_id: input.profile_id,
      role: input.role,
      schedule: input.schedule || null,
      hourly_rate_usd: input.hourly_rate_usd || null,
      is_active: true,
      hired_at: new Date().toISOString(),
    })
    .select(
      "*, profiles:profile_id(full_name, email, phone, avatar_url)"
    )
    .single();

  if (error) {
    console.error("Error creating staff member:", error);
    return null;
  }

  return {
    ...data,
    profile: data.profiles as unknown as StaffMember["profile"],
  };
}

export async function updateStaffMember(
  staffId: string,
  updates: UpdateStaffInput
): Promise<boolean> {
  const supabase = createClient();

  const payload: Record<string, unknown> = {};
  if (updates.role !== undefined) payload.role = updates.role;
  if (updates.schedule !== undefined) payload.schedule = updates.schedule;
  if (updates.hourly_rate_usd !== undefined)
    payload.hourly_rate_usd = updates.hourly_rate_usd;
  if (updates.is_active !== undefined) {
    payload.is_active = updates.is_active;
    if (!updates.is_active) {
      payload.terminated_at = new Date().toISOString();
    }
  }

  const { error } = await supabase
    .from("pharmacy_staff")
    .update(payload)
    .eq("id", staffId);

  if (error) {
    console.error("Error updating staff member:", error);
    return false;
  }

  return true;
}
