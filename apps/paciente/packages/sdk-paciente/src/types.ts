export interface MedicalSpecialty {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  description?: string | null;
  category?: string;
  doctor_count?: number;
}
