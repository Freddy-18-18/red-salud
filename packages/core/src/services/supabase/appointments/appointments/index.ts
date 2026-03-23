// Export all types
export * from "./appointments.types";

// Export all queries
export {
  getMedicalSpecialties,
  getAvailableDoctors,
  getDoctorProfile,
  getDoctorSchedules,
  getAvailableTimeSlots,
  getPatientAppointments,
  getDoctorAppointments,
} from "./appointments.queries";

// Export all mutations
export {
  createAppointment,
  cancelAppointment,
  confirmAppointment,
  completeAppointment,
} from "./appointments.mutations";
