// Servicio para gestión de médicos
import { supabase } from '@/lib/supabase/client';
import type {
  DoctorProfile,
  DoctorProfileFormData,
  MedicalSpecialty,
  DoctorReview,
  DoctorReviewFormData,
  DoctorSearchFilters,
} from '@/types/doctor';

// ============================================
// ESPECIALIDADES
// ============================================

export async function getSpecialties() {
  try {
    const { data, error } = await supabase
      .from('specialties')
      .select('*')
      .eq('active', true)
      .order('name');

    if (error) {
      // Silenciar error si la tabla no existe - no es crítico
      return { success: false, error: error.message };
    }

    return { success: true, data: data as MedicalSpecialty[] };
  } catch (err) {
    // Silenciar error - specialties no es crítico para el funcionamiento
    return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' };
  }
}

export async function getSpecialtyById(id: string) {
  const { data, error } = await supabase
    .from('specialties')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching specialty:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data: data as MedicalSpecialty };
}

// ============================================
// PERFIL DE MÉDICO
// ============================================

export async function getDoctorProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('doctor_profiles')
      .select(`
        *,
        specialty:specialties(id, name, slug, icon, description),
        profile:profiles!doctor_profiles_profile_id_fkey(
          id,
          full_name,
          email,
          avatar_url,
          telefono,
          ciudad,
          estado,
          cedula,
          cedula_verificada,
          sacs_verificado,
          sacs_nombre,
          sacs_matricula,
          sacs_especialidad
        )
      `)
      .eq('profile_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching doctor profile detailed:', JSON.stringify(error, null, 2));
      return { success: false, error: error.message || 'Error desconocido al obtener perfil' };
    }

    if (!data) {
      return { success: false, error: 'Profile not found' };
    }

    const doctorProfile: DoctorProfile = {
      id: data.profile_id,
      specialty_id: data.specialty_id || null,
      specialty: data.specialty ? {
        id: data.specialty.id,
        name: data.specialty.name,
        slug: data.specialty.slug ?? null,
        icon: data.specialty.icon,
        description: data.specialty.description,
      } : null,
      license_number: data.medical_license || null,
      license_country: 'VE',
      years_experience: data.years_experience || 0,
      professional_phone: data.profile?.telefono || null,
      professional_email: data.profile?.email || null,
      clinic_address: null,
      consultation_duration: 30,
      consultation_price: data.consultation_fee ? Number(data.consultation_fee) : null,
      accepts_insurance: data.accepts_insurance ?? false,
      bio: data.biography || null,
      languages: Array.isArray(data.languages) && data.languages.length > 0 ? data.languages : ['es'],
      is_verified: data.verified || false,
      is_active: true,
      sacs_verified: data.sacs_verified ?? data.profile?.sacs_verificado ?? false,
      sacs_data: data.sacs_data || null,
      average_rating: 0,
      total_reviews: 0,
      professional_type: data.professional_type || 'doctor',
      dashboard_config: data.dashboard_config || {},
      schedule: data.schedule || undefined,
      created_at: data.created_at,
      updated_at: data.updated_at,
      full_name: data.profile?.full_name || undefined,
      email: data.profile?.email || undefined,
      telefono: data.profile?.telefono || undefined,
      cedula: data.profile?.cedula || undefined,
      cedula_verificada: data.profile?.cedula_verificada || undefined,
      sacs_verificado: data.profile?.sacs_verificado || undefined,
      sacs_nombre: data.profile?.sacs_nombre || undefined,
      sacs_matricula: data.profile?.sacs_matricula || undefined,
      sacs_especialidad: data.profile?.sacs_especialidad || undefined,
      subspecialties: Array.isArray(data.subspecialties) ? data.subspecialties : [],
      universidad: undefined,
    } as unknown as DoctorProfile;

    return { success: true, data: doctorProfile };
  } catch (_err) {
    console.error('Exception fetching doctor profile:', _err);
    return { success: false, error: _err instanceof Error ? _err.message : 'Error desconocido' };
  }
}

export async function createDoctorProfile(
  userId: string,
  profileData: DoctorProfileFormData
) {
  const { data, error } = await supabase
    .from('doctor_profiles')
    .insert({
      profile_id: userId,
      ...profileData,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating doctor profile:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data: data as DoctorProfile };
}

export async function updateDoctorProfile(
  userId: string,
  updates: Partial<DoctorProfileFormData>
) {
  const { data, error } = await supabase
    .from('doctor_profiles')
    .update(updates)
    .eq('profile_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating doctor profile:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data: data as DoctorProfile };
}

// ============================================
// BÚSQUEDA DE MÉDICOS
// ============================================

export async function searchDoctors(filters: DoctorSearchFilters = {}) {
  let query = supabase
    .from('doctor_profiles')
    .select(`
      *,
      specialty:specialties(*),
      profile:profiles(*)
    `)
    .eq('verified', true);

  if (filters.specialty_id) {
    query = query.eq('specialty_id', filters.specialty_id);
  }

  if (filters.accepts_insurance !== undefined) {
    query = query.eq('accepts_insurance', filters.accepts_insurance);
  }

  if (filters.max_price) {
    query = query.lte('consultation_fee', filters.max_price);
  }

  if (filters.languages && filters.languages.length > 0) {
    query = query.contains('languages', filters.languages);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error searching doctors:', error);
    return { success: false, error: error.message };
  }

  const results = (data || []).map(d => ({
    ...d,
    specialty: d.specialty ? {
      id: d.specialty.id,
      name: d.specialty.name,
      icon: d.specialty.icon,
      description: d.specialty.description,
    } : null,
    full_name: d.profile?.full_name,
    email: d.profile?.email,
    telefono: d.profile?.telefono,
    avatar_url: d.profile?.avatar_url,
  }));

  return { success: true, data: results };
}

export async function getFeaturedDoctors(limit: number = 10) {
  const { data, error } = await supabase
    .from('doctor_profiles')
    .select(`
      *,
      specialty:specialties(*),
      profile:profiles!doctor_profiles_profile_id_fkey(*)
    `)
    .eq('verified', true)
    .eq('sacs_verified', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching featured doctors:', error);
    return { success: false, error: error.message };
  }

  const results = (data || []).map(d => ({
    profile_id: d.profile_id,
    specialty_id: d.specialty_id,
    specialty: d.specialty ? {
      id: d.specialty.id,
      name: d.specialty.name,
      icon: d.specialty.icon,
      description: d.specialty.description,
    } : null,
    license_number: d.medical_license,
    years_experience: d.years_experience,
    consultation_price: d.consultation_fee ? Number(d.consultation_fee) : null,
    bio: d.biography,
    is_verified: d.verified,
    full_name: d.profile?.full_name,
    email: d.profile?.email,
    avatar_url: d.profile?.avatar_url,
    telefono: d.profile?.telefono,
  }));

  return { success: true, data: results };
}

// ============================================
// RESEÑAS
// ============================================

export async function getDoctorReviews(doctorId: string) {
  const { data, error } = await supabase
    .from('doctor_reviews')
    .select('*')
    .eq('doctor_id', doctorId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reviews:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data: data as DoctorReview[] };
}

export async function createReview(
  doctorId: string,
  patientId: string,
  reviewData: DoctorReviewFormData,
  appointmentId?: string
) {
  const { data, error } = await supabase
    .from('doctor_reviews')
    .insert({
      doctor_id: doctorId,
      patient_id: patientId,
      appointment_id: appointmentId,
      ...reviewData,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating review:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data: data as DoctorReview };
}

export async function updateReview(
  reviewId: string,
  updates: Partial<DoctorReviewFormData>
) {
  const { data, error } = await supabase
    .from('doctor_reviews')
    .update(updates)
    .eq('id', reviewId)
    .select()
    .single();

  if (error) {
    console.error('Error updating review:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data: data as DoctorReview };
}

// ============================================
// DISPONIBILIDAD
// ============================================
// NOTE: Availability exceptions CRUD has been migrated to core hooks:
// - useAvailabilityExceptions from @red-salud/core
// - useDoctorSchedule (composite) via hooks/use-doctor-schedule.ts
// The functions below have been removed as they were unused.

// ============================================
// ESTADÍSTICAS DEL MÉDICO
// ============================================

export async function getDoctorStats(doctorId: string) {
  try {
    // Inicializar con valores por defecto
    let totalAppointments = 0;
    let completedAppointments = 0;
    let cancelledAppointments = 0;
    let todayAppointments = 0;
    let uniquePatients = 0;

    // Intentar obtener estadísticas de citas (puede fallar si la tabla no existe)
    try {
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('status, scheduled_at, patient_id')
        .eq('doctor_id', doctorId);

      if (!appointmentsError && appointmentsData) {
        totalAppointments = appointmentsData.length;
        completedAppointments = appointmentsData.filter((a) => a.status === 'completed').length;
        cancelledAppointments = appointmentsData.filter((a) => a.status === 'cancelled').length;

        // Citas de hoy
        const today = new Date().toISOString().split('T')[0];
        todayAppointments = appointmentsData.filter(
          (a) => a.scheduled_at.startsWith(today) && a.status === 'scheduled'
        ).length;

        // Contar pacientes únicos
        uniquePatients = new Set(appointmentsData.map(p => p.patient_id)).size;
      }
    } catch {
      console.log('Appointments table not available yet');
    }

    // Obtener perfil con ratings
    const profileResult = await getDoctorProfile(doctorId);
    const profileData = profileResult.success ? profileResult.data : null;

    return {
      success: true,
      data: {
        totalAppointments,
        completedAppointments,
        cancelledAppointments,
        todayAppointments,
        totalPatients: uniquePatients,
        averageRating: profileData?.average_rating || 0,
        totalReviews: profileData?.total_reviews || 0,
      },
    };
  } catch (error) {
    console.error('Error in getDoctorStats:', error);
    // Retornar datos por defecto en lugar de error
    return {
      success: true,
      data: {
        totalAppointments: 0,
        completedAppointments: 0,
        cancelledAppointments: 0,
        todayAppointments: 0,
        totalPatients: 0,
        averageRating: 0,
        totalReviews: 0,
      },
    };
  }
}

// ============================================
// HORARIOS Y SLOTS DISPONIBLES
// ============================================
// NOTE: Available slots logic has been migrated to core hook:
// - useAvailableTimeSlots from @red-salud/core
// The getAvailableSlots function has been removed as it was unused.
