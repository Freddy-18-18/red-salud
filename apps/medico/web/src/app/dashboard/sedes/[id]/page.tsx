import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { SedeWizard } from '@/components/sedes/wizard/sede-wizard';
import {
  DEFAULT_WEEKLY_SCHEDULE,
  type ScheduleDay,
  type ScheduleSlot,
  type WeeklySchedule,
} from '@/components/sedes/sede-wizard-types';
import type { DoctorPracticeLocation } from '@/lib/sedes/types';
import { createClient } from '@/lib/supabase/server';

/**
 * @file app/dashboard/sedes/[id]/page.tsx
 * @description Wizard in edit mode for a single sede.
 *
 * Server-fetches both the sede row and its weekly schedule template so the
 * wizard hydrates with the doctor's existing data. RLS guarantees we only
 * see this doctor's own rows — a foreign id returns null and we 404.
 */

export const dynamic = 'force-dynamic';

const SELECT_COLUMNS =
  'id,doctor_id,name,address,city,state,postal_code,phone,latitude,longitude,notes,amenities,arrival_instructions,is_primary,active,created_at,updated_at';

interface WeeklyRow {
  day_of_week: number;
  is_working_day: boolean;
  slots: unknown;
  default_duration_mins: number;
  buffer_after_mins: number;
}

function parseSlots(raw: unknown): ScheduleSlot[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry) => {
      if (typeof entry !== 'object' || entry === null) return null;
      const obj = entry as Record<string, unknown>;
      const start = typeof obj.start === 'string' ? obj.start : null;
      const end = typeof obj.end === 'string' ? obj.end : null;
      if (!start || !end) return null;
      return { start, end } as ScheduleSlot;
    })
    .filter((s): s is ScheduleSlot => s !== null);
}

function scheduleFromRows(rows: WeeklyRow[]): WeeklySchedule {
  if (rows.length === 0) return DEFAULT_WEEKLY_SCHEDULE;
  const days: ScheduleDay[] = Array.from({ length: 7 }, (_, dow) => {
    const row = rows.find((r) => r.day_of_week === dow);
    if (!row) return DEFAULT_WEEKLY_SCHEDULE.days[dow];
    return {
      dayOfWeek: row.day_of_week,
      isWorkingDay: row.is_working_day,
      slots: parseSlots(row.slots),
    };
  });
  return {
    days,
    defaultDurationMins:
      rows[0]?.default_duration_mins ?? DEFAULT_WEEKLY_SCHEDULE.defaultDurationMins,
    bufferAfterMins:
      rows[0]?.buffer_after_mins ?? DEFAULT_WEEKLY_SCHEDULE.bufferAfterMins,
  };
}

export default async function EditSedePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: sedeRow } = await supabase
    .from('doctor_practice_locations')
    .select(SELECT_COLUMNS)
    .eq('id', id)
    .maybeSingle();

  if (!sedeRow) {
    notFound();
  }

  const sede = sedeRow as DoctorPracticeLocation;

  const { data: scheduleRows } = await supabase
    .from('weekly_schedule_template')
    .select('day_of_week,is_working_day,slots,default_duration_mins,buffer_after_mins')
    .eq('office_id', sede.id);

  const schedule = scheduleFromRows((scheduleRows ?? []) as WeeklyRow[]);

  const { count } = await supabase
    .from('doctor_practice_locations')
    .select('id', { count: 'exact', head: true })
    .eq('doctor_id', user.id)
    .eq('active', true);

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/sedes"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Volver a sedes
      </Link>

      <header className="space-y-1 border-b border-border pb-4">
        <h1 className="text-2xl font-bold tracking-tight">Editar sede</h1>
        <p className="text-sm text-muted-foreground">{sede.name}</p>
      </header>

      <SedeWizard
        doctorId={user.id}
        existingSedeCount={count ?? 0}
        initial={{ sede, schedule }}
      />
    </div>
  );
}
