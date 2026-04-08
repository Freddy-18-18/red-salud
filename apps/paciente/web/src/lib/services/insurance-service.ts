import { supabase } from "@/lib/supabase/client";
import { fetchJson } from "@/lib/utils/fetch";

// --- Types ---

export type CoverageType = "individual" | "familiar" | "colectivo";

export type PreauthorizationStatus =
  | "pending"
  | "approved"
  | "denied"
  | "expired";

export type ClaimStatus =
  | "draft"
  | "submitted"
  | "in_review"
  | "approved"
  | "partially_approved"
  | "denied"
  | "paid";

export type ClaimType =
  | "consulta"
  | "laboratorio"
  | "farmacia"
  | "hospitalizacion"
  | "emergencia"
  | "otro";

export interface CoverageDetails {
  consultas?: { limit?: number; copay?: number; covered_pct?: number };
  laboratorio?: { limit?: number; copay?: number; covered_pct?: number };
  farmacia?: { limit?: number; copay?: number; covered_pct?: number };
  emergencia?: { limit?: number; copay?: number; covered_pct?: number };
  hospitalizacion?: {
    limit?: number;
    copay?: number;
    covered_pct?: number;
    requires_preauth?: boolean;
  };
}

export interface PatientInsurance {
  id: string;
  patient_id: string;
  insurance_company: string;
  plan_name: string;
  policy_number: string;
  member_id: string;
  group_number: string | null;
  coverage_type: CoverageType;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  coverage_details: CoverageDetails;
  created_at: string;
  updated_at: string;
}

export interface InsurancePreauthorization {
  id: string;
  patient_id: string;
  insurance_id: string;
  appointment_id: string | null;
  procedure_code: string | null;
  procedure_description: string;
  estimated_cost: number;
  covered_amount: number;
  copay_amount: number;
  status: PreauthorizationStatus;
  authorization_number: string | null;
  created_at: string;
  updated_at: string;
  insurance?: PatientInsurance;
}

export interface InsuranceClaim {
  id: string;
  patient_id: string;
  insurance_id: string;
  appointment_id: string | null;
  claim_type: ClaimType;
  total_amount: number;
  covered_amount: number;
  patient_responsibility: number;
  status: ClaimStatus;
  claim_number: string | null;
  created_at: string;
  updated_at: string;
  insurance?: PatientInsurance;
}

export interface CreateInsuranceData {
  insurance_company: string;
  plan_name: string;
  policy_number: string;
  member_id: string;
  group_number?: string | null;
  coverage_type: CoverageType;
  valid_from: string;
  valid_until: string;
  coverage_details?: CoverageDetails;
}

export interface CreatePreauthorizationData {
  insurance_id: string;
  appointment_id?: string | null;
  procedure_code?: string | null;
  procedure_description: string;
  estimated_cost: number;
}

export interface CreateClaimData {
  insurance_id: string;
  appointment_id?: string | null;
  claim_type: ClaimType;
  total_amount: number;
}

// --- Constants ---

export const COVERAGE_TYPES: { value: CoverageType; label: string }[] = [
  { value: "individual", label: "Individual" },
  { value: "familiar", label: "Familiar" },
  { value: "colectivo", label: "Colectivo" },
];

export const CLAIM_TYPES: { value: ClaimType; label: string }[] = [
  { value: "consulta", label: "Consulta" },
  { value: "laboratorio", label: "Laboratorio" },
  { value: "farmacia", label: "Farmacia" },
  { value: "hospitalizacion", label: "Hospitalizacion" },
  { value: "emergencia", label: "Emergencia" },
  { value: "otro", label: "Otro" },
];

export const KNOWN_INSURANCE_COMPANIES = [
  "Seguros Horizonte",
  "Seguros Mercantil",
  "Seguros Caracas",
  "Mapfre La Seguridad",
  "Seguros Venezuela",
  "Seguros Catatumbo",
  "Seguros Altamira",
  "Seguros Qualitas",
  "Seguros La Previsora",
  "Seguros Constitución",
  "Seguros La Vitalicia",
  "Seguros Pirámide",
];

// --- Service ---

export const insuranceService = {
  // ---- Insurance Policies ----

  async getInsurances(patientId: string): Promise<PatientInsurance[]> {
    const { data, error } = await supabase
      .from("patient_insurance")
      .select("*")
      .eq("patient_id", patientId)
      .order("is_active", { ascending: false })
      .order("valid_until", { ascending: false });

    if (error) {
      console.error("Error fetching insurances:", error);
      throw error;
    }

    return (data ?? []).map(normalizeInsurance);
  },

  async getInsurance(id: string): Promise<PatientInsurance> {
    const { data, error } = await supabase
      .from("patient_insurance")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching insurance:", error);
      throw error;
    }

    return normalizeInsurance(data);
  },

  async addInsurance(
    patientId: string,
    payload: CreateInsuranceData
  ): Promise<PatientInsurance> {
    const { data, error } = await supabase
      .from("patient_insurance")
      .insert({
        patient_id: patientId,
        insurance_company: payload.insurance_company,
        plan_name: payload.plan_name,
        policy_number: payload.policy_number,
        member_id: payload.member_id,
        group_number: payload.group_number || null,
        coverage_type: payload.coverage_type,
        valid_from: payload.valid_from,
        valid_until: payload.valid_until,
        is_active: true,
        coverage_details: payload.coverage_details ?? {},
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding insurance:", error);
      throw error;
    }

    await supabase.from("user_activity_log").insert({
      user_id: patientId,
      activity_type: "insurance_added",
      description: `Seguro agregado: ${payload.insurance_company} - ${payload.plan_name}`,
      status: "success",
    });

    return normalizeInsurance(data);
  },

  async updateInsurance(
    id: string,
    payload: Partial<CreateInsuranceData> & { is_active?: boolean }
  ): Promise<PatientInsurance> {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (payload.insurance_company !== undefined)
      updateData.insurance_company = payload.insurance_company;
    if (payload.plan_name !== undefined)
      updateData.plan_name = payload.plan_name;
    if (payload.policy_number !== undefined)
      updateData.policy_number = payload.policy_number;
    if (payload.member_id !== undefined)
      updateData.member_id = payload.member_id;
    if (payload.group_number !== undefined)
      updateData.group_number = payload.group_number || null;
    if (payload.coverage_type !== undefined)
      updateData.coverage_type = payload.coverage_type;
    if (payload.valid_from !== undefined)
      updateData.valid_from = payload.valid_from;
    if (payload.valid_until !== undefined)
      updateData.valid_until = payload.valid_until;
    if (payload.coverage_details !== undefined)
      updateData.coverage_details = payload.coverage_details;
    if (payload.is_active !== undefined)
      updateData.is_active = payload.is_active;

    const { data, error } = await supabase
      .from("patient_insurance")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating insurance:", error);
      throw error;
    }

    return normalizeInsurance(data);
  },

  async deleteInsurance(id: string): Promise<void> {
    const { error } = await supabase
      .from("patient_insurance")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting insurance:", error);
      throw error;
    }
  },

  // ---- Preauthorizations ----

  async getPreauthorizations(
    patientId: string
  ): Promise<InsurancePreauthorization[]> {
    try {
      return await fetchJson<InsurancePreauthorization[]>(
        `/api/insurance/preauthorizations?patientId=${encodeURIComponent(patientId)}`
      );
    } catch (err) {
      console.error("Error fetching preauthorizations:", err);
      throw err;
    }
  },

  async createPreauthorization(
    patientId: string,
    payload: CreatePreauthorizationData
  ): Promise<InsurancePreauthorization> {
    try {
      return await fetchJson<InsurancePreauthorization>(
        "/api/insurance/preauthorizations",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patient_id: patientId,
            insurance_id: payload.insurance_id,
            appointment_id: payload.appointment_id || null,
            procedure_code: payload.procedure_code || null,
            procedure_description: payload.procedure_description,
            estimated_cost: payload.estimated_cost,
          }),
        }
      );
    } catch (err) {
      console.error("Error creating preauthorization:", err);
      throw err;
    }
  },

  // ---- Claims ----

  async getClaims(patientId: string): Promise<InsuranceClaim[]> {
    try {
      return await fetchJson<InsuranceClaim[]>(
        `/api/insurance/claims?patientId=${encodeURIComponent(patientId)}`
      );
    } catch (err) {
      console.error("Error fetching claims:", err);
      throw err;
    }
  },

  async createClaim(
    patientId: string,
    payload: CreateClaimData
  ): Promise<InsuranceClaim> {
    try {
      return await fetchJson<InsuranceClaim>("/api/insurance/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: patientId,
          insurance_id: payload.insurance_id,
          appointment_id: payload.appointment_id || null,
          claim_type: payload.claim_type,
          total_amount: payload.total_amount,
        }),
      });
    } catch (err) {
      console.error("Error creating claim:", err);
      throw err;
    }
  },

  async submitClaim(id: string): Promise<InsuranceClaim> {
    try {
      return await fetchJson<InsuranceClaim>(
        `/api/insurance/claims/${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "submitted" }),
        }
      );
    } catch (err) {
      console.error("Error submitting claim:", err);
      throw err;
    }
  },
};

// --- Normalizers ---

function normalizeInsurance(raw: Record<string, unknown>): PatientInsurance {
  return {
    id: raw.id as string,
    patient_id: raw.patient_id as string,
    insurance_company: raw.insurance_company as string,
    plan_name: raw.plan_name as string,
    policy_number: raw.policy_number as string,
    member_id: raw.member_id as string,
    group_number: (raw.group_number as string) ?? null,
    coverage_type: raw.coverage_type as CoverageType,
    valid_from: raw.valid_from as string,
    valid_until: raw.valid_until as string,
    is_active: raw.is_active as boolean,
    coverage_details: (raw.coverage_details as CoverageDetails) ?? {},
    created_at: raw.created_at as string,
    updated_at: raw.updated_at as string,
  };
}

// --- Helpers ---

export function formatCurrency(
  amount: number,
  currency: "bs" | "usd" = "bs"
): string {
  if (currency === "usd") {
    return `$${amount.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `Bs. ${amount.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function getPreauthorizationStatusConfig(status: PreauthorizationStatus) {
  const config: Record<
    PreauthorizationStatus,
    { label: string; bg: string; text: string }
  > = {
    pending: { label: "Pendiente", bg: "bg-amber-50", text: "text-amber-700" },
    approved: {
      label: "Aprobada",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
    },
    denied: { label: "Denegada", bg: "bg-red-50", text: "text-red-700" },
    expired: { label: "Expirada", bg: "bg-gray-100", text: "text-gray-600" },
  };
  return config[status] ?? config.pending;
}

export function getClaimStatusConfig(status: ClaimStatus) {
  const config: Record<
    ClaimStatus,
    { label: string; bg: string; text: string }
  > = {
    draft: { label: "Borrador", bg: "bg-gray-100", text: "text-gray-600" },
    submitted: {
      label: "Enviado",
      bg: "bg-amber-50",
      text: "text-amber-700",
    },
    in_review: {
      label: "En revision",
      bg: "bg-amber-50",
      text: "text-amber-700",
    },
    approved: {
      label: "Aprobado",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
    },
    partially_approved: {
      label: "Parcialmente aprobado",
      bg: "bg-blue-50",
      text: "text-blue-700",
    },
    denied: { label: "Denegado", bg: "bg-red-50", text: "text-red-700" },
    paid: { label: "Pagado", bg: "bg-blue-50", text: "text-blue-700" },
  };
  return config[status] ?? config.draft;
}

export function getClaimTypeLabel(type: ClaimType): string {
  return CLAIM_TYPES.find((t) => t.value === type)?.label ?? type;
}

export function getCoverageTypeLabel(type: CoverageType): string {
  return COVERAGE_TYPES.find((t) => t.value === type)?.label ?? type;
}

export function isInsuranceExpired(validUntil: string): boolean {
  return new Date(validUntil) < new Date();
}

export function isInsuranceExpiringSoon(
  validUntil: string,
  daysThreshold = 30
): boolean {
  const expiryDate = new Date(validUntil);
  const now = new Date();
  const diffMs = expiryDate.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays > 0 && diffDays <= daysThreshold;
}
