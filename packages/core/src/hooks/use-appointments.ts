'use client';

import { useState, useEffect, useCallback } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';

// ============================================================================
// TYPES
// ============================================================================

// Re-use canonical types from contracts where possible, but define
// hook-specific shapes here so the hooks are self-contained and don't
// force consumers to install @red-salud/contracts.

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'absent'
  | 'scheduled'
  | 'waiting'
  | 'in_progress'
  | 'no_show';

export interface AppointmentRow {
  id: string;
  patient_id: string;
  doctor_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  reason?: string | null;
  notes?: string | null;
  internal_notes?: string | null;
  appointment_type?: string | null;
  meeting_url?: string | null;
  price?: number | null;
  payment_method?: string | null;
  created_at: string;
  updated_at: string;
  patient?: {
    id: string;
    full_name?: string;
    email?: string;
    avatar_url?: string | null;
    telefono?: string | null;
    fecha_nacimiento?: string | null;
    cedula?: string | null;
  } | null;
}

export interface DoctorProfileRow {
  id: string;
  profile_id?: string;
  specialty_id: string | null;
  medical_license?: string | null;
  license_number?: string | null;
  years_experience: number;
  biography?: string | null;
  bio?: string | null;
  consultation_fee?: string | number | null;
  consultation_price?: number | null;
  consultation_duration?: number;
  is_verified?: boolean;
  verified?: boolean;
  is_active?: boolean;
  sacs_verified?: boolean;
  sacs_data?: Record<string, unknown> | null;
  accepts_insurance?: boolean;
  languages?: string[];
  professional_type?: string;
  dashboard_config?: Record<string, unknown>;
  schedule?: Record<string, unknown>;
  subspecialties?: string[];
  created_at: string;
  updated_at: string;
  specialty?: {
    id: string;
    name: string;
    slug?: string | null;
    icon?: string | null;
    description?: string | null;
  } | null;
  profile?: {
    id: string;
    full_name?: string;
    email?: string;
    avatar_url?: string | null;
    telefono?: string | null;
    cedula?: string | null;
    cedula_verificada?: boolean;
    sacs_verificado?: boolean;
    sacs_nombre?: string | null;
    sacs_matricula?: string | null;
    sacs_especialidad?: string | null;
  } | null;
}

export interface MedicalSpecialtyRow {
  id: string;
  name: string;
  slug?: string | null;
  icon?: string | null;
  description?: string | null;
  active?: boolean;
}

export interface TimeSlotResult {
  time: string;
  available: boolean;
  appointment_id?: string;
}

export interface CreateAppointmentInput {
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  reason?: string;
  consultation_type?: string;
  duration_minutes?: number;
}

// Schedule-related types
export interface TimeSlot {
  start: string; // HH:mm
  end: string;   // HH:mm
}

export interface BreakSlot {
  label: string;
  start: string; // HH:mm
  end: string;   // HH:mm
}

export interface WeeklyScheduleRow {
  id?: string;
  doctor_id: string;
  day_of_week: number; // 0=Sunday ... 6=Saturday
  slots: TimeSlot[];
  breaks: BreakSlot[];
  buffer_after_mins: number;
  max_appointments: number | null;
  is_active: boolean;
}

export type BlockType =
  | 'block'
  | 'lunch'
  | 'meeting'
  | 'vacation'
  | 'emergency'
  | 'preparation'
  | 'administrative';

export interface TimeBlockRow {
  id?: string;
  doctor_id: string;
  block_type: BlockType;
  title: string;
  starts_at: string; // ISO datetime
  ends_at: string;   // ISO datetime
  all_day: boolean;
  is_recurring: boolean;
  recurrence_rule: string | null;
  notes: string | null;
}

export interface AvailabilityExceptionRow {
  id?: string;
  doctor_id: string;
  date: string; // YYYY-MM-DD
  is_available: boolean;
  reason: string | null;
  custom_slots: TimeSlot[] | null;
}

// ============================================================================
// Supabase client type alias — keeps the signatures concise.
// We use `any` generics to accept any Supabase client variant (browser, server, etc.)
// ============================================================================
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SB = SupabaseClient<any, any, any>;

// ============================================================================
// DOCTOR APPOINTMENTS
// ============================================================================

export interface UseDoctorAppointmentsOptions {
  dateRange?: { start: string; end: string };
  status?: string | string[];
}

export function useDoctorAppointments(
  supabase: SB,
  doctorId: string | null | undefined,
  options?: UseDoctorAppointmentsOptions,
) {
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dateStart = options?.dateRange?.start;
  const dateEnd = options?.dateRange?.end;
  const statusFilter = options?.status;

  const refresh = useCallback(async () => {
    if (!doctorId) {
      setAppointments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('appointments')
        .select(`
          *,
          patient:profiles!appointments_patient_id_fkey(
            id,
            full_name,
            email,
            avatar_url,
            telefono,
            fecha_nacimiento,
            cedula
          )
        `)
        .eq('doctor_id', doctorId);

      if (dateStart) {
        query = query.gte('scheduled_at', `${dateStart}T00:00:00`);
      }
      if (dateEnd) {
        query = query.lte('scheduled_at', `${dateEnd}T23:59:59`);
      }
      if (statusFilter) {
        if (Array.isArray(statusFilter)) {
          query = query.in('status', statusFilter);
        } else {
          query = query.eq('status', statusFilter);
        }
      }

      query = query.order('scheduled_at', { ascending: true });

      const { data, error: queryError } = await query;

      if (queryError) {
        // Graceful degradation if table doesn't exist yet
        if (queryError.code === '42P01' || queryError.message?.includes('does not exist')) {
          setAppointments([]);
          return;
        }
        throw queryError;
      }

      setAppointments((data as unknown as AppointmentRow[]) ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar citas');
    } finally {
      setLoading(false);
    }
  }, [supabase, doctorId, dateStart, dateEnd, statusFilter]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { appointments, loading, error, refresh };
}

// ============================================================================
// PATIENT APPOINTMENTS
// ============================================================================

export function usePatientAppointments(
  supabase: SB,
  patientId: string | null | undefined,
) {
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!patientId) {
      setAppointments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', patientId)
        .order('scheduled_at', { ascending: false });

      if (queryError) {
        if (queryError.code === '42P01' || queryError.message?.includes('does not exist')) {
          setAppointments([]);
          return;
        }
        throw queryError;
      }

      setAppointments((data as unknown as AppointmentRow[]) ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar citas del paciente');
    } finally {
      setLoading(false);
    }
  }, [supabase, patientId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { appointments, loading, error, refresh };
}

// ============================================================================
// MEDICAL SPECIALTIES
// ============================================================================

export function useMedicalSpecialties(
  supabase: SB,
  options?: { onlyActive?: boolean },
) {
  const [specialties, setSpecialties] = useState<MedicalSpecialtyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const onlyActive = options?.onlyActive ?? true;

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      try {
        let query = supabase
          .from('specialties')
          .select('*')
          .order('name');

        if (onlyActive) {
          query = query.eq('active', true);
        }

        const { data, error: queryError } = await query;

        if (queryError) {
          if (queryError.code === '42P01' || queryError.message?.includes('does not exist')) {
            setSpecialties([]);
            return;
          }
          throw queryError;
        }

        setSpecialties((data as unknown as MedicalSpecialtyRow[]) ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar especialidades');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [supabase, onlyActive]);

  return { specialties, loading, error };
}

// ============================================================================
// DOCTOR PROFILE
// ============================================================================

export function useDoctorProfile(
  supabase: SB,
  doctorId: string | null | undefined,
) {
  const [doctor, setDoctor] = useState<DoctorProfileRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!doctorId) {
      setDoctor(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
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
            cedula,
            cedula_verificada,
            sacs_verificado,
            sacs_nombre,
            sacs_matricula,
            sacs_especialidad
          )
        `)
        .eq('profile_id', doctorId)
        .maybeSingle();

      if (queryError) throw queryError;

      setDoctor(data as unknown as DoctorProfileRow | null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar perfil del doctor');
    } finally {
      setLoading(false);
    }
  }, [supabase, doctorId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { doctor, loading, error, refresh };
}

// ============================================================================
// AVAILABLE TIME SLOTS
// ============================================================================

export function useAvailableTimeSlots(
  supabase: SB,
  doctorId: string | null | undefined,
  date: string | null | undefined,
) {
  const [timeSlots, setTimeSlots] = useState<TimeSlotResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!doctorId || !date) {
      setTimeSlots([]);
      return;
    }

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const dayOfWeek = new Date(date!).getDay();
        const startOfDay = `${date}T00:00:00`;
        const endOfDay = `${date}T23:59:59.999`;

        // Get doctor availability for this day of week
        const { data: availability, error: availError } = await supabase
          .from('doctor_availability')
          .select('start_time, end_time')
          .eq('doctor_id', doctorId)
          .eq('day_of_week', dayOfWeek)
          .eq('is_active', true);

        if (availError) throw availError;

        if (!availability || availability.length === 0) {
          setTimeSlots([]);
          return;
        }

        const slotDuration = 30; // Default

        // Get existing appointments for this day
        const { data: appointments, error: aptError } = await supabase
          .from('appointments')
          .select('id, scheduled_at, duration_minutes, status')
          .eq('doctor_id', doctorId)
          .gte('scheduled_at', startOfDay)
          .lte('scheduled_at', endOfDay)
          .not('status', 'in', '("cancelled","rejected")');

        if (aptError) throw aptError;

        // Get time blocks
        const { data: timeBlocks, error: blocksError } = await supabase
          .from('doctor_time_blocks')
          .select('start_date, end_date')
          .eq('doctor_id', doctorId)
          .lte('start_date', endOfDay)
          .gte('end_date', startOfDay);

        if (blocksError) throw blocksError;

        const toMinutes = (value: string) => {
          const [hoursStr = '0', minutesStr = '0'] = value.split(':');
          const hours = Number.isFinite(Number(hoursStr)) ? Number(hoursStr) : 0;
          const minutes = Number.isFinite(Number(minutesStr)) ? Number(minutesStr) : 0;
          return hours * 60 + minutes;
        };

        const toTimeString = (mins: number) => {
          const h = Math.floor(mins / 60);
          const m = mins % 60;
          return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`;
        };

        const appointmentIntervals = (appointments || []).map((apt: { id: string; scheduled_at: string; duration_minutes?: number }) => {
          const d = new Date(apt.scheduled_at);
          const start = d.getHours() * 60 + d.getMinutes();
          return { id: apt.id, start, end: start + (apt.duration_minutes || slotDuration) };
        });

        const blockIntervals = (timeBlocks || []).map((b: { start_date: string; end_date: string }) => {
          const s = new Date(b.start_date);
          const e = new Date(b.end_date);
          return {
            start: Math.max(0, s.getHours() * 60 + s.getMinutes()),
            end: Math.min(24 * 60, e.getHours() * 60 + e.getMinutes()),
          };
        });

        const hasConflict = (start: number, end: number) => {
          const aptConflict = appointmentIntervals.find(
            (i: { id: string; start: number; end: number }) => i.start < end && i.end > start,
          );
          if (aptConflict) return { conflicted: true, appointmentId: aptConflict.id };
          const blockConflict = blockIntervals.some(
            (i: { start: number; end: number }) => i.start < end && i.end > start,
          );
          return { conflicted: blockConflict, appointmentId: undefined };
        };

        const slots: TimeSlotResult[] = [];

        availability.forEach((slot: { start_time: string; end_time: string }) => {
          const startMins = toMinutes(slot.start_time);
          const endMins = toMinutes(slot.end_time);
          let cursor = startMins;

          while (cursor + slotDuration <= endMins) {
            const conflict = hasConflict(cursor, cursor + slotDuration);
            slots.push({
              time: toTimeString(cursor),
              available: !conflict.conflicted,
              appointment_id: conflict.appointmentId,
            });
            cursor += slotDuration;
          }
        });

        setTimeSlots(slots);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar horarios disponibles');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [supabase, doctorId, date]);

  return { timeSlots, loading, error };
}

// ============================================================================
// CREATE APPOINTMENT
// ============================================================================

export function useCreateAppointment(supabase: SB) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(
    async (patientId: string, data: CreateAppointmentInput) => {
      setLoading(true);
      setError(null);

      try {
        const scheduledAt = `${data.appointment_date}T${data.appointment_time}`;

        const { data: result, error: insertError } = await supabase
          .from('appointments')
          .insert({
            patient_id: patientId,
            doctor_id: data.doctor_id,
            scheduled_at: scheduledAt,
            duration_minutes: data.duration_minutes ?? 30,
            reason: data.reason ?? '',
            status: 'pending',
          })
          .select()
          .single();

        if (insertError) throw insertError;

        // Log activity
        await supabase.from('user_activity_log').insert({
          user_id: patientId,
          activity_type: 'appointment_created',
          description: `Cita creada para ${data.appointment_date}`,
          status: 'success',
        });

        return { success: true as const, data: result, error: null };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        return { success: false as const, data: null, error: message };
      } finally {
        setLoading(false);
      }
    },
    [supabase],
  );

  return { create, loading, error };
}

// ============================================================================
// CANCEL APPOINTMENT
// ============================================================================

export function useCancelAppointment(supabase: SB) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancel = useCallback(
    async (appointmentId: string, userId: string, reason?: string) => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: updateError } = await supabase
          .from('appointments')
          .update({
            status: 'cancelled',
            notes: reason ? `Cancelada: ${reason}` : 'Cancelada',
          })
          .eq('id', appointmentId)
          .select()
          .single();

        if (updateError) throw updateError;

        // Log activity
        await supabase.from('user_activity_log').insert({
          user_id: userId,
          activity_type: 'appointment_cancelled',
          description: `Cita cancelada: ${appointmentId}`,
          status: 'success',
        });

        return { success: true as const, data, error: null };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        return { success: false as const, data: null, error: message };
      } finally {
        setLoading(false);
      }
    },
    [supabase],
  );

  return { cancel, loading, error };
}

// ============================================================================
// UPDATE APPOINTMENT STATUS
// ============================================================================

export function useUpdateAppointmentStatus(supabase: SB) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = useCallback(
    async (appointmentId: string, newStatus: string) => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: updateError } = await supabase
          .from('appointments')
          .update({ status: newStatus })
          .eq('id', appointmentId)
          .select()
          .single();

        if (updateError) throw updateError;

        return { success: true as const, data, error: null };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        return { success: false as const, data: null, error: message };
      } finally {
        setLoading(false);
      }
    },
    [supabase],
  );

  return { updateStatus, loading, error };
}

// ============================================================================
// DOCTOR SCHEDULE (weekly_schedule_template CRUD)
// ============================================================================

function createDefaultWeek(doctorId: string): WeeklyScheduleRow[] {
  return [0, 1, 2, 3, 4, 5, 6].map((dow) => ({
    doctor_id: doctorId,
    day_of_week: dow,
    slots:
      dow >= 1 && dow <= 5
        ? [
            { start: '08:00', end: '12:00' },
            { start: '14:00', end: '18:00' },
          ]
        : [],
    breaks:
      dow >= 1 && dow <= 5
        ? [{ label: 'Almuerzo', start: '12:00', end: '14:00' }]
        : [],
    buffer_after_mins: 5,
    max_appointments: null,
    is_active: dow >= 1 && dow <= 5,
  }));
}

export function useDoctorSchedule(
  supabase: SB,
  doctorId: string | null | undefined,
) {
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklyScheduleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // LOAD
  const loadSchedule = useCallback(async () => {
    if (!doctorId) return;
    setLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from('weekly_schedule_template')
        .select('*')
        .eq('doctor_id', doctorId)
        .order('day_of_week');

      if (queryError) throw queryError;

      if (data && data.length > 0) {
        setWeeklySchedule(data as WeeklyScheduleRow[]);
      } else {
        setWeeklySchedule(createDefaultWeek(doctorId));
      }
    } catch (err) {
      console.error('Error loading schedule:', err);
      setError('No se pudo cargar el horario');
      if (doctorId) setWeeklySchedule(createDefaultWeek(doctorId));
    } finally {
      setLoading(false);
    }
  }, [supabase, doctorId]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  // SAVE
  const saveWeeklySchedule = useCallback(
    async (rows: WeeklyScheduleRow[]) => {
      if (!doctorId) return;
      setSaving(true);
      setError(null);

      try {
        const upsertRows = rows.map((r) => ({
          ...r,
          doctor_id: doctorId,
          slots: r.slots,
          breaks: r.breaks,
        }));

        const { error: upsertError } = await supabase
          .from('weekly_schedule_template')
          .upsert(upsertRows, { onConflict: 'doctor_id,day_of_week' });

        if (upsertError) throw upsertError;
        setWeeklySchedule(rows);
      } catch (err) {
        console.error('Error saving schedule:', err);
        setError('No se pudo guardar el horario');
      } finally {
        setSaving(false);
      }
    },
    [supabase, doctorId],
  );

  return {
    weeklySchedule,
    setWeeklySchedule,
    saveWeeklySchedule,
    loading,
    saving,
    error,
    refresh: loadSchedule,
  };
}

// ============================================================================
// TIME BLOCKS CRUD
// ============================================================================

export function useTimeBlocks(
  supabase: SB,
  doctorId: string | null | undefined,
) {
  const [timeBlocks, setTimeBlocks] = useState<TimeBlockRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // LOAD
  const loadBlocks = useCallback(async () => {
    if (!doctorId) return;
    setLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from('time_blocks')
        .select('*')
        .eq('doctor_id', doctorId)
        .order('starts_at', { ascending: true });

      if (queryError) throw queryError;
      setTimeBlocks((data ?? []) as TimeBlockRow[]);
    } catch (err) {
      console.error('Error loading time blocks:', err);
      setError('No se pudo cargar los bloqueos');
    } finally {
      setLoading(false);
    }
  }, [supabase, doctorId]);

  useEffect(() => {
    loadBlocks();
  }, [loadBlocks]);

  // ADD
  const addTimeBlock = useCallback(
    async (block: Omit<TimeBlockRow, 'id'>) => {
      if (!doctorId) return;
      setSaving(true);
      setError(null);

      try {
        const { data, error: insertError } = await supabase
          .from('time_blocks')
          .insert({ ...block, doctor_id: doctorId })
          .select()
          .single();

        if (insertError) throw insertError;
        setTimeBlocks((prev) => [...prev, data as TimeBlockRow]);
      } catch (err) {
        console.error('Error adding time block:', err);
        setError('No se pudo crear el bloqueo');
      } finally {
        setSaving(false);
      }
    },
    [supabase, doctorId],
  );

  // UPDATE
  const updateTimeBlock = useCallback(
    async (id: string, updates: Partial<TimeBlockRow>) => {
      setSaving(true);
      setError(null);

      try {
        const { data, error: updateError } = await supabase
          .from('time_blocks')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (updateError) throw updateError;
        setTimeBlocks((prev) => prev.map((b) => (b.id === id ? (data as TimeBlockRow) : b)));
      } catch (err) {
        console.error('Error updating time block:', err);
        setError('No se pudo actualizar el bloqueo');
      } finally {
        setSaving(false);
      }
    },
    [supabase],
  );

  // DELETE
  const deleteTimeBlock = useCallback(
    async (id: string) => {
      setSaving(true);
      setError(null);

      try {
        const { error: deleteError } = await supabase
          .from('time_blocks')
          .delete()
          .eq('id', id);

        if (deleteError) throw deleteError;
        setTimeBlocks((prev) => prev.filter((b) => b.id !== id));
      } catch (err) {
        console.error('Error deleting time block:', err);
        setError('No se pudo eliminar el bloqueo');
      } finally {
        setSaving(false);
      }
    },
    [supabase],
  );

  return {
    timeBlocks,
    addTimeBlock,
    updateTimeBlock,
    deleteTimeBlock,
    loading,
    saving,
    error,
    refresh: loadBlocks,
  };
}

// ============================================================================
// AVAILABILITY EXCEPTIONS CRUD
// ============================================================================

export function useAvailabilityExceptions(
  supabase: SB,
  doctorId: string | null | undefined,
) {
  const [exceptions, setExceptions] = useState<AvailabilityExceptionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // LOAD
  const loadExceptions = useCallback(async () => {
    if (!doctorId) return;
    setLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from('doctor_availability_exceptions')
        .select('*')
        .eq('doctor_id', doctorId)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date');

      if (queryError) throw queryError;
      setExceptions((data ?? []) as AvailabilityExceptionRow[]);
    } catch (err) {
      console.error('Error loading exceptions:', err);
      setError('No se pudo cargar las excepciones');
    } finally {
      setLoading(false);
    }
  }, [supabase, doctorId]);

  useEffect(() => {
    loadExceptions();
  }, [loadExceptions]);

  // ADD
  const addException = useCallback(
    async (exception: Omit<AvailabilityExceptionRow, 'id'>) => {
      if (!doctorId) return;
      setSaving(true);
      setError(null);

      try {
        const { data, error: insertError } = await supabase
          .from('doctor_availability_exceptions')
          .insert({ ...exception, doctor_id: doctorId })
          .select()
          .single();

        if (insertError) throw insertError;
        setExceptions((prev) =>
          [...prev, data as AvailabilityExceptionRow].sort((a, b) =>
            a.date.localeCompare(b.date),
          ),
        );
      } catch (err) {
        console.error('Error adding exception:', err);
        setError('No se pudo agregar la excepcion');
      } finally {
        setSaving(false);
      }
    },
    [supabase, doctorId],
  );

  // DELETE
  const deleteException = useCallback(
    async (id: string) => {
      setSaving(true);
      setError(null);

      try {
        const { error: deleteError } = await supabase
          .from('doctor_availability_exceptions')
          .delete()
          .eq('id', id);

        if (deleteError) throw deleteError;
        setExceptions((prev) => prev.filter((e) => e.id !== id));
      } catch (err) {
        console.error('Error deleting exception:', err);
        setError('No se pudo eliminar la excepcion');
      } finally {
        setSaving(false);
      }
    },
    [supabase],
  );

  return {
    exceptions,
    addException,
    deleteException,
    loading,
    saving,
    error,
    refresh: loadExceptions,
  };
}
