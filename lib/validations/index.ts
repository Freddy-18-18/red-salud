// Validation schemas index
// Centralized exports for all validation schemas

// Authentication validations
export {
  registerSchema,
  loginSchema,
  type RegisterFormData,
  type LoginFormData,
} from "./auth";

// Profile validations
export {
  profileSchema,
  doctorProfileSchema,
  emergencyContactSchema,
  cedulaValidationSchema,
  profileUpdateSchema,
  type ProfileFormData,
  type DoctorProfileFormData,
  type EmergencyContactFormData,
  type CedulaValidationData,
  type ProfileUpdateData,
} from "./profile";

// Medical data validations
export {
  allergySchema,
  medicationSchema,
  medicalHistorySchema,
  vitalSignsSchema,
  diagnosisSchema,
  medicalRecordSchema,
  laboratoryResultSchema,
  appointmentSchema,
  type AllergyFormData,
  type MedicationFormData,
  type MedicalHistoryFormData,
  type VitalSignsFormData,
  type DiagnosisFormData,
  type MedicalRecordFormData,
  type LaboratoryResultFormData,
  type AppointmentFormData,
} from "./medical";
