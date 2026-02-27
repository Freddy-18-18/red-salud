export const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export const calculateAge = (birthDate: string | null) => {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

export type RegisteredPatient = {
  id: string;
  patient_id: string;
  first_consultation_date: string | null;
  last_consultation_date: string | null;
  total_consultations: number;
  status: string;
  created_at?: string;
  patient: {
    id: string;
    nombre_completo: string;
    email: string;
    avatar_url: string | null;
    fecha_nacimiento: string | null;
    genero: string | null;
    telefono: string | null;
    cedula: string | null;
  };
};

export type OfflinePatient = {
  id: string;
  cedula: string;
  nombre_completo: string;
  fecha_nacimiento: string | null;
  genero: string | null;
  telefono: string | null;
  email: string | null;
  status: string;
  created_at: string;
  total_consultations?: number;
};

