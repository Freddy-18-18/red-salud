'use client';

import { useEffect } from 'react';

/**
 * @file service-worker-registrar.tsx
 * @description Mounts once at the root and registers `/sw.js`.
 *
 * Why a component instead of just calling `register()` in a `useEffect`
 * somewhere: Next.js App Router renders the root layout as a server component
 * by default. The registration MUST run client-side AFTER the page is
 * hydrated, so we wrap the side-effect in a tiny `'use client'` component
 * that the layout includes alongside the rest of the tree.
 *
 * Skips registration in development so HMR keeps working — the SW would
 * otherwise cache stale chunks and you'd have to manually unregister it
 * every time you change a file.
 */

export function ServiceWorkerRegistrar(): null {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;
    // Dev builds change too much to benefit from a SW; skip to avoid stale
    // chunks during HMR. Toggle `NEXT_PUBLIC_FORCE_SW=1` to test locally.
    if (
      process.env.NODE_ENV !== 'production' &&
      process.env.NEXT_PUBLIC_FORCE_SW !== '1'
    ) {
      return;
    }

    let cancelled = false;
    async function register() {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });
        if (cancelled) return;

        // If a new SW is waiting (deploy landed), prompt it to take over on
        // the next navigation. Reload-on-update keeps the doctor on a stable
        // version of every chunk.
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              // The new SW is installed AND there's already a controller
              // (meaning this is an upgrade, not a fresh install). Tell it
              // to skip waiting; reload is left to the user via the offline
              // banner refresh action.
              newWorker.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        });
      } catch (err) {
        // SW registration failures are non-fatal — the app still works,
        // just without offline support. Log so it's visible in devtools.
        console.warn('[sw] registration failed:', err);
      }
    }
    void register();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}

/**
 * Force-clear every cache the SW owns. Useful for "Limpiar caché" in the
 * doctor settings, and for the dev console.
 */
export async function clearOfflineCaches(): Promise<void> {
  if (typeof navigator === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;
  const reg = await navigator.serviceWorker.getRegistration();
  reg?.active?.postMessage({ type: 'CLEAR_CACHES' });
}
