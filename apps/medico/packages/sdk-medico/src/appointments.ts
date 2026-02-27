import { format } from 'date-fns';
import type { MedicalSpecialty } from '@red-salud/types';

import {
  appointmentFormSchema,
  type AppointmentFormValues,
  type Appointment,
  type DoctorStats,
  type DoctorProfileFormData,
  type DoctorSearchFilters,
  appointmentSchema
} from '@red-salud/contracts';

export type {
  Appointment,
  DoctorProfile,
  AppointmentConflict,
  AppointmentStatus,
  DoctorStats,
  DoctorProfileFormData,
  AppointmentFormValues,
  DoctorSearchFilters
};

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

export interface TimeSlot {
  time: string;
  available: boolean;
  appointment_id?: string;
}

export interface CreateAppointmentData {
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  consultation_type: string;
  reason?: string;
}

// Back-compat alias
export type DoctorAppointment = Appointment;

export interface MedicalRecord {
  id: string;
  paciente_id: string;
  medico_id: string;
  fecha: string;
  diagnostico: string;
  tratamiento: string;
  notas?: string;
  created_at: string;
}

export interface MedicalRecordFilters {
  paciente_id?: string;
  medico_id?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
}

export interface Prescription {
  id: string;
  paciente_id: string;
  medico_id: string;
  fecha: string;
  medicamentos: any[];
  estado: string;
}

export interface LaboratoryResult {
  id: string;
  paciente_id: string;
  medico_id: string;
  fecha: string;
  tipo_examen: string;
  resultado: string;
}

export interface LabOrderFilters {
  paciente_id?: string;
  medico_id?: string;
}

export interface AppointmentFilters {
  medico_id?: string;
  paciente_id?: string;
  status?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
}

export type CheckConflictsResult = {
  conflicts: AppointmentConflict[];
  message: string | null;
};

export type CreateAppointmentFromFormResult = {
  appointmentId: string;
  meetingUrl: string | null;
};


type OfflinePatientNewData = NonNullable<AppointmentFormValues['new_patient_data']>;

function getName(value: unknown): string | undefined {
  if (!value) return undefined;
  if (Array.isArray(value)) {
    const first = value[0] as { nombre_completo?: string } | undefined;
    return first?.nombre_completo;
  }
  return (value as { nombre_completo?: string }).nombre_completo;
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && aEnd > bStart;
}

function toStatus(value: string): AppointmentStatus {
  if (value === 'pendiente') return 'pendiente';
  if (value === 'confirmada') return 'confirmada';
  if (value === 'completada') return 'completada';
  if (value === 'cancelada') return 'cancelada';
  return 'ausente';
}

function transformDoctorAppointmentRow(apt: {
  id: string;
  paciente_id: string;
  medico_id: string;
  fecha_hora: string;
  duracion_minutos: number;
  status: string;
  motivo?: string;
  notas?: string;
  created_at?: string;
  updated_at?: string;
  patient?: {
    id: string;
    nombre_completo: string;
    email: string;
    avatar_url?: string;
  } | null;
}): Appointment {
  const fechaHora = new Date(apt.fecha_hora);

  // IMPORTANT: use local methods to avoid timezone date shifts
  const year = fechaHora.getFullYear();
  const month = String(fechaHora.getMonth() + 1).padStart(2, '0');
  const day = String(fechaHora.getDate()).padStart(2, '0');
  const appointment_date = `${year}-${month}-${day}`;

  const hours = String(fechaHora.getHours()).padStart(2, '0');
  const minutes = String(fechaHora.getMinutes()).padStart(2, '0');
  const seconds = String(fechaHora.getSeconds()).padStart(2, '0');
  const appointment_time = `${hours}:${minutes}:${seconds}`;

  return {
    id: apt.id,
    paciente_id: apt.paciente_id,
    medico_id: apt.medico_id,
    fecha_hora: apt.fecha_hora,
    duracion_minutos: apt.duracion_minutos,
    status: toStatus(apt.status),
    tipo_cita: 'presencial',
    motivo: apt.motivo,
    notas_internas: apt.notas,
    created_at: apt.created_at,
    updated_at: apt.updated_at,
    patient: apt.patient || undefined,
  };
}

type PublicApiResponse<T> = {
  success: boolean;
  data: T;
  error?: unknown;
};

function getApiBaseUrl() {
  if (typeof window !== 'undefined') return '';

  const env = (globalThis as any)?.process?.env as Record<string, string | undefined> | undefined;

  if (env?.NEXT_PUBLIC_SITE_URL) {
    return env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  }

  if (env?.VERCEL_URL) {
    return `https://${env.VERCEL_URL}`;
  }

  return 'http://localhost:3001';
}

async function fetchPublicData<T>(
  path: string,
  params?: Record<string, string | undefined>,
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const queryString = params
    ? Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&')
    : '';

  const url = `${baseUrl}${path}${queryString ? `?${queryString}` : ''}`;
  const response = await fetch(url, { cache: 'no-store', credentials: 'same-origin' });
  const payload = (await response.json()) as PublicApiResponse<T>;

  if (!response.ok || !payload.success) {
    const normalizedError = typeof payload.error === 'string'
      ? payload.error
      : payload.error && typeof payload.error === 'object' && 'message' in payload.error
        ? String((payload.error as { message?: unknown }).message ?? '')
        : '';
    throw new Error(normalizedError || `Request to ${path} failed`);
  }

  return payload.data;
}

async function resolvePatientIdForAppointment(
  supabase: SupabaseClient,
  doctorId: string,
  form: AppointmentFormValues,
): Promise<{ isOffline: boolean; patientId: string }> {
  // New offline patient flow
  if (form.paciente_id === 'NEW' && form.new_patient_data) {
    const newPatientData: OfflinePatientNewData = form.new_patient_data;

    const { data: newPatient, error: createError } = await supabase
      .from('offline_patients')
      .insert({
        doctor_id: doctorId,
        nombre_completo: newPatientData.nombre_completo,
        cedula: newPatientData.cedula,
        email: newPatientData.email || null,
        status: 'offline',
      })
      .select('id')
      .single();

    if (!createError && newPatient?.id) {
      return { isOffline: true, patientId: newPatient.id as string };
    }

    // If unique violation, fetch existing offline patient by cedula for this doctor
    if (createError && (createError as { code?: string }).code === '23505') {
      const { data: existingPatient, error: fetchError } = await supabase
        .from('offline_patients')
        .select('id')
        .eq('doctor_id', doctorId)
        .eq('cedula', newPatientData.cedula)
        .single();
      if (fetchError || !existingPatient?.id) {
        throw new Error('El paciente ya existe pero no se pudo recuperar su información.');
      }

      return { isOffline: true, patientId: existingPatient.id as string };
    }

    throw createError ?? new Error('Error al registrar el nuevo paciente.');
  }

  // Existing patient: infer offline vs registered by checking offline_patients scoped to this doctor.
  const patientId = form.paciente_id;
  if (!patientId || patientId === 'NEW') {
    throw new Error('Selecciona un paciente');
  }

  const { data: offlinePatient } = await supabase
    .from('offline_patients')
    .select('id')
    .eq('doctor_id', doctorId)
    .eq('id', patientId)
    .maybeSingle();

  if (offlinePatient?.id) {
    return { isOffline: true, patientId: offlinePatient.id as string };
  }

  return { isOffline: false, patientId };
}

export function createAppointmentsSdk(supabase: SupabaseClient) {
  return {
    async getSpecialties(onlyWithDoctors: boolean = false): Promise<MedicalSpecialty[]> {
      // Uses same-origin Next route (service role inside route). Safe client access.
      return fetchPublicData<MedicalSpecialty[]>('/api/public/doctor-specialties', {
        onlyWithDoctors: onlyWithDoctors ? 'true' : undefined,
      });
    },

    async getMedicalSpecialties(onlyWithDoctors: boolean = false): Promise<MedicalSpecialty[]> {
      return fetchPublicData<MedicalSpecialty[]>('/api/public/doctor-specialties', {
        onlyWithDoctors: onlyWithDoctors ? 'true' : undefined,
      });
    },

    async getDoctors(specialtyId?: string): Promise<DoctorProfile[]> {
      // Prefer direct Supabase query (RLS applies) to allow filtering.
      let query = supabase
        .from('doctor_details')
        .select(
          `
          *,
          specialty:specialties(id, name, description, icon),
          profile:profiles!inner(id, nombre_completo, email, avatar_url)
        `,
        )
        .eq('verified', true);

      if (specialtyId) {
        query = query.eq('especialidad_id', specialtyId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;

      const rows = (data || []) as any[];
      return rows.map((row) => ({
        id: String(row.id),
        especialidad_id: row.especialidad_id ?? undefined,
        licencia_medica: row.licencia_medica ?? undefined,
        anos_experiencia: row.anos_experiencia ?? undefined,
        biografia: row.biografia ?? undefined,
        tarifa_consulta: row.tarifa_consulta ? Number(row.tarifa_consulta) : undefined,
        consultation_duration: row.consultation_duration ?? 30,
        verified: Boolean(row.verified),
        created_at: String(row.created_at),
        updated_at: String(row.updated_at),
        profile: row.profile
          ? {
            id: String(row.profile.id),
            nombre_completo: row.profile.nombre_completo ?? undefined,
            email: row.profile.email ?? undefined,
            avatar_url: row.profile.avatar_url ?? undefined,
          }
          : undefined,
      })) as unknown as DoctorProfile[];
    },

    async getAppointments(filters?: AppointmentFilters): Promise<Appointment[]> {
      let query = supabase
        .from('appointments')
        .select(`
          *,
          patient:profiles!appointments_paciente_id_fkey(
            id,
            nombre_completo,
            email,
            avatar_url
          )
        `);

      if (filters?.medico_id) {
        query = query.eq('medico_id', filters.medico_id);
      }
      if (filters?.paciente_id) {
        query = query.eq('paciente_id', filters.paciente_id);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.fecha_inicio) {
        query = query.gte('fecha_hora', filters.fecha_inicio);
      }
      if (filters?.fecha_fin) {
        query = query.lte('fecha_hora', filters.fecha_fin);
      }

      const { data, error } = await query.order('fecha_hora', { ascending: false });
      if (error) throw error;

      return (data || []).map(row => transformDoctorAppointmentRow(row as any));
    },

    async getDoctorProfile(doctorId: string): Promise<DoctorProfile> {
      const { data, error } = await supabase
        .from('doctor_details')
        .select(
          `
          *,
          especialidad:specialties(id, name, slug, icon, description),
          profile:profiles!doctor_details_profile_id_fkey(
            id,
            nombre_completo,
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
        `,
        )
        .eq('profile_id', doctorId)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Doctor profile not found');

      // Transform to rich DoctorProfile interface with legacy support
      const profile: DoctorProfile = {
        id: data.profile_id,
        profile_id: data.profile_id,
        specialty_id: data.especialidad_id || null,
        especialidad_id: data.especialidad_id || undefined,
        license_number: data.licencia_medica || null,
        licencia_medica: data.licencia_medica || undefined,
        license_country: 'VE',
        years_experience: data.anos_experiencia || 0,
        anos_experiencia: data.anos_experiencia || undefined,
        professional_phone: data.profile?.telefono || null,
        professional_email: data.profile?.email || null,
        clinic_address: null,
        consultation_duration: 30,
        consultation_price: data.tarifa_consulta ? Number(data.tarifa_consulta) : null,
        tarifa_consulta: data.tarifa_consulta ? Number(data.tarifa_consulta) : undefined,
        accepts_insurance: data.acepta_seguros ?? false,
        bio: data.biografia || null,
        languages: Array.isArray(data.idiomas) && data.idiomas.length > 0 ? data.idiomas : ['es'],
        is_verified: data.verified || false,
        verified: data.verified || false,
        is_active: true,
        sacs_verified: data.sacs_verified ?? data.profile?.sacs_verificado ?? false,
        sacs_data: data.sacs_data || null,
        average_rating: 0,
        total_reviews: 0,
        professional_type: data.professional_type || 'doctor',
        dashboard_config: data.dashboard_config || {},
        schedule: data.horario_atencion || undefined,
        subespecialidades: Array.isArray(data.subespecialidades) ? data.subespecialidades : [],
        universidad: undefined,
        created_at: data.created_at,
        updated_at: data.updated_at,
        profile: data.profile ? {
          id: data.profile.id,
          nombre_completo: data.profile.nombre_completo || undefined,
          email: data.profile.email || undefined,
          avatar_url: data.profile.avatar_url || undefined,
          telefono: data.profile.telefono || undefined,
          cedula: data.profile.cedula || undefined,
          cedula_verificada: data.profile.cedula_verificada || undefined,
          sacs_verificado: data.profile.sacs_verificado || undefined,
          sacs_nombre: data.profile.sacs_nombre || undefined,
          sacs_matricula: data.profile.sacs_matricula || undefined,
          sacs_especialidad: data.profile.sacs_especialidad || undefined,
        } : undefined,
        specialty: data.especialidad ? {
          id: data.especialidad.id,
          name: data.especialidad.name,
          slug: data.especialidad.slug ?? null,
          icon: data.especialidad.icon,
          description: data.especialidad.description,
        } : undefined,
      };

      return profile;
    },

    async searchDoctors(filters: DoctorSearchFilters = {}): Promise<DoctorProfile[]> {
      let query = supabase
        .from('doctor_details')
        .select(`
          *,
          especialidad:specialties(*),
          profile:profiles!doctor_details_profile_id_fkey(*)
        `)
        .eq('verified', true);

      if (filters.specialty_id) {
        query = query.eq('especialidad_id', filters.specialty_id);
      }
      if (filters.accepts_insurance !== undefined) {
        query = query.eq('acepta_seguros', filters.accepts_insurance);
      }
      if (filters.min_rating) {
        query = query.gte('average_rating', filters.min_rating);
      }
      if (filters.max_price) {
        query = query.lte('tarifa_consulta', filters.max_price);
      }

      const { data, error } = await query.order('average_rating', { ascending: false });
      if (error) throw error;

      const results = (data || []) as any[];
      return Promise.all(results.map(d => this.getDoctorProfile(d.profile_id)));
    },

    async getFeaturedDoctors(limit: number = 10): Promise<DoctorProfile[]> {
      const { data, error } = await supabase
        .from('doctor_details')
        .select('profile_id')
        .eq('verified', true)
        .eq('sacs_verified', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const profileIds = (data || []).map(d => d.profile_id);
      return Promise.all(profileIds.map(id => this.getDoctorProfile(id)));
    },

    async updateDoctorProfile(userId: string, updates: Partial<DoctorProfileFormData>): Promise<DoctorProfile> {
      const { data, error } = await supabase
        .from('doctor_details')
        .update(updates)
        .eq('profile_id', userId)
        .select(`
          *,
          especialidad:specialties(id, name, slug, icon, description),
          profile:profiles!doctor_details_profile_id_fkey(*)
        `)
        .single();

      if (error) throw error;
      return this.getDoctorProfile(userId); // Re-fetch to get consistent transformation
    },

    async getDoctorStats(doctorId: string): Promise<DoctorStats> {
      // Logic migrated from doctors-service.ts
      let totalAppointments = 0;
      let completedAppointments = 0;
      let cancelledAppointments = 0;
      let todayAppointments = 0;
      let uniquePatients = 0;

      try {
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from('appointments')
          .select('status, fecha_hora, paciente_id')
          .eq('medico_id', doctorId);

        if (!appointmentsError && appointmentsData) {
          totalAppointments = appointmentsData.length;
          completedAppointments = appointmentsData.filter((a) => a.status === 'completada').length;
          cancelledAppointments = appointmentsData.filter((a) => a.status === 'cancelada').length;

          const today = new Date().toISOString().split('T')[0];
          todayAppointments = appointmentsData.filter(
            (a) => a.fecha_hora.startsWith(today) && a.status === 'pendiente'
          ).length;

          uniquePatients = new Set(appointmentsData.map(p => p.paciente_id)).size;
        }
      } catch (err) {
        console.warn('Could not fetch appointment stats:', err);
      }

      const { data: profile } = await supabase
        .from('doctor_details')
        .select('average_rating, total_reviews')
        .eq('profile_id', doctorId)
        .maybeSingle();

      return {
        totalAppointments,
        completedAppointments,
        cancelledAppointments,
        todayAppointments,
        totalPatients: uniquePatients,
        averageRating: profile?.average_rating || 0,
        totalReviews: profile?.total_reviews || 0,
      };
    },


    async getAvailableTimeSlots(doctorId: string, date: string): Promise<TimeSlot[]> {
      const dayOfWeek = new Date(date).getDay();
      const startOfDay = new Date(`${date}T00:00:00`);
      const endOfDay = new Date(`${date}T23:59:59.999`);

      const availabilityResult = await supabase
        .from('doctor_availability')
        .select('hora_inicio, hora_fin')
        .eq('doctor_id', doctorId)
        .eq('dia_semana', dayOfWeek)
        .eq('activo', true);

      if (availabilityResult.error) throw availabilityResult.error;

      const availability = availabilityResult.data || [];
      if (availability.length === 0) return [];

      const slotDuration = 30;

      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('id, fecha_hora, duracion_minutos, status')
        .eq('medico_id', doctorId)
        .gte('fecha_hora', startOfDay.toISOString())
        .lte('fecha_hora', endOfDay.toISOString())
        .not('status', 'in', '("cancelada","rechazada")');

      if (appointmentsError) throw appointmentsError;

      const { data: timeBlocks, error: blocksError } = await supabase
        .from('doctor_time_blocks')
        .select('fecha_inicio, fecha_fin')
        .eq('doctor_id', doctorId)
        .lte('fecha_inicio', endOfDay.toISOString())
        .gte('fecha_fin', startOfDay.toISOString());

      if (blocksError) throw blocksError;

      const toMinutes = (value: string) => {
        const [hoursStr = '0', minutesStr = '0'] = value.split(':');
        const parsedHours = Number(hoursStr);
        const parsedMinutes = Number(minutesStr);
        const hours = Number.isFinite(parsedHours) ? parsedHours : 0;
        const minutes = Number.isFinite(parsedMinutes) ? parsedMinutes : 0;
        return hours * 60 + minutes;
      };

      const toTimeString = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;
      };

      const appointmentIntervals = (appointments || []).map((apt: any) => {
        const startDate = new Date(apt.fecha_hora);
        const start = startDate.getHours() * 60 + startDate.getMinutes();
        const duration = apt.duracion_minutos || slotDuration;
        return { id: apt.id, start, end: start + duration };
      });

      const blockIntervals = (timeBlocks || []).map((block: any) => {
        const startDate = new Date(block.fecha_inicio);
        const endDate = new Date(block.fecha_fin);
        return {
          start: Math.max(0, startDate.getHours() * 60 + startDate.getMinutes()),
          end: Math.min(24 * 60, endDate.getHours() * 60 + endDate.getMinutes()),
        };
      });

      const hasConflict = (start: number, end: number) => {
        const appointmentConflict = appointmentIntervals.find((i: any) => i.start < end && i.end > start);
        if (appointmentConflict) return { conflicted: true, appointmentId: appointmentConflict.id as string };

        const blockConflict = blockIntervals.some((i: any) => i.start < end && i.end > start);
        return { conflicted: blockConflict, appointmentId: undefined as string | undefined };
      };

      const slots: TimeSlot[] = [];
      availability.forEach((slot: any) => {
        const startMinutes = toMinutes(String(slot.hora_inicio));
        const endMinutes = toMinutes(String(slot.hora_fin));

        let cursor = startMinutes;
        while (cursor + slotDuration <= endMinutes) {
          const slotEnd = cursor + slotDuration;
          const conflict = hasConflict(cursor, slotEnd);

          slots.push({
            time: toTimeString(cursor),
            available: !conflict.conflicted,
            appointment_id: conflict.appointmentId,
          });

          cursor += slotDuration;
        }
      });

      return slots;
    },

    async getPatientAppointments(patientId: string): Promise<Appointment[]> {
      const { data, error } = await supabase
        .from('appointments')
        .select('id, paciente_id, medico_id, fecha_hora, duracion_minutos, status, tipo_cita, motivo, notas_internas, created_at, updated_at')
        .eq('paciente_id', patientId)
        .order('fecha_hora', { ascending: false });

      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: String(row.id),
        paciente_id: String(row.paciente_id),
        medico_id: String(row.medico_id),
        fecha_hora: String(row.fecha_hora),
        duracion_minutos: Number(row.duracion_minutos ?? 30),
        status: toStatus(String(row.status ?? '')),
        tipo_cita: String(row.tipo_cita || 'presencial'),
        motivo: row.motivo ?? undefined,
        notas_internas: row.notas_internas ?? undefined,
        created_at: row.created_at ?? undefined,
        updated_at: row.updated_at ?? undefined,
      } as Appointment));
    },

    async createAppointment(patientId: string, appointmentData: CreateAppointmentData) {
      const doctor = await this.getDoctorProfile(appointmentData.doctor_id);
      const fechaHora = `${appointmentData.appointment_date}T${appointmentData.appointment_time}`;

      const { data, error } = await supabase
        .from('appointments')
        .insert({
          paciente_id: patientId,
          medico_id: appointmentData.doctor_id,
          fecha_hora: fechaHora,
          duracion_minutos: doctor?.consultation_duration || 30,
          motivo: appointmentData.reason || '',
          tipo_cita: appointmentData.consultation_type,
          status: 'pendiente',
        })
        .select()
        .single();

      if (error) throw error;

      await supabase.from('user_activity_log').insert({
        user_id: patientId,
        activity_type: 'appointment_created',
        description: `Cita creada con doctor para ${appointmentData.appointment_date}`,
        status: 'success',
      }).maybeSingle();

      const appointment: Appointment = {
        id: String((data as any).id),
        paciente_id: String((data as any).paciente_id),
        medico_id: String((data as any).medico_id),
        fecha_hora: String((data as any).fecha_hora),
        duracion_minutos: Number((data as any).duracion_minutos ?? 30),
        status: toStatus(String((data as any).status ?? '')),
        tipo_cita: appointmentData.consultation_type,
        motivo: (data as any).motivo ?? undefined,
        price: doctor?.tarifa_consulta,
        created_at: (data as any).created_at ?? undefined,
        updated_at: (data as any).updated_at ?? undefined,
      };

      return { success: true as const, data: appointment };
    },

    async getDoctorAppointments(doctorId: string): Promise<DoctorAppointment[]> {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      if (!user) throw new Error('No autenticado');

      // Security guard: doctor can only access their own appointments.
      if (doctorId !== user.id) {
        throw new Error('No autorizado: solo puedes acceder a tus propias citas.');
      }

      const { data, error } = await supabase
        .from('appointments')
        .select(
          `
        *,
        patient:profiles!appointments_paciente_id_fkey(
          id,
          nombre_completo,
          email,
          avatar_url
        )
      `,
        )
        .eq('medico_id', user.id)
        .order('fecha_hora', { ascending: false });

      if (error) throw error;

      const rows = (data || []) as any[];
      return rows.map((row) =>
        transformDoctorAppointmentRow({
          id: String(row.id),
          paciente_id: String(row.paciente_id),
          medico_id: String(row.medico_id),
          fecha_hora: String(row.fecha_hora),
          duracion_minutos: Number(row.duracion_minutos ?? 0),
          status: String(row.status ?? ''),
          motivo: row.motivo ?? undefined,
          notas: row.notas ?? row.notas_internas ?? undefined,
          created_at: row.created_at ?? undefined,
          updated_at: row.updated_at ?? undefined,
          patient: row.patient ?? null,
        }),
      );
    },

    async checkConflicts(params: { fecha: string; hora: string; duracion_minutos: number }): Promise<CheckConflictsResult> {
      const { fecha, hora, duracion_minutos } = params;

      if (!fecha || !hora || !duracion_minutos) return { conflicts: [], message: null };

      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      if (!user) return { conflicts: [], message: null };

      const startDateTime = new Date(`${fecha}T${hora}:00`);
      const endDateTime = new Date(startDateTime.getTime() + duracion_minutos * 60000);

      const { data: conflicts } = await supabase
        .from('appointments')
        .select(
          `
          id,
          fecha_hora,
          duracion_minutos,
          motivo,
          paciente:profiles!appointments_paciente_id_fkey(nombre_completo),
          offline_patient:offline_patients!appointments_offline_patient_id_fkey(nombre_completo)
        `,
        )
        .eq('medico_id', user.id)
        .gte('fecha_hora', startDateTime.toISOString())
        .lt('fecha_hora', endDateTime.toISOString())
        .neq('status', 'cancelada');

      const { data: conflictsOverlapping } = await supabase
        .from('appointments')
        .select(
          `
          id,
          fecha_hora,
          duracion_minutos,
          motivo,
          paciente:profiles!appointments_paciente_id_fkey(nombre_completo),
          offline_patient:offline_patients!appointments_offline_patient_id_fkey(nombre_completo)
        `,
        )
        .eq('medico_id', user.id)
        .lt('fecha_hora', startDateTime.toISOString())
        .neq('status', 'cancelada');

      const overlapping =
        conflictsOverlapping?.filter((apt: { fecha_hora: string; duracion_minutos: number }) => {
          const aptStart = new Date(apt.fecha_hora);
          const aptEnd = new Date(aptStart.getTime() + apt.duracion_minutos * 60000);
          return aptEnd > startDateTime;
        }) ?? [];

      const all = [...(conflicts ?? []), ...overlapping];

      const normalized: AppointmentConflict[] = all.map((apt: any) => {
        const patientName = getName(apt.paciente) || getName(apt.offline_patient) || 'Paciente';
        return {
          id: String(apt.id),
          fecha_hora: String(apt.fecha_hora),
          duracion_minutos: Number(apt.duracion_minutos),
          motivo: apt.motivo ?? undefined,
          patient_name: patientName,
        };
      });

      if (normalized.length === 0) return { conflicts: [], message: null };

      const conflictList = normalized
        .map((apt) => {
          const time = format(new Date(apt.fecha_hora), 'HH:mm');
          return `${time} - ${apt.patient_name}`;
        })
        .join(', ');

      return {
        conflicts: normalized,
        message:
          `⚠️ Conflicto de horario: Ya tienes ${normalized.length} cita(s) programada(s): ${conflictList}. ` +
          `Por favor, elige otro horario.`,
      };
    },

    async createFromForm(params: {
      form: AppointmentFormValues;
      officeId: string;
    }): Promise<CreateAppointmentFromFormResult> {
      const { form, officeId } = params;

      const parsed = appointmentFormSchema.parse(form);

      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      if (!user) {
        throw new Error('No autenticado');
      }

      if (!officeId) {
        throw new Error('Debes seleccionar un consultorio antes de crear la cita.');
      }

      const selectedDateTime = new Date(`${parsed.fecha}T${parsed.hora}:00`);
      if (selectedDateTime < new Date()) {
        throw new Error('La fecha y hora seleccionadas ya pasaron. Por favor, elige una hora futura.');
      }

      // Resolve patient (offline/new/registered)
      const { isOffline, patientId } = await resolvePatientIdForAppointment(supabase, user.id, parsed);

      // Final conflict check (server-trust relies on RLS; this is still a UX guard)
      const startDateTime = new Date(`${parsed.fecha}T${parsed.hora}:00`);
      const endDateTime = new Date(startDateTime.getTime() + parsed.duracion_minutos * 60000);

      const { data: finalConflictCheck } = await supabase
        .from('appointments')
        .select('id, fecha_hora, duracion_minutos')
        .eq('medico_id', user.id)
        .neq('status', 'cancelada');

      const hasConflict = finalConflictCheck?.some((apt: { fecha_hora: string; duracion_minutos: number }) => {
        const aptStart = new Date(apt.fecha_hora);
        const aptEnd = new Date(aptStart.getTime() + apt.duracion_minutos * 60000);
        return overlaps(startDateTime, endDateTime, aptStart, aptEnd);
      });

      if (hasConflict) {
        throw new Error(
          '⛔ No se puede crear la cita: Ya existe una cita programada en este horario. Por favor, elige otro horario.',
        );
      }

      const colors: Record<string, string> = {
        presencial: '#3B82F6',
        telemedicina: '#10B981',
        urgencia: '#EF4444',
        seguimiento: '#8B5CF6',
        primera_vez: '#F59E0B',
      };

      const appointmentId = crypto.randomUUID();
      const meetingUrl = parsed.tipo_cita === 'telemedicina' && !isOffline ? `https://meet.jit.si/cita-${appointmentId.substring(0, 8)}` : null;

      const appointmentData: Record<string, unknown> = {
        id: appointmentId,
        medico_id: user.id,
        fecha_hora: new Date(`${parsed.fecha}T${parsed.hora}:00`).toISOString(),
        duracion_minutos: parsed.duracion_minutos,
        tipo_cita: parsed.tipo_cita,
        motivo: parsed.motivo,
        notas_internas: parsed.notas_internas || null,
        status: 'pendiente',
        color: colors[parsed.tipo_cita] || colors.presencial,
        price: parsed.precio ? parseFloat(parsed.precio) : null,
        meeting_url: meetingUrl,
        metodo_pago: parsed.metodo_pago,
        enviar_recordatorio: parsed.enviar_recordatorio,
        location_id: officeId,
      };

      if (isOffline) {
        appointmentData.offline_patient_id = patientId;
        appointmentData.paciente_id = null;
      } else {
        appointmentData.paciente_id = patientId;
        appointmentData.offline_patient_id = null;
      }

      const result = await supabase.from('appointments').insert(appointmentData).select().single();
      if (result.error) throw result.error;

      // Dental details (non-blocking)
      if (
        parsed.dental_details &&
        (parsed.dental_details.procedureCode || parsed.dental_details.toothNumbers?.length || parsed.dental_details.chairId)
      ) {
        const dentalData = {
          appointment_id: appointmentId,
          chair_id: parsed.dental_details.chairId || null,
          hygienist_id: parsed.dental_details.hygienistId || null,
          assistant_id: parsed.dental_details.assistantId || null,
          procedure_code: parsed.dental_details.procedureCode || null,
          procedure_name: parsed.dental_details.procedureName || null,
          tooth_numbers: parsed.dental_details.toothNumbers || [],
          surfaces: parsed.dental_details.surfaces || [],
          quadrant: parsed.dental_details.quadrant || null,
          requires_anesthesia: parsed.dental_details.requiresAnesthesia || false,
          anesthesia_type: parsed.dental_details.anesthesiaType || null,
          requires_sedation: parsed.dental_details.requiresSedation || false,
          sedation_type: parsed.dental_details.sedationType || null,
          materials_needed: parsed.dental_details.materialsNeeded || [],
          materials_prepared: parsed.dental_details.materialsPrepared || false,
          special_equipment: parsed.dental_details.specialEquipment || [],
          estimated_cost: parsed.dental_details.estimatedCost || null,
          insurance_authorization: parsed.dental_details.insuranceAuthorization || null,
          preop_notes: parsed.dental_details.preopNotes || '',
          postop_notes: parsed.dental_details.postopNotes || '',
          complications: parsed.dental_details.complications || '',
        };

        const dentalResult = await supabase.from('dental_appointment_details').insert(dentalData);
        if (dentalResult.error) {
          // Keep non-blocking behavior (mirrors existing page)
          console.error('Error saving dental details:', dentalResult.error);
        }
      }

      await supabase.from('user_activity_log').insert({
        user_id: user.id,
        activity_type: 'appointment_created',
        description: `Cita creada para ${new Date(`${parsed.fecha}T${parsed.hora}:00`).toLocaleString()}`,
        status: 'success',
      });

      return { appointmentId, meetingUrl };
    },

    async cancel(params: { appointmentId: string; reason?: string }): Promise<void> {
      const { appointmentId, reason } = params;

      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      if (!user) throw new Error('No autenticado');

      const { error } = await supabase
        .from('appointments')
        .update({
          status: 'cancelada',
          notas: reason ? `Cancelada: ${reason}` : 'Cancelada',
        })
        .eq('id', appointmentId)
        .eq('medico_id', user.id);

      if (error) throw error;

      await supabase.from('user_activity_log').insert({
        user_id: user.id,
        activity_type: 'appointment_cancelled',
        description: `Cita cancelada: ${appointmentId}`,
        status: 'success',
      });
    },

    async confirm(params: { appointmentId: string }): Promise<void> {
      const { appointmentId } = params;

      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      if (!user) throw new Error('No autenticado');

      const { error } = await supabase
        .from('appointments')
        .update({ status: 'confirmada' })
        .eq('id', appointmentId)
        .eq('medico_id', user.id);

      if (error) throw error;
    },

    async complete(params: { appointmentId: string }): Promise<void> {
      const { appointmentId } = params;

      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      if (!user) throw new Error('No autenticado');

      const { error } = await supabase
        .from('appointments')
        .update({ status: 'completada' })
        .eq('id', appointmentId)
        .eq('medico_id', user.id);

      if (error) throw error;
    },
  };
}
