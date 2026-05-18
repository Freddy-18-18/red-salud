/**
 * @file lib/palette/types.ts
 * @description Type contract for the command-palette personalisation system.
 *
 * Lives entirely in TypeScript — the DB column is JSONB so we can evolve the
 * schema without DDL changes. Every reader MUST validate the row shape with
 * `parsePaletteConfig` because legacy / hand-edited rows could be partial.
 */

import type { StaticCommandGroup } from '@/components/shell/command-palette/commands/static-commands';

/**
 * Per-command preference (visibility + display order within its group).
 * `customShortcut` is the doctor's overridden keybinding — when set, it
 * replaces the static default at registration time. Stored as a normalised
 * string like `"Cmd+Shift+P"` (see `lib/palette/hotkeys.ts`).
 */
export interface CommandPref {
  visible: boolean;
  /** Lower = appears first within the group. Falls back to default order on tie. */
  order: number;
  /** Overridden keyboard shortcut, e.g. "Cmd+Shift+N". null = use default. */
  customShortcut?: string | null;
}

/**
 * Per-group preference (visibility + display order vs other groups).
 */
export interface GroupPref {
  visible: boolean;
  order: number;
}

/**
 * Doctor-defined custom command that opens an external URL in a new tab.
 * Phase 2 feature — kept here so the contract is stable from day one.
 */
export interface CustomCommand {
  id: string;
  label: string;
  url: string;
  icon?: string;
}

/**
 * Full palette config shape persisted in
 * `doctor_palette_preferences.config`. Every leaf is optional so the doctor
 * can save partial overrides without filling out the whole tree.
 */
export interface PaletteConfig {
  groups: Partial<Record<StaticCommandGroup, GroupPref>>;
  /** Keyed by `StaticCommandDef.id`. */
  commands: Record<string, CommandPref>;
  customCommands: CustomCommand[];
}

export const EMPTY_PALETTE_CONFIG: PaletteConfig = {
  groups: {},
  commands: {},
  customCommands: [],
};

/**
 * Whether a single command should appear in the palette. Returns true unless
 * the doctor explicitly hid it (`visible === false`). Brand-new commands the
 * doctor has never seen always show by default.
 */
export function isCommandVisible(
  config: PaletteConfig,
  commandId: string,
): boolean {
  const pref = config.commands[commandId];
  return pref?.visible !== false;
}

/**
 * Whether a whole group should render. Hiding a group hides every command
 * inside it regardless of per-command preferences.
 */
export function isGroupVisible(
  config: PaletteConfig,
  groupKey: StaticCommandGroup,
): boolean {
  const pref = config.groups[groupKey];
  return pref?.visible !== false;
}

/**
 * Sort a list of commands by the doctor's chosen order, falling back to the
 * original array order (the "default") when no override exists. Stable for
 * commands with the same order value.
 */
export function sortCommandsByOrder<T extends { id: string }>(
  items: T[],
  config: PaletteConfig,
): T[] {
  return [...items]
    .map((item, idx) => ({ item, idx }))
    .sort((a, b) => {
      const aOrder = config.commands[a.item.id]?.order;
      const bOrder = config.commands[b.item.id]?.order;
      // Doctor-defined orders win — falls back to default position when missing.
      const aEffective = aOrder ?? a.idx;
      const bEffective = bOrder ?? b.idx;
      if (aEffective !== bEffective) return aEffective - bEffective;
      return a.idx - b.idx;
    })
    .map((entry) => entry.item);
}

/**
 * Apply per-command visibility filter to a list. Group-level visibility is
 * checked separately by the caller because hiding a group also hides items
 * inside.
 */
export function filterVisibleCommands<T extends { id: string }>(
  items: T[],
  config: PaletteConfig,
): T[] {
  return items.filter((item) => isCommandVisible(config, item.id));
}

/**
 * Safe parser — accepts unknown JSONB blobs from the DB and returns a
 * normalised config with empty defaults for missing fields. Never throws.
 */
export function parsePaletteConfig(raw: unknown): PaletteConfig {
  if (!raw || typeof raw !== 'object') return EMPTY_PALETTE_CONFIG;
  const obj = raw as Record<string, unknown>;

  const groupsRaw = (obj.groups as Record<string, unknown>) ?? {};
  const groups: PaletteConfig['groups'] = {};
  for (const [key, value] of Object.entries(groupsRaw)) {
    if (!value || typeof value !== 'object') continue;
    const g = value as Record<string, unknown>;
    groups[key as StaticCommandGroup] = {
      visible: g.visible !== false,
      order: typeof g.order === 'number' ? g.order : 0,
    };
  }

  const commandsRaw = (obj.commands as Record<string, unknown>) ?? {};
  const commands: PaletteConfig['commands'] = {};
  for (const [id, value] of Object.entries(commandsRaw)) {
    if (!value || typeof value !== 'object') continue;
    const c = value as Record<string, unknown>;
    commands[id] = {
      visible: c.visible !== false,
      order: typeof c.order === 'number' ? c.order : 0,
      customShortcut: typeof c.customShortcut === 'string' ? c.customShortcut : null,
    };
  }

  const customRaw = Array.isArray(obj.customCommands) ? obj.customCommands : [];
  const customCommands: CustomCommand[] = customRaw
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null;
      const e = entry as Record<string, unknown>;
      if (typeof e.id !== 'string' || typeof e.label !== 'string' || typeof e.url !== 'string') {
        return null;
      }
      return {
        id: e.id,
        label: e.label,
        url: e.url,
        icon: typeof e.icon === 'string' ? e.icon : undefined,
      } as CustomCommand;
    })
    .filter((entry): entry is CustomCommand => entry !== null);

  return { groups, commands, customCommands };
}
