// Appointments domain types

export type AppointmentStatus = 'pendiente' | 'confirmada' | 'completada' | 'cancelada' | 'ausente';

export interface Appointment {
    id: string;
    paciente_id: string;
    medico_id: string;
    office_id?: string;
    fecha_hora: string;
    duracion_minutos: number;
    status: AppointmentStatus;
    tipo_cita: string;
    motivo?: string;
    notas_internas?: string;
    meeting_url?: string;
    price?: number;
    metodo_pago?: string;
    created_at?: string;
    updated_at?: string;
    patient?: {
        id: string;
        nombre_completo: string;
        email: string;
        avatar_url?: string;
    };
    medico?: {
        id: string;
        nombre_completo: string;
    };
}

export interface DoctorProfile {
    id: string;
    profile_id?: string;
    specialty_id: string | null;
    especialidad_id?: string; // Legacy alias used in some places
    license_number: string | null;
    licencia_medica?: string; // Legacy alias
    license_country: string;
    years_experience: number;
    anos_experiencia?: number; // Legacy alias
    professional_phone: string | null;
    professional_email: string | null;
    clinic_address: string | null;
    consultation_duration: number;
    consultation_price: number | null;
    tarifa_consulta?: number; // Legacy alias
    accepts_insurance: boolean;
    bio: string | null;
    languages: string[];
    is_verified: boolean;
    verified?: boolean; // Legacy alias
    is_active: boolean;
    sacs_verified: boolean;
    sacs_data: Record<string, unknown> | null;
    average_rating: number;
    total_reviews: number;
    professional_type: 'doctor' | 'tecnico' | 'asistente' | 'otro';
    dashboard_config: Record<string, unknown>;
    schedule?: Record<string, unknown>;
    subespecialidades?: string[];
    universidad?: string;
    created_at: string;
    updated_at: string;
    profile?: {
        id: string;
        nombre_completo?: string;
        email?: string;
        avatar_url?: string;
        telefono?: string;
        cedula?: string;
        cedula_verificada?: boolean;
        sacs_verificado?: boolean;
        sacs_nombre?: string;
        sacs_matricula?: string;
        sacs_especialidad?: string;
    };
    specialty?: {
        id: string;
        name: string;
        slug: string | null;
        icon: string | null;
        description: string | null;
    };
}

export interface DoctorProfileFormData {
    specialty_id?: string;
    license_number?: string;
    license_country?: string;
    years_experience?: number;
    professional_phone?: string;
    professional_email?: string;
    clinic_address?: string;
    consultation_duration?: number;
    consultation_price?: number;
    accepts_insurance?: boolean;
    bio?: string;
    languages?: string[];
    professional_type?: 'doctor' | 'tecnico' | 'asistente' | 'otro';
    dashboard_config?: Record<string, unknown>;
    schedule?: Record<string, unknown>;
}

export interface DoctorStats {
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    todayAppointments: number;
    totalPatients: number;
    averageRating: number;
    totalReviews: number;
}

export interface DoctorSearchFilters {
    specialty_id?: string;
    accepts_insurance?: boolean;
    min_rating?: number;
    max_price?: number;
    languages?: string[];
    accepts_new_patients?: boolean;
}


export interface AppointmentConflict {
    id: string;
    fecha_hora: string;
    duracion_minutos: number;
    motivo?: string;
    patient_name: string;
}
