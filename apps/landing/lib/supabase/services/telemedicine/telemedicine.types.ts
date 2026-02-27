// Types for telemedicine service
export type {
  TelemedicineSession,
  TelemedicineParticipant,
  TelemedicineChatMessage,
  TelemedicineRecording,
  TelemedicinePrescription,
  WaitingRoomEntry,
  CreateSessionData,
  UpdateSessionData,
  CreatePrescriptionData,
  SendMessageData,
  JoinSessionData,
  SessionStats,
} from "../../types/telemedicine";

// Internal service response types
export interface TelemedicineServiceResponse<T> {
  success: boolean;
  data: T;
  error?: unknown;
}
