// Export all types
export * from "./medications.types";

// Export all queries
export {
  searchMedicationsCatalog,
  getMedicationById,
  getPatientPrescriptions,
  getDoctorPrescriptions,
  getPrescription,
  getPatientReminders,
  getTodayIntakeLog,
  getAdherenceStats,
  getActiveMedicationsSummary,
} from "./medications.queries";

// Export all mutations
export {
  createPrescription,
  markPrescriptionAsFilled,
  createReminder,
  updateReminder,
  deactivateReminder,
  recordMedicationIntake,
} from "./medications.mutations";

// Export template queries
export {
  getDoctorTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  useTemplate,
  deleteTemplate,
} from "./templates.queries";
