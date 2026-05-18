'use client';

import { useMemo, useState } from 'react';
import {
  Button,
  Switch,
} from '@red-salud/design-system';
import {
  GripVertical,
  Keyboard,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { shortcutGlyphs } from '@/lib/palette/hotkeys';

import { CaptureShortcutDialog } from './capture-shortcut-dialog';
import { CustomCommandsSection } from './custom-commands-section';

import {
  ACCOUNT_COMMANDS,
  ACTION_COMMANDS,
  GROUP_LABELS,
  NAVIGATION_COMMANDS,
  THEME_COMMANDS,
  type StaticCommandDef,
  type StaticCommandGroup,
} from '@/components/shell/command-palette/commands/static-commands';
import { useCommandPalette } from '@/components/shell/command-palette/command-palette-context';
import { usePalettePreferences } from '@/lib/palette/use-palette-preferences';
import type { PaletteConfig } from '@/lib/palette/types';

/**
 * @file atajos-settings.tsx
 * @description Client component that owns the personalisation UI. The
 * structure mirrors how the palette renders: groups first, commands inside.
 *
 * Reorder is implemented with up/down arrows (not drag-and-drop) so we
 * don't have to drag a `@dnd-kit` dependency in for the Phase 1 surface.
 * Phase 2 can swap it in if the doctor demand warrants it.
 */

interface GroupSection {
  key: StaticCommandGroup;
  label: string;
  description: string;
  commands: StaticCommandDef[];
}

// We split navigation by `group` so account-targeted nav rows render in the
// account section, not the navigation section — mirroring the palette layout.
const NAV_NAVIGATION = NAVIGATION_COMMANDS.filter((c) => c.group === 'navigation');
const NAV_ACCOUNT = NAVIGATION_COMMANDS.filter((c) => c.group === 'account');

const SECTIONS: GroupSection[] = [
  {
    key: 'actions',
    label: GROUP_LABELS.actions,
    description: 'Atajos visibles cuando abrís el buscador sin escribir nada.',
    commands: ACTION_COMMANDS,
  },
  {
    key: 'navigation',
    label: GROUP_LABELS.navigation,
    description: 'Saltos rápidos a cada sección del consultorio.',
    commands: NAV_NAVIGATION,
  },
  {
    key: 'theme',
    label: GROUP_LABELS.theme,
    description: 'Acceso al tema visual (claro / oscuro / automático).',
    commands: THEME_COMMANDS,
  },
  {
    key: 'account',
    label: GROUP_LABELS.account,
    description: 'Perfil, configuración general y cerrar sesión.',
    commands: [...NAV_ACCOUNT, ...ACCOUNT_COMMANDS],
  },
];

export function AtajosSettings(): React.ReactElement {
  const { config, loading, saving, setConfig, reset } = usePalettePreferences();
  const { triggerVisible, toggleTriggerVisible } = useCommandPalette();

  // Capture-shortcut modal — when set, the dialog opens for this command.
  // Lifted to the top level so a single Dialog instance handles every row.
  const [editingCommand, setEditingCommand] = useState<{
    id: string;
    label: string;
    defaultShortcut: string | null;
  } | null>(null);

  // Flatten the doctor's effective shortcut bindings for conflict checks.
  // Map keyed by command id → resolved shortcut (custom || default).
  const allBindings = useMemo(() => {
    const bindings: Record<string, string> = {};
    for (const section of SECTIONS) {
      for (const cmd of section.commands) {
        const override = config.commands[cmd.id]?.customShortcut;
        const def = cmd.shortcut?.join('+');
        const effective = override ?? def ?? null;
        if (effective) bindings[cmd.id] = effective;
      }
    }
    return bindings;
  }, [config]);

  async function saveShortcut(commandId: string, next: string | null) {
    await setConfig({
      ...config,
      commands: {
        ...config.commands,
        [commandId]: {
          visible: config.commands[commandId]?.visible !== false,
          order: config.commands[commandId]?.order ?? 0,
          customShortcut: next,
        },
      },
    });
    toast.success(next ? 'Atajo guardado' : 'Atajo restaurado al default');
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-6 text-sm text-muted-foreground">
        <Loader2
          className="h-4 w-4 animate-spin motion-reduce:animate-none"
          aria-hidden="true"
        />
        Cargando tu configuración...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <GeneralSection
        triggerVisible={triggerVisible}
        onToggleTrigger={toggleTriggerVisible}
      />

      {SECTIONS.map((section) => (
        <GroupSectionCard
          key={section.key}
          section={section}
          config={config}
          onChange={setConfig}
          saving={saving}
          onEditShortcut={(commandId, label, defaultShortcut) =>
            setEditingCommand({ id: commandId, label, defaultShortcut })
          }
        />
      ))}

      {/* Custom URL commands (Phase 2) — separate card with its own CRUD. */}
      <CustomCommandsSection
        config={config}
        onChange={setConfig}
        saving={saving}
      />

      {editingCommand && (
        <CaptureShortcutDialog
          open={true}
          onOpenChange={(open) => {
            if (!open) setEditingCommand(null);
          }}
          commandId={editingCommand.id}
          commandLabel={editingCommand.label}
          defaultShortcut={editingCommand.defaultShortcut}
          currentShortcut={
            config.commands[editingCommand.id]?.customShortcut ?? null
          }
          allBindings={allBindings}
          onSave={async (next) => {
            await saveShortcut(editingCommand.id, next);
            setEditingCommand(null);
          }}
        />
      )}

      <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
        <div>
          <p className="text-sm font-medium">Restaurar valores predeterminados</p>
          <p className="text-xs text-muted-foreground">
            Vuelve a la configuración original (todos los comandos visibles, orden de fábrica).
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={saving}
          onClick={async () => {
            try {
              await reset();
              toast.success('Configuración restaurada');
            } catch (err) {
              toast.error(err instanceof Error ? err.message : 'Error al restaurar');
            }
          }}
        >
          <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
          Restaurar
        </Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// General preferences (header trigger visibility)
// ─────────────────────────────────────────────────────────────────────────

function GeneralSection({
  triggerVisible,
  onToggleTrigger,
}: {
  triggerVisible: boolean;
  onToggleTrigger: () => void;
}) {
  return (
    <section className="rounded-xl border border-border bg-background p-5">
      <header className="mb-4">
        <h2 className="text-sm font-semibold">General</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Cómo aparece el buscador en el header.
        </p>
      </header>
      <label className="flex cursor-pointer items-center justify-between gap-4 rounded-md border border-border bg-muted/30 px-4 py-3 transition-colors hover:bg-muted/50">
        <span className="space-y-0.5">
          <span className="block text-sm font-medium">Mostrar buscador en el header</span>
          <span className="block text-xs text-muted-foreground">
            Si lo apagás, el atajo
            <kbd className="mx-1 rounded border border-border bg-background px-1 font-mono text-[10px]">⌘K</kbd>
            sigue funcionando.
          </span>
        </span>
        <Switch checked={triggerVisible} onCheckedChange={onToggleTrigger} />
      </label>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// One section per palette group
// ─────────────────────────────────────────────────────────────────────────

function GroupSectionCard({
  section,
  config,
  onChange,
  saving,
  onEditShortcut,
}: {
  section: GroupSection;
  config: PaletteConfig;
  onChange: (next: PaletteConfig) => Promise<void>;
  saving: boolean;
  onEditShortcut: (
    commandId: string,
    label: string,
    defaultShortcut: string | null,
  ) => void;
}) {
  const groupVisible = config.groups[section.key]?.visible !== false;

  // Sort commands by the doctor's chosen order so the UI reflects what the
  // palette renders. Within ties we fall back to the default array order.
  const orderedCommands = useMemo(() => {
    return [...section.commands]
      .map((cmd, idx) => ({ cmd, idx }))
      .sort((a, b) => {
        const aOrder = config.commands[a.cmd.id]?.order;
        const bOrder = config.commands[b.cmd.id]?.order;
        const aEff = aOrder ?? a.idx;
        const bEff = bOrder ?? b.idx;
        if (aEff !== bEff) return aEff - bEff;
        return a.idx - b.idx;
      })
      .map((entry) => entry.cmd);
  }, [section.commands, config]);

  async function toggleGroup(visible: boolean) {
    await onChange({
      ...config,
      groups: {
        ...config.groups,
        [section.key]: {
          visible,
          order: config.groups[section.key]?.order ?? 0,
        },
      },
    });
  }

  async function toggleCommand(commandId: string, visible: boolean) {
    await onChange({
      ...config,
      commands: {
        ...config.commands,
        [commandId]: {
          visible,
          order: config.commands[commandId]?.order ?? 0,
        },
      },
    });
  }

  async function reorderTo(activeId: string, overId: string) {
    if (activeId === overId) return;
    const fromIdx = orderedCommands.findIndex((c) => c.id === activeId);
    const toIdx = orderedCommands.findIndex((c) => c.id === overId);
    if (fromIdx === -1 || toIdx === -1) return;

    // Move the dragged command into the destination position. Then re-write
    // every command's `order` based on its new index — keeps the numeric
    // line clean and idempotent.
    const reordered = [...orderedCommands];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);

    const nextCommands: PaletteConfig['commands'] = { ...config.commands };
    reordered.forEach((cmd, i) => {
      nextCommands[cmd.id] = {
        visible: config.commands[cmd.id]?.visible !== false,
        order: i,
        customShortcut: config.commands[cmd.id]?.customShortcut ?? null,
      };
    });

    await onChange({ ...config, commands: nextCommands });
  }

  // Sensors: PointerSensor for mouse/touch, KeyboardSensor for accessibility
  // (space to lift, arrows to move, space again to drop). Both are essential —
  // drag-only would lock keyboard users out of reordering.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    await reorderTo(active.id as string, over.id as string);
  }

  return (
    <section
      className={[
        'rounded-xl border border-border bg-background p-5 transition-opacity',
        groupVisible ? '' : 'opacity-70',
      ].join(' ')}
    >
      <header className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold">{section.label}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {section.description}
          </p>
        </div>
        <Switch
          checked={groupVisible}
          onCheckedChange={(checked) => void toggleGroup(checked)}
          aria-label={`Mostrar grupo ${section.label}`}
        />
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={orderedCommands.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul
            className={[
              'divide-y divide-border/60 rounded-lg border border-border',
              groupVisible ? '' : 'pointer-events-none',
            ].join(' ')}
          >
            {orderedCommands.map((cmd) => (
              <SortableCommandRow
                key={cmd.id}
                cmd={cmd}
                isVisible={config.commands[cmd.id]?.visible !== false}
                customShortcut={config.commands[cmd.id]?.customShortcut ?? null}
                onEditShortcut={() =>
                  onEditShortcut(
                    cmd.id,
                    cmd.label,
                    cmd.shortcut?.join('+') ?? null,
                  )
                }
                onToggleVisibility={(checked) => void toggleCommand(cmd.id, checked)}
                disabled={saving || !groupVisible}
                groupVisible={groupVisible}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </section>
  );
}

/**
 * Sortable command row. Wraps the row's content with dnd-kit's
 * `useSortable` hook so it can be lifted with mouse or keyboard.
 * The drag handle is the GripVertical icon on the left — clicking
 * anywhere else (switch, pill) preserves its native behaviour.
 */
function SortableCommandRow({
  cmd,
  isVisible,
  customShortcut,
  onEditShortcut,
  onToggleVisibility,
  disabled,
  groupVisible,
}: {
  cmd: StaticCommandDef;
  isVisible: boolean;
  customShortcut: string | null;
  onEditShortcut: () => void;
  onToggleVisibility: (checked: boolean) => void;
  disabled: boolean;
  groupVisible: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: cmd.id, disabled: !groupVisible });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = cmd.icon;

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={[
        'flex items-center gap-3 bg-background px-3 py-2.5 transition-colors',
        isVisible ? '' : 'opacity-60',
        isDragging ? 'z-10 shadow-lg ring-1 ring-primary/30' : '',
      ].join(' ')}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        disabled={!groupVisible}
        aria-label={`Reordenar ${cmd.label}`}
        className="inline-flex h-7 w-5 cursor-grab items-center justify-center text-muted-foreground/60 transition-colors hover:text-foreground active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-30"
      >
        <GripVertical className="h-4 w-4" aria-hidden="true" />
      </button>
      <Icon
        className="h-4 w-4 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
      <span className="flex-1 truncate text-sm">{cmd.label}</span>
      <ShortcutPill
        defaultShortcut={cmd.shortcut?.join('+') ?? null}
        customShortcut={customShortcut}
        onEdit={onEditShortcut}
        disabled={disabled}
      />
      <Switch
        checked={isVisible}
        onCheckedChange={onToggleVisibility}
        disabled={disabled}
        aria-label={`Mostrar ${cmd.label}`}
      />
    </li>
  );
}

/**
 * Clickable pill that displays a command's effective shortcut and opens the
 * capture modal. Visually:
 *   - If the doctor set a custom shortcut → shows it with a tiny "custom" dot
 *   - Else if there's a default → shows the default in muted style
 *   - Else → shows a "Asignar" placeholder
 */
function ShortcutPill({
  defaultShortcut,
  customShortcut,
  onEdit,
  disabled,
}: {
  defaultShortcut: string | null;
  customShortcut: string | null;
  onEdit: () => void;
  disabled: boolean;
}) {
  const effective = customShortcut ?? defaultShortcut;
  const isCustom = customShortcut !== null;

  if (!effective) {
    return (
      <button
        type="button"
        onClick={onEdit}
        disabled={disabled}
        className="inline-flex items-center gap-1 rounded-md border border-dashed border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground transition-colors hover:border-foreground/50 hover:text-foreground disabled:opacity-50"
      >
        <Keyboard className="h-3 w-3" aria-hidden="true" />
        Asignar
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onEdit}
      disabled={disabled}
      title="Cambiar atajo"
      className={[
        'group inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[10px] transition-colors disabled:opacity-50',
        isCustom
          ? 'border-primary/40 bg-primary/10 text-primary hover:bg-primary/15'
          : 'border-border bg-muted text-foreground/70 hover:border-foreground/40',
      ].join(' ')}
    >
      {isCustom && (
        <span
          aria-label="Atajo personalizado"
          className="h-1.5 w-1.5 rounded-full bg-primary"
        />
      )}
      <span>{shortcutGlyphs(effective).join(' ')}</span>
    </button>
  );
}
