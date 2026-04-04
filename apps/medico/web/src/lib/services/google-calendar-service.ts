/**
 * Google Calendar Integration Service
 *
 * Handles OAuth2 flow and bidirectional sync between Red Salud appointments
 * and Google Calendar using the REST API v3 (no external dependencies).
 *
 * Environment variables required:
 *   GOOGLE_CLIENT_ID
 *   GOOGLE_CLIENT_SECRET
 *   GOOGLE_REDIRECT_URI  (optional, defaults to NEXT_PUBLIC_APP_URL + /api/calendar/google/callback)
 */

import { createClient } from '@/lib/supabase/server';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

export interface GoogleCalendarToken {
  id: string;
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
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{ method: string; minutes: number }>;
  };
  updated?: string;
}

export interface SyncResult {
  success: boolean;
  eventId?: string;
  error?: string;
}

// ---------------------------------------------------------------------------
// Configuration helpers
// ---------------------------------------------------------------------------

const GOOGLE_CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
];

const GOOGLE_API_BASE = 'https://www.googleapis.com/calendar/v3';
const GOOGLE_OAUTH_BASE = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const GOOGLE_REVOKE_ENDPOINT = 'https://oauth2.googleapis.com/revoke';

function getClientId(): string {
  const id = process.env.GOOGLE_CLIENT_ID;
  if (!id) throw new Error('GOOGLE_CLIENT_ID no configurado');
  return id;
}

function getClientSecret(): string {
  const secret = process.env.GOOGLE_CLIENT_SECRET;
  if (!secret) throw new Error('GOOGLE_CLIENT_SECRET no configurado');
  return secret;
}

function getRedirectUri(): string {
  if (process.env.GOOGLE_REDIRECT_URI) return process.env.GOOGLE_REDIRECT_URI;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl)
    throw new Error('NEXT_PUBLIC_APP_URL o GOOGLE_REDIRECT_URI requerido');
  return `${appUrl}/api/calendar/google/callback`;
}

/**
 * Returns true when all required env vars are present.
 * API routes can use this to short-circuit gracefully.
 */
export function isGoogleCalendarConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      (process.env.GOOGLE_REDIRECT_URI || process.env.NEXT_PUBLIC_APP_URL),
  );
}

// ---------------------------------------------------------------------------
// Token management (internal)
// ---------------------------------------------------------------------------

interface TokenPayload {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

/**
 * Exchange an authorization code for an access + refresh token pair.
 */
async function requestTokens(code: string): Promise<TokenPayload> {
  const body = new URLSearchParams({
    code,
    client_id: getClientId(),
    client_secret: getClientSecret(),
    redirect_uri: getRedirectUri(),
    grant_type: 'authorization_code',
  });

  const res = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Error al intercambiar código OAuth: ${err}`);
  }

  return res.json() as Promise<TokenPayload>;
}

/**
 * Refresh an expired access token using the stored refresh token.
 */
async function refreshAccessToken(refreshToken: string): Promise<TokenPayload> {
  const body = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: getClientId(),
    client_secret: getClientSecret(),
    grant_type: 'refresh_token',
  });

  const res = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Error al refrescar token de Google: ${err}`);
  }

  return res.json() as Promise<TokenPayload>;
}

/**
 * Get a valid access token for a user, refreshing if necessary.
 * Returns the access token string ready for Authorization header.
 */
async function getValidAccessToken(userId: string): Promise<{
  accessToken: string;
  calendarId: string;
}> {
  const supabase = await createClient();

  const { data: tokenData, error } = await supabase
    .from('google_calendar_tokens')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !tokenData) {
    throw new Error(
      'Google Calendar no conectado. Por favor, autoriza primero.',
    );
  }

  const expiryDate = new Date(tokenData.token_expiry);
  const now = new Date(Date.now() + 5 * 60 * 1000); // 5 min buffer

  if (expiryDate <= now) {
    // Token expired — refresh
    const refreshed = await refreshAccessToken(tokenData.refresh_token);

    const newExpiry = new Date(
      Date.now() + refreshed.expires_in * 1000,
    ).toISOString();

    await supabase
      .from('google_calendar_tokens')
      .update({
        access_token: refreshed.access_token,
        token_expiry: newExpiry,
      })
      .eq('user_id', userId);

    return {
      accessToken: refreshed.access_token,
      calendarId: tokenData.calendar_id,
    };
  }

  return {
    accessToken: tokenData.access_token,
    calendarId: tokenData.calendar_id,
  };
}

// ---------------------------------------------------------------------------
// Google Calendar REST helpers
// ---------------------------------------------------------------------------

async function gcalFetch<T = unknown>(
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

  // DELETE returns 204 No Content
  if (res.status === 204) return undefined as T;

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Google Calendar API error (${res.status}): ${body}`);
  }

  return res.json() as Promise<T>;
}

async function listEvents(
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

async function createEvent(
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

async function updateEvent(
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

async function deleteEvent(
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

async function getPrimaryCalendar(
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

// ---------------------------------------------------------------------------
// Appointment <-> Google Event mapping
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
  pending: '5', // Yellow
  confirmed: '10', // Green
  waiting: '4', // Pink
  in_consultation: '9', // Blue
  completed: '2', // Sage
  cancelled: '8', // Gray
  no_show: '11', // Red
  rejected: '8', // Gray
};

function appointmentToGoogleEvent(
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

// ---------------------------------------------------------------------------
// Public API — OAuth2
// ---------------------------------------------------------------------------

/**
 * Generate the Google OAuth2 authorization URL for a given user.
 */
export function getAuthorizationUrl(userId: string): string {
  if (!isGoogleCalendarConfigured()) {
    throw new Error(
      'Google Calendar no está configurado. Faltan variables de entorno.',
    );
  }

  const params = new URLSearchParams({
    client_id: getClientId(),
    redirect_uri: getRedirectUri(),
    response_type: 'code',
    scope: GOOGLE_CALENDAR_SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    state: userId,
  });

  return `${GOOGLE_OAUTH_BASE}?${params.toString()}`;
}

/**
 * Exchange an OAuth2 authorization code for access/refresh tokens and persist them.
 */
export async function exchangeCodeForTokens(
  code: string,
  userId: string,
): Promise<void> {
  const tokens = await requestTokens(code);

  if (!tokens.access_token) {
    throw new Error('No se obtuvo access token de Google');
  }

  // Get primary calendar info to store calendar ID and timezone
  const calendarInfo = await getPrimaryCalendar(tokens.access_token);

  const expiresAt = new Date(
    Date.now() + tokens.expires_in * 1000,
  ).toISOString();

  const supabase = await createClient();

  const tokenData = {
    user_id: userId,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token ?? '',
    token_expiry: expiresAt,
    scope: tokens.scope,
    calendar_id: calendarInfo.id,
    calendar_timezone: calendarInfo.timeZone,
    sync_enabled: true,
    sync_direction: 'bidirectional' as const,
  };

  const { error } = await supabase
    .from('google_calendar_tokens')
    .upsert(tokenData, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    throw new Error(`Error al guardar tokens: ${error.message}`);
  }
}

// ---------------------------------------------------------------------------
// Public API — Disconnect
// ---------------------------------------------------------------------------

/**
 * Disconnect (revoke tokens and remove stored credentials) for a user.
 */
export async function disconnectGoogleCalendar(
  userId: string,
): Promise<{ success: boolean }> {
  const supabase = await createClient();

  try {
    // Try to revoke the token at Google (best-effort)
    const { data: tokenData } = await supabase
      .from('google_calendar_tokens')
      .select('access_token')
      .eq('user_id', userId)
      .single();

    if (tokenData?.access_token) {
      // Fire-and-forget revocation
      fetch(
        `${GOOGLE_REVOKE_ENDPOINT}?token=${encodeURIComponent(tokenData.access_token)}`,
        { method: 'POST' },
      ).catch(() => {
        // Revocation failure is non-critical
      });
    }

    // Get appointment IDs for this doctor so we can delete their mappings.
    // google_calendar_event_mappings doesn't have user_id — it references
    // appointments, so we need to find them through the appointments table.
    const { data: doctorAppointments } = await supabase
      .from('appointments')
      .select('id')
      .eq('doctor_id', userId);

    const appointmentIds =
      doctorAppointments?.map((a) => a.id) ?? [];

    // Delete all stored data
    await supabase
      .from('google_calendar_imported_events')
      .delete()
      .eq('user_id', userId);

    await supabase
      .from('google_calendar_tokens')
      .delete()
      .eq('user_id', userId);

    if (appointmentIds.length > 0) {
      await supabase
        .from('google_calendar_event_mappings')
        .delete()
        .in('appointment_id', appointmentIds);
    }

    return { success: true };
  } catch (err) {
    console.error('Error al desconectar Google Calendar:', err);
    return { success: false };
  }
}

// ---------------------------------------------------------------------------
// Public API — Sync appointment TO Google
// ---------------------------------------------------------------------------

/**
 * Sync a single appointment to Google Calendar (create or update).
 */
export async function syncAppointmentToGoogle(
  userId: string,
  appointment: CalendarAppointment | Record<string, unknown>,
): Promise<SyncResult> {
  try {
    const { accessToken, calendarId } = await getValidAccessToken(userId);
    const supabase = await createClient();

    // Normalize appointment shape
    const appt = appointment as CalendarAppointment;

    // Check if we already have a mapping for this appointment
    const { data: mapping } = await supabase
      .from('google_calendar_event_mappings')
      .select('google_event_id')
      .eq('appointment_id', appt.id)
      .single();

    const eventData = appointmentToGoogleEvent(appt);
    let googleEventId: string;

    if (mapping?.google_event_id) {
      // Update existing event
      const updated = await updateEvent(
        accessToken,
        calendarId,
        mapping.google_event_id,
        eventData,
      );
      googleEventId = updated.id!;
    } else {
      // Create new event
      const created = await createEvent(accessToken, calendarId, eventData);
      googleEventId = created.id!;

      // Store the mapping
      await supabase.from('google_calendar_event_mappings').insert({
        appointment_id: appt.id,
        google_event_id: googleEventId,
        google_calendar_id: calendarId,
        local_updated_at: new Date().toISOString(),
        google_updated_at: new Date().toISOString(),
        sync_status: 'synced',
      });
    }

    // Update mapping sync status
    await supabase
      .from('google_calendar_event_mappings')
      .update({
        last_synced_at: new Date().toISOString(),
        google_updated_at: new Date().toISOString(),
        sync_status: 'synced',
        sync_error: null,
      })
      .eq('appointment_id', appt.id);

    return { success: true, eventId: googleEventId };
  } catch (err) {
    console.error('Error al sincronizar cita a Google Calendar:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error desconocido',
    };
  }
}

/**
 * Delete an appointment's corresponding Google Calendar event.
 */
export async function deleteAppointmentFromGoogle(
  userId: string,
  appointmentId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { accessToken } = await getValidAccessToken(userId);
    const supabase = await createClient();

    const { data: mapping } = await supabase
      .from('google_calendar_event_mappings')
      .select('google_event_id, google_calendar_id')
      .eq('appointment_id', appointmentId)
      .single();

    if (!mapping) {
      return { success: true }; // Nothing to delete
    }

    await deleteEvent(
      accessToken,
      mapping.google_calendar_id,
      mapping.google_event_id,
    );

    await supabase
      .from('google_calendar_event_mappings')
      .delete()
      .eq('appointment_id', appointmentId);

    return { success: true };
  } catch (err) {
    console.error('Error al eliminar evento de Google Calendar:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error desconocido',
    };
  }
}

// ---------------------------------------------------------------------------
// Public API — Import events FROM Google
// ---------------------------------------------------------------------------

/**
 * Import events from Google Calendar into the local system (external events
 * shown as blocked time in the agenda).
 */
export async function importEventsFromGoogle(
  userId: string,
  startDate: Date,
  endDate: Date,
): Promise<{ success: boolean; imported: number; error?: string }> {
  try {
    const { accessToken, calendarId } = await getValidAccessToken(userId);
    const supabase = await createClient();

    const events = await listEvents(
      accessToken,
      calendarId,
      startDate.toISOString(),
      endDate.toISOString(),
    );

    // Get existing mappings so we can skip our own synced events
    const { data: mappings } = await supabase
      .from('google_calendar_event_mappings')
      .select('google_event_id');

    const ownEventIds = new Set(
      mappings?.map((m) => m.google_event_id) ?? [],
    );

    let imported = 0;

    for (const event of events) {
      if (!event.id) continue;
      if (ownEventIds.has(event.id)) continue;
      if (event.status === 'cancelled') continue;

      const startTime = event.start?.dateTime ?? event.start?.date;
      const endTime = event.end?.dateTime ?? event.end?.date;
      if (!startTime || !endTime) continue;

      await supabase.from('google_calendar_imported_events').upsert(
        {
          user_id: userId,
          google_event_id: event.id,
          google_calendar_id: calendarId,
          title: event.summary ?? '(Sin titulo)',
          description: event.description ?? null,
          start_time: startTime,
          end_time: endTime,
          all_day: !event.start?.dateTime,
          location: event.location ?? null,
          google_updated_at: event.updated ?? new Date().toISOString(),
          last_synced_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,google_calendar_id,google_event_id',
        },
      );

      imported++;
    }

    // Update last sync timestamp
    await supabase
      .from('google_calendar_tokens')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('user_id', userId);

    return { success: true, imported };
  } catch (err) {
    console.error('Error al importar eventos de Google Calendar:', err);
    return {
      success: false,
      imported: 0,
      error: err instanceof Error ? err.message : 'Error desconocido',
    };
  }
}

// ---------------------------------------------------------------------------
// Public API — Connection status
// ---------------------------------------------------------------------------

/**
 * Get connection status for a user.
 */
export async function getConnectionStatus(userId: string): Promise<{
  connected: boolean;
  calendar_id?: string;
  calendar_timezone?: string;
  sync_enabled?: boolean;
  last_sync_at?: string;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('google_calendar_tokens')
    .select('calendar_id, calendar_timezone, sync_enabled, last_sync_at')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return { connected: false };
  }

  return {
    connected: true,
    ...data,
  };
}
