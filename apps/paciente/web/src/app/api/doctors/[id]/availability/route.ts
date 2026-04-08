import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/utils/rate-limit';

// -------------------------------------------------------------------
// Doctor Availability — BFF API Route
// -------------------------------------------------------------------
// If `date` param is provided (YYYY-MM-DD): returns 30-min time slots
// for that specific date with conflict detection.
// If no `date`: returns available dates for the next 30 days based on
// the doctor's weekly schedule template.
// Public endpoint — no authentication required.
// -------------------------------------------------------------------

interface AvailabilityRow {
  id: string;
  day_of_week: number; // 0 = Sunday, 6 = Saturday
  start_time: string; // HH:MM:SS
  end_time: string; // HH:MM:SS
  is_available: boolean;
}

interface AppointmentRow {
  start_time: string; // ISO datetime
  end_time: string; // ISO datetime
  status: string;
}

interface TimeSlot {
  start: string; // HH:MM
  end: string; // HH:MM
  available: boolean;
}

interface GroupedSlots {
  morning: TimeSlot[];
  afternoon: TimeSlot[];
  evening: TimeSlot[];
}

/**
 * Generate 30-minute time slots between a start and end time,
 * marking slots as unavailable if they overlap with existing appointments.
 */
function generateSlots(
  startTime: string,
  endTime: string,
  appointments: AppointmentRow[],
  dateStr: string,
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  let currentMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  while (currentMinutes + 30 <= endMinutes) {
    const slotStartH = Math.floor(currentMinutes / 60);
    const slotStartM = currentMinutes % 60;
    const slotEndH = Math.floor((currentMinutes + 30) / 60);
    const slotEndM = (currentMinutes + 30) % 60;

    const slotStart = `${String(slotStartH).padStart(2, '0')}:${String(slotStartM).padStart(2, '0')}`;
    const slotEnd = `${String(slotEndH).padStart(2, '0')}:${String(slotEndM).padStart(2, '0')}`;

    // Check for conflicts with existing appointments
    const slotStartISO = new Date(`${dateStr}T${slotStart}:00`).getTime();
    const slotEndISO = new Date(`${dateStr}T${slotEnd}:00`).getTime();

    const hasConflict = appointments.some((apt) => {
      if (apt.status === 'cancelada') return false;
      const aptStart = new Date(apt.start_time).getTime();
      const aptEnd = new Date(apt.end_time).getTime();
      return slotStartISO < aptEnd && slotEndISO > aptStart;
    });

    slots.push({
      start: slotStart,
      end: slotEnd,
      available: !hasConflict,
    });

    currentMinutes += 30;
  }

  return slots;
}

/**
 * Group time slots into morning (before 12:00), afternoon (12:00-17:00),
 * and evening (17:00+).
 */
function groupSlots(slots: TimeSlot[]): GroupedSlots {
  return {
    morning: slots.filter((s) => {
      const hour = parseInt(s.start.split(':')[0], 10);
      return hour < 12;
    }),
    afternoon: slots.filter((s) => {
      const hour = parseInt(s.start.split(':')[0], 10);
      return hour >= 12 && hour < 17;
    }),
    evening: slots.filter((s) => {
      const hour = parseInt(s.start.split(':')[0], 10);
      return hour >= 17;
    }),
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const limited = checkRateLimit(request, 'public');
    if (limited) return limited;

    const { id: doctorId } = await params;
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date'); // YYYY-MM-DD

    // --- Fetch the doctor's weekly availability template ---
    const { data: availability, error: availError } = await supabase
      .from('doctor_availability')
      .select('id, day_of_week, start_time, end_time, is_available')
      .eq('doctor_id', doctorId)
      .eq('is_available', true);

    if (availError) {
      console.error('[Doctor Availability] Supabase error:', availError);
      return NextResponse.json(
        { error: 'Error al obtener disponibilidad.' },
        { status: 500 },
      );
    }

    const schedule = (availability ?? []) as AvailabilityRow[];

    // -----------------------------------------------------------
    // MODE 1: Specific date → return time slots with conflicts
    // -----------------------------------------------------------
    if (dateParam) {
      // Validate date format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
        return NextResponse.json(
          { error: 'Formato de fecha inválido. Usa YYYY-MM-DD.' },
          { status: 400 },
        );
      }

      const requestedDate = new Date(dateParam + 'T00:00:00');
      const dayOfWeek = requestedDate.getDay(); // 0 = Sunday

      // Find schedule blocks for that day of week
      const daySchedule = schedule.filter((s) => s.day_of_week === dayOfWeek);

      if (daySchedule.length === 0) {
        return NextResponse.json({
          data: {
            date: dateParam,
            slots: { morning: [], afternoon: [], evening: [] } as GroupedSlots,
            total_available: 0,
          },
        });
      }

      // Fetch existing appointments for that date
      const dayStart = `${dateParam}T00:00:00`;
      const dayEnd = `${dateParam}T23:59:59`;

      const { data: appointments, error: aptError } = await supabase
        .from('appointments')
        .select('start_time, end_time, status')
        .eq('doctor_id', doctorId)
        .gte('start_time', dayStart)
        .lte('start_time', dayEnd)
        .neq('status', 'cancelada');

      if (aptError) {
        console.error('[Doctor Availability] Appointments query error:', aptError);
        return NextResponse.json(
          { error: 'Error al verificar citas existentes.' },
          { status: 500 },
        );
      }

      const existingAppointments = (appointments ?? []) as AppointmentRow[];

      // Generate all slots across all schedule blocks for this day
      const allSlots: TimeSlot[] = [];
      for (const block of daySchedule) {
        const blockSlots = generateSlots(
          block.start_time,
          block.end_time,
          existingAppointments,
          dateParam,
        );
        allSlots.push(...blockSlots);
      }

      // Sort by start time
      allSlots.sort((a, b) => a.start.localeCompare(b.start));

      const grouped = groupSlots(allSlots);
      const totalAvailable = allSlots.filter((s) => s.available).length;

      return NextResponse.json({
        data: {
          date: dateParam,
          slots: grouped,
          total_available: totalAvailable,
        },
      });
    }

    // -----------------------------------------------------------
    // MODE 2: No date → return available dates for next 30 days
    // -----------------------------------------------------------
    const availableDays = new Set(schedule.map((s) => s.day_of_week));
    const today = new Date();
    const dates: string[] = [];

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      if (availableDays.has(date.getDay())) {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        dates.push(`${yyyy}-${mm}-${dd}`);
      }
    }

    return NextResponse.json({
      data: {
        available_dates: dates,
        schedule: schedule.map((s) => ({
          day_of_week: s.day_of_week,
          start_time: s.start_time,
          end_time: s.end_time,
        })),
      },
    });
  } catch (error) {
    console.error('[Doctor Availability] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 },
    );
  }
}
