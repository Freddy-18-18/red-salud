'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@red-salud/design-system';

import { usePalettePreferences } from '@/lib/palette/use-palette-preferences';

import { NAVIGATION_COMMANDS } from './commands/static-commands';
import { useGlobalHotkeys, type HotkeyHandler } from './use-global-hotkeys';

/**
 * @file global-hotkeys-binder.tsx
 * @description Mounts inside the shell and wires the doctor's custom
 * keyboard shortcuts to the matching command actions.
 *
 * Renders nothing — it's a side-effect component. The handlers map mirrors
 * what `useCommandContents` exposes, but built locally so we don't have to
 * thread the active sede into a non-palette surface. Custom shortcuts only
 * dispatch navigation + theme + action commands; sede switching and
 * dynamic searches require an open palette anyway.
 */

export function GlobalHotkeysBinder(): null {
  const router = useRouter();
  const { setTheme } = useTheme();
  const { config } = usePalettePreferences();

  // Build the per-command handler map ONCE per config change. Each handler
  // is dispatched when the doctor's custom hotkey for that command fires.
  const handlers = useMemo<Record<string, HotkeyHandler>>(() => {
    const map: Record<string, HotkeyHandler> = {};

    // Quick actions
    map['act-new-appointment'] = () => router.push('/dashboard/agenda?action=new');
    map['act-new-consultation'] = () =>
      router.push('/dashboard/consulta?action=new');
    map['act-new-prescription'] = () =>
      router.push('/dashboard/recetas?action=new');
    map['act-telemedicine'] = () =>
      router.push('/dashboard/consulta?mode=telemedicine');

    // Navigation — wire every nav command from the static list.
    for (const cmd of NAVIGATION_COMMANDS) {
      map[cmd.id] = () => router.push(cmd.href);
    }

    // Theme switches
    map['theme-light'] = () => setTheme('light');
    map['theme-dark'] = () => setTheme('dark');
    map['theme-system'] = () => setTheme('system');

    return map;
  }, [router, setTheme]);

  useGlobalHotkeys({ config, handlers });
  return null;
}
