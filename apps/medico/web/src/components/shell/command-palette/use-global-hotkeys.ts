'use client';

import { useEffect } from 'react';

import { matchesShortcut } from '@/lib/palette/hotkeys';
import type { PaletteConfig } from '@/lib/palette/types';

/**
 * @file use-global-hotkeys.ts
 * @description Wires custom keyboard shortcuts to their command actions.
 *
 * Behaviour:
 *   - On every keydown, walks the doctor's custom-shortcut bindings and
 *     fires the matching command. Default shortcuts (the ones declared on
 *     `static-commands.ts`) are NOT bound here yet — they only appear as
 *     display hints. Phase 3 can extend this to default bindings too.
 *   - Ignores keydowns that originate from text inputs / textareas / editable
 *     elements so the doctor can keep typing the letter without firing the
 *     hotkey.
 *
 * The hook expects a `commandHandlers` map keyed by command id. The caller
 * (the shell) knows which commands exist and what each one should do.
 */

export type HotkeyHandler = () => void;

interface UseGlobalHotkeysArgs {
  config: PaletteConfig;
  handlers: Record<string, HotkeyHandler>;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (target.isContentEditable) return true;
  return false;
}

export function useGlobalHotkeys({ config, handlers }: UseGlobalHotkeysArgs): void {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (isEditableTarget(event.target)) return;

      // Iterate command preferences; only entries with a customShortcut bind here.
      for (const [commandId, pref] of Object.entries(config.commands)) {
        const shortcut = pref.customShortcut;
        if (!shortcut) continue;
        if (!matchesShortcut(event, shortcut)) continue;
        const handler = handlers[commandId];
        if (!handler) continue;
        event.preventDefault();
        handler();
        return;
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [config, handlers]);
}
