// Prescription and Medication domain types

export type PrescriptionStatus = 'activa' | 'surtida' | 'vencida' | 'cancelada';
export type TemplateType = 'sistema' | 'personalizado' | 'escaneado';
export type TemplateCategory = 'general' | 'pediatria' | 'cardiologia' | 'medicina-interna' | 'otro';
export type Orientation = 'portrait' | 'landscape';
export type SignatureType = 'digital' | 'upload' | 'touch';
export type ScanType = 'scan' | 'photo' | 'upload';
export type PrintFormat = 'pdf' | 'print';

export interface MedicationCatalog {
    id: string;
    nombre_comercial: string;
    nombre_generico: string;
    principio_activo?: string;
    concentracion?: string;
    forma_farmaceutica?: string;
    fabricante?: string;
    descripcion?: string;
    indicaciones?: string;
    contraindicaciones?: string;
    efectos_secundarios?: string;
    dosis_usual?: string;
    requiere_receta: boolean;
    activo: boolean;
    created_at: string;
    updated_at: string;
}

export interface PrescriptionMedication {
    id: string;
    prescription_id: string;
    medication_id?: string;
    nombre_medicamento: string;
    dosis: string;
    frecuencia: string;
    via_administracion?: string;
    duracion_dias?: number;
    cantidad_total?: string;
    instrucciones_especiales?: string;
    created_at: string;
    medication?: MedicationCatalog;
}

export interface PrescriptionDomain {
    id: string;
    paciente_id: string;
    medico_id: string;
    medical_record_id?: string;
    appointment_id?: string;
    fecha_prescripcion: string;
    fecha_vencimiento?: string;
    diagnostico?: string;
    instrucciones_generales?: string;
    status: PrescriptionStatus;
    farmacia_id?: string;
    fecha_surtida?: string;
    notas?: string;
    folio?: string;
    created_at: string;
    updated_at: string;
    medico?: {
        id: string;
        nombre_completo: string;
        especialidad?: string;
        avatar_url?: string;
    };
    paciente?: {
        id: string;
        nombre_completo: string;
        cedula?: string;
        avatar_url?: string;
        fecha_nacimiento?: string;
        genero?: string;
    };
    medications?: PrescriptionMedication[];
}

// Advanced Features (Extracted from prescriptions-advanced.ts)

export interface PrescriptionTemplate {
    id: string;
    medico_id: string | null;
    nombre: string;
    descripcion?: string | null;
    tipo: TemplateType;
    categoria?: TemplateCategory;
    layout_config: any; // Simplified for contracts, can be typed more deeply if needed
    custom_styles: any;
    header_config: any;
    patient_fields: any[];
    footer_config: any;
    texto_encabezado?: string | null;
    texto_pie?: string | null;
    texto_instrucciones: string;
    es_predeterminado: boolean;
    activo: boolean;
    usos_count: number;
    created_at: string;
    updated_at: string;
}

export interface DoctorSignature {
    id: string;
    medico_id: string;
    firma_url?: string | null;
    firma_type: SignatureType;
    firma_data?: string | null;
    es_firma_autografa: boolean;
    activa: boolean;
    created_at: string;
    updated_at: string;
}

export interface PrescriptionScan {
    id: string;
    medico_id: string;
    paciente_id?: string | null;
    imagen_url: string;
    imagen_type: ScanType;
    ocr_data?: any;
    procesada: boolean;
    template_id?: string | null;
    prescription_id?: string | null;
    notas?: string | null;
    fecha_escaneo: string;
    created_at: string;
    updated_at: string;
}

export interface CreatePrescriptionData {
    paciente_id?: string;
    offline_patient_id?: string; // For backward compatibility if needed
    medico_id: string;
    medical_record_id?: string;
    appointment_id?: string;
    fecha_prescripcion?: string;
    fecha_vencimiento?: string;
    diagnostico?: string;
    instrucciones_generales?: string;
    notas?: string;
    medications?: CreatePrescriptionMedicationData[];
}

export interface CreatePrescriptionMedicationData {
    medication_id?: string;
    nombre_medicamento: string;
    dosis: string;
    frecuencia: string;
    via_administracion?: string;
    duracion_dias?: number;
    cantidad_total?: string;
    instrucciones_especiales?: string;
}

export interface MedicationReminder {
    id: string;
    paciente_id: string;
    prescription_medication_id?: string;
    nombre_medicamento: string;
    dosis: string;
    horarios: string[]; // Array de horarios en formato HH:MM
    dias_semana?: number[]; // 0-6, null = todos los días
    fecha_inicio: string;
    fecha_fin?: string;
    activo: boolean;
    notificar_email: boolean;
    notificar_push: boolean;
    notas?: string;
    created_at: string;
    updated_at: string;
}

export type IntakeStatus = 'pendiente' | 'tomado' | 'omitido' | 'retrasado';

export interface MedicationIntakeLog {
    id: string;
    reminder_id: string;
    paciente_id: string;
    fecha_programada: string;
    fecha_tomada?: string;
    status: IntakeStatus;
    notas?: string;
    created_at: string;
    reminder?: MedicationReminder;
}

export interface CreateReminderData {
    paciente_id: string;
    prescription_medication_id?: string;
    nombre_medicamento: string;
    dosis: string;
    horarios: string[];
    dias_semana?: number[];
    fecha_inicio: string;
    fecha_fin?: string;
    notificar_email?: boolean;
    notificar_push?: boolean;
    notas?: string;
}

export interface AdherenceStats {
    total_tomas_programadas: number;
    tomas_completadas: number;
    tomas_omitidas: number;
    tomas_retrasadas: number;
    porcentaje_adherencia: number;
    racha_actual: number;
    mejor_racha: number;
}

export interface ActiveMedicationsSummary {
    total_medicamentos: number;
    total_recordatorios: number;
    proxima_toma?: {
        medicamento: string;
        hora: string;
        minutos_restantes: number;
    } | null;
    medicamentos_activos: Array<{
        nombre: string;
        dosis: string;
        frecuencia: string;
        proxima_toma: string;
    }>;
}
