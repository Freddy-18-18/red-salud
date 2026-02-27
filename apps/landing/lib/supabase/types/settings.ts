// Settings Types for Doctor Configuration

export interface DoctorSettings {
    id: string;
    doctor_id: string;

    // Personal Info
    nombre_completo?: string;
    trato?: 'Dr.' | 'Dra.';
    titulo?: string;
    cedula_profesional?: string;
    especialidad?: string;

    // Clinic Info
    clinica_nombre?: string;
    consultorio_direccion?: string;
    telefono?: string;
    email?: string;

    // Signature & Logo
    firma_digital_url?: string;
    firma_digital_enabled: boolean;
    logo_url?: string;
    logo_enabled: boolean;

    // Active Template Settings
    active_frame_id?: string;
    active_watermark_id?: string;
    frame_color: string;

    // Relations (populated on fetch)
    active_frame?: PrescriptionFrame;
    active_watermark?: PrescriptionWatermark;

    created_at: string;
    updated_at: string;
}

export interface PrescriptionFrame {
    id: string;
    name: string;
    image_url: string;
    is_generic: boolean;
    doctor_id?: string;
    has_customizable_color: boolean;
    created_at: string;
}

export interface PrescriptionWatermark {
    id: string;
    name: string;
    image_url: string;
    is_generic: boolean;
    doctor_id?: string;
    created_at: string;
}

export type DoctorSettingsUpdate = Partial<Omit<DoctorSettings, 'id' | 'doctor_id' | 'created_at' | 'updated_at' | 'active_frame' | 'active_watermark'>>;

export interface SettingsFormValues {
    // Personal Info
    nombre_completo: string;
    trato: 'Dr.' | 'Dra.';
    titulo: string;
    cedula_profesional: string;
    especialidad: string;

    // Clinic Info
    clinica_nombre: string;
    consultorio_direccion: string;
    telefono: string;
    email: string;

    // Signature & Logo
    firma_digital_enabled: boolean;
    logo_enabled: boolean;

    // Template
    active_frame_id: string;
    active_watermark_id: string;
    frame_color: string;
}
