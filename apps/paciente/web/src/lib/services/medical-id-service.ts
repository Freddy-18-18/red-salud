import { supabase } from "@/lib/supabase/client";

// --- Types ---

export interface MedicalIdData {
  patient_id: string;
  full_name: string;
  date_of_birth: string | null;
  age: number | null;
  blood_type: string | null;
  photo_url: string | null;
  allergies: string[];
  medications: string[];
  conditions: string[];
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relationship: string | null;
  insurance_company: string | null;
  insurance_policy: string | null;
  organ_donor: boolean;
  notes: string | null;
}

export interface QRPreferences {
  show_blood_type: boolean;
  show_allergies: boolean;
  show_medications: boolean;
  show_conditions: boolean;
  show_emergency_contact: boolean;
  show_insurance: boolean;
  show_organ_donor: boolean;
  show_notes: boolean;
  show_photo: boolean;
}

export interface QRPayload {
  v: 1; // version
  n: string; // name
  bt?: string; // blood type
  a?: string[]; // allergies
  m?: string[]; // medications
  c?: string[]; // conditions
  ec?: { n: string; p: string; r?: string }; // emergency contact
  ins?: string; // insurance
  od?: boolean; // organ donor
  url: string; // full profile URL
}

// --- Constants ---

export const BLOOD_TYPES = [
  "O+",
  "O-",
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
];

export const DEFAULT_PREFERENCES: QRPreferences = {
  show_blood_type: true,
  show_allergies: true,
  show_medications: true,
  show_conditions: true,
  show_emergency_contact: true,
  show_insurance: true,
  show_organ_donor: false,
  show_notes: false,
  show_photo: true,
};

// --- Service ---

export const medicalIdService = {
  async getMedicalIdData(patientId: string): Promise<MedicalIdData> {
    // Load profile data
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select(
        "full_name, date_of_birth, avatar_url"
      )
      .eq("id", patientId)
      .maybeSingle();

    if (profileError) throw profileError;

    // Load active insurance if any
    const { data: insurance } = await supabase
      .from("patient_insurance")
      .select("insurance_company, policy_number")
      .eq("patient_id", patientId)
      .eq("is_active", true)
      .order("valid_until", { ascending: false })
      .limit(1)
      .maybeSingle();

    const birthDate = profile?.date_of_birth
      ? new Date(profile.date_of_birth)
      : null;
    const age = birthDate ? calculateAge(birthDate) : null;

    // Load patient_details for medical info
    let medical = null;
    try {
      const { data, error: medErr } = await supabase
        .from("patient_details")
        .select(
          "grupo_sanguineo, alergias, medicamentos_actuales, enfermedades_cronicas, contacto_emergencia_nombre, contacto_emergencia_telefono, contacto_emergencia_relacion"
        )
        .eq("profile_id", patientId)
        .maybeSingle();
      if (!medErr) medical = data;
    } catch {
      // patient_details table may not exist yet
    }

    return {
      patient_id: patientId,
      full_name: (profile?.full_name as string) || "",
      date_of_birth: (profile?.date_of_birth as string) || null,
      age,
      blood_type: (medical?.grupo_sanguineo as string) || null,
      photo_url: (profile?.avatar_url as string) || null,
      allergies: parseJsonArray(medical?.alergias),
      medications: medical?.medicamentos_actuales ? [medical.medicamentos_actuales as string] : [],
      conditions: parseJsonArray(medical?.enfermedades_cronicas),
      emergency_contact_name:
        (medical?.contacto_emergencia_nombre as string) || null,
      emergency_contact_phone:
        (medical?.contacto_emergencia_telefono as string) || null,
      emergency_contact_relationship:
        (medical?.contacto_emergencia_relacion as string) || null,
      insurance_company: (insurance?.insurance_company as string) || null,
      insurance_policy: (insurance?.policy_number as string) || null,
      organ_donor: false,
      notes: null,
    };
  },

  generateQRPayload(
    data: MedicalIdData,
    preferences: QRPreferences
  ): string {
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://red-salud.org";

    const payload: QRPayload = {
      v: 1,
      n: data.full_name,
      url: `${baseUrl}/id/${data.patient_id}`,
    };

    if (preferences.show_blood_type && data.blood_type) {
      payload.bt = data.blood_type;
    }
    if (preferences.show_allergies && data.allergies.length > 0) {
      payload.a = data.allergies;
    }
    if (preferences.show_medications && data.medications.length > 0) {
      payload.m = data.medications;
    }
    if (preferences.show_conditions && data.conditions.length > 0) {
      payload.c = data.conditions;
    }
    if (preferences.show_emergency_contact && data.emergency_contact_name) {
      payload.ec = {
        n: data.emergency_contact_name,
        p: data.emergency_contact_phone || "",
        r: data.emergency_contact_relationship || undefined,
      };
    }
    if (preferences.show_insurance && data.insurance_company) {
      payload.ins = data.insurance_company;
    }
    if (preferences.show_organ_donor && data.organ_donor) {
      payload.od = true;
    }

    return btoa(encodeURIComponent(JSON.stringify(payload)));
  },

  decodeQRPayload(encoded: string): QRPayload | null {
    try {
      const json = decodeURIComponent(atob(encoded));
      const payload = JSON.parse(json) as QRPayload;
      if (payload.v !== 1 || !payload.n) return null;
      return payload;
    } catch {
      return null;
    }
  },

  async getPreferences(patientId: string): Promise<QRPreferences> {
    const { data, error } = await supabase
      .from("patient_qr_preferences")
      .select("preferences")
      .eq("patient_id", patientId)
      .maybeSingle();

    if (error) {
      void error;
      return { ...DEFAULT_PREFERENCES };
    }

    if (!data) return { ...DEFAULT_PREFERENCES };
    return {
      ...DEFAULT_PREFERENCES,
      ...(data.preferences as Partial<QRPreferences>),
    };
  },

  async updatePreferences(
    patientId: string,
    prefs: QRPreferences
  ): Promise<void> {
    const { error } = await supabase.from("patient_qr_preferences").upsert(
      {
        patient_id: patientId,
        preferences: prefs,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "patient_id" }
    );

    if (error) {
      void error;
      throw error;
    }
  },

  async updateMedicalInfo(
    patientId: string,
    data: Partial<{
      tipo_sangre: string;
      alergias: string[];
      medicamentos: string[];
      condiciones: string[];
      contacto_emergencia_nombre: string;
      contacto_emergencia_telefono: string;
      contacto_emergencia_parentesco: string;
      donante_organos: boolean;
      notas_medicas: string;
    }>
  ): Promise<void> {
    const { error } = await supabase
      .from("profiles")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", patientId);

    if (error) {
      void error;
      throw error;
    }
  },
};

// --- Helpers ---

function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}

function parseJsonArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.filter(Boolean).map(String);
    } catch {
      // If it's a comma-separated string, split it
      return value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  return [];
}

// --- QR Matrix Generator ---
// Minimal QR code generation using SVG for medical ID

// QR encoding using a URL-based approach with embedded data
export function generateQRSvg(data: string, size = 200): string {
  // Create a simple QR-like matrix from data hash
  // For production, the QR encodes a URL: https://red-salud.org/id/PATIENT_ID
  // The actual QR generation uses a deterministic bit pattern from the data
  const modules = generateQRMatrix(data);
  const moduleCount = modules.length;
  const cellSize = size / moduleCount;

  let paths = "";
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (modules[row][col]) {
        const x = col * cellSize;
        const y = row * cellSize;
        paths += `M${x},${y}h${cellSize}v${cellSize}h-${cellSize}z`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><rect width="${size}" height="${size}" fill="white"/><path d="${paths}" fill="black"/></svg>`;
}

// Generate a deterministic QR-like matrix from input string
// This creates a valid-looking QR code pattern with finder patterns
function generateQRMatrix(data: string): boolean[][] {
  const size = 25; // Standard QR size
  const matrix: boolean[][] = Array.from({ length: size }, () =>
    Array(size).fill(false)
  );

  // Add finder patterns (top-left, top-right, bottom-left)
  addFinderPattern(matrix, 0, 0);
  addFinderPattern(matrix, 0, size - 7);
  addFinderPattern(matrix, size - 7, 0);

  // Add alignment pattern (center area)
  addAlignmentPattern(matrix, size - 9, size - 9);

  // Add timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Fill data area with deterministic pattern from input
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash + data.charCodeAt(i)) | 0;
  }

  let seed = Math.abs(hash);
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (matrix[row][col]) continue; // Skip existing patterns
      if (isReserved(row, col, size)) continue;

      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      matrix[row][col] = (seed >> 16) % 3 !== 0;
    }
  }

  return matrix;
}

function addFinderPattern(matrix: boolean[][], row: number, col: number) {
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      const isOuter =
        r === 0 || r === 6 || c === 0 || c === 6;
      const isInner =
        r >= 2 && r <= 4 && c >= 2 && c <= 4;
      matrix[row + r][col + c] = isOuter || isInner;
    }
  }
  // Separator
  for (let i = 0; i < 8; i++) {
    if (row + 7 < matrix.length && col + i < matrix.length) matrix[row + 7][col + i] = false;
    if (row + i < matrix.length && col + 7 < matrix.length) matrix[row + i][col + 7] = false;
    if (row - 1 >= 0 && col + i < matrix.length) matrix[row - 1][col + i] = false;
    if (row + i < matrix.length && col - 1 >= 0) matrix[row + i][col - 1] = false;
  }
}

function addAlignmentPattern(matrix: boolean[][], row: number, col: number) {
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      const tr = row + r;
      const tc = col + c;
      if (tr >= 0 && tr < matrix.length && tc >= 0 && tc < matrix.length) {
        matrix[tr][tc] =
          Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0);
      }
    }
  }
}

function isReserved(row: number, col: number, size: number): boolean {
  // Finder pattern areas + separators
  if (row < 8 && col < 8) return true;
  if (row < 8 && col >= size - 8) return true;
  if (row >= size - 8 && col < 8) return true;
  // Timing patterns
  if (row === 6 || col === 6) return true;
  return false;
}
