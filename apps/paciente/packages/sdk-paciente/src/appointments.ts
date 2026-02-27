import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  Appointment,
  DoctorProfile,
  DoctorStats,
} from '@red-salud/contracts';
import type { MedicalSpecialty } from './types';

export type { Appointment, DoctorProfile, DoctorStats };
export type { MedicalSpecialty };

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

export interface AppointmentFilters {
  medico_id?: string;
  paciente_id?: string;
  status?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
}

type AppointmentStatus = 'pendiente' | 'confirmada' | 'completada' | 'cancelada' | 'ausente';

function toStatus(value: string): AppointmentStatus {
  if (value === 'pendiente') return 'pendiente';
  if (value === 'confirmada') return 'confirmada';
  if (value === 'completada') return 'completada';
  if (value === 'cancelada') return 'cancelada';
  return 'ausente';
}

type PublicApiResponse<T> = {
  success: boolean;
  data: T;
  error?: string;
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

  return 'http://localhost:3002';
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

export function createAppointmentsSdk(supabase: SupabaseClient) {
  return {
    async getSpecialties(onlyWithDoctors: boolean = false): Promise<MedicalSpecialty[]> {
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
      return fetchPublicData<DoctorProfile[]>('/api/public/doctors', {
        specialtyId,
      });
    },

    async getAvailableDoctors(specialtyId?: string): Promise<DoctorProfile[]> {
      return this.getDoctors(specialtyId);
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

    async getDoctorAppointments(doctorId: string): Promise<Appointment[]> {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      if (!user) throw new Error('No autenticado');

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
      return rows.map((row) => ({
        id: String(row.id),
        paciente_id: String(row.paciente_id),
        medico_id: String(row.medico_id),
        fecha_hora: String(row.fecha_hora),
        duracion_minutos: Number(row.duracion_minutos ?? 0),
        status: toStatus(String(row.status ?? '')),
        tipo_cita: String(row.tipo_cita || 'presencial'),
        motivo: row.motivo ?? undefined,
        notas_internas: row.notas ?? row.notas_internas ?? undefined,
        created_at: row.created_at ?? undefined,
        updated_at: row.updated_at ?? undefined,
        patient: row.patient ? {
          id: String(row.patient.id),
          nombre_completo: row.patient.nombre_completo ?? undefined,
          email: row.patient.email ?? undefined,
          avatar_url: row.patient.avatar_url ?? undefined,
        } : undefined,
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
        .eq('id', appointmentId);

      if (error) throw error;

      await supabase.from('user_activity_log').insert({
        user_id: user.id,
        activity_type: 'appointment_cancelled',
        description: `Cita cancelada: ${appointmentId}`,
        status: 'success',
      });
    },
  };
}
