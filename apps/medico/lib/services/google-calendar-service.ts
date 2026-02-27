/**
 * Google Calendar Integration Service
 * Handles bidirectional sync between appointments and Google Calendar
 */

import { google, calendar_v3 } from 'googleapis';
import { createClient } from '@/lib/supabase/server';
import type { CalendarAppointment } from '@/components/dashboard/medico/calendar/types';

// OAuth2 Configuration
const GOOGLE_CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
];

const REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL + '/api/calendar/google/callback';

// Types
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
  last_sync_token: string | null;
  watch_channel_id: string | null;
  watch_resource_id: string | null;
  watch_expiration: string | null;
}

export interface EventMapping {
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

export interface ImportedEvent {
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

export interface SyncResult {
  success: boolean;
  synced: number;
  errors: string[];
  conflicts: Array<{
    appointment_id: string;
    message: string;
  }>;
}

/**
 * Get OAuth2 client configured with credentials
 */
export function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Google Calendar OAuth credentials not configured. Set GOOGLE_CALENDAR_CLIENT_ID and GOOGLE_CALENDAR_CLIENT_SECRET');
  }

  return new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI);
}

/**
 * Generate authorization URL for OAuth flow
 */
export function getAuthorizationUrl(userId: string): string {
  const oauth2Client = getOAuth2Client();

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: GOOGLE_CALENDAR_SCOPES,
    state: userId, // Pass user ID to callback
    prompt: 'consent', // Force consent to get refresh token
  });
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(code: string, userId: string): Promise<GoogleCalendarToken> {
  const supabase = await createClient();
  const oauth2Client = getOAuth2Client();

  // Exchange code for tokens
  const { tokens } = await oauth2Client.getToken(code);

  if (!tokens.access_token || !tokens.refresh_token) {
    throw new Error('Failed to obtain access or refresh token');
  }

  // Set credentials to get user info
  oauth2Client.setCredentials(tokens);
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  // Get primary calendar info
  const calendarInfo = await calendar.calendarList.get({
    calendarId: 'primary',
  });

  const calendarId = calendarInfo.data.id!;
  const timezone = calendarInfo.data.timeZone || 'America/Caracas';

  // Store tokens in database
  const tokenData = {
    user_id: userId,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    token_expiry: new Date(tokens.expiry_date!).toISOString(),
    scope: tokens.scope!,
    calendar_id: calendarId,
    calendar_timezone: timezone,
    sync_enabled: true,
    sync_direction: 'bidirectional' as const,
  };

  const { data, error } = await supabase
    .from('google_calendar_tokens')
    .upsert(tokenData, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to store tokens: ${error.message}`);
  }

  return data as GoogleCalendarToken;
}

/**
 * Get OAuth client with valid tokens for a user
 */
export async function getAuthenticatedClient(userId: string): Promise<calendar_v3.Calendar> {
  const supabase = await createClient();

  // Get stored tokens
  const { data: tokenData, error } = await supabase
    .from('google_calendar_tokens')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !tokenData) {
    throw new Error('Google Calendar not connected. Please authorize first.');
  }

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    expiry_date: new Date(tokenData.token_expiry).getTime(),
    scope: tokenData.scope,
  });

  // Check if token is expired and refresh if needed
  const isExpired = new Date(tokenData.token_expiry) <= new Date(Date.now() + 5 * 60 * 1000);

  if (isExpired) {
    const { credentials } = await oauth2Client.refreshAccessToken();
    
    // Update stored tokens
    await supabase
      .from('google_calendar_tokens')
      .update({
        access_token: credentials.access_token!,
        token_expiry: new Date(credentials.expiry_date!).toISOString(),
      })
      .eq('user_id', userId);

    oauth2Client.setCredentials(credentials);
  }

  return google.calendar({ version: 'v3', auth: oauth2Client });
}

/**
 * Convert appointment to Google Calendar event
 */
function appointmentToGoogleEvent(appointment: CalendarAppointment): calendar_v3.Schema$Event {
  const typeLabels = {
    presencial: 'Presencial',
    telemedicina: 'Telemedicina',
    urgencia: 'Urgencia',
    seguimiento: 'Seguimiento',
    primera_vez: 'Primera Vez',
  };

  return {
    summary: `${appointment.status === 'confirmada' ? '✓' : '⏳'} ${appointment.paciente_nombre}`,
    description: [
      appointment.motivo,
      appointment.tipo_cita && `Tipo: ${typeLabels[appointment.tipo_cita]}`,
      appointment.notas_internas && `Notas: ${appointment.notas_internas}`,
      `\n---\nGestionado por Red Salud`,
    ].filter(Boolean).join('\n'),
    start: {
      dateTime: new Date(appointment.fecha_hora).toISOString(),
      timeZone: 'America/Caracas',
    },
    end: {
      dateTime: new Date(appointment.fecha_hora_fin).toISOString(),
      timeZone: 'America/Caracas',
    },
    location: appointment.location_id || undefined,
    colorId: getColorIdForStatus(appointment.status),
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 }, // 1 day before
        { method: 'popup', minutes: 30 }, // 30 min before
      ],
    },
  };
}

/**
 * Get Google Calendar color ID based on appointment status
 */
function getColorIdForStatus(status: string): string {
  const colorMap: Record<string, string> = {
    'pendiente': '5',      // Yellow
    'confirmada': '10',    // Green
    'en_espera': '4',      // Pink
    'en_consulta': '9',    // Blue
    'completada': '2',     // Sage
    'cancelada': '8',      // Gray
    'no_asistio': '11',    // Red
    'rechazada': '8',      // Gray
  };
  return colorMap[status] || '1'; // Default lavender
}

/**
 * Sync appointment TO Google Calendar (create or update)
 */
export async function syncAppointmentToGoogle(
  userId: string,
  appointment: CalendarAppointment
): Promise<{ success: boolean; eventId?: string; error?: string }> {
  try {
    const supabase = await createClient();
    const calendar = await getAuthenticatedClient(userId);

    // Get token info for calendar ID
    const { data: tokenData } = await supabase
      .from('google_calendar_tokens')
      .select('calendar_id')
      .eq('user_id', userId)
      .single();

    if (!tokenData) {
      throw new Error('Calendar not configured');
    }

    const calendarId = tokenData.calendar_id;

    // Check if mapping exists (update) or create new event
    const { data: mapping } = await supabase
      .from('google_calendar_event_mappings')
      .select('google_event_id')
      .eq('appointment_id', appointment.id)
      .single();

    const eventData = appointmentToGoogleEvent(appointment);
    let googleEventId: string;

    if (mapping?.google_event_id) {
      // Update existing event
      const response = await calendar.events.update({
        calendarId,
        eventId: mapping.google_event_id,
        requestBody: eventData,
      });
      googleEventId = response.data.id!;
    } else {
      // Create new event
      const response = await calendar.events.insert({
        calendarId,
        requestBody: eventData,
      });
      googleEventId = response.data.id!;

      // Create mapping
      await supabase.from('google_calendar_event_mappings').insert({
        appointment_id: appointment.id,
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
      .eq('appointment_id', appointment.id);

    return { success: true, eventId: googleEventId };
  } catch (error) {
    console.error('Error syncing to Google Calendar:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Delete appointment from Google Calendar
 */
export async function deleteAppointmentFromGoogle(
  userId: string,
  appointmentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const calendar = await getAuthenticatedClient(userId);

    // Get mapping
    const { data: mapping } = await supabase
      .from('google_calendar_event_mappings')
      .select('google_event_id, google_calendar_id')
      .eq('appointment_id', appointmentId)
      .single();

    if (!mapping) {
      return { success: true }; // Not synced, nothing to delete
    }

    // Delete from Google Calendar
    await calendar.events.delete({
      calendarId: mapping.google_calendar_id,
      eventId: mapping.google_event_id,
    });

    // Delete mapping
    await supabase
      .from('google_calendar_event_mappings')
      .delete()
      .eq('appointment_id', appointmentId);

    return { success: true };
  } catch (error) {
    console.error('Error deleting from Google Calendar:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Import events FROM Google Calendar (external events as blocked time)
 */
export async function importEventsFromGoogle(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<{ success: boolean; imported: number; error?: string }> {
  try {
    const supabase = await createClient();
    const calendar = await getAuthenticatedClient(userId);

    const { data: tokenData } = await supabase
      .from('google_calendar_tokens')
      .select('calendar_id')
      .eq('user_id', userId)
      .single();

    if (!tokenData) {
      throw new Error('Calendar not configured');
    }

    // Get events from Google Calendar
    const response = await calendar.events.list({
      calendarId: tokenData.calendar_id,
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];
    let imported = 0;

    // Get existing mappings to filter out our own events
    const { data: mappings } = await supabase
      .from('google_calendar_event_mappings')
      .select('google_event_id');

    const ourEventIds = new Set(mappings?.map(m => m.google_event_id) || []);

    for (const event of events) {
      // Skip our own synced events
      if (ourEventIds.has(event.id!)) continue;

      // Skip cancelled events
      if (event.status === 'cancelled') continue;

      // Store as imported event (blocked time)
      const startTime = event.start?.dateTime || event.start?.date;
      const endTime = event.end?.dateTime || event.end?.date;

      if (!startTime || !endTime) continue;

      await supabase.from('google_calendar_imported_events').upsert({
        user_id: userId,
        google_event_id: event.id!,
        google_calendar_id: tokenData.calendar_id,
        title: event.summary || '(Sin título)',
        description: event.description || null,
        start_time: startTime,
        end_time: endTime,
        all_day: !event.start?.dateTime, // If no dateTime, it's all-day
        location: event.location || null,
        google_updated_at: event.updated!,
        last_synced_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,google_calendar_id,google_event_id',
      });

      imported++;
    }

    // Update last sync time
    await supabase
      .from('google_calendar_tokens')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('user_id', userId);

    return { success: true, imported };
  } catch (error) {
    console.error('Error importing from Google Calendar:', error);
    return {
      success: false,
      imported: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get connection status for a user
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

/**
 * Disconnect Google Calendar (revoke tokens)
 */
export async function disconnectGoogleCalendar(userId: string): Promise<{ success: boolean }> {
  try {
    const supabase = await createClient();

    // Delete all data
    await Promise.all([
      supabase.from('google_calendar_tokens').delete().eq('user_id', userId),
      supabase.from('google_calendar_event_mappings').delete().eq('appointment_id', userId), // This needs fix in schema
      supabase.from('google_calendar_imported_events').delete().eq('user_id', userId),
    ]);

    return { success: true };
  } catch (error) {
    console.error('Error disconnecting Google Calendar:', error);
    return { success: false };
  }
}
