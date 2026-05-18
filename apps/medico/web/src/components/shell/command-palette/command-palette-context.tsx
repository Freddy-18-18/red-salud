'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

/**
 * @file command-palette-context.tsx
 * @description Global state for the Cmd+K command palette.
 *
 * Mounted once at the top of `<DashboardShell>` so every page, header button,
 * sidebar entry, or user menu can open the palette without prop drilling.
 * Also owns:
 *   - the global `Cmd+K` / `Ctrl+K` keyboard shortcut (works whether or not
 *     the trigger button is visible — the "best of both worlds" the doctor
 *     asked for)
 *   - the doctor's preference for the visible header trigger, persisted to
 *     localStorage. Lifting this into the context ensures both the trigger
 *     button and the user-menu toggle stay in lockstep within the same tab.
 */

const STORAGE_KEY = 'medico:command-palette-trigger-visible';

function readPreference(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return true;
    return raw !== 'false';
  } catch {
    return true;
  }
}

function writePreference(value: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    // localStorage may be disabled (private mode, quota) — fail silently;
    // the in-memory state still tracks the doctor's choice for this session.
  }
}

interface CommandPaletteContextValue {
  /** Whether the palette modal is open. */
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;

  /** Whether the visible "Buscar ⌘K" button shows in the header. */
  triggerVisible: boolean;
  /** True after the first mount — used by consumers to avoid SSR/client flicker. */
  triggerHydrated: boolean;
  setTriggerVisible: (value: boolean) => void;
  toggleTriggerVisible: () => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null);

interface ProviderProps {
  children: ReactNode;
}

export function CommandPaletteProvider({ children }: ProviderProps): React.ReactElement {
  const [open, setOpen] = useState(false);

  // SSR + first-paint always assume "visible" so the header markup matches
  // the server. The real value lands on mount and React patches in place.
  const [triggerVisible, setTriggerVisibleState] = useState<boolean>(true);
  const [triggerHydrated, setTriggerHydrated] = useState<boolean>(false);

  useEffect(() => {
    setTriggerVisibleState(readPreference());
    setTriggerHydrated(true);

    // Cross-tab sync. The `storage` event only fires on OTHER tabs, so a tab
    // updating the preference here also triggers the listener in any other
    // open tabs — keeping every window in lockstep.
    function onStorage(event: StorageEvent) {
      if (event.key !== STORAGE_KEY) return;
      setTriggerVisibleState(event.newValue !== 'false');
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setTriggerVisible = useCallback((value: boolean) => {
    setTriggerVisibleState(value);
    writePreference(value);
  }, []);

  const toggleTriggerVisible = useCallback(() => {
    setTriggerVisibleState((prev) => {
      const next = !prev;
      writePreference(next);
      return next;
    });
  }, []);

  const toggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  // Global Cmd+K / Ctrl+K listener. Stops the browser's default search-bar
  // shortcut so the palette always wins. Doesn't fire when an `<input>` or
  // `<textarea>` is focused and the modifier ISN'T held — letting doctors
  // type the literal "k" inside forms remains intact.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const isMod = event.metaKey || event.ctrlKey;
      if (!isMod) return;
      if (event.key !== 'k' && event.key !== 'K') return;
      event.preventDefault();
      toggle();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [toggle]);

  const value = useMemo(
    () => ({
      open,
      setOpen,
      toggle,
      triggerVisible,
      triggerHydrated,
      setTriggerVisible,
      toggleTriggerVisible,
    }),
    [open, toggle, triggerVisible, triggerHydrated, setTriggerVisible, toggleTriggerVisible],
  );

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
    </CommandPaletteContext.Provider>
  );
}

/**
 * Read palette state, open/close handlers, and trigger-visibility preference
 * from anywhere inside the provider. Throws when called outside so misplaced
 * consumers fail loud during dev instead of silently no-oping.
 */
export function useCommandPalette(): CommandPaletteContextValue {
  const ctx = useContext(CommandPaletteContext);
  if (!ctx) {
    throw new Error(
      'useCommandPalette must be used inside <CommandPaletteProvider>',
    );
  }
  return ctx;
}
