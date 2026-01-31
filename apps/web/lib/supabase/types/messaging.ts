// Tipos para el sistema de mensajería

export type ConversationStatus = 'active' | 'archived' | 'closed';

export interface Conversation {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_id?: string;
  subject?: string;
  status: ConversationStatus;
  last_message_at?: string;
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
  unread_count?: number;
  last_message?: Message;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  read_at?: string;
  attachment_url?: string;
  attachment_name?: string;
  attachment_type?: string;
  created_at: string;
  updated_at: string;
  // Datos del remitente
  sender?: {
    id: string;
    nombre_completo: string;
    avatar_url?: string;
    role: string;
  };
}

export interface CreateConversationData {
  doctor_id: string;
  appointment_id?: string;
  subject?: string;
  initial_message: string;
}

export interface SendMessageData {
  conversation_id: string;
  content: string;
  attachment_url?: string;
  attachment_name?: string;
  attachment_type?: string;
}
