/**
 * @file __tests__/hotkeys.test.ts
 * @description Unit tests for the shortcut normalisation helpers used by
 * the capture dialog and the global listener.
 */

import { describe, expect, it } from 'vitest';

import {
  findShortcutConflict,
  matchesShortcut,
  parseShortcut,
  shortcutFromEvent,
  shortcutGlyphs,
} from '../hotkeys';

function ke(over: Partial<KeyboardEventInit> & { key: string }): KeyboardEvent {
  return new KeyboardEvent('keydown', over);
}

describe('shortcutFromEvent', () => {
  it('returns null when no modifier is held', () => {
    expect(shortcutFromEvent(ke({ key: 'k' }))).toBeNull();
  });

  it('captures Cmd+K via metaKey on macOS', () => {
    expect(shortcutFromEvent(ke({ key: 'k', metaKey: true }))).toBe('Cmd+K');
  });

  it('captures Cmd+K via ctrlKey on Windows/Linux', () => {
    expect(shortcutFromEvent(ke({ key: 'k', ctrlKey: true }))).toBe('Cmd+K');
  });

  it('orders modifiers Cmd > Alt > Shift', () => {
    expect(
      shortcutFromEvent(ke({ key: 'n', metaKey: true, shiftKey: true })),
    ).toBe('Cmd+Shift+N');
    expect(
      shortcutFromEvent(
        ke({ key: 'p', metaKey: true, altKey: true, shiftKey: true }),
      ),
    ).toBe('Cmd+Alt+Shift+P');
  });

  it('ignores reserved keys', () => {
    expect(shortcutFromEvent(ke({ key: 'Escape', metaKey: true }))).toBeNull();
    expect(shortcutFromEvent(ke({ key: 'Tab', metaKey: true }))).toBeNull();
  });

  it('ignores standalone modifier presses', () => {
    expect(shortcutFromEvent(ke({ key: 'Shift', shiftKey: true }))).toBeNull();
    expect(shortcutFromEvent(ke({ key: 'Meta', metaKey: true }))).toBeNull();
  });
});

describe('parseShortcut', () => {
  it('returns null for malformed input', () => {
    expect(parseShortcut(null)).toBeNull();
    expect(parseShortcut('')).toBeNull();
    expect(parseShortcut('+')).toBeNull();
  });

  it('parses a single modifier + key', () => {
    expect(parseShortcut('Cmd+K')).toEqual({
      cmd: true,
      ctrl: false,
      alt: false,
      shift: false,
      key: 'K',
    });
  });

  it('parses multi-modifier shortcuts', () => {
    expect(parseShortcut('Cmd+Shift+N')).toEqual({
      cmd: true,
      ctrl: false,
      alt: false,
      shift: true,
      key: 'N',
    });
  });
});

describe('matchesShortcut', () => {
  it('matches when modifiers and key align', () => {
    const event = ke({ key: 'k', metaKey: true });
    expect(matchesShortcut(event, 'Cmd+K')).toBe(true);
  });

  it('treats Cmd shortcut as matching ctrlKey events (Windows/Linux)', () => {
    const event = ke({ key: 'k', ctrlKey: true });
    expect(matchesShortcut(event, 'Cmd+K')).toBe(true);
  });

  it('does NOT match when an extra modifier is held', () => {
    const event = ke({ key: 'k', metaKey: true, shiftKey: true });
    expect(matchesShortcut(event, 'Cmd+K')).toBe(false);
  });

  it('does NOT match when the key is different', () => {
    const event = ke({ key: 'j', metaKey: true });
    expect(matchesShortcut(event, 'Cmd+K')).toBe(false);
  });
});

describe('shortcutGlyphs', () => {
  it('translates shortcut tokens to readable glyphs', () => {
    expect(shortcutGlyphs('Cmd+Shift+N')).toEqual(['⌘', '⇧', 'N']);
    expect(shortcutGlyphs('Cmd+Alt+P')).toEqual(['⌘', '⌥', 'P']);
  });

  it('falls back to the raw string on malformed input', () => {
    expect(shortcutGlyphs('invalid')).toEqual(['invalid']);
  });
});

describe('findShortcutConflict', () => {
  it('returns the conflicting command id when the shortcut clashes', () => {
    const bindings = {
      'cmd-a': 'Cmd+N',
      'cmd-b': 'Cmd+Shift+N',
    };
    expect(findShortcutConflict('Cmd+N', bindings)).toBe('cmd-a');
  });

  it('returns null when there is no conflict', () => {
    expect(findShortcutConflict('Cmd+P', { 'cmd-a': 'Cmd+N' })).toBeNull();
  });

  it('ignores the excluded command id (re-saving same shortcut)', () => {
    expect(
      findShortcutConflict('Cmd+N', { 'cmd-a': 'Cmd+N' }, 'cmd-a'),
    ).toBeNull();
  });
});
