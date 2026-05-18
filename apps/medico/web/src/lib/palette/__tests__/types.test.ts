/**
 * @file __tests__/types.test.ts
 * @description Tests for the palette config parser + visibility/order helpers.
 */

import { describe, expect, it } from 'vitest';

import {
  EMPTY_PALETTE_CONFIG,
  filterVisibleCommands,
  isCommandVisible,
  isGroupVisible,
  parsePaletteConfig,
  sortCommandsByOrder,
  type PaletteConfig,
} from '../types';

describe('parsePaletteConfig', () => {
  it('returns the empty config for null / undefined / non-object input', () => {
    expect(parsePaletteConfig(null)).toEqual(EMPTY_PALETTE_CONFIG);
    expect(parsePaletteConfig(undefined)).toEqual(EMPTY_PALETTE_CONFIG);
    expect(parsePaletteConfig('foo')).toEqual(EMPTY_PALETTE_CONFIG);
  });

  it('normalises visible=false correctly (defaults to true otherwise)', () => {
    const parsed = parsePaletteConfig({
      commands: {
        'cmd-a': { visible: false, order: 1 },
        'cmd-b': { order: 2 }, // missing visible → defaults to true
      },
    });
    expect(parsed.commands['cmd-a']).toEqual({
      visible: false,
      order: 1,
      customShortcut: null,
    });
    expect(parsed.commands['cmd-b']).toEqual({
      visible: true,
      order: 2,
      customShortcut: null,
    });
  });

  it('drops malformed custom commands without throwing', () => {
    const parsed = parsePaletteConfig({
      customCommands: [
        { id: 'c-1', label: 'Valid', url: 'https://x.test' },
        { id: 'c-2' }, // missing label + url → dropped
        'not-an-object', // wrong shape → dropped
        null,
      ],
    });
    expect(parsed.customCommands).toEqual([
      { id: 'c-1', label: 'Valid', url: 'https://x.test', icon: undefined },
    ]);
  });

  it('preserves customShortcut when present', () => {
    const parsed = parsePaletteConfig({
      commands: {
        'cmd-a': { visible: true, order: 0, customShortcut: 'Cmd+Shift+P' },
      },
    });
    expect(parsed.commands['cmd-a'].customShortcut).toBe('Cmd+Shift+P');
  });
});

describe('isCommandVisible', () => {
  it('returns true when no preference exists', () => {
    expect(isCommandVisible(EMPTY_PALETTE_CONFIG, 'anything')).toBe(true);
  });

  it('returns false when visible is explicitly false', () => {
    const cfg: PaletteConfig = {
      groups: {},
      commands: { 'cmd-a': { visible: false, order: 0 } },
      customCommands: [],
    };
    expect(isCommandVisible(cfg, 'cmd-a')).toBe(false);
  });
});

describe('isGroupVisible', () => {
  it('defaults to true when no group preference is set', () => {
    expect(isGroupVisible(EMPTY_PALETTE_CONFIG, 'actions')).toBe(true);
  });

  it('returns false when the group is hidden', () => {
    const cfg: PaletteConfig = {
      groups: { actions: { visible: false, order: 0 } },
      commands: {},
      customCommands: [],
    };
    expect(isGroupVisible(cfg, 'actions')).toBe(false);
  });
});

describe('sortCommandsByOrder', () => {
  it('respects doctor-defined orders', () => {
    const cfg: PaletteConfig = {
      groups: {},
      commands: {
        a: { visible: true, order: 2 },
        b: { visible: true, order: 0 },
        c: { visible: true, order: 1 },
      },
      customCommands: [],
    };
    const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
    const sorted = sortCommandsByOrder(items, cfg);
    expect(sorted.map((i) => i.id)).toEqual(['b', 'c', 'a']);
  });

  it('falls back to default array order when no override exists', () => {
    const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
    const sorted = sortCommandsByOrder(items, EMPTY_PALETTE_CONFIG);
    expect(sorted.map((i) => i.id)).toEqual(['a', 'b', 'c']);
  });
});

describe('filterVisibleCommands', () => {
  it('keeps everything by default', () => {
    const items = [{ id: 'a' }, { id: 'b' }];
    expect(filterVisibleCommands(items, EMPTY_PALETTE_CONFIG)).toEqual(items);
  });

  it('drops items marked visible=false', () => {
    const cfg: PaletteConfig = {
      groups: {},
      commands: { a: { visible: false, order: 0 } },
      customCommands: [],
    };
    const items = [{ id: 'a' }, { id: 'b' }];
    expect(filterVisibleCommands(items, cfg)).toEqual([{ id: 'b' }]);
  });
});
