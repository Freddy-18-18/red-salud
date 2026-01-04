/**
 * Tipos para el sistema de secretarias médicas
 */

export interface SecretaryPermissions {
  can_view_agenda: boolean;
  can_create_appointments: boolean;
  can_edit_appointments: boolean;
  can_cancel_appointments: boolean;
  can_view_patients: boolean;
  can_register_patients: boolean;
  can_view_medical_records: boolean;
  can_send_messages: boolean;
  can_view_statistics: boolean;
}

export interface DoctorSecretaryRelation {
  id: string;
  doctor_id: string;
  secretary_id: string;
  permissions: SecretaryPermissions;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface DoctorSecretaryRelationshipView extends DoctorSecretaryRelation {
  doctor_name: string;
  doctor_email: string;
  secretary_name: string;
  secretary_email: string;
}

export interface SecretaryContext {
  currentDoctorId: string | null;
  availableDoctors: Array<{
    id: string;
    name: string;
    email: string;
    permissions: SecretaryPermissions;
    status: string;
  }>;
  permissions: SecretaryPermissions | null;
}

export const DEFAULT_SECRETARY_PERMISSIONS: SecretaryPermissions = {
  can_view_agenda: true,
  can_create_appointments: true,
  can_edit_appointments: true,
  can_cancel_appointments: true,
  can_view_patients: true,
  can_register_patients: true,
  can_view_medical_records: false,
  can_send_messages: true,
  can_view_statistics: false,
};
