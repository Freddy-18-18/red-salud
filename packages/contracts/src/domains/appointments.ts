// Appointments domain types

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'absent';

export interface Appointment {
    id: string;
    patient_id: string;
    doctor_id: string;
    office_id?: string;
    scheduled_at: string;
    duration_minutes: number;
    status: AppointmentStatus;
    appointment_type: string;
    reason?: string;
    internal_notes?: string;
    meeting_url?: string;
    price?: number;
    payment_method?: string;
    created_at?: string;
    updated_at?: string;
    patient?: {
        id: string;
        full_name: string;
        email: string;
        avatar_url?: string;
    };
    doctor?: {
        id: string;
        full_name: string;
    };
}

export interface DoctorProfile {
    id: string;
    profile_id?: string;
    specialty_id: string | null;
    license_number: string | null;
    license_country: string;
    years_experience: number;
    professional_phone: string | null;
    professional_email: string | null;
    clinic_address: string | null;
    consultation_duration: number;
    consultation_price: number | null;
    accepts_insurance: boolean;
    bio: string | null;
    languages: string[];
    is_verified: boolean;
    is_active: boolean;
    sacs_verified: boolean;
    sacs_data: Record<string, unknown> | null;
    average_rating: number;
    total_reviews: number;
    professional_type: 'doctor' | 'tecnico' | 'asistente' | 'otro';
    dashboard_config: Record<string, unknown>;
    schedule?: Record<string, unknown>;
    sub_specialties?: string[];
    university?: string;
    created_at: string;
    updated_at: string;
    profile?: {
        id: string;
        full_name?: string;
        email?: string;
        avatar_url?: string;
        phone?: string;
        id_number?: string;
        id_verified?: boolean;
        sacs_verified?: boolean;
        sacs_name?: string;
        sacs_license?: string;
        sacs_specialty?: string;
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
    scheduled_at: string;
    duration_minutes: number;
    reason?: string;
    patient_name: string;
}
