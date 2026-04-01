import { createClient } from "@/lib/supabase/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Prescription {
  id: string;
  patient_id: string | null;
  doctor_id: string | null;
  medical_record_id: string | null;
  appointment_id: string | null;
  prescribed_at: string;
  expires_at: string | null;
  diagnosis: string | null;
  general_instructions: string | null;
  status: "pending" | "dispensed" | "cancelled";
  pharmacy_id: string | null;
  dispensed_at: string | null;
  notes: string | null;
  offline_patient_id: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  // joined
  patient?: { id: string; full_name: string; email: string | null } | null;
  doctor?: { id: string; full_name: string; email: string | null } | null;
}

export interface PrescriptionFilters {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getPharmacyId(): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Try pharmacy_staff first (employee)
  const { data: staff } = await supabase
    .from("pharmacy_staff")
    .select("pharmacy_id")
    .eq("profile_id", user.id)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (staff?.pharmacy_id) return staff.pharmacy_id;

  // Try pharmacy_details (owner)
  const { data: pharmacy } = await supabase
    .from("pharmacy_details")
    .select("id")
    .eq("profile_id", user.id)
    .limit(1)
    .maybeSingle();

  return pharmacy?.id ?? null;
}

// ---------------------------------------------------------------------------
// Fetch prescriptions
// ---------------------------------------------------------------------------

export async function fetchPrescriptions(
  filters: PrescriptionFilters = {}
): Promise<Prescription[]> {
  const supabase = createClient();
  const pharmacyId = await getPharmacyId();

  let query = supabase
    .from("prescriptions")
    .select(
      `
      *,
      patient:profiles!patient_id(id, full_name, email),
      doctor:profiles!doctor_id(id, full_name, email)
    `
    )
    .order("prescribed_at", { ascending: false });

  // Scope to this pharmacy if we have one
  if (pharmacyId) {
    query = query.eq("pharmacy_id", pharmacyId);
  }

  if (filters.status && filters.status !== "todas") {
    query = query.eq("status", filters.status);
  }

  if (filters.dateFrom) {
    query = query.gte("prescribed_at", filters.dateFrom);
  }

  if (filters.dateTo) {
    query = query.lte("prescribed_at", filters.dateTo);
  }

  if (filters.search) {
    query = query.or(
      `diagnosis.ilike.%${filters.search}%,general_instructions.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching prescriptions:", error);
    return [];
  }

  return (data || []) as unknown as Prescription[];
}

// ---------------------------------------------------------------------------
// Dispense prescription
// ---------------------------------------------------------------------------

export async function dispensePrescription(prescriptionId: string): Promise<boolean> {
  const supabase = createClient();

  const pharmacyId = await getPharmacyId();

  const { error } = await supabase
    .from("prescriptions")
    .update({
      status: "dispensed",
      dispensed_at: new Date().toISOString(),
      pharmacy_id: pharmacyId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", prescriptionId);

  if (error) {
    console.error("Error dispensing prescription:", error);
    return false;
  }

  return true;
}

// ---------------------------------------------------------------------------
// Cancel prescription
// ---------------------------------------------------------------------------

export async function cancelPrescription(prescriptionId: string): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from("prescriptions")
    .update({
      status: "cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", prescriptionId);

  if (error) {
    console.error("Error cancelling prescription:", error);
    return false;
  }

  return true;
}

// ---------------------------------------------------------------------------
// Get single prescription
// ---------------------------------------------------------------------------

export async function getPrescriptionById(
  id: string
): Promise<Prescription | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("prescriptions")
    .select(
      `
      *,
      patient:profiles!patient_id(id, full_name, email),
      doctor:profiles!doctor_id(id, full_name, email)
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching prescription:", error);
    return null;
  }

  return data as unknown as Prescription;
}
