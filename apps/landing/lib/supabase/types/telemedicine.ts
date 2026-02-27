// Tipos para el sistema de telemedicina

export type SessionStatus = 'scheduled' | 'waiting' | 'active' | 'completed' | 'cancelled' | 'failed';
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';
export type ParticipantRole = 'patient' | 'doctor' | 'observer';
export type MessageType = 'text' | 'file' | 'system';
export type RecordingStatus = 'processing' | 'available' | 'expired' | 'deleted';
export type PrescriptionStatus = 'active' | 'used' | 'expired' | 'cancelled';
export type WaitingRoomStatus = 'waiting' | 'called' | 'admitted' | 'left';
export type Priority = 'low' | 'normal' | 'high' | 'urgent';
export type ConnectionQuality = 'excellent' | 'good' | 'fair' | 'poor';

export interface TelemedicineSession {
  id: string;
  appointment_id?: string;
  patient_id: string;
  doctor_id: string;
  session_token: string;
  room_name: string;
  status: SessionStatus;
  scheduled_start_time: string;
  actual_start_time?: string;
  end_time?: string;
  duration_minutes?: number;
  video_enabled: boolean;
  audio_enabled: boolean;
  screen_sharing_enabled: boolean;
  recording_enabled: boolean;
  connection_quality?: ConnectionQuality;
  session_notes?: string;
  technical_issues?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Datos relacionados
  patient?: {
    id: string;
    nombre_completo: string;
    email: string;
    avatar_url?: string;
  };
  doctor?: {
    id: string;
    nombre_completo: string;
    email: string;
    avatar_url?: string;
    specialty?: string;
  };
  appointment?: {
    id: string;
    appointment_date: string;
    appointment_time: string;
    reason?: string;
  };
}

export interface TelemedicineParticipant {
  id: string;
  session_id: string;
  user_id: string;
  role: ParticipantRole;
  connection_status: ConnectionStatus;
  joined_at?: string;
  left_at?: string;
  total_duration_minutes?: number;
  video_enabled: boolean;
  audio_enabled: boolean;
  screen_sharing: boolean;
  device_info: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface TelemedicineChatMessage {
  id: string;
  session_id: string;
  sender_id: string;
  message: string;
  message_type: MessageType;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  is_read: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  // Datos del remitente
  sender?: {
    id: string;
    nombre_completo: string;
    avatar_url?: string;
    role: ParticipantRole;
  };
}

export interface TelemedicineRecording {
  id: string;
  session_id: string;
  recording_url: string;
  file_size_mb?: number;
  duration_minutes?: number;
  status: RecordingStatus;
  is_available_to_patient: boolean;
  is_available_to_doctor: boolean;
  expires_at?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface TelemedicinePrescription {
  id: string;
  session_id: string;
  patient_id: string;
  doctor_id: string;
  prescription_number: string;
  diagnosis: string;
  medications: Medication[];
  instructions?: string;
  notes?: string;
  valid_from: string;
  valid_until?: string;
  status: PrescriptionStatus;
  digital_signature?: string;
  signed_at?: string;
  created_at: string;
  updated_at: string;
  // Datos relacionados
  doctor?: {
    id: string;
    nombre_completo: string;
    license_number?: string;
  };
}

export interface WaitingRoomEntry {
  id: string;
  session_id: string;
  patient_id: string;
  status: WaitingRoomStatus;
  entered_at: string;
  called_at?: string;
  admitted_at?: string;
  left_at?: string;
  wait_time_minutes?: number;
  reason_for_visit?: string;
  priority: Priority;
  created_at: string;
  updated_at: string;
  // Datos del paciente
  patient?: {
    id: string;
    nombre_completo: string;
    avatar_url?: string;
  };
}

// Tipos para crear nuevas entidades
export interface CreateSessionData {
  appointment_id?: string;
  doctor_id: string;
  scheduled_start_time: string;
  video_enabled?: boolean;
  audio_enabled?: boolean;
  recording_enabled?: boolean;
}

export interface UpdateSessionData {
  status?: SessionStatus;
  actual_start_time?: string;
  end_time?: string;
  connection_quality?: ConnectionQuality;
  session_notes?: string;
  technical_issues?: string;
}

export interface CreatePrescriptionData {
  session_id: string;
  diagnosis: string;
  medications: Medication[];
  instructions?: string;
  notes?: string;
  valid_until?: string;
}

export interface SendMessageData {
  session_id: string;
  message: string;
  message_type?: MessageType;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
}

export interface JoinSessionData {
  session_id: string;
  role: ParticipantRole;
  video_enabled?: boolean;
  audio_enabled?: boolean;
  device_info?: Record<string, unknown>;
}

// Tipos para estadísticas
export interface SessionStats {
  total_sessions: number;
  completed_sessions: number;
  cancelled_sessions: number;
  average_duration: number;
  total_duration: number;
}

export interface DoctorSessionStats extends SessionStats {
  doctor_id: string;
  doctor_name: string;
  patients_attended: number;
  prescriptions_issued: number;
}
