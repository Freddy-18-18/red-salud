import { fetchJson, postJson } from "@/lib/utils/fetch";

// --- Types ---

export interface EmergencyProfileConfig {
  id: string;
  access_token: string;
  is_active: boolean;
  pin_code: string | null;
  share_blood_type: boolean;
  share_allergies: boolean;
  share_medications: boolean;
  share_conditions: boolean;
  share_emergency_contacts: boolean;
  share_insurance: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface EmergencyMedicalData {
  full_name: string | null;
  date_of_birth: string | null;
  avatar_url: string | null;
  blood_type: string | null;
  allergies: string[];
  medications: string[];
  conditions: string[];
  emergency_contacts: EmergencyContact[];
  insurance: EmergencyInsurance | null;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface EmergencyInsurance {
  company: string;
  policy_number: string;
}

export interface EmergencyProfileResponse {
  config: EmergencyProfileConfig | null;
  medical_data: EmergencyMedicalData;
}

export interface UpdateEmergencyProfileSettings {
  is_active?: boolean;
  pin_code?: string | null;
  share_blood_type?: boolean;
  share_allergies?: boolean;
  share_medications?: boolean;
  share_conditions?: boolean;
  share_emergency_contacts?: boolean;
  share_insurance?: boolean;
}

export interface PublicEmergencyProfile {
  full_name: string;
  age: number | null;
  blood_type?: string;
  allergies?: string[];
  medications?: string[];
  conditions?: string[];
  emergency_contacts?: EmergencyContact[];
  insurance?: EmergencyInsurance;
}

// --- Service Functions ---

/**
 * Get the authenticated patient's emergency profile configuration.
 */
export function getEmergencyProfile(): Promise<EmergencyProfileResponse> {
  return fetchJson<EmergencyProfileResponse>("/api/emergency-profile");
}

/**
 * Update (or create) the emergency profile settings.
 */
export function updateEmergencyProfile(
  settings: UpdateEmergencyProfileSettings,
): Promise<EmergencyProfileConfig> {
  return postJson<EmergencyProfileConfig>(
    "/api/emergency-profile",
    settings,
    "PUT",
  );
}

/**
 * Fetch a public emergency profile by access token (no auth needed).
 */
export function getPublicProfile(
  token: string,
): Promise<PublicEmergencyProfile> {
  return fetchJson<PublicEmergencyProfile>(
    `/api/emergency-profile/${encodeURIComponent(token)}`,
  );
}

/**
 * Generate the full URL for QR code generation.
 */
export function generateQRUrl(token: string): string {
  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://paciente.red-salud.org";
  return `${baseUrl}/emergencia/${token}`;
}
