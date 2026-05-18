'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Three-way desktop sidebar mode.
 *
 *  - `collapsed` → narrow icon rail, never auto-expands (mouse-stable users).
 *  - `expanded`  → always wide, never auto-collapses (large screens).
 *  - `hover`     → narrow icon rail by default; on mouse enter the panel
 *                  expands as a floating overlay (does NOT push content).
 *                  Default mode — matches Supabase's "expand on hover" UX.
 */
export type SidebarMode = 'collapsed' | 'expanded' | 'hover';

const STORAGE_KEY = 'medico:sidebar-mode';
const DEFAULT_MODE: SidebarMode = 'hover';

function readPersisted(): SidebarMode {
  if (typeof window === 'undefined') return DEFAULT_MODE;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'collapsed' || stored === 'expanded' || stored === 'hover') {
      return stored;
    }
    return DEFAULT_MODE;
  } catch {
    return DEFAULT_MODE;
  }
}

function writePersisted(next: SidebarMode): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // localStorage unavailable — degrade silently.
  }
}

export interface UseSidebarModeReturn {
  /** Current mode (user-selected). */
  mode: SidebarMode;
  /** Update the mode (persists immediately). */
  setMode: (next: SidebarMode) => void;
  /**
   * Whether the panel content should currently be shown expanded.
   * Derived from `mode + hovering`:
   *   - mode = 'expanded'                 → true
   *   - mode = 'collapsed'                → false
   *   - mode = 'hover' && hovering        → true
   *   - mode = 'hover' && !hovering       → false
   */
  isExpanded: boolean;
  /** True while the rail is in hover-expanded state (only relevant for mode='hover'). */
  isHoverExpanded: boolean;
  /** Mouse-enter handler for the sidebar. */
  onMouseEnter: () => void;
  /** Mouse-leave handler for the sidebar. */
  onMouseLeave: () => void;
}

export function useSidebarMode(): UseSidebarModeReturn {
  // Initial state must match SSR to avoid hydration warnings. We use the
  // default and snap to the persisted value on mount.
  const [mode, setModeState] = useState<SidebarMode>(DEFAULT_MODE);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const persisted = readPersisted();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setModeState(persisted);
  }, []);

  const setMode = useCallback((next: SidebarMode) => {
    writePersisted(next);
    setModeState(next);
    // Reset hover state when mode changes so the visual is predictable.
    setHovering(false);
  }, []);

  const onMouseEnter = useCallback(() => {
    setHovering(true);
  }, []);

  const onMouseLeave = useCallback(() => {
    setHovering(false);
  }, []);

  const isHoverExpanded = mode === 'hover' && hovering;
  const isExpanded = mode === 'expanded' || isHoverExpanded;

  return {
    mode,
    setMode,
    isExpanded,
    isHoverExpanded,
    onMouseEnter,
    onMouseLeave,
  };
}
