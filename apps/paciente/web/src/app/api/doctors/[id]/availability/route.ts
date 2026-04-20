import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/utils/rate-limit';

// -------------------------------------------------------------------
// Doctor Availability — BFF API Route (public)
// -------------------------------------------------------------------
// Thin wrapper around two SECURITY DEFINER RPCs:
//   * get_doctor_public_availability(doctor_id, date)
//   * get_doctor_available_dates(doctor_id, days_ahead)
//
// The RPCs encapsulate conflict checks against appointments + time
// blocks without exposing any PII (only slot_start/slot_end/is_available).
// -------------------------------------------------------------------

interface RpcSlot {
  slot_start: string;
  slot_end: string;
  is_available: boolean;
}

interface TimeSlot {
  start: string; // HH:MM (local)
  end: string;   // HH:MM (local)
  available: boolean;
}

interface GroupedSlots {
  morning: TimeSlot[];
  afternoon: TimeSlot[];
  evening: TimeSlot[];
}

function toLocalHHMM(iso: string): string {
  // The RPC returns timestamptz; we format using the Caracas offset so the
  // UI shows the same wall-clock time the doctor configured.
  const d = new Date(iso);
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'America/Caracas',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return formatter.format(d);
}

function groupSlots(slots: TimeSlot[]): GroupedSlots {
  return {
    morning:   slots.filter((s) => parseInt(s.start.slice(0, 2), 10) < 12),
    afternoon: slots.filter((s) => {
      const h = parseInt(s.start.slice(0, 2), 10);
      return h >= 12 && h < 17;
    }),
    evening:   slots.filter((s) => parseInt(s.start.slice(0, 2), 10) >= 17),
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
    const dateParam = searchParams.get('date');

    // ---------- MODE 1: specific date ----------
    if (dateParam) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
        return NextResponse.json(
          { error: 'Formato de fecha inválido. Usa YYYY-MM-DD.' },
          { status: 400 },
        );
      }

      const { data, error } = await supabase.rpc('get_doctor_public_availability', {
        p_doctor_id: doctorId,
        p_date: dateParam,
        p_slot_duration_mins: null,
      });

      if (error) {
        console.error('[Doctor Availability] RPC error:', error);
        return NextResponse.json(
          { error: 'Error al obtener disponibilidad.' },
          { status: 500 },
        );
      }

      const rpcSlots = (data ?? []) as RpcSlot[];
      const slots: TimeSlot[] = rpcSlots.map((s) => ({
        start: toLocalHHMM(s.slot_start),
        end:   toLocalHHMM(s.slot_end),
        available: s.is_available,
      }));

      slots.sort((a, b) => a.start.localeCompare(b.start));

      return NextResponse.json({
        data: {
          date: dateParam,
          slots: groupSlots(slots),
          total_available: slots.filter((s) => s.available).length,
        },
      });
    }

    // ---------- MODE 2: next 30 days ----------
    const { data, error } = await supabase.rpc('get_doctor_available_dates', {
      p_doctor_id: doctorId,
      p_days_ahead: 30,
    });

    if (error) {
      console.error('[Doctor Availability] RPC error (dates):', error);
      return NextResponse.json(
        { error: 'Error al obtener fechas disponibles.' },
        { status: 500 },
      );
    }

    const rows = (data ?? []) as { date: string; available_count: number }[];
    const available_dates = rows.filter((r) => r.available_count > 0).map((r) => r.date);

    return NextResponse.json({
      data: {
        available_dates,
        day_counts: rows,
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
