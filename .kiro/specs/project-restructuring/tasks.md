# Implementation Plan - Project Restructuring

## Overview

This implementation plan breaks down the project restructuring into discrete, executable coding tasks. Each task builds incrementally on previous tasks and focuses on writing, modifying, or testing code. All context documents (requirements, design) are available during implementation.

---

## Phase 1: Preparation and Foundation

- [ ] 1. Create directory structure and shared types
  - Create all new subdirectories under `components/`, `lib/`, and `hooks/`
  - Create `lib/supabase/types/common.types.ts` with ServiceResponse, PaginationParams, PaginatedResponse interfaces
  - Create `lib/supabase/types/database.types.ts` for Supabase-specific types
  - Create `lib/supabase/types/api.types.ts` for API request/response types
  - Create `lib/utils/date-utils.ts` with date formatting utilities
  - Create `lib/utils/format-utils.ts` with string formatting utilities
  - _Requirements: 1.1, 3.1, 3.2, 3.3, 3.4, 3.5, 8.2_

- [ ] 2. Create validation schemas organization
  - Create `lib/validations/profile.ts` with profile-related Zod schemas
  - Create `lib/validations/medical.ts` with medical data Zod schemas
  - Move existing auth validations to ensure proper organization
  - _Requirements: 2.1, 2.2, 3.1, 8.1_

- [ ] 3. Create verification scripts
  - Write `scripts/verify-file-sizes.ts` to scan and report files >400 lines
  - Write `scripts/verify-imports.ts` to check for broken import paths
  - Write `scripts/verify-single-responsibility.ts` to analyze file responsibilities
  - _Requirements: 9.1, 9.2, 9.4, 10.1, 10.5_

---

## Phase 2: Component Refactoring - Medical Workspace

- [ ] 4. Decompose medical-workspace.tsx
- [ ] 4.1 Extract type definitions
  - Create `components/dashboard/medico/workspace/medical-workspace.types.ts`
  - Move all interfaces (MedicalWorkspaceProps, PatientInfo, HistorialItem, AIAnalysis, ICDResult)
  - Export all types for use in other files
  - _Requirements: 1.5, 2.1, 2.2, 7.4, 8.1, 8.2_

- [ ] 4.2 Extract business logic hook
  - Create `components/dashboard/medico/workspace/use-medical-workspace.ts`
  - Move all useState, useEffect, and business logic
  - Implement ICD search logic, AI analysis, autocomplete, clinical history fetching
  - Return state and handlers as hook interface
  - _Requirements: 1.2, 2.4, 7.3_

- [ ] 4.3 Create workspace header component
  - Create `components/dashboard/medico/workspace/workspace-header.tsx`
  - Implement patient information display, breadcrumbs, back/save/print buttons
  - Accept patient info and action handlers as props
  - Handle loading states for buttons
  - _Requirements: 1.1, 1.2, 2.1, 7.1, 7.2_

- [ ] 4.4 Create workspace toolbar component
  - Create `components/dashboard/medico/workspace/workspace-toolbar.tsx`
  - Implement tab switching (Estructurado/Libre/Plantillas)
  - Add AI analysis trigger button
  - Add template selection controls
  - Implement search functionality UI
  - _Requirements: 1.1, 1.2, 2.1, 7.1, 7.2_

- [ ] 4.5 Create workspace editor component
  - Create `components/dashboard/medico/workspace/workspace-editor.tsx`
  - Implement structured template editor integration
  - Implement free-form text editor
  - Integrate template marketplace
  - Implement ICD-11 search and selection UI
  - _Requirements: 1.1, 1.2, 2.1, 7.1, 7.2_

- [ ] 4.6 Create workspace preview component
  - Create `components/dashboard/medico/workspace/workspace-preview.tsx`
  - Implement clinical history display
  - Display AI analysis results
  - Show suggested diagnoses
  - Render historical records list
  - _Requirements: 1.1, 1.2, 2.1, 7.1, 7.2_

- [ ] 4.7 Refactor main medical-workspace orchestrator
  - Update `components/dashboard/medico/medical-workspace.tsx` to compose sub-components
  - Import and use workspace-header, workspace-toolbar, workspace-editor, workspace-preview
  - Use use-medical-workspace hook for state management
  - Remove all extracted code, keep only composition logic
  - Verify file is under 150 lines
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 7.5_

- [ ] 4.8 Update imports for medical-workspace
  - Search for all files importing from medical-workspace.tsx
  - Update import paths to new workspace directory structure
  - Verify no compilation errors
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

---

## Phase 3: Component Refactoring - Medical Tab

- [ ] 5. Consolidate and decompose medical tab
- [ ] 5.1 Extract medical tab type definitions
  - Create `components/dashboard/profile/tabs/medical/medical-tab.types.ts`
  - Define MedicalTabProps, MedicalHistory, Allergy, Medication, EmergencyContact interfaces
  - Export all types
  - _Requirements: 1.5, 2.1, 2.2, 8.1, 8.2_

- [ ] 5.2 Extract medical tab business logic hook
  - Create `components/dashboard/profile/tabs/medical/use-medical-tab.ts`
  - Implement form state management, API calls to Supabase, validation logic
  - Handle data fetching and updates for medical history, allergies, medications, emergency contacts
  - _Requirements: 1.2, 2.4, 7.3_

- [ ] 5.3 Create medical history section component
  - Create `components/dashboard/profile/tabs/medical/medical-history-section.tsx`
  - Implement chronic conditions input, previous surgeries, family medical history, medical notes
  - Accept data and handlers as props
  - _Requirements: 1.1, 1.2, 2.1, 7.1, 7.2_


- [ ] 5.4 Create allergies section component
  - Create `components/dashboard/profile/tabs/medical/allergies-section.tsx`
  - Implement allergy list display, add/remove allergies, severity selection, reaction descriptions
  - Accept allergies data and handlers as props
  - _Requirements: 1.1, 1.2, 2.1, 7.1, 7.2_

- [ ] 5.5 Create medications section component
  - Create `components/dashboard/profile/tabs/medical/medications-section.tsx`
  - Implement medication list, dosage information, frequency and schedule, add/remove medications
  - Accept medications data and handlers as props
  - _Requirements: 1.1, 1.2, 2.1, 7.1, 7.2_

- [ ] 5.6 Create emergency contacts section component
  - Create `components/dashboard/profile/tabs/medical/emergency-contacts-section.tsx`
  - Implement contact list, add/edit/remove contacts, contact validation, relationship types
  - Accept contacts data and handlers as props
  - _Requirements: 1.1, 1.2, 2.1, 7.1, 7.2_

- [ ] 5.7 Create consolidated medical tab orchestrator
  - Create new `components/dashboard/profile/tabs/medical/medical-tab.tsx` based on medical-tab-improved.tsx
  - Compose all section components (medical-history, allergies, medications, emergency-contacts)
  - Use use-medical-tab hook for state management
  - Implement save/cancel actions
  - Verify file is under 150 lines
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 4.2, 7.5_

- [ ] 5.8 Delete duplicate medical tab files
  - Delete `components/dashboard/profile/tabs/medical-tab.tsx` (old version)
  - Delete `components/dashboard/profile/tabs/medical-tab-new.tsx` (intermediate version)
  - Keep only the new consolidated version in medical/ subdirectory
  - _Requirements: 4.1, 4.3, 4.5_

- [ ] 5.9 Update imports for medical tab
  - Search for all files importing from old medical-tab files
  - Update import paths to `@/components/dashboard/profile/tabs/medical/medical-tab`
  - Verify no compilation errors
  - _Requirements: 4.4, 5.1, 5.2, 5.3, 5.4_

---

## Phase 4: Component Refactoring - Profile Tab

- [ ] 6. Decompose profile-tab.tsx
- [ ] 6.1 Extract profile tab type definitions
  - Create `components/dashboard/profile/tabs/common/profile-tab.types.ts`
  - Define ProfileTabProps, PersonalInfo, ContactInfo interfaces
  - Export all types
  - _Requirements: 1.5, 2.1, 2.2, 8.1, 8.2_

- [ ] 6.2 Extract profile tab business logic hook
  - Create `components/dashboard/profile/tabs/common/use-profile-tab.ts`
  - Implement profile data fetching, update operations, validation, photo upload handling
  - Return state and handlers
  - _Requirements: 1.2, 2.4, 7.3_

- [ ] 6.3 Create personal info section component
  - Create `components/dashboard/profile/tabs/common/personal-info-section.tsx`
  - Implement name, ID, date of birth, gender, blood type, profile photo upload fields
  - Accept data and handlers as props
  - _Requirements: 1.1, 1.2, 2.1, 7.1, 7.2_

- [ ] 6.4 Create contact info section component
  - Create `components/dashboard/profile/tabs/common/contact-info-section.tsx`
  - Implement email, phone, address fields, city/state selection
  - Accept data and handlers as props
  - _Requirements: 1.1, 1.2, 2.1, 7.1, 7.2_

- [ ] 6.5 Refactor profile tab orchestrator
  - Update `components/dashboard/profile/tabs/common/profile-tab.tsx` to compose sections
  - Use personal-info-section and contact-info-section components
  - Use use-profile-tab hook for state management
  - Implement save/cancel actions
  - Verify file is under 150 lines
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 7.5_

- [ ] 6.6 Update imports for profile tab
  - Search for all files importing from profile-tab.tsx
  - Update import paths to new common/ subdirectory
  - Verify no compilation errors
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

---

## Phase 5: Component Refactoring - Date Picker

- [ ] 7. Decompose date-picker.tsx
- [ ] 7.1 Extract date picker type definitions
  - Create `components/ui/forms/date-picker.types.ts`
  - Define DatePickerProps, DatePickerInputProps, DatePickerCalendarProps interfaces
  - Export all types
  - _Requirements: 1.5, 2.1, 2.2, 8.1, 8.2_

- [ ] 7.2 Create date picker input component
  - Create `components/ui/forms/date-picker-input.tsx`
  - Implement text input with icon, manual date entry, format validation, placeholder handling
  - Accept value and onChange as props
  - _Requirements: 1.1, 1.2, 2.1, 7.1, 7.2_

- [ ] 7.3 Create date picker calendar component
  - Create `components/ui/forms/date-picker-calendar.tsx`
  - Implement calendar grid display, date selection, month/year navigation, disabled dates handling
  - Accept value, onChange, and configuration props
  - _Requirements: 1.1, 1.2, 2.1, 7.1, 7.2_

- [ ] 7.4 Refactor date picker orchestrator
  - Update `components/ui/forms/date-picker.tsx` to compose input and calendar
  - Manage state for popup visibility and selected date
  - Handle value formatting and validation
  - Verify file is under 100 lines
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 7.5_

- [ ] 7.5 Move date picker to forms subdirectory
  - Move all date-picker files from `components/ui/` to `components/ui/forms/`
  - Update internal imports within date-picker files
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 7.6 Update imports for date picker
  - Search for all files importing from date-picker.tsx
  - Update import paths to `@/components/ui/forms/date-picker`
  - Verify no compilation errors
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

---

## Phase 6: Component Refactoring - Security Tab

- [ ] 8. Decompose security-tab-new.tsx
- [ ] 8.1 Extract security tab type definitions
  - Create `components/dashboard/profile/tabs/common/security-tab.types.ts`
  - Define SecurityTabProps, SessionInfo, TwoFactorStatus interfaces
  - Export all types
  - _Requirements: 1.5, 2.1, 2.2, 8.1, 8.2_

- [ ] 8.2 Extract security tab business logic hook
  - Create `components/dashboard/profile/tabs/common/use-security-tab.ts`
  - Implement password change API, 2FA setup/disable, session management, security event logging
  - Return state and handlers
  - _Requirements: 1.2, 2.4, 7.3_

- [ ] 8.3 Create password section component
  - Create `components/dashboard/profile/tabs/common/password-section.tsx`
  - Implement change password form, password strength indicator, validation rules display
  - Accept handlers as props
  - _Requirements: 1.1, 1.2, 2.1, 7.1, 7.2_

- [ ] 8.4 Create two-factor section component
  - Create `components/dashboard/profile/tabs/common/two-factor-section.tsx`
  - Implement enable/disable 2FA, QR code display, backup codes, verification
  - Accept 2FA status and handlers as props
  - _Requirements: 1.1, 1.2, 2.1, 7.1, 7.2_

- [ ] 8.5 Create sessions section component
  - Create `components/dashboard/profile/tabs/common/sessions-section.tsx`
  - Implement session list display, device information, revoke session action, current session indicator
  - Accept sessions data and handlers as props
  - _Requirements: 1.1, 1.2, 2.1, 7.1, 7.2_

- [ ] 8.6 Refactor security tab orchestrator
  - Update `components/dashboard/profile/tabs/common/security-tab.tsx` (rename from security-tab-new.tsx)
  - Compose password, two-factor, and sessions sections
  - Use use-security-tab hook for state management
  - Implement tab navigation and loading states
  - Verify file is under 100 lines
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 7.5_

- [ ] 8.7 Update imports for security tab
  - Search for all files importing from security-tab-new.tsx
  - Update import paths to `@/components/dashboard/profile/tabs/common/security-tab`
  - Verify no compilation errors
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

---

## Phase 7: Service Refactoring - Appointments

- [ ] 9. Decompose appointments service
- [ ] 9.1 Extract appointments type definitions
  - Create `lib/supabase/services/appointments/appointments-types.ts`
  - Define Appointment, AppointmentStatus, AppointmentFilters, CreateAppointmentInput interfaces
  - Export all types
  - _Requirements: 1.5, 2.1, 2.2, 2.5, 6.4, 8.1, 8.2_

- [ ] 9.2 Create appointments queries module
  - Create `lib/supabase/services/appointments/appointments-queries.ts`
  - Implement getAppointments, getAppointmentById, getAppointmentsByPatient, getAppointmentsByDoctor functions
  - All functions return ServiceResponse<T>
  - _Requirements: 1.1, 1.2, 2.1, 2.3, 6.1, 6.2_

- [ ] 9.3 Create appointments mutations module
  - Create `lib/supabase/services/appointments/appointments-mutations.ts`
  - Implement createAppointment, updateAppointment, deleteAppointment, cancelAppointment functions
  - All functions return ServiceResponse<T>
  - _Requirements: 1.1, 1.2, 2.1, 2.3, 6.1, 6.3_

- [ ] 9.4 Create appointments service orchestrator
  - Create `lib/supabase/services/appointments/appointments-service.ts`
  - Re-export all functions from queries and mutations modules
  - Create appointmentsService facade object for backward compatibility
  - Verify file is under 100 lines
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 6.5, 12.4_

- [ ] 9.5 Update imports for appointments service
  - Search for all files importing from appointments-service.ts
  - Update import paths to new appointments/ subdirectory
  - Verify no compilation errors
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

---

## Phase 8: Service Refactoring - Telemedicine

- [ ] 10. Decompose telemedicine service
- [ ] 10.1 Extract telemedicine type definitions
  - Create `lib/supabase/services/telemedicine/telemedicine-types.ts`
  - Define VideoSession, CallHistory, SessionStatus, CreateSessionInput interfaces
  - Export all types
  - _Requirements: 1.5, 2.1, 2.2, 2.5, 6.4, 8.1, 8.2_

- [ ] 10.2 Create telemedicine queries module
  - Create `lib/supabase/services/telemedicine/telemedicine-queries.ts`
  - Implement getSessions, getSessionById, getCallHistory functions
  - All functions return ServiceResponse<T>
  - _Requirements: 1.1, 1.2, 2.1, 2.3, 6.1, 6.2_

- [ ] 10.3 Create telemedicine mutations module
  - Create `lib/supabase/services/telemedicine/telemedicine-mutations.ts`
  - Implement createSession, updateSession, endSession, saveRecording functions
  - All functions return ServiceResponse<T>
  - _Requirements: 1.1, 1.2, 2.1, 2.3, 6.1, 6.3_

- [ ] 10.4 Create telemedicine service orchestrator
  - Create `lib/supabase/services/telemedicine/telemedicine-service.ts`
  - Re-export all functions from queries and mutations modules
  - Create telemedicineService facade object
  - Verify file is under 100 lines
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 6.5, 12.4_

- [ ] 10.5 Update imports for telemedicine service
  - Search for all files importing from telemedicine-service.ts
  - Update import paths to new telemedicine/ subdirectory
  - Verify no compilation errors
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

---

## Phase 9: Service Refactoring - Health Metrics

- [ ] 11. Decompose health-metrics service
- [ ] 11.1 Extract health metrics type definitions
  - Create `lib/supabase/services/health-metrics/health-metrics-types.ts`
  - Define VitalSigns, MetricHistory, AlertThreshold, CreateMetricInput interfaces
  - Export all types
  - _Requirements: 1.5, 2.1, 2.2, 2.5, 6.4, 8.1, 8.2_

- [ ] 11.2 Create health metrics queries module
  - Create `lib/supabase/services/health-metrics/health-metrics-queries.ts`
  - Implement getMetrics, getMetricHistory, getAlerts functions
  - All functions return ServiceResponse<T>
  - _Requirements: 1.1, 1.2, 2.1, 2.3, 6.1, 6.2_

- [ ] 11.3 Create health metrics mutations module
  - Create `lib/supabase/services/health-metrics/health-metrics-mutations.ts`
  - Implement createMetric, updateMetric, deleteMetric, setThreshold functions
  - All functions return ServiceResponse<T>
  - _Requirements: 1.1, 1.2, 2.1, 2.3, 6.1, 6.3_

- [ ] 11.4 Create health metrics service orchestrator
  - Create `lib/supabase/services/health-metrics/health-metrics-service.ts`
  - Re-export all functions from queries and mutations modules
  - Create healthMetricsService facade object
  - Verify file is under 100 lines
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 6.5, 12.4_

- [ ] 11.5 Update imports for health metrics service
  - Search for all files importing from health-metrics-service.ts
  - Update import paths to new health-metrics/ subdirectory
  - Verify no compilation errors
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

---

## Phase 10: Service Refactoring - Medications

- [ ] 12. Decompose medications service
- [ ] 12.1 Extract medications type definitions
  - Create `lib/supabase/services/medications/medications-types.ts`
  - Define Medication, Prescription, MedicationHistory, CreateMedicationInput interfaces
  - Export all types
  - _Requirements: 1.5, 2.1, 2.2, 2.5, 6.4, 8.1, 8.2_

- [ ] 12.2 Create medications queries module
  - Create `lib/supabase/services/medications/medications-queries.ts`
  - Implement getMedications, getMedicationById, getPrescriptions, getMedicationHistory functions
  - All functions return ServiceResponse<T>
  - _Requirements: 1.1, 1.2, 2.1, 2.3, 6.1, 6.2_

- [ ] 12.3 Create medications mutations module
  - Create `lib/supabase/services/medications/medications-mutations.ts`
  - Implement createMedication, updateMedication, deleteMedication, createPrescription functions
  - All functions return ServiceResponse<T>
  - _Requirements: 1.1, 1.2, 2.1, 2.3, 6.1, 6.3_

- [ ] 12.4 Create medications service orchestrator
  - Create `lib/supabase/services/medications/medications-service.ts`
  - Re-export all functions from queries and mutations modules
  - Create medicationsService facade object
  - Verify file is under 100 lines
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 6.5, 12.4_

- [ ] 12.5 Update imports for medications service
  - Search for all files importing from medications-service.ts
  - Update import paths to new medications/ subdirectory
  - Verify no compilation errors
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

---

## Phase 11: Service Refactoring - Doctors

- [ ] 13. Decompose doctors service
- [ ] 13.1 Extract doctors type definitions
  - Create `lib/supabase/services/doctors/doctors-types.ts`
  - Define DoctorProfile, VerificationStatus, Specialty, Schedule, CreateDoctorInput interfaces
  - Export all types
  - _Requirements: 1.5, 2.1, 2.2, 2.5, 6.4, 8.1, 8.2_

- [ ] 13.2 Create doctors queries module
  - Create `lib/supabase/services/doctors/doctors-queries.ts`
  - Implement getDoctors, getDoctorById, getDoctorsBySpecialty, getSchedule functions
  - All functions return ServiceResponse<T>
  - _Requirements: 1.1, 1.2, 2.1, 2.3, 6.1, 6.2_

- [ ] 13.3 Create doctors mutations module
  - Create `lib/supabase/services/doctors/doctors-mutations.ts`
  - Implement createDoctor, updateDoctor, updateVerificationStatus, updateSchedule functions
  - All functions return ServiceResponse<T>
  - _Requirements: 1.1, 1.2, 2.1, 2.3, 6.1, 6.3_

- [ ] 13.4 Create doctors service orchestrator
  - Create `lib/supabase/services/doctors/doctors-service.ts`
  - Re-export all functions from queries and mutations modules
  - Create doctorsService facade object
  - Verify file is under 100 lines
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 6.5, 12.4_

- [ ] 13.5 Update imports for doctors service
  - Search for all files importing from doctors-service.ts
  - Update import paths to new doctors/ subdirectory
  - Verify no compilation errors
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

---

## Phase 12: Service Refactoring - Messaging

- [ ] 14. Decompose messaging service
- [ ] 14.1 Extract messaging type definitions
  - Create `lib/supabase/services/messaging/messaging-types.ts`
  - Define Conversation, Message, UnreadCount, CreateMessageInput interfaces
  - Export all types
  - _Requirements: 1.5, 2.1, 2.2, 2.5, 6.4, 8.1, 8.2_

- [ ] 14.2 Create messaging queries module
  - Create `lib/supabase/services/messaging/messaging-queries.ts`
  - Implement getConversations, getMessages, getUnreadCount functions
  - All functions return ServiceResponse<T>
  - _Requirements: 1.1, 1.2, 2.1, 2.3, 6.1, 6.2_

- [ ] 14.3 Create messaging mutations module
  - Create `lib/supabase/services/messaging/messaging-mutations.ts`
  - Implement createConversation, sendMessage, markAsRead, deleteMessage functions
  - All functions return ServiceResponse<T>
  - _Requirements: 1.1, 1.2, 2.1, 2.3, 6.1, 6.3_

- [ ] 14.4 Create messaging service orchestrator
  - Create `lib/supabase/services/messaging/messaging-service.ts`
  - Re-export all functions from queries and mutations modules
  - Create messagingService facade object
  - Verify file is under 100 lines
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 6.5, 12.4_

- [ ] 14.5 Update imports for messaging service
  - Search for all files importing from messaging-service.ts
  - Update import paths to new messaging/ subdirectory
  - Verify no compilation errors
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

---

## Phase 13: Service Refactoring - Medical Records

- [ ] 15. Decompose medical-records service
- [ ] 15.1 Extract medical records type definitions
  - Create `lib/supabase/services/medical-records/medical-records-types.ts`
  - Define MedicalRecord, Document, RecordShare, CreateRecordInput interfaces
  - Export all types
  - _Requirements: 1.5, 2.1, 2.2, 2.5, 6.4, 8.1, 8.2_

- [ ] 15.2 Create medical records queries module
  - Create `lib/supabase/services/medical-records/medical-records-queries.ts`
  - Implement getRecords, getRecordById, getSharedRecords, getDocuments functions
  - All functions return ServiceResponse<T>
  - _Requirements: 1.1, 1.2, 2.1, 2.3, 6.1, 6.2_

- [ ] 15.3 Create medical records mutations module
  - Create `lib/supabase/services/medical-records/medical-records-mutations.ts`
  - Implement createRecord, updateRecord, deleteRecord, uploadDocument, shareRecord functions
  - All functions return ServiceResponse<T>
  - _Requirements: 1.1, 1.2, 2.1, 2.3, 6.1, 6.3_

- [ ] 15.4 Create medical records service orchestrator
  - Create `lib/supabase/services/medical-records/medical-records-service.ts`
  - Re-export all functions from queries and mutations modules
  - Create medicalRecordsService facade object
  - Verify file is under 100 lines
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 6.5, 12.4_

- [ ] 15.5 Update imports for medical records service
  - Search for all files importing from medical-records-service.ts
  - Update import paths to new medical-records/ subdirectory
  - Verify no compilation errors
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

---

## Phase 14: UI Components Organization

- [ ] 16. Organize UI components into subdirectories
- [ ] 16.1 Move form components
  - Move `components/ui/phone-input.tsx` to `components/ui/forms/`
  - Move `components/ui/custom-select.tsx` to `components/ui/forms/`
  - Move `components/ui/timezone-select.tsx` to `components/ui/forms/`
  - Update internal imports within moved files
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 16.2 Move feedback components
  - Move `components/ui/toast.tsx` to `components/ui/feedback/`
  - Move `components/ui/alert.tsx` to `components/ui/feedback/`
  - Move `components/ui/progress.tsx` to `components/ui/feedback/`
  - Update internal imports within moved files
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 16.3 Move data-display components
  - Move `components/ui/card.tsx` to `components/ui/data-display/`
  - Move `components/ui/table.tsx` to `components/ui/data-display/`
  - Move `components/ui/badge.tsx` to `components/ui/data-display/`
  - Move `components/ui/avatar.tsx` to `components/ui/data-display/`
  - Update internal imports within moved files
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 16.4 Move navigation components
  - Move `components/ui/tabs.tsx` to `components/ui/navigation/`
  - Move `components/ui/navigation-menu.tsx` to `components/ui/navigation/`
  - Move `components/ui/dropdown-menu.tsx` to `components/ui/navigation/`
  - Update internal imports within moved files
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 16.5 Move overlay components
  - Move `components/ui/dialog.tsx` to `components/ui/overlays/`
  - Move `components/ui/sheet.tsx` to `components/ui/overlays/`
  - Move `components/ui/popover.tsx` to `components/ui/overlays/`
  - Move `components/ui/tooltip.tsx` to `components/ui/overlays/`
  - Update internal imports within moved files
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 16.6 Move input components
  - Move remaining input components (button, input, textarea, checkbox, switch, select, label, calendar, command, scroll-area, separator, toggle, toggle-group, accordion) to `components/ui/inputs/`
  - Update internal imports within moved files
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 16.7 Update imports for all UI components
  - Search for all files importing from `components/ui/` (excluding subdirectories)
  - Update import paths to include appropriate subdirectory (forms, feedback, data-display, navigation, overlays, inputs)
  - Verify no compilation errors
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

---

## Phase 15: Consolidation and Cleanup

- [ ] 17. Remove duplicate and obsolete files
- [ ] 17.1 Delete old medical tab versions
  - Verify all imports updated to new medical tab location
  - Delete `components/dashboard/profile/tabs/medical-tab.tsx`
  - Delete `components/dashboard/profile/tabs/medical-tab-new.tsx`
  - _Requirements: 4.1, 4.3, 4.5_

- [ ] 17.2 Delete old date picker versions
  - Verify all imports updated to new date picker location
  - Delete any `components/ui/date-picker-old.tsx` or similar backup files
  - _Requirements: 4.1, 4.3, 4.5_

- [ ] 17.3 Delete old service files
  - Verify all imports updated to new service subdirectories
  - Delete old service files from `lib/supabase/services/` root (keep only subdirectories)
  - _Requirements: 4.1, 4.3, 4.5_

- [ ] 17.4 Search for and remove any backup files
  - Search for files with patterns: `*-old.*`, `*-backup.*`, `*-v1.*`, `*-v2.*`
  - Verify these are truly obsolete
  - Delete confirmed obsolete files
  - _Requirements: 4.1, 4.3, 4.5_

---

## Phase 16: Final Validation

- [ ] 18. Run comprehensive validation
- [ ] 18.1 Verify file size compliance
  - Run `scripts/verify-file-sizes.ts`
  - Verify zero files exceed 400 lines
  - Generate and review file size report
  - _Requirements: 1.1, 1.2, 1.4, 9.1, 10.5_

- [ ] 18.2 Verify import integrity
  - Run `scripts/verify-imports.ts`
  - Verify all import paths resolve correctly
  - Fix any broken imports found
  - _Requirements: 5.1, 5.2, 5.3, 9.2, 10.5_

- [ ] 18.3 Verify TypeScript compilation
  - Run `npm run build`
  - Verify zero TypeScript errors
  - Verify zero import resolution errors
  - Fix any compilation errors found
  - _Requirements: 8.3, 8.4, 9.1, 9.2, 9.3_

- [ ] 18.4 Generate restructuring report
  - Run reporting script to generate before/after metrics
  - Document files modified, created, deleted
  - Calculate average file size before/after
  - Count files over 400 lines before/after
  - Save report to `.kiro/specs/project-restructuring/restructuring-report.md`
  - _Requirements: 9.4, 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 18.5 Verify API endpoints
  - Test all API routes in `app/api/` still respond correctly
  - Verify environment variables still referenced correctly
  - Test external integrations (Supabase, Gemini AI, ICD-11)
  - _Requirements: 12.1, 12.2, 12.3, 12.5_

---

## Notes

- Each task should be completed fully before moving to the next
- Run `npm run build` after completing each phase to verify no compilation errors
- Commit changes after each completed phase with descriptive commit message
- If any task introduces errors, fix them before proceeding to the next task
- Optional tasks (marked with *) can be skipped if time is limited
- All file paths use forward slashes (/) for cross-platform compatibility
- Maintain existing code functionality - only reorganize, do not change business logic
