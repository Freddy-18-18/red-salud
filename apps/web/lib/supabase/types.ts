// Tipos compartidos para Supabase

export interface PatientProfile {
  // Datos básicos (profiles)
  id: string;
  email: string;
  nombre_completo: string;
  telefono?: string;
  cedula?: string;
  fecha_nacimiento?: string;
  direccion?: string;
  ciudad?: string;
  estado?: string;
  codigo_postal?: string;
  avatar_url?: string;

  // Datos médicos (patient_details)
  grupo_sanguineo?: string;
  alergias?: string[];
  contacto_emergencia_nombre?: string;
  contacto_emergencia_telefono?: string;
  contacto_emergencia_relacion?: string;
  enfermedades_cronicas?: string[];
  medicamentos_actuales?: string;
  cirugias_previas?: string;
}

export interface UserPreferences {
  language: string;
  timezone: string;
  dark_mode: boolean;
  desktop_notifications: boolean;
  sound_notifications: boolean;
  preferred_contact_method: string;
  newsletter_subscribed: boolean;
  promotions_subscribed: boolean;
  surveys_subscribed: boolean;
}

export interface PrivacySettings {
  profile_public: boolean;
  share_medical_history: boolean;
  show_profile_photo: boolean;
  share_location: boolean;
  anonymous_data_research: boolean;
  analytics_cookies: boolean;
}

export interface NotificationSettings {
  login_alerts: boolean;
  account_changes: boolean;
  appointment_reminders: boolean;
  lab_results: boolean;
  doctor_messages: boolean;
}
