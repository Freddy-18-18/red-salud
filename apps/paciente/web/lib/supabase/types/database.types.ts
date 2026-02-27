/**
 * Database-specific types for Supabase
 * This file contains types that map to database tables and views
 */

/**
 * User role types matching the database enum
 */
export type UserRole = 'paciente' | 'doctor' | 'admin';

/**
 * Base timestamp fields present in most tables
 */
export interface TimestampFields {
  created_at: string;
  updated_at: string;
}

/**
 * User profile base fields
 */
export interface UserProfileBase extends TimestampFields {
  id: string;
  user_id: string;
  nombre_completo: string;
  cedula: string;
  fecha_nacimiento: string | null;
  genero: string | null;
  telefono: string | null;
  direccion: string | null;
  ciudad: string | null;
  estado: string | null;
  foto_perfil_url: string | null;
}

/**
 * Patient-specific profile fields
 */
export interface PatientProfile extends UserProfileBase {
  tipo_sangre: string | null;
  alergias: string[];
  condiciones_cronicas: string[];
  medicamentos_actuales: string[];
  contacto_emergencia_nombre: string | null;
  contacto_emergencia_telefono: string | null;
  contacto_emergencia_relacion: string | null;
}

/**
 * Doctor-specific profile fields
 */
export interface DoctorProfile extends UserProfileBase {
  especialidad: string | null;
  numero_licencia: string | null;
  anos_experiencia: number | null;
  institucion: string | null;
  biografia: string | null;
  verificado: boolean;
  estado_verificacion: 'pendiente' | 'verificado' | 'rechazado' | null;
  fecha_verificacion: string | null;
}

/**
 * Database query options
 */
export interface QueryOptions {
  select?: string;
  order?: { column: string; ascending?: boolean };
  limit?: number;
  offset?: number;
}

/**
 * Supabase error response
 */
export interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}
