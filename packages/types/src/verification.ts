// ============================================
// TYPES: Sistema de Verificación Multi-Nivel
// Fecha: 2026-02-14
// ============================================

// File type for web environment

/**
 * Niveles de verificación profesional
 */
export type VerificationLevel =
  | 'sacs_verified'        // Verificado por SACS (solo médicos)
  | 'manual_verified'      // Verificación manual por admin
  | 'supervisor_verified'  // Verificado por supervisor del área
  | 'doctor_delegated'     // Delegado por médico responsable
  | 'pending'              // Pendiente de verificación
  | 'rejected'             // Rechazado

/**
 * Estados de verificación
 */
export type VerificationStatus =
  | 'pending'       // Pendiente
  | 'approved'      // Aprobado
  | 'rejected'      // Rechazado
  | 'expired'       // Expirado
  | 'under_review'  // En revisión

/**
 * Roles principales del sistema (Dashboard Médico/Clínico SOLAMENTE)
 *
 * NO INCLUYE: farmacia, admin, secretaria, paciente, ambulancia, seguro, laboratorio, clínica
 * (Esos tienen sus propios dashboards y sistemas de autenticación)
 */
export type MainRoleType =
  | 'medico'             // Médico verificado por SACS
  | 'profesional_salud'  // Enfermeros, nutricionistas, psicólogos, etc.
  | 'tecnico_salud'      // Técnicos radiológicos, asistentes médicos, etc.

/**
 * Subtipos de profesionales de salud (Dashboard Médico)
 */
export type ProfesionalSaludSubtype =
  | 'enfermero'
  | 'enfermero_jefe'
  | 'nutricionista'
  | 'nutricionista_clinico'
  | 'psicologo'
  | 'psicologo_clinico'
  | 'fisioterapeuta'
  | 'terapeuta_ocupacional'
  | 'terapeuta_respiratorio'
  | 'fonoaudiologo'
  | 'asistente_medico'
  | 'otro'

/**
 * Subtipos de técnicos de salud (Dashboard Médico)
 */
export type TecnicoSaludSubtype =
  | 'tecnico_radiologo'
  | 'tecnico_radiologia'
  | 'tecnico_electrocardiografia'
  | 'tecnico_ecografia'
  | 'tecnico_quirofano'
  | 'tecnico_esterilizacion'
  | 'tecnico_laboratorio_clinico'
  | 'tecnico_hemodinamia'
  | 'tecnico_emergencias'
  | 'otro'

/**
 * Unidad organizativa principal
 */
export type DepartmentType =
  | 'urgencias'
  | 'hospitalizacion'
  | 'cuidado_intensivo'
  | 'quirurgico'
  | 'pediatria'
  | 'ginecologia'
  | 'obstetricia'
  | 'odontologia'
  | 'cardiologia'
  | 'radiologia'
  | 'laboratorio'
  | 'fisioterapia'
  | 'farmacia'
  | 'administracion'
  | 'consultas_externas'
  | 'trauma'
  | 'neonatologia'
  | 'rehabilitacion'
  | 'diagnostico_imagen'
  | 'hemodialisis'
  | 'oncologia'
  | 'endocrinologia'
  | 'gastroenterologia'
  | 'neurologia'
  | 'psiquiatria'
  | 'otorrinolaringologia'
  | 'oftalmologia'
  | 'dermatologia'
  | 'urologia'
  | 'otorrinolaringologia'
  | 'medicina_interna'
  | 'medicina_familiar'
  | 'medicina_emergencia'
  | 'medicina_trauma'
  | 'medicina_pediatria'
  | 'medicina_neonatal'
  | 'medicina_renal'
  | 'medicina_transplante'
  | 'medicina_nuclear'
  | 'radioterapia'
  | 'oncologia_medica'
  | 'oncologia_radioterapia'
  | 'oncologia_quimioterapia'
  | 'oncologia_hematologia'
  | 'oncologia_pediatria'
  | 'cancerologia'
  | 'hematologia'
  | 'inmunologia'
  | 'genetica_medica'
  | 'medicina_genomica'
  | 'biologia_molecular'
  | 'microbiologia'
  | 'parasitologia'
  | 'virologia'
  | 'bacteriologia'
  | 'epidemiologia'
  | 'salud_publica'
  | 'medicina_preventiva'
  | 'medicina_del_trabajo'
  | 'medicina_legal'
  | 'medicina_aeronautica'
  | 'medicina_nautica'
  | 'medicina_deporte'
  | 'medicina_antienvejecimiento'
  | 'medicina_estetica'
  | 'medicina_nuclear'
  | 'medicina_familiar_comunitaria'
  | 'medicina_comunitaria'
  | 'medicina_atencion_primaria'
  | 'medicina_continuidad'
  | 'medicina_cruceros'
  | 'medicina_seguridad'
  | 'medicina_penitenciaria'
  | 'medicina_militar'
  | 'medicina_disaster'
  | 'medicina_humanitaria'
  | 'medicina_cooperacion'
  | 'medicina_desarrollo'
  | 'medicina_internacional'
  | 'medicina_global'
  | 'medicina_viajes'
  | 'medicina_tropical'
  | 'medicina_montana'
  | 'medicina_extremos'
  | 'medicina_espacial'
  | 'medicina_submarina'
  | 'medicina_buceo'
  | 'medicina_aviacion'
  | 'medicina_deportiva'
  | 'medicina_fitness'
  | 'medicina_nutricion'
  | 'medicina_alimentacion'
  | 'medicina_genetica'
  | 'medicina_reproductiva'
  | 'medicina_fertilidad'
  | 'medicina_reproduccion_asistida'
  | 'medicina_feto'
  | 'medicina_perinatal'
  | 'medicina_neonatal'
  | 'medicina_pediatria'
  | 'medicina_adolescente'
  | 'medicina_juvenil'
  | 'medicina_adulto'
  | 'medicina_geriatria'
  | 'medicina_anciano'
  | 'medicina_paliativa'
  | 'medicina_dolor'
  | 'medicina_paliativa'
  | 'medicina_terminal'
  | 'medicina_cuidados'
  | 'medicina_paliativa'
  | 'medicina_hospice'
  | 'medicina_domicilio'
  | 'medicina_comunitaria'
  | 'medicina_familiar'
  | 'medicina_general'
  | 'medicina_practica'
  | 'medicina_clinica'
  | 'medicina_asistencial'
  | 'medicina_hospitalaria'
  | 'medicina_ambulatoria'
  | 'medicina_consulta'
  | 'medicina_externa'
  | 'medicina_ambulatoria'
  | 'medicina_dia'
  | 'medicina_corta_estadia'
  | 'medicina_observacion'
  | 'medicina_urgencias'
  | 'medicina_emergencia'
  | 'medicina_trauma'
  | 'medicina_desastre'
  | 'medicina_catstrofe'
  | 'medicina_masa'
  | 'medicina_colectiva'
  | 'medicina_comunitaria'
  | 'medicina_publica'
  | 'medicina_prevencion'
  | 'medicina_promocion'
  | 'medicina_proteccion'
  | 'medicina_seguridad'
  | 'medicina_defensa'
  | 'medicina_interna'
  | 'medicina_cirugia'
  | 'medicina_especialidades'
  | 'medicina_subespecialidades'
  | 'medicina_superespecialidades'
  | 'medicina_complementarias'
  | 'medicina_alternativas'
  | 'medicana_tradicional'
  | 'medicina_china'
  | 'medicina_oriental'
  | 'medicina_india'
  | 'medicina_arabe'
  | 'medicina_islamica'
  | 'medicina_europea'
  | 'medicina_occidental'
  | 'medicina_moderna'
  | 'medicina_contemporanea'
  | 'medicina_actual'
  | 'medicina_futura'
  | 'medicina_innovadora'
  | 'medicina_vanguardia'
  | 'medicina_avanzada'
  | 'medicina_cutting_edge'
  | 'medicina_frontera'
  | 'medicina_pionera'
  | 'medicina_novedosa'
  | 'medicina_experimental'
  | 'medicina_investigacion'
  | 'medicina_estudio'
  | 'medicina_ciencia'
  | 'medicina_base'
  | 'medicina_fundamental'
  | 'medicina_basica'
  | 'medicina_esencial'
  | 'medicina_primaria'
  | 'medienia_necesaria'
  | 'medicina_imprescindible'
  | 'medicina_critica'
  | 'medencia_emergencial'
  | 'medencia_vida'
  | 'medicina_sustancial'
  | 'medencia_relevante'
  | 'medencia_importante'
  | 'medencia_significativa'
  | 'medencia_consecuente'
  | 'medencia_efectiva'
  | 'medencia_eficiente'
  | 'medencia_eficaz'
  | 'medencia_util'
  | 'medencia_practica'
  | 'medencia_aplicable'
  | 'medencia_operativa'
  | 'medencia_funcional'
  | 'medencia_operacional'
  | 'medencia_tecnica'
  | 'medencia_especifica'
  | 'medencia_detallada'
  | 'medencia_precisa'
  | 'medencia_exacta'
  | 'medencia_cientifica'
  | 'medencia_academica'
  | 'medencia_profesional'
  | 'medencia_especializada'
  | 'medencia_calificada'
  | 'medencia_certificada'
  | 'medencia_titulada'
  | 'medencia_formalizada'
  | 'medencia_regulada'
  | 'medencia_controlada'
  | 'medencia_supervisada'
  | 'medencia_auditada'
  | 'medencia_evaluada'
  | 'medencia_verificada'
  | 'medencia_validada'
  | 'medencia_confir'
  | 'admisiones'
  | 'otro'

/**
 * Tipos de documentos de verificación
 */
export type VerificationDocumentType =
  | 'cedula'
  | 'titulo_universitario'
  | 'certificado_especialidad'
  | 'licencia_profesional'
  | 'certificado_tecnico'
  | 'constancia_trabajo'
  | 'carta_recomendacion'
  | 'curriculum_vitae'
  | 'carnet_colegio'
  | 'otro'

/**
 * Estado de revisión de documentos
 */
export type DocumentReviewStatus =
  | 'pending'          // Pendiente
  | 'approved'         // Aprobado
  | 'rejected'         // Rechazado
  | 'requires_change'  // Requiere cambios

/**
 * Acciones del historial de verificación
 */
export type VerificationHistoryAction =
  | 'created'
  | 'approved'
  | 'rejected'
  | 'updated'
  | 'expired'
  | 'renewed'
  | 'suspended'
  | 'reactivated'
  | 'documents_added'
  | 'permissions_changed'
  | 'supervisor_changed'

// ============================================
// INTERFACES
// ============================================

/**
 * Verificación profesional completa
 */
export interface ProfessionalVerification {
  id: string
  user_id: string

  // Nivel y estado
  verification_level: VerificationLevel
  verification_status: VerificationStatus

  // Datos del profesional
  main_role: MainRoleType
  sub_role?: string
  professional_id?: string
  institution?: string
  department?: string

  // Verificación SACS (solo médicos)
  sacs_cedula?: string
  sacs_verified: boolean
  sacs_data?: SacsData
  sacs_verified_at?: string

  // Documentos
  documents_count: number
  documents_approved: number

  // Verificador
  verified_by?: string
  verified_by_role?: string
  verification_notes?: string
  verified_at?: string

  // Permisos y restricciones
  restrictions: Record<string, any>
  custom_permissions: Record<string, any>

  // Control de vigencia
  expires_at?: string
  last_reviewed_at?: string
  next_review_date?: string

  // Supervisor
  supervisor_id?: string
  supervisor_approved: boolean
  supervisor_approved_at?: string

  // Metadata
  created_at: string
  updated_at: string
}

/**
 * Datos de SACS
 */
export interface SacsData {
  nombre_completo: string
  profesion: string
  matricula: string
  especialidad?: string
  especialidades?: string[]
  postgrados?: string[]
}

/**
 * Documento de verificación
 */
export interface VerificationDocument {
  id: string
  verification_id: string
  user_id: string

  // Tipo y metadata
  document_type: VerificationDocumentType
  document_name: string
  file_url: string
  file_path?: string
  file_size?: number
  mime_type?: string

  // Estado de revisión
  review_status: DocumentReviewStatus
  reviewed_by?: string
  review_notes?: string
  rejection_reason?: string
  reviewed_at?: string

  // Control de versiones
  version: number
  replaced_by?: string
  is_current: boolean

  // Metadata del documento
  document_metadata: Record<string, any>

  // Metadata
  uploaded_at: string
  created_at: string
  updated_at: string
}

/**
 * Historial de cambios
 */
export interface VerificationHistory {
  id: string
  verification_id: string
  user_id: string

  // Cambio realizado
  action: VerificationHistoryAction

  // Quién hizo el cambio
  performed_by?: string
  performed_by_role?: string

  // Detalles
  changes?: Record<string, any>
  reason?: string
  notes?: string

  // Metadata
  created_at: string
  ip_address?: string
  user_agent?: string
}

/**
 * Vista de verificaciones pendientes
 */
export interface PendingVerification extends ProfessionalVerification {
  nombre_completo: string
  email: string
  user_current_role: string
  documents_status: 'Sin documentos' | 'Documentos aprobados' | 'Parcialmente aprobados' | 'En revisión'
}

/**
 * Vista de verificaciones próximas a vencer
 */
export interface ExpiringVerification extends ProfessionalVerification {
  nombre_completo: string
  email: string
  days_until_expiry: number
}

/**
 * Estadísticas del sistema de verificación
 */
export interface VerificationStatistics {
  total_verifications: number
  pending: number
  under_review: number
  approved: number
  rejected: number
  by_level: Record<VerificationLevel, number>
}

// ============================================
// REQUEST/RESPONSE TYPES
// ============================================

/**
 * Request para crear verificación
 */
export interface CreateVerificationRequest {
  userId: string
  mainRole: MainRoleType
  subRole?: string
  professionalId?: string
  institution?: string
  department?: string
}

/**
 * Request para subir documento
 */
export interface UploadDocumentRequest {
  verificationId: string
  userId: string
  documentType: VerificationDocumentType
  file: File
  metadata?: Record<string, any>
}

/**
 * Request para aprobar verificación
 */
export interface ApproveVerificationRequest {
  verificationId: string
  verifiedBy: string
  verifiedByRole: string
  notes?: string
  expiresAt?: string
  customPermissions?: Record<string, any>
}

/**
 * Request para rechazar verificación
 */
export interface RejectVerificationRequest {
  verificationId: string
  rejectedBy: string
  rejectedByRole: string
  rejectionReason: string
  notes?: string
}

/**
 * Request para renovar verificación
 */
export interface RenewVerificationRequest {
  verificationId: string
  renewedBy: string
  newExpiryDate: string
  notes?: string
}

/**
 * Request para aprobar documento
 */
export interface ApproveDocumentRequest {
  documentId: string
  reviewedBy: string
  notes?: string
}

/**
 * Request para rechazar documento
 */
export interface RejectDocumentRequest {
  documentId: string
  reviewedBy: string
  rejectionReason: string
  notes?: string
}

/**
 * Response genérica de operaciones
 */
export interface OperationResponse {
  success: boolean
  error?: string
  data?: any
}

// ============================================
// PERMISOS PERSONALIZADOS
// ============================================

/**
 * Permisos para técnico radiólogo
 */
export interface RadiologyPermissions {
  operate_equipment: boolean
  approve_reports: boolean
  take_xrays: boolean
  take_ct_scans: boolean
  take_mri: boolean
  access_pacs: boolean
  schedule_procedures: boolean
}

/**
 * Permisos para técnico de laboratorio
 */
export interface LaboratoryPermissions {
  input_results: boolean
  validate_results: boolean
  operate_equipment: boolean
  handle_samples: boolean
  perform_blood_draws: boolean
  access_patient_records: boolean
}

/**
 * Permisos para enfermero
 */
export interface NursingPermissions {
  administer_medications: boolean
  take_vital_signs: boolean
  wound_care: boolean
  iv_therapy: boolean
  patient_assessment: boolean
  document_care: boolean
  emergency_response: boolean
}

/**
 * Unión de todos los tipos de permisos (Dashboard Médico)
 */
export type CustomPermissions =
  | { radiology: RadiologyPermissions }
  | { laboratory: LaboratoryPermissions }
  | { nursing: NursingPermissions }
  | Record<string, any>

// ============================================
// RESTRICCIONES
// ============================================

/**
 * Restricciones comunes para verificaciones
 */
export interface VerificationRestrictions {
  cannot_prescribe_controlled_substances?: boolean
  requires_supervision?: boolean
  max_patients_per_day?: number
  working_hours?: {
    start: string  // "08:00"
    end: string    // "17:00"
  }
  restricted_procedures?: string[]
  restricted_areas?: string[]
  requires_cosign?: boolean
  cosign_roles?: string[]
}

// ============================================
// FORM TYPES
// ============================================

/**
 * Datos del formulario de verificación (Paso 1: Información básica)
 */
export interface VerificationFormBasicInfo {
  mainRole: MainRoleType
  subRole?: string
  professionalId?: string
  institution?: string
  department?: string
}

/**
 * Datos del formulario de verificación (Paso 2: Documentos)
 */
export interface VerificationFormDocuments {
  documents: Array<{
    type: VerificationDocumentType
    file: File
    metadata?: Record<string, any>
  }>
}

/**
 * Formulario completo de verificación
 */
export interface VerificationForm extends VerificationFormBasicInfo {
  documents: VerificationFormDocuments['documents']
}

// ============================================
// UTILITY TYPES
// ============================================

/**
 * Helper para obtener el subtipo según el rol principal
 */
export type SubRoleType<T extends MainRoleType> =
  T extends 'profesional_salud' ? ProfesionalSaludSubtype :
  T extends 'tecnico_salud' ? TecnicoSaludSubtype :
  string

/**
 * Verificación con datos populados
 */
export interface PopulatedVerification extends ProfessionalVerification {
  user?: {
    nombre_completo: string
    email: string
    avatar_url?: string
  }
  verifier?: {
    nombre_completo: string
    email: string
  }
  supervisor?: {
    nombre_completo: string
    email: string
  }
  documents?: VerificationDocument[]
  history?: VerificationHistory[]
}