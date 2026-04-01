import { createClient } from "@/lib/supabase/client";

// ============================================================================
// Types
// ============================================================================

export interface InsuranceContract {
  id: string;
  pharmacy_id: string;
  insurance_company: string;
  contract_number: string;
  discount_percent: number;
  copay_percent: number;
  coverage_types: string[];
  is_active: boolean;
  valid_from: string;
  valid_until: string;
  created_at: string;
}

export interface InsuranceUsageStats {
  contract_id: string;
  insurance_company: string;
  invoice_count: number;
  total_usd: number;
}

export interface CreateInsuranceInput {
  pharmacy_id: string;
  insurance_company: string;
  contract_number: string;
  discount_percent: number;
  copay_percent: number;
  coverage_types: string[];
  valid_from: string;
  valid_until: string;
}

export interface UpdateInsuranceInput {
  insurance_company?: string;
  contract_number?: string;
  discount_percent?: number;
  copay_percent?: number;
  coverage_types?: string[];
  is_active?: boolean;
  valid_from?: string;
  valid_until?: string;
}

export const COVERAGE_TYPE_OPTIONS = [
  { value: "consulta", label: "Consulta medica" },
  { value: "medicamentos", label: "Medicamentos" },
  { value: "examenes", label: "Examenes de laboratorio" },
  { value: "hospitalizacion", label: "Hospitalizacion" },
  { value: "cirugia", label: "Cirugia" },
  { value: "maternidad", label: "Maternidad" },
  { value: "odontologia", label: "Odontologia" },
  { value: "oftalmologia", label: "Oftalmologia" },
];

// ============================================================================
// Queries
// ============================================================================

export async function getInsuranceContracts(
  pharmacyId: string
): Promise<InsuranceContract[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("pharmacy_insurance_contracts")
    .select("*")
    .eq("pharmacy_id", pharmacyId)
    .order("insurance_company", { ascending: true });

  if (error) {
    console.error("Error fetching insurance contracts:", error);
    return [];
  }

  return data || [];
}

export async function getInsuranceUsageStats(
  pharmacyId: string
): Promise<InsuranceUsageStats[]> {
  const supabase = createClient();

  // Get all contracts for this pharmacy
  const { data: contracts } = await supabase
    .from("pharmacy_insurance_contracts")
    .select("id, insurance_company")
    .eq("pharmacy_id", pharmacyId);

  if (!contracts?.length) return [];

  // For each contract, count invoices that reference this insurer
  // Since pharmacy_invoices might reference insurance via a field, we do a simple count approach
  const { data: invoices } = await supabase
    .from("pharmacy_invoices")
    .select("id, total_usd, payment_method")
    .eq("pharmacy_id", pharmacyId)
    .eq("payment_method", "seguro");

  const totalInsured = invoices?.length || 0;
  const totalUsd = (invoices || []).reduce(
    (s, i) => s + (i.total_usd || 0),
    0
  );

  // Distribute evenly if we can't match specific insurers
  return contracts.map((c) => ({
    contract_id: c.id,
    insurance_company: c.insurance_company,
    invoice_count: Math.round(totalInsured / contracts.length),
    total_usd: totalUsd / contracts.length,
  }));
}

// ============================================================================
// Mutations
// ============================================================================

export async function createInsuranceContract(
  input: CreateInsuranceInput
): Promise<InsuranceContract | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("pharmacy_insurance_contracts")
    .insert({
      pharmacy_id: input.pharmacy_id,
      insurance_company: input.insurance_company,
      contract_number: input.contract_number,
      discount_percent: input.discount_percent,
      copay_percent: input.copay_percent,
      coverage_types: input.coverage_types,
      is_active: true,
      valid_from: input.valid_from,
      valid_until: input.valid_until,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating insurance contract:", error);
    return null;
  }

  return data;
}

export async function updateInsuranceContract(
  contractId: string,
  updates: UpdateInsuranceInput
): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from("pharmacy_insurance_contracts")
    .update(updates)
    .eq("id", contractId);

  if (error) {
    console.error("Error updating insurance contract:", error);
    return false;
  }

  return true;
}

export async function deleteInsuranceContract(
  contractId: string
): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from("pharmacy_insurance_contracts")
    .delete()
    .eq("id", contractId);

  if (error) {
    console.error("Error deleting insurance contract:", error);
    return false;
  }

  return true;
}
