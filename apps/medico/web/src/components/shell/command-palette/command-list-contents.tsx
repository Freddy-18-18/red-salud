'use client';

import {
  Avatar,
  AvatarFallback,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from '@red-salud/design-system';
import {
  Building2,
  Calendar,
  ExternalLink,
  Loader2,
  LogOut,
  Pill,
  Search,
  Settings,
  Star,
} from 'lucide-react';

import {
  ACCOUNT_COMMANDS,
  ACTION_COMMANDS,
  GROUP_LABELS,
  NAVIGATION_COMMANDS,
  THEME_COMMANDS,
  type StaticCommandGroup,
} from './commands/static-commands';
import type { CommandContents } from './use-command-contents';
import type {
  AppointmentHit,
  PatientHit,
  PrescriptionHit,
} from './commands/use-dynamic-search';
import { usePalettePreferences } from '@/lib/palette/use-palette-preferences';
import {
  filterVisibleCommands,
  isGroupVisible,
  sortCommandsByOrder,
} from '@/lib/palette/types';

/**
 * The 3 critical action commands shown in the empty state. Kept short on
 * purpose — a hero buscador at rest should feel like a question, not a menu.
 * The full command list lives behind the doctor typing anything.
 */
const EMPTY_STATE_ACTION_IDS = new Set([
  'act-new-appointment',
  'act-new-consultation',
  'act-new-prescription',
]);

/**
 * @file command-list-contents.tsx
 * @description The actual list of groups + items rendered inside any
 * Command surface (modal OR inline hero). Pure presentation — every action
 * is wired up by the caller via the `CommandContents` bag.
 *
 * The wrapping `<Command>` (or `<CommandDialog>`) provides the input,
 * keyboard navigation, and fuzzy matching. This component just declares
 * which items exist.
 */

interface Props {
  contents: CommandContents;
}

export function CommandListContents({ contents }: Props): React.ReactElement {
  const {
    patients,
    appointments,
    prescriptions,
    isLoading,
    isQueryActive,
    handleAction,
    handleNavigate,
    handleThemeChange,
    handleSedeSelect,
    handleLogout,
    goToPatient,
    goToAppointment,
    goToPrescription,
    sedes,
    activeSedeId,
  } = contents;

  // Doctor's palette personalisation overrides — visibility + order.
  // Loaded async; while `loading=true` we render the defaults so the palette
  // never appears empty during initial open.
  const { config: paletteConfig } = usePalettePreferences();

  // Per-group visibility. Hides every command inside a hidden group AND the
  // group heading itself — short-circuit BEFORE iterating items.
  const showActions = isGroupVisible(paletteConfig, 'actions');
  const showNavigation = isGroupVisible(paletteConfig, 'navigation');
  const showSedes = isGroupVisible(paletteConfig, 'sedes');
  const showTheme = isGroupVisible(paletteConfig, 'theme');
  const showAccount = isGroupVisible(paletteConfig, 'account');

  // Effective command lists per group: filter hidden + sort by doctor order.
  const effectiveActions = sortCommandsByOrder(
    filterVisibleCommands(ACTION_COMMANDS, paletteConfig),
    paletteConfig,
  );
  const effectiveNavigation = sortCommandsByOrder(
    filterVisibleCommands(
      NAVIGATION_COMMANDS.filter((c) => c.group === 'navigation'),
      paletteConfig,
    ),
    paletteConfig,
  );
  const effectiveAccountNav = sortCommandsByOrder(
    filterVisibleCommands(
      NAVIGATION_COMMANDS.filter((c) => c.group === 'account'),
      paletteConfig,
    ),
    paletteConfig,
  );
  const effectiveTheme = sortCommandsByOrder(
    filterVisibleCommands(THEME_COMMANDS, paletteConfig),
    paletteConfig,
  );
  const effectiveAccount = sortCommandsByOrder(
    filterVisibleCommands(ACCOUNT_COMMANDS, paletteConfig),
    paletteConfig,
  );

  // Empty state — only show 3 critical actions + a friendly prompt. Mirrors
  // Linear / Notion / Stripe behaviour: the palette should feel like a
  // question, not a menu. Power doctors still reach every command via typing
  // because cmdk fuzzy-matches against ALL keywords. The featured set
  // honours the doctor's hide preferences (a hidden action is hidden here
  // too).
  if (!isQueryActive) {
    const featuredActions = effectiveActions.filter((cmd) =>
      EMPTY_STATE_ACTION_IDS.has(cmd.id),
    );
    return (
      <>
        <CommandGroup heading="Accesos rápidos">
          {featuredActions.map((cmd) => {
            const Icon = cmd.icon;
            return (
              <CommandItem
                key={cmd.id}
                value={`${cmd.label} ${cmd.keywords.join(' ')}`}
                onSelect={handleAction(cmd.id)}
              >
                <Icon className="mr-2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <span>{cmd.label}</span>
                {cmd.shortcut && (
                  <CommandShortcut>{cmd.shortcut.join(' ')}</CommandShortcut>
                )}
              </CommandItem>
            );
          })}
        </CommandGroup>

        {/* Friendly hint that nudges the doctor to actually type something.
            Pure UI — no CommandItem so cmdk doesn't try to filter / select. */}
        <div className="mt-2 flex flex-col items-center gap-1 px-4 pb-4 pt-2 text-center">
          <Search
            className="h-5 w-5 text-muted-foreground/60"
            aria-hidden="true"
          />
          <p className="text-xs font-medium text-foreground/80">
            Empezá a escribir para buscar
          </p>
          <p className="text-[11px] text-muted-foreground">
            Pacientes, citas, recetas o cualquier comando del sistema.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <CommandEmpty>
        <div className="flex flex-col items-center gap-1 py-8 text-center">
          <span className="text-sm font-medium text-foreground">Sin resultados</span>
          <span className="text-xs text-muted-foreground">
            Probá con otro nombre, cédula o palabra clave.
          </span>
        </div>
      </CommandEmpty>

      {/* ── Static: actions ─────────────────────────────────────────── */}
      {showActions && effectiveActions.length > 0 && (
        <CommandGroup heading={GROUP_LABELS.actions}>
          {effectiveActions.map((cmd) => {
            const Icon = cmd.icon;
            return (
              <CommandItem
                key={cmd.id}
                value={`${cmd.label} ${cmd.keywords.join(' ')}`}
                onSelect={handleAction(cmd.id)}
              >
                <Icon className="mr-2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <span>{cmd.label}</span>
                {cmd.shortcut && (
                  <CommandShortcut>{cmd.shortcut.join(' ')}</CommandShortcut>
                )}
              </CommandItem>
            );
          })}
        </CommandGroup>
      )}

      {showActions && showNavigation && <CommandSeparator />}

      {/* ── Static: navigation ──────────────────────────────────────── */}
      {showNavigation && effectiveNavigation.length > 0 && (
        <CommandGroup heading={GROUP_LABELS.navigation}>
          {effectiveNavigation.map((cmd) => {
            const Icon = cmd.icon;
            return (
              <CommandItem
                key={cmd.id}
                value={`${cmd.label} ${cmd.keywords.join(' ')}`}
                onSelect={handleNavigate(cmd.href)}
              >
                <Icon className="mr-2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <span>{cmd.label}</span>
                {cmd.shortcut && (
                  <CommandShortcut>{cmd.shortcut.join(' · ')}</CommandShortcut>
                )}
              </CommandItem>
            );
          })}
        </CommandGroup>
      )}

      {/* ── Dynamic: patients ───────────────────────────────────────── */}
      {isQueryActive && patients.hits.length > 0 && (
        <>
          <CommandSeparator />
          <CommandGroup heading="Pacientes">
            {patients.hits.map((p) => (
              <PatientRow key={p.id} hit={p} onSelect={goToPatient(p.id)} />
            ))}
          </CommandGroup>
        </>
      )}

      {/* ── Dynamic: appointments ───────────────────────────────────── */}
      {isQueryActive && appointments.hits.length > 0 && (
        <>
          <CommandSeparator />
          <CommandGroup heading="Citas">
            {appointments.hits.map((a) => (
              <AppointmentRow
                key={a.id}
                hit={a}
                onSelect={goToAppointment(a.id)}
              />
            ))}
          </CommandGroup>
        </>
      )}

      {/* ── Dynamic: prescriptions ──────────────────────────────────── */}
      {isQueryActive && prescriptions.hits.length > 0 && (
        <>
          <CommandSeparator />
          <CommandGroup heading="Recetas">
            {prescriptions.hits.map((rx) => (
              <PrescriptionRow
                key={rx.id}
                hit={rx}
                onSelect={goToPrescription(rx.id)}
              />
            ))}
          </CommandGroup>
        </>
      )}

      {/* ── Loading indicator for dynamic results ───────────────────── */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-3 text-xs text-muted-foreground">
          <Loader2
            className="h-3 w-3 animate-spin motion-reduce:animate-none"
            aria-hidden="true"
          />
          Buscando...
        </div>
      )}

      <CommandSeparator />

      {/* ── Sedes switcher ──────────────────────────────────────────── */}
      {showSedes && sedes.length > 0 && (
        <>
          <CommandSeparator />
          <CommandGroup heading={GROUP_LABELS.sedes}>
            {sedes.map((sede) => {
              const isActive = sede.id === activeSedeId;
              return (
                <CommandItem
                  key={sede.id}
                  value={`sede ${sede.label}`}
                  onSelect={handleSedeSelect(sede.id)}
                >
                  <Building2
                    className={`mr-2 h-4 w-4 ${
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    }`}
                    aria-hidden="true"
                  />
                  <span className="flex-1 truncate">
                    {isActive ? 'Estás en ' : 'Cambiar a '}
                    <span className="font-medium">{sede.label}</span>
                  </span>
                  {sede.isPrimary && (
                    <Star
                      className="ml-2 h-3 w-3 fill-amber-400 text-amber-500"
                      aria-label="Sede principal"
                    />
                  )}
                </CommandItem>
              );
            })}
            <CommandItem
              value="gestionar sedes consultorios"
              onSelect={handleNavigate('/dashboard/sedes')}
            >
              <Settings className="mr-2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span>Gestionar sedes</span>
            </CommandItem>
          </CommandGroup>
        </>
      )}

      {/* ── Theme ───────────────────────────────────────────────────── */}
      {showTheme && effectiveTheme.length > 0 && (
        <>
          <CommandSeparator />
          <CommandGroup heading={GROUP_LABELS.theme}>
            {effectiveTheme.map((cmd) => {
              const Icon = cmd.icon;
              return (
                <CommandItem
                  key={cmd.id}
                  value={`${cmd.label} ${cmd.keywords.join(' ')}`}
                  onSelect={handleThemeChange(cmd.theme)}
                >
                  <Icon className="mr-2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <span>{cmd.label}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </>
      )}

      {/* ── Custom commands (doctor-defined URLs) ────────────────────── */}
      {paletteConfig.customCommands.length > 0 && (
        <>
          <CommandSeparator />
          <CommandGroup heading="Mis comandos">
            {paletteConfig.customCommands.map((cmd) => (
              <CommandItem
                key={cmd.id}
                value={`custom ${cmd.label} ${cmd.url}`}
                onSelect={() => {
                  if (typeof window !== 'undefined') {
                    window.open(cmd.url, '_blank', 'noopener,noreferrer');
                  }
                }}
              >
                <ExternalLink
                  className="mr-2 h-4 w-4 text-muted-foreground"
                  aria-hidden="true"
                />
                <span className="flex-1 truncate">{cmd.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </>
      )}

      {/* ── Account ─────────────────────────────────────────────────── */}
      {showAccount && (effectiveAccountNav.length > 0 || effectiveAccount.length > 0) && (
        <>
          <CommandSeparator />
          <CommandGroup heading={GROUP_LABELS.account}>
            {effectiveAccountNav.map((cmd) => {
              const Icon = cmd.icon;
              return (
                <CommandItem
                  key={cmd.id}
                  value={`${cmd.label} ${cmd.keywords.join(' ')}`}
                  onSelect={handleNavigate(cmd.href)}
                >
                  <Icon className="mr-2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <span>{cmd.label}</span>
                </CommandItem>
              );
            })}
            {effectiveAccount.map((cmd) => (
              <CommandItem
                key={cmd.id}
                value={`${cmd.label} ${cmd.keywords.join(' ')}`}
                onSelect={handleLogout}
                className="text-destructive aria-selected:bg-destructive/10 aria-selected:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                <span>{cmd.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </>
      )}
    </>
  );
}

// ── Dynamic row components ──────────────────────────────────────────────

function PatientRow({
  hit,
  onSelect,
}: {
  hit: PatientHit;
  onSelect: () => void;
}) {
  const initials = computeInitials(hit.fullName);
  const subtitleParts = [hit.cedula, hit.phone].filter(Boolean);

  return (
    <CommandItem
      value={`paciente ${hit.fullName} ${hit.cedula ?? ''} ${hit.phone ?? ''}`}
      onSelect={onSelect}
    >
      <Avatar className="mr-2 h-7 w-7">
        <AvatarFallback className="bg-primary/15 text-[10px] font-semibold text-primary">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate">{hit.fullName}</span>
        {subtitleParts.length > 0 && (
          <span className="truncate text-[11px] text-muted-foreground">
            {subtitleParts.join(' · ')}
          </span>
        )}
      </div>
    </CommandItem>
  );
}

function AppointmentRow({
  hit,
  onSelect,
}: {
  hit: AppointmentHit;
  onSelect: () => void;
}) {
  const date = new Date(hit.scheduledAt);
  const dateLabel = date.toLocaleDateString('es-VE', {
    day: 'numeric',
    month: 'short',
  });
  const timeLabel = date.toLocaleTimeString('es-VE', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return (
    <CommandItem
      value={`cita ${hit.patientName} ${hit.reason ?? ''}`}
      onSelect={onSelect}
    >
      <Calendar
        className="mr-2 h-4 w-4 text-muted-foreground"
        aria-hidden="true"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate">{hit.patientName}</span>
        <span className="truncate text-[11px] text-muted-foreground">
          {dateLabel} · {timeLabel}
          {hit.reason ? ` · ${hit.reason}` : ''}
        </span>
      </div>
    </CommandItem>
  );
}

function PrescriptionRow({
  hit,
  onSelect,
}: {
  hit: PrescriptionHit;
  onSelect: () => void;
}) {
  const date = new Date(hit.prescribedAt).toLocaleDateString('es-VE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  return (
    <CommandItem
      value={`receta ${hit.patientName} ${hit.diagnosis ?? ''}`}
      onSelect={onSelect}
    >
      <Pill className="mr-2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate">
          {hit.patientName}
          {hit.diagnosis ? ` — ${hit.diagnosis}` : ''}
        </span>
        <span className="truncate text-[11px] text-muted-foreground">{date}</span>
      </div>
    </CommandItem>
  );
}

function computeInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '?';
  const parts = trimmed.split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
  return `${first}${last}`.toUpperCase() || '?';
}
