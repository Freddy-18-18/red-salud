/**
 * Hook for Google Calendar integration
 * Handles connection status, sync triggers, and real-time updates.
 */

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CalendarAppointment {
  id: string;
  title?: string;
  description?: string;
  start_time: string;
  end_time: string;
  patient_name?: string;
  status?: string;
  [key: string]: unknown;
}

interface GoogleCalendarStatus {
  /** Whether the user has connected their Google account */
  connected: boolean;
  /** Whether the server has Google Calendar env vars configured */
  configured?: boolean;
  calendar_id?: string;
  sync_enabled?: boolean;
  last_sync_at?: string;
  stats?: {
    synced_appointments: number;
    imported_events: number;
    pending_syncs: number;
  };
}

interface SyncResult {
  to_google?: { synced: number; errors: string[] };
  from_google?: { imported: number; error: string | null };
}

interface GoogleCalendarHook {
  // Status
  status: GoogleCalendarStatus;
  loading: boolean;
  error: string | null;

  // Actions
  connect: () => void;
  disconnect: () => Promise<void>;
  syncNow: (appointmentIds?: string[]) => Promise<void>;
  syncAppointment: (appointment: CalendarAppointment) => Promise<void>;

  // Sync state
  syncing: boolean;
  lastSyncResult: SyncResult | null;
}

// ---------------------------------------------------------------------------
// Error messages (es-VE)
// ---------------------------------------------------------------------------

const GCAL_ERROR_MESSAGES: Record<string, string> = {
  access_denied:
    'Permisos denegados. Debes autorizar el acceso a Google Calendar.',
  invalid_request: 'Solicitud invalida. Intenta de nuevo.',
  connection_failed:
    'Error al conectar con Google Calendar. Verifica tu configuracion.',
  not_configured:
    'Google Calendar no esta configurado en el servidor. Contacta al administrador.',
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useGoogleCalendar(): GoogleCalendarHook {
  const [status, setStatus] = useState<GoogleCalendarStatus>({
    connected: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(
    null,
  );

  // ── Load connection status ──────────────────────────────────────────
  const loadStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/calendar/google/sync');

      if (!response.ok) {
        throw new Error('Error al cargar estado de Google Calendar');
      }

      const data: GoogleCalendarStatus = await response.json();
      setStatus(data);
    } catch (err) {
      console.error('Error loading Google Calendar status:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setStatus({ connected: false });
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Mount + OAuth callback URL params ───────────────────────────────
  useEffect(() => {
    loadStatus();

    const params = new URLSearchParams(window.location.search);
    const gcalConnected = params.get('gcal_connected');
    const gcalError = params.get('gcal_error');

    if (gcalConnected === 'true') {
      loadStatus();

      // Clean URL
      const url = new URL(window.location.href);
      url.searchParams.delete('gcal_connected');
      window.history.replaceState({}, '', url.toString());
    } else if (gcalError) {
      setError(
        GCAL_ERROR_MESSAGES[gcalError] ??
          'Error al conectar Google Calendar',
      );

      const url = new URL(window.location.href);
      url.searchParams.delete('gcal_error');
      window.history.replaceState({}, '', url.toString());
    }
  }, [loadStatus]);

  // ── Real-time subscription for token changes ────────────────────────
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel('google_calendar_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'google_calendar_tokens',
        },
        () => {
          loadStatus();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadStatus]);

  // ── Actions ─────────────────────────────────────────────────────────

  const connect = useCallback(() => {
    window.location.href = '/api/calendar/google/connect';
  }, []);

  const disconnect = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/calendar/google/disconnect', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Error al desconectar Google Calendar');
      }

      setStatus({ connected: false });
    } catch (err) {
      console.error('Error disconnecting Google Calendar:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const syncNow = useCallback(
    async (appointmentIds?: string[]) => {
      try {
        setSyncing(true);
        setError(null);

        const response = await fetch('/api/calendar/google/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            direction: 'bidirectional',
            appointmentIds,
          }),
        });

        if (!response.ok) {
          throw new Error('Error al sincronizar con Google Calendar');
        }

        const result: SyncResult = await response.json();
        setLastSyncResult(result);

        await loadStatus();
      } catch (err) {
        console.error('Error syncing with Google Calendar:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        throw err;
      } finally {
        setSyncing(false);
      }
    },
    [loadStatus],
  );

  const syncAppointment = useCallback(
    async (appointment: CalendarAppointment) => {
      if (!status.connected || !status.sync_enabled) return;

      try {
        await syncNow([appointment.id]);
      } catch {
        // Sync failures should not break the UI
      }
    },
    [status.connected, status.sync_enabled, syncNow],
  );

  return {
    status,
    loading,
    error,
    connect,
    disconnect,
    syncNow,
    syncAppointment,
    syncing,
    lastSyncResult,
  };
}
