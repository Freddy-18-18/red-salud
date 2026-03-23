// TODO: Implement patient profile hooks
// This is a stub to allow the app to compile.

import { useState } from 'react';

interface PatientProfile {
  id: string;
  nombre_completo?: string;
  email?: string;
  phone?: string;
  fecha_nacimiento?: string;
  cedula?: string;
  ciudad?: string;
  grupo_sanguineo?: string;
  alergias?: string[];
  enfermedades_cronicas?: string[];
  medicamentos_actuales?: string;
  cirugias_previas?: string;
  contacto_emergencia_nombre?: string;
  contacto_emergencia_telefono?: string;
  contacto_emergencia_relacion?: string;
  avatar_url?: string;
}

interface PatientDocument {
  id: string;
  name?: string;
  type?: string;
  document_name: string;
  document_type: string;
  document_url?: string;
  url?: string;
  created_at?: string;
}

export function usePatientProfile(userId: string | null | undefined) {
  const [profile] = useState<PatientProfile | null>(null);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  return { profile, loading, error };
}

export function usePatientDocuments(userId: string | null | undefined) {
  const [documents] = useState<PatientDocument[]>([]);
  const [loading] = useState(false);

  return { documents, loading };
}
