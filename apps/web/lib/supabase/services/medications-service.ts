// Re-export everything from the new modular structure
// This file is kept for backward compatibility
export * from "./medications";

// Legacy exports (deprecated - use named imports from "./medications" instead)
import {
  searchMedicationsCatalog as _searchMedicationsCatalog,
  getMedicationById as _getMedicationById,
  getPatientPrescriptions as _getPatientPrescriptions,
  getPrescription as _getPrescription,
  getPatientReminders as _getPatientReminders,
  getTodayIntakeLog as _getTodayIntakeLog,
  getAdherenceStats as _getAdherenceStats,
  getActiveMedicationsSummary as _getActiveMedicationsSummary,
  createPrescription as _createPrescription,
  markPrescriptionAsFilled as _markPrescriptionAsFilled,
  createReminder as _createReminder,
  updateReminder as _updateReminder,
  deactivateReminder as _deactivateReminder,
  recordMedicationIntake as _recordMedicationIntake,
} from "./medications";

export const searchMedicationsCatalog = _searchMedicationsCatalog;
export const getMedicationById = _getMedicationById;
export const getPatientPrescriptions = _getPatientPrescriptions;
export const getPrescription = _getPrescription;
export const getPatientReminders = _getPatientReminders;
export const getTodayIntakeLog = _getTodayIntakeLog;
export const getAdherenceStats = _getAdherenceStats;
export const getActiveMedicationsSummary = _getActiveMedicationsSummary;
export const createPrescription = _createPrescription;
export const markPrescriptionAsFilled = _markPrescriptionAsFilled;
export const createReminder = _createReminder;
export const updateReminder = _updateReminder;
export const deactivateReminder = _deactivateReminder;
export const recordMedicationIntake = _recordMedicationIntake;
