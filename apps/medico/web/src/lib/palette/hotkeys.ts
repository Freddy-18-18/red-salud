/**
 * @file lib/palette/hotkeys.ts
 * @description Tiny utility layer for keyboard-shortcut handling.
 *
 * Goals:
 *   1. Normalise a `KeyboardEvent` into a stable shortcut string like
 *      "Cmd+Shift+N" / "Alt+G". Useful as a map key + display token.
 *   2. Render a shortcut string back into readable kbd glyphs:
 *      "Cmd+Shift+N" → "⌘ ⇧ N"
 *
 * Designed for the shortcut-capture modal and the global keydown listener
 * that fires custom hotkeys from the doctor's preferences.
 *
 * Conventions:
 *   - `Cmd` represents the platform-correct meta key (⌘ on macOS, Ctrl on
 *     Windows/Linux). The capture flow always normalises to `Cmd` so the
 *     doctor sees a consistent token regardless of platform.
 *   - Modifier order is fixed for stable comparisons: Cmd > Ctrl > Alt > Shift.
 */

const MODIFIER_ORDER = ['Cmd', 'Ctrl', 'Alt', 'Shift'] as const;

/**
 * Keys we refuse to capture because they break the modal UX (Escape closes,
 * Tab navigates, etc.) or aren't useful as a primary hotkey.
 */
const RESERVED_KEYS = new Set(['Escape', 'Tab', 'Enter', 'CapsLock']);

export interface ParsedShortcut {
  cmd: boolean;
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  /** Final non-modifier key, e.g. "N", "Slash", "ArrowUp". Already normalised. */
  key: string;
}

/**
 * Read a KeyboardEvent and return either a normalised shortcut string or
 * `null` when the keystroke shouldn't be captured (just modifiers held,
 * reserved keys, etc.).
 *
 * The platform-meta key (Cmd on Mac, Ctrl on Windows) is unified to `Cmd`
 * so the persisted string is portable between machines. On Windows/Linux
 * we treat `Ctrl` as the primary modifier and also map it to `Cmd`.
 */
export function shortcutFromEvent(event: KeyboardEvent): string | null {
  const key = event.key;
  if (!key) return null;
  // Standalone modifier presses fire keydown too — ignore them so the
  // capture only completes on a real key.
  if (['Shift', 'Control', 'Alt', 'Meta'].includes(key)) return null;
  if (RESERVED_KEYS.has(key)) return null;

  const parts: string[] = [];
  // Unify meta keys under "Cmd" — see file-level docstring.
  if (event.metaKey || event.ctrlKey) parts.push('Cmd');
  if (event.altKey) parts.push('Alt');
  if (event.shiftKey) parts.push('Shift');

  // Need at least one modifier — bare letters would steal typing.
  if (parts.length === 0) return null;

  parts.push(normaliseKey(key));
  return parts.join('+');
}

function normaliseKey(raw: string): string {
  if (raw.length === 1) return raw.toUpperCase();
  // Browser-reported names already use PascalCase ("ArrowUp", "Slash", "Comma")
  return raw;
}

/**
 * Parse a stored shortcut string back into structured flags. Returns `null`
 * for malformed input — never throws.
 */
export function parseShortcut(raw: string | null | undefined): ParsedShortcut | null {
  if (!raw) return null;
  const tokens = raw.split('+').map((t) => t.trim()).filter(Boolean);
  if (tokens.length === 0) return null;
  const flags = { cmd: false, ctrl: false, alt: false, shift: false };
  let key: string | null = null;
  for (const t of tokens) {
    if (t === 'Cmd' || t === 'Meta') flags.cmd = true;
    else if (t === 'Ctrl' || t === 'Control') flags.ctrl = true;
    else if (t === 'Alt' || t === 'Option') flags.alt = true;
    else if (t === 'Shift') flags.shift = true;
    else key = t;
  }
  if (!key) return null;
  return { ...flags, key };
}

/**
 * Test whether a live KeyboardEvent matches a stored shortcut. Used by the
 * global listener that triggers commands the doctor bound.
 */
export function matchesShortcut(event: KeyboardEvent, shortcut: string): boolean {
  const parsed = parseShortcut(shortcut);
  if (!parsed) return false;
  const wantsMeta = parsed.cmd || parsed.ctrl;
  const hasMeta = event.metaKey || event.ctrlKey;
  if (wantsMeta !== hasMeta) return false;
  if (parsed.alt !== event.altKey) return false;
  if (parsed.shift !== event.shiftKey) return false;
  return normaliseKey(event.key) === parsed.key;
}

/**
 * Render a shortcut string for the UI: "Cmd+Shift+N" → ["⌘", "⇧", "N"].
 * Returning an array lets the caller wrap each token in its own kbd element
 * with consistent spacing.
 */
export function shortcutGlyphs(raw: string): string[] {
  const parsed = parseShortcut(raw);
  if (!parsed) return [raw];
  const out: string[] = [];
  if (parsed.cmd) out.push('⌘');
  if (parsed.ctrl) out.push('⌃');
  if (parsed.alt) out.push('⌥');
  if (parsed.shift) out.push('⇧');
  out.push(parsed.key);
  return out;
}

/**
 * Returns the conflicting command id, if any, given a candidate shortcut
 * and the full set of bindings. Used by the capture modal to warn the doctor
 * BEFORE saving.
 */
export function findShortcutConflict(
  candidate: string,
  bindings: Record<string, string>,
  excludeCommandId?: string,
): string | null {
  for (const [commandId, bound] of Object.entries(bindings)) {
    if (excludeCommandId && commandId === excludeCommandId) continue;
    if (bound === candidate) return commandId;
  }
  return null;
}
