/**
 * Hook for Google Calendar integration
 * Handles connection status, sync triggers, and real-time updates
 */

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { CalendarAppointment } from '@/components/dashboard/medico/calendar/types';

interface GoogleCalendarStatus {
  connected: boolean;
  calendar_id?: string;
  sync_enabled?: boolean;
  last_sync_at?: string;
  stats?: {
    synced_appointments: number;
    imported_events: number;
    pending_syncs: number;
  };
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
  lastSyncResult: {
    to_google?: { synced: number; errors: string[] };
    from_google?: { imported: number; error: string | null };
  } | null;
}

export function useGoogleCalendar(): GoogleCalendarHook {
  const [status, setStatus] = useState<GoogleCalendarStatus>({ connected: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<GoogleCalendarHook['lastSyncResult']>(null);

  /**
   * Load connection status
   */
  const loadStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/calendar/google/sync');
      
      if (!response.ok) {
        throw new Error('Error al cargar estado de Google Calendar');
      }

      const data = await response.json();
      setStatus(data);
    } catch (err) {
      console.error('Error loading Google Calendar status:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setStatus({ connected: false });
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load status on mount and when URL params change (after OAuth)
   */
  useEffect(() => {
    loadStatus();

    // Check URL params for OAuth callback
    const params = new URLSearchParams(window.location.search);
    const gcalConnected = params.get('gcal_connected');
    const gcalError = params.get('gcal_error');

    if (gcalConnected === 'true') {
      // Success - reload status
      loadStatus();
      
      // Clean URL
      const url = new URL(window.location.href);
      url.searchParams.delete('gcal_connected');
      window.history.replaceState({}, '', url.toString());
    } else if (gcalError) {
      const errorMessages: Record<string, string> = {
        access_denied: 'Permisos denegados. Debes autorizar el acceso a Google Calendar.',
        invalid_request: 'Solicitud inválida. Intenta de nuevo.',
        connection_failed: 'Error al conectar con Google Calendar. Verifica tu configuración.',
      };
      
      setError(errorMessages[gcalError] || 'Error al conectar Google Calendar');
      
      // Clean URL
      const url = new URL(window.location.href);
      url.searchParams.delete('gcal_error');
      window.history.replaceState({}, '', url.toString());
    }
  }, [loadStatus]);

  /**
   * Subscribe to real-time updates for sync status
   */
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
          // Reload status when tokens change
          loadStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadStatus]);

  /**
   * Initiate OAuth connection
   */
  const connect = useCallback(() => {
    window.location.href = '/api/calendar/google/connect';
  }, []);

  /**
   * Disconnect Google Calendar
   */
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

  /**
   * Trigger manual sync
   */
  const syncNow = useCallback(async (appointmentIds?: string[]) => {
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

      const result = await response.json();
      setLastSyncResult(result);

      // Reload status
      await loadStatus();
    } catch (err) {
      console.error('Error syncing with Google Calendar:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setSyncing(false);
    }
  }, [loadStatus]);

  /**
   * Sync a single appointment (called automatically on create/update)
   */
  const syncAppointment = useCallback(async (appointment: CalendarAppointment) => {
    // Only sync if connected and sync is enabled
    if (!status.connected || !status.sync_enabled) {
      return;
    }

    try {
      await syncNow([appointment.id]);
    } catch (err) {
      console.error('Error syncing appointment:', err);
      // Don't throw - sync failures shouldn't break the UI
    }
  }, [status.connected, status.sync_enabled, syncNow]);

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
