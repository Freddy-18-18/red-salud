/**
 * Google Calendar Integration — Core Types & Helpers
 *
 * This module provides shared types, event mapping logic, and Google Calendar
 * REST API helpers that any app (medico, secretaria, clinica) can use.
 *
 * It does NOT import googleapis — all API calls use fetch against the REST v3 API.
 * Each consuming app is responsible for:
 *   1. Managing OAuth tokens (via its own Supabase client)
 *   2. Passing a valid access token to these helpers
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GoogleCalendarTokenData {
  user_id: string;
  access_token: string;
  refresh_token: string;
  token_expiry: string;
  scope: string;
  calendar_id: string;
  calendar_timezone: string;
  sync_enabled: boolean;
  sync_direction: 'to_google' | 'from_google' | 'bidirectional';
  last_sync_at: string | null;
  last_sync_token: string | null;
}

export interface GoogleCalendarEventMapping {
  id: string;
  appointment_id: string;
  google_event_id: string;
  google_calendar_id: string;
  last_synced_at: string;
  sync_status: 'synced' | 'pending' | 'conflict' | 'error';
  sync_error: string | null;
  local_updated_at: string;
  google_updated_at: string;
}

export interface GoogleCalendarImportedEvent {
  id: string;
  user_id: string;
  google_event_id: string;
  google_calendar_id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  all_day: boolean;
  location: string | null;
  last_synced_at: string;
  google_updated_at: string;
}

export interface GoogleCalendarEvent {
  id?: string;
  summary?: string;
  description?: string;
  start?: { dateTime?: string; date?: string; timeZone?: string };
  end?: { dateTime?: string; date?: string; timeZone?: string };
  location?: string;
  colorId?: string;
  status?: string;
  updated?: string;
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{ method: string; minutes: number }>;
  };
}

export interface CalendarAppointment {
  id: string;
  patient_name: string;
  scheduled_at: string;
  scheduled_end?: string;
  duration_minutes?: number;
  reason?: string;
  appointment_type?:
    | 'in_person'
    | 'telemedicine'
    | 'emergency'
    | 'follow_up'
    | 'first_visit';
  internal_notes?: string;
  status: string;
  location_id?: string;
  location_address?: string;
}

export interface SyncResult {
  success: boolean;
  synced: number;
  errors: string[];
  conflicts: Array<{
    appointment_id: string;
    message: string;
  }>;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const GOOGLE_CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
] as const;

export const GOOGLE_API_BASE = 'https://www.googleapis.com/calendar/v3';
export const GOOGLE_OAUTH_BASE = 'https://accounts.google.com/o/oauth2/v2/auth';
export const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
export const GOOGLE_REVOKE_ENDPOINT = 'https://oauth2.googleapis.com/revoke';

// ---------------------------------------------------------------------------
// Event Mapping
// ---------------------------------------------------------------------------

const TYPE_LABELS: Record<string, string> = {
  in_person: 'Presencial',
  telemedicine: 'Telemedicina',
  emergency: 'Emergencia',
  follow_up: 'Control',
  first_visit: 'Primera consulta',
};

/**
 * Google Calendar color IDs mapped to appointment statuses.
 * See https://developers.google.com/calendar/api/v3/reference/colors
 */
const STATUS_COLOR_MAP: Record<string, string> = {
  pending: '5',
  confirmed: '10',
  waiting: '4',
  in_consultation: '9',
  completed: '2',
  cancelled: '8',
  no_show: '11',
  rejected: '8',
};

/**
 * Convert a Red Salud appointment into a Google Calendar event payload.
 */
export function appointmentToGoogleEvent(
  appointment: CalendarAppointment,
): GoogleCalendarEvent {
  const typeLabel = appointment.appointment_type
    ? TYPE_LABELS[appointment.appointment_type] ?? appointment.appointment_type
    : '';

  const summaryParts = [
    appointment.status === 'confirmed' ? '\u2713' : '\u23F3',
    typeLabel,
    '-',
    appointment.patient_name,
  ].filter(Boolean);

  const descriptionParts = [
    appointment.reason && `Motivo: ${appointment.reason}`,
    appointment.appointment_type &&
      `Tipo: ${TYPE_LABELS[appointment.appointment_type] ?? appointment.appointment_type}`,
    appointment.internal_notes && `Notas: ${appointment.internal_notes}`,
    '\n---\nGestionado por Red Salud',
  ].filter(Boolean);

  const startDt = new Date(appointment.scheduled_at);
  let endDt: Date;

  if (appointment.scheduled_end) {
    endDt = new Date(appointment.scheduled_end);
  } else {
    const durationMs = (appointment.duration_minutes ?? 30) * 60 * 1000;
    endDt = new Date(startDt.getTime() + durationMs);
  }

  return {
    summary: summaryParts.join(' '),
    description: descriptionParts.join('\n'),
    start: {
      dateTime: startDt.toISOString(),
      timeZone: 'America/Caracas',
    },
    end: {
      dateTime: endDt.toISOString(),
      timeZone: 'America/Caracas',
    },
    location:
      appointment.location_address ?? appointment.location_id ?? undefined,
    colorId: STATUS_COLOR_MAP[appointment.status] ?? '1',
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 30 },
      ],
    },
  };
}

/**
 * Get the Google Calendar color ID for a given appointment status.
 */
export function getColorIdForStatus(status: string): string {
  return STATUS_COLOR_MAP[status] ?? '1';
}

// ---------------------------------------------------------------------------
// REST API Helpers (fetch-based, no googleapis dependency)
// ---------------------------------------------------------------------------

/**
 * Make an authenticated request to the Google Calendar REST API.
 *
 * @param accessToken - Valid OAuth2 access token
 * @param path - API path (e.g. `/calendars/primary/events`)
 * @param options - Standard fetch options (method, body, etc.)
 */
export async function gcalFetch<T = unknown>(
  accessToken: string,
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${GOOGLE_API_BASE}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> | undefined),
    },
  });

  if (res.status === 204) return undefined as T;

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Google Calendar API error (${res.status}): ${body}`);
  }

  return res.json() as Promise<T>;
}

/**
 * List events from a Google Calendar within a date range.
 */
export async function listCalendarEvents(
  accessToken: string,
  calendarId: string,
  timeMin: string,
  timeMax: string,
): Promise<GoogleCalendarEvent[]> {
  const params = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '250',
  });

  const data = await gcalFetch<{ items?: GoogleCalendarEvent[] }>(
    accessToken,
    `/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
  );

  return data.items ?? [];
}

/**
 * Create an event in Google Calendar.
 */
export async function createCalendarEvent(
  accessToken: string,
  calendarId: string,
  event: GoogleCalendarEvent,
): Promise<GoogleCalendarEvent> {
  return gcalFetch<GoogleCalendarEvent>(
    accessToken,
    `/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: 'POST',
      body: JSON.stringify(event),
    },
  );
}

/**
 * Update an existing event in Google Calendar.
 */
export async function updateCalendarEvent(
  accessToken: string,
  calendarId: string,
  eventId: string,
  event: GoogleCalendarEvent,
): Promise<GoogleCalendarEvent> {
  return gcalFetch<GoogleCalendarEvent>(
    accessToken,
    `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
    {
      method: 'PUT',
      body: JSON.stringify(event),
    },
  );
}

/**
 * Delete an event from Google Calendar.
 */
export async function deleteCalendarEvent(
  accessToken: string,
  calendarId: string,
  eventId: string,
): Promise<void> {
  await gcalFetch<void>(
    accessToken,
    `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
    { method: 'DELETE' },
  );
}

/**
 * Get primary calendar info (id + timezone).
 */
export async function getPrimaryCalendarInfo(
  accessToken: string,
): Promise<{ id: string; timeZone: string }> {
  const data = await gcalFetch<{ id?: string; timeZone?: string }>(
    accessToken,
    '/calendars/primary',
  );

  return {
    id: data.id ?? 'primary',
    timeZone: data.timeZone ?? 'America/Caracas',
  };
}

/**
 * Exchange an OAuth2 authorization code for tokens.
 */
export async function exchangeAuthorizationCode(params: {
  code: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
  token_type: string;
}> {
  const body = new URLSearchParams({
    code: params.code,
    client_id: params.clientId,
    client_secret: params.clientSecret,
    redirect_uri: params.redirectUri,
    grant_type: 'authorization_code',
  });

  const res = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Error exchanging OAuth code: ${err}`);
  }

  return res.json();
}

/**
 * Refresh an expired access token using a refresh token.
 */
export async function refreshAccessToken(params: {
  refreshToken: string;
  clientId: string;
  clientSecret: string;
}): Promise<{
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
}> {
  const body = new URLSearchParams({
    refresh_token: params.refreshToken,
    client_id: params.clientId,
    client_secret: params.clientSecret,
    grant_type: 'refresh_token',
  });

  const res = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Error refreshing Google token: ${err}`);
  }

  return res.json();
}

/**
 * Build a Google OAuth2 authorization URL.
 */
export function buildAuthorizationUrl(params: {
  clientId: string;
  redirectUri: string;
  state: string;
  scopes?: readonly string[];
}): string {
  const urlParams = new URLSearchParams({
    client_id: params.clientId,
    redirect_uri: params.redirectUri,
    response_type: 'code',
    scope: (params.scopes ?? GOOGLE_CALENDAR_SCOPES).join(' '),
    access_type: 'offline',
    prompt: 'consent',
    state: params.state,
  });

  return `${GOOGLE_OAUTH_BASE}?${urlParams.toString()}`;
}
