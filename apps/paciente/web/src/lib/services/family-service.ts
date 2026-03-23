import { supabase } from "@/lib/supabase/client";

// --- Types ---

export interface FamilyMember {
  id: string;
  owner_id: string;
  profile_id: string | null;
  relationship: string;
  full_name: string;
  date_of_birth: string | null;
  gender: string | null;
  blood_type: string | null;
  allergies: string[];
  chronic_conditions: string[];
  current_medications: Medication[];
  emergency_contact: EmergencyContact | null;
  national_id: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency?: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface CreateFamilyMember {
  full_name: string;
  relationship: string;
  date_of_birth?: string | null;
  gender?: string | null;
  blood_type?: string | null;
  allergies?: string[];
  chronic_conditions?: string[];
  current_medications?: Medication[];
  emergency_contact?: EmergencyContact | null;
  national_id?: string | null;
  avatar_url?: string | null;
}

// --- Constants ---

export const RELATIONSHIPS = [
  { value: "hijo", label: "Hijo" },
  { value: "hija", label: "Hija" },
  { value: "padre", label: "Padre" },
  { value: "madre", label: "Madre" },
  { value: "esposo", label: "Esposo" },
  { value: "esposa", label: "Esposa" },
  { value: "abuelo", label: "Abuelo" },
  { value: "abuela", label: "Abuela" },
  { value: "hermano", label: "Hermano" },
  { value: "hermana", label: "Hermana" },
  { value: "otro", label: "Otro" },
] as const;

export const BLOOD_TYPES = [
  "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-",
] as const;

export const GENDERS = [
  { value: "masculino", label: "Masculino" },
  { value: "femenino", label: "Femenino" },
  { value: "otro", label: "Otro" },
] as const;

export const COMMON_ALLERGIES = [
  "Penicilina",
  "Aspirina",
  "Ibuprofeno",
  "Sulfamidas",
  "Latex",
  "Polen",
  "Polvo",
  "Mariscos",
  "Mani",
  "Leche",
  "Huevo",
  "Gluten",
  "Soya",
  "Frutos secos",
  "Picadura de abeja",
  "Contraste yodado",
];

export const COMMON_CONDITIONS = [
  "Hipertension",
  "Diabetes Tipo 1",
  "Diabetes Tipo 2",
  "Asma",
  "Artritis",
  "Hipotiroidismo",
  "Hipertiroidismo",
  "Epilepsia",
  "Enfermedad cardiaca",
  "EPOC",
  "Insuficiencia renal",
  "Anemia",
  "Migranas",
  "Depresion",
  "Ansiedad",
  "Osteoporosis",
];

// --- Service ---

export const familyService = {
  async getMembers(ownerId: string): Promise<FamilyMember[]> {
    const { data, error } = await supabase
      .from("family_members")
      .select("*")
      .eq("owner_id", ownerId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching family members:", error);
      throw error;
    }

    return (data ?? []).map(normalizeMember);
  },

  async getMemberDetail(id: string): Promise<FamilyMember> {
    const { data, error } = await supabase
      .from("family_members")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching family member:", error);
      throw error;
    }

    return normalizeMember(data);
  },

  async addMember(ownerId: string, data: CreateFamilyMember): Promise<FamilyMember> {
    const insertData = {
      owner_id: ownerId,
      full_name: data.full_name,
      relationship: data.relationship,
      date_of_birth: data.date_of_birth || null,
      gender: data.gender || null,
      blood_type: data.blood_type || null,
      allergies: data.allergies ?? [],
      chronic_conditions: data.chronic_conditions ?? [],
      current_medications: data.current_medications ?? [],
      emergency_contact: data.emergency_contact ?? null,
      national_id: data.national_id || null,
      avatar_url: data.avatar_url || null,
    };

    const { data: member, error } = await supabase
      .from("family_members")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("Error adding family member:", error);
      throw error;
    }

    await supabase.from("user_activity_log").insert({
      user_id: ownerId,
      activity_type: "family_member_added",
      description: `Familiar agregado: ${data.full_name} (${data.relationship})`,
      status: "success",
    });

    return normalizeMember(member);
  },

  async updateMember(
    id: string,
    data: Partial<CreateFamilyMember>
  ): Promise<FamilyMember> {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (data.full_name !== undefined) updateData.full_name = data.full_name;
    if (data.relationship !== undefined) updateData.relationship = data.relationship;
    if (data.date_of_birth !== undefined) updateData.date_of_birth = data.date_of_birth || null;
    if (data.gender !== undefined) updateData.gender = data.gender || null;
    if (data.blood_type !== undefined) updateData.blood_type = data.blood_type || null;
    if (data.allergies !== undefined) updateData.allergies = data.allergies;
    if (data.chronic_conditions !== undefined) updateData.chronic_conditions = data.chronic_conditions;
    if (data.current_medications !== undefined) updateData.current_medications = data.current_medications;
    if (data.emergency_contact !== undefined) updateData.emergency_contact = data.emergency_contact;
    if (data.national_id !== undefined) updateData.national_id = data.national_id || null;
    if (data.avatar_url !== undefined) updateData.avatar_url = data.avatar_url || null;

    const { data: member, error } = await supabase
      .from("family_members")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating family member:", error);
      throw error;
    }

    return normalizeMember(member);
  },

  async removeMember(id: string): Promise<void> {
    const { error } = await supabase
      .from("family_members")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error removing family member:", error);
      throw error;
    }
  },

  async uploadAvatar(memberId: string, file: File): Promise<string> {
    const fileExt = file.name.split(".").pop();
    const filePath = `family-avatars/${memberId}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath);

    await supabase
      .from("family_members")
      .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
      .eq("id", memberId);

    return publicUrl;
  },
};

// --- Helpers ---

function normalizeMember(raw: Record<string, unknown>): FamilyMember {
  return {
    id: raw.id as string,
    owner_id: raw.owner_id as string,
    profile_id: (raw.profile_id as string) ?? null,
    relationship: raw.relationship as string,
    full_name: raw.full_name as string,
    date_of_birth: (raw.date_of_birth as string) ?? null,
    gender: (raw.gender as string) ?? null,
    blood_type: (raw.blood_type as string) ?? null,
    allergies: Array.isArray(raw.allergies) ? raw.allergies : [],
    chronic_conditions: Array.isArray(raw.chronic_conditions) ? raw.chronic_conditions : [],
    current_medications: Array.isArray(raw.current_medications) ? raw.current_medications : [],
    emergency_contact: raw.emergency_contact as EmergencyContact | null,
    national_id: (raw.national_id as string) ?? null,
    avatar_url: (raw.avatar_url as string) ?? null,
    created_at: raw.created_at as string,
    updated_at: raw.updated_at as string,
  };
}

// --- Age calculation ---

export function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function getRelationshipLabel(value: string): string {
  return RELATIONSHIPS.find((r) => r.value === value)?.label ?? value;
}
