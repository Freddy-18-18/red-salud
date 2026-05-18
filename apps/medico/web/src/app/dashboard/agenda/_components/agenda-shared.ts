/**
 * Shared types, constants, and helpers for the Agenda module.
 * Centralised so page.tsx stays focused on orchestration and rendering.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface Appointment {
  id: string;
  scheduled_at: string;
  duration_minutes: number;
  reason: string | null;
  status: string;
  appointment_type: string | null;
  internal_notes: string | null;
  paciente: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    telefono: string | null;
  } | null;
}

export type ViewMode = 'day' | 'week' | 'month';

export type StatusKey =
  | 'scheduled'
  | 'confirmed'
  | 'waiting'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type TypeKey =
  | 'in_person'
  | 'follow_up'
  | 'telemedicine'
  | 'emergency'
  | 'first_visit';

export type StatusStyle = {
  label: string;
  pill: string;
  dot: string;
};

export type TypeStyle = {
  label: string;
  bar: string;
  surface: string;
  text: string;
};

export type AgendaFilters = {
  search: string;
  statuses: Set<string>;
  types: Set<string>;
};

// ============================================================================
// GRID CONSTANTS
// ============================================================================

export const DAY_START_HOUR = 7;
export const DAY_END_HOUR = 21;
export const HOURS = Array.from(
  { length: DAY_END_HOUR - DAY_START_HOUR },
  (_, i) => i + DAY_START_HOUR,
);
export const SLOT_MINUTES = 15;
export const SLOTS_PER_HOUR = 60 / SLOT_MINUTES;
export const SLOT_HEIGHT_PX = 18;
export const HOUR_HEIGHT_PX = SLOT_HEIGHT_PX * SLOTS_PER_HOUR;
export const TOTAL_GRID_HEIGHT_PX = HOUR_HEIGHT_PX * HOURS.length;
export const DRAG_THRESHOLD_PX = 5;
export const MIN_BLOCK_SLOTS = 2;

// ============================================================================
// THEME-AWARE STATUS + TYPE STYLES
// All colors come from design-system tokens — dark mode is automatic.
// ============================================================================

export const STATUS_CONFIG: Record<string, StatusStyle> = {
  scheduled:   { label: 'Programada',  pill: 'bg-info/10 text-info ring-1 ring-inset ring-info/20',                                       dot: 'bg-info' },
  confirmed:   { label: 'Confirmada',  pill: 'bg-success/10 text-success ring-1 ring-inset ring-success/25',                              dot: 'bg-success' },
  waiting:     { label: 'En espera',   pill: 'bg-warning/10 text-warning ring-1 ring-inset ring-warning/25',                              dot: 'bg-warning' },
  in_progress: { label: 'En curso',    pill: 'bg-violet-500/10 text-violet-600 dark:text-violet-300 ring-1 ring-inset ring-violet-500/25', dot: 'bg-violet-500' },
  completed:   { label: 'Completada',  pill: 'bg-muted text-muted-foreground ring-1 ring-inset ring-border',                              dot: 'bg-muted-foreground' },
  cancelled:   { label: 'Cancelada',   pill: 'bg-destructive/10 text-destructive ring-1 ring-inset ring-destructive/25',                  dot: 'bg-destructive' },
  no_show:     { label: 'No asistió',  pill: 'bg-destructive/10 text-destructive ring-1 ring-inset ring-destructive/25',                  dot: 'bg-destructive' },
};

export const STATUS_ORDER: StatusKey[] = [
  'scheduled',
  'confirmed',
  'waiting',
  'in_progress',
  'completed',
  'cancelled',
  'no_show',
];

export const TYPE_STYLES: Record<string, TypeStyle> = {
  in_person:    { label: 'Presencial',    bar: 'bg-info',         surface: 'bg-info/[0.08] border-info/30 hover:border-info/50',                 text: 'text-info' },
  follow_up:    { label: 'Control',       bar: 'bg-success',      surface: 'bg-success/[0.08] border-success/30 hover:border-success/50',        text: 'text-success' },
  telemedicine: { label: 'Telemedicina',  bar: 'bg-violet-500',   surface: 'bg-violet-500/[0.08] border-violet-500/30 hover:border-violet-500/50', text: 'text-violet-600 dark:text-violet-300' },
  emergency:    { label: 'Urgencia',      bar: 'bg-destructive',  surface: 'bg-destructive/[0.08] border-destructive/30 hover:border-destructive/50', text: 'text-destructive' },
  first_visit:  { label: 'Primera vez',   bar: 'bg-warning',      surface: 'bg-warning/[0.08] border-warning/30 hover:border-warning/50',        text: 'text-warning' },
};

export const TYPE_ORDER: TypeKey[] = [
  'in_person',
  'follow_up',
  'first_visit',
  'telemedicine',
  'emergency',
];

export const DEFAULT_TYPE_STYLE: TypeStyle = {
  label: 'Cita',
  bar: 'bg-muted-foreground',
  surface: 'bg-muted/50 border-border hover:border-border-strong',
  text: 'text-muted-foreground',
};

export function getTypeStyle(type: string | null | undefined): TypeStyle {
  if (!type) return DEFAULT_TYPE_STYLE;
  return TYPE_STYLES[type] ?? DEFAULT_TYPE_STYLE;
}

// ============================================================================
// TIME HELPERS
// ============================================================================

/** Monday-anchored start of week. */
export function getWeekDays(date: Date): Date[] {
  const start = new Date(date);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}

/** Local YYYY-MM-DD (NEVER toISOString — avoids UTC drift in es-VE). */
export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return formatDateKey(a) === formatDateKey(b);
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function minutesFromDayStart(date: Date): number {
  return (date.getHours() - DAY_START_HOUR) * 60 + date.getMinutes();
}

export function blockTop(date: Date): number {
  return (minutesFromDayStart(date) / SLOT_MINUTES) * SLOT_HEIGHT_PX;
}

export function blockHeight(durationMin: number): number {
  const slots = Math.max(durationMin / SLOT_MINUTES, MIN_BLOCK_SLOTS);
  return slots * SLOT_HEIGHT_PX;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Monday-anchored 6-week grid covering the given month.
 * Always returns 42 days so the grid is a stable 7×6.
 */
export function getMonthGrid(date: Date): Date[] {
  const firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const startWeek = getWeekDays(firstOfMonth);
  const start = startWeek[0];
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}

// ============================================================================
// FILTERING
// ============================================================================

export function matchesFilters(apt: Appointment, filters: AgendaFilters): boolean {
  if (filters.statuses.size > 0 && !filters.statuses.has(apt.status)) return false;
  if (filters.types.size > 0) {
    const t = apt.appointment_type ?? '__none__';
    if (!filters.types.has(t)) return false;
  }
  if (filters.search.trim().length > 0) {
    const q = filters.search.trim().toLowerCase();
    const name = (apt.paciente?.full_name ?? '').toLowerCase();
    const reason = (apt.reason ?? '').toLowerCase();
    if (!name.includes(q) && !reason.includes(q)) return false;
  }
  return true;
}

export function emptyFilters(): AgendaFilters {
  return { search: '', statuses: new Set(), types: new Set() };
}

export function filtersActive(filters: AgendaFilters): boolean {
  return (
    filters.search.trim().length > 0 ||
    filters.statuses.size > 0 ||
    filters.types.size > 0
  );
}
