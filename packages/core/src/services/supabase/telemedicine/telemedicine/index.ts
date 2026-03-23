// Export all types
export * from "./telemedicine.types";

// Export all queries
export {
  getPatientSessions,
  getDoctorSessions,
  getSession,
  getSessionParticipants,
  getSessionMessages,
  getPatientPrescriptions,
  getSessionPrescriptions,
  getWaitingRoomPatients,
  getPatientSessionStats,
} from "./telemedicine.queries";

// Export all mutations
export {
  createTelemedicineSession,
  updateSession,
  startSession,
  endSession,
  joinSession,
  leaveSession,
  sendMessage,
  markMessagesAsRead,
  createPrescription,
  enterWaitingRoom,
  admitPatient,
} from "./telemedicine.mutations";
