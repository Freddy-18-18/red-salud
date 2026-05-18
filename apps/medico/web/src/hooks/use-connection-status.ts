'use client';

import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase/client';

/**
 * @file use-connection-status.ts
 * @description Tri-state connection indicator for the header:
 *   - 'online'      → browser online AND last Supabase ping succeeded
 *   - 'offline'     → `navigator.onLine === false`
 *   - 'reconnecting'→ browser online but the latest ping failed
 *
 * The ping is cheap: a SELECT 1 against `profiles` with a head request.
 * RLS allows every authenticated user to read their own profile row, so
 * this works regardless of doctor identity. We ping every 60s while the
 * tab is visible and stop polling while it's hidden.
 */

export type ConnectionStatus = 'online' | 'offline' | 'reconnecting';

const PING_INTERVAL_MS = 60_000;
const PING_TIMEOUT_MS = 8_000;

async function pingSupabase(): Promise<boolean> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), PING_TIMEOUT_MS);
  try {
    // `head: true` skips response body; we only care about the HTTP status.
    const { error } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .limit(1)
      .abortSignal(controller.signal);
    return !error;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timer);
  }
}

export function useConnectionStatus(): ConnectionStatus {
  // Default to 'online' on the server so SSR markup matches the optimistic
  // first paint. The browser corrects to the real value on mount.
  const [status, setStatus] = useState<ConnectionStatus>('online');

  useEffect(() => {
    let cancelled = false;
    let interval: number | null = null;

    function updateFromNavigator() {
      if (typeof navigator === 'undefined') return;
      if (!navigator.onLine) {
        setStatus('offline');
      }
    }

    async function check() {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setStatus('offline');
        return;
      }
      const ok = await pingSupabase();
      if (cancelled) return;
      setStatus(ok ? 'online' : 'reconnecting');
    }

    function start() {
      void check();
      interval = window.setInterval(() => void check(), PING_INTERVAL_MS);
    }

    function stop() {
      if (interval !== null) {
        window.clearInterval(interval);
        interval = null;
      }
    }

    function onVisibility() {
      if (document.visibilityState === 'visible') {
        start();
      } else {
        stop();
      }
    }

    function onOnline() {
      setStatus('reconnecting');
      void check();
    }

    function onOffline() {
      setStatus('offline');
    }

    updateFromNavigator();
    if (document.visibilityState === 'visible') {
      start();
    }
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      cancelled = true;
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  return status;
}
