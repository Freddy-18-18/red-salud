'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  useTheme,
} from '@red-salud/design-system';
import {
  ChevronDown,
  LogOut,
  Search,
  Settings,
  ShieldCheck,
  ShieldAlert,
  User,
  Eye,
  ExternalLink,
  MessageSquare,
  HelpCircle,
  FileText,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { supabase } from '@/lib/supabase/client';
import { useConnectionStatus, type ConnectionStatus } from '@/hooks/use-connection-status';

import { useCommandPalette } from './command-palette/command-palette-context';

/**
 * @file user-menu-dropdown.tsx
 * @description Avatar trigger + identity / settings menu (Linear/Stripe pattern).
 *
 * Three trigger variants:
 *  - 'header'           → compact 36px avatar (default — used by global header)
 *  - 'sidebar-expanded' → avatar + name + email + chevron
 *  - 'sidebar-collapsed'→ avatar only with tooltip
 *
 * Menu structure (Linear-style sections separated by dividers):
 *  1. Identity block: avatar + name + email + SACS verified badge
 *  2. Public profile + my profile + configuration
 *  3. Security + SACS verification
 *  4. Theme picker (segmented controls inline)
 *  5. Help center + feedback + legal
 *  6. Logout
 */

export interface UserMenuDropdownProps {
  doctorName: string;
  email: string;
  avatarUrl: string | null;
  variant?: 'header' | 'sidebar-expanded' | 'sidebar-collapsed';
  /** @deprecated Use `variant`. Retained for callers still passing `collapsed`. */
  collapsed?: boolean;
}

function computeInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '?';
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  const first = parts[0]?.[0] ?? '';
  const last = parts[parts.length - 1]?.[0] ?? '';
  return `${first}${last}`.toUpperCase();
}

export function UserMenuDropdown({
  doctorName,
  email,
  avatarUrl,
  variant,
  collapsed,
}: UserMenuDropdownProps): React.ReactElement {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { triggerVisible, toggleTriggerVisible: toggleTrigger } =
    useCommandPalette();
  // Connection status drives the colour of the ring around the avatar.
  // Green = online, amber (pulsing) = reconnecting or offline. The doctor's
  // identity surface doubles as the connection indicator — the previous
  // standalone dot lived next to the avatar but doctors kept missing it.
  const connectionStatus = useConnectionStatus();
  const [sacsVerified, setSacsVerified] = useState<boolean | null>(null);

  // Fetch the SACS verified flag once, to show the badge in the menu header.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      const { data } = await supabase
        .from('profiles')
        .select('sacs_verified')
        .eq('id', user.id)
        .maybeSingle();
      if (!cancelled) setSacsVerified(!!data?.sacs_verified);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const resolvedVariant: 'header' | 'sidebar-expanded' | 'sidebar-collapsed' =
    variant ??
    (collapsed === true
      ? 'sidebar-collapsed'
      : collapsed === false
        ? 'sidebar-expanded'
        : 'header');

  const initials = computeInitials(doctorName);

  const navigateTo = useCallback(
    (path: string) => () => {
      router.push(path);
    },
    [router],
  );

  const openExternal = useCallback((url: string) => () => {
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/auth/login');
      router.refresh();
    } catch {
      toast.error('No se pudo cerrar sesión. Intentalo de nuevo.');
    }
  }, [router]);

  // ── Trigger styles ────────────────────────────────────────────────────
  const triggerClassName =
    resolvedVariant === 'header'
      ? 'inline-flex items-center justify-center rounded-full transition-colors motion-reduce:transition-none hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
      : resolvedVariant === 'sidebar-collapsed'
        ? 'flex w-full items-center justify-center rounded-xl p-2 transition-colors motion-reduce:transition-none hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
        : 'flex w-full items-center gap-3 rounded-xl p-2 transition-colors motion-reduce:transition-none hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

  const avatarSize = resolvedVariant === 'header' ? 'h-9 w-9' : 'h-10 w-10';
  const dropdownSide = resolvedVariant === 'header' ? 'bottom' : 'top';
  const ringClasses = connectionRingClasses(connectionStatus);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Abrir menu de usuario (${connectionLabel(connectionStatus)})`}
          className={triggerClassName}
          title={
            resolvedVariant !== 'sidebar-expanded'
              ? `${doctorName} · ${connectionLabel(connectionStatus)}`
              : undefined
          }
        >
          {/* Ring colour reflects Supabase connection status:
              · emerald = online      (everything synced)
              · amber (pulse) = reconnecting / offline (working without network) */}
          <Avatar
            className={`${avatarSize} ring-2 ring-offset-2 ring-offset-background ${ringClasses}`}
            data-connection-status={connectionStatus}
          >
            {avatarUrl && <AvatarImage src={avatarUrl} alt={doctorName} />}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          {resolvedVariant === 'sidebar-expanded' && (
            <>
              <span className="flex min-w-0 flex-col text-left">
                <span className="truncate text-sm font-semibold">{doctorName}</span>
                <span className="truncate text-xs text-muted-foreground">{email}</span>
              </span>
              <ChevronDown
                className="ml-auto h-4 w-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
            </>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        side={dropdownSide}
        sideOffset={10}
        className={[
          // Surface refinements: kill the heavy default border (it reads as a
          // bright white line on dark mode) and lean on a deeper shadow + a
          // subtle inner ring for definition.
          'w-[19.5rem] overflow-hidden rounded-xl p-0',
          'border border-border/30 shadow-[0_18px_60px_-20px_rgba(0,0,0,0.55)]',
          'bg-popover/95 backdrop-blur-xl',
          // Override the default arrow animations a hair so the drop feels
          // more "pull" than "snap".
          'data-[state=open]:duration-150',
        ].join(' ')}
      >
        {/* ─── Identity block ──────────────────────────────────────────── */}
        <div className="relative px-4 pb-4 pt-4">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-primary/[0.06] to-transparent"
          />
          <div className="relative flex items-center gap-3">
            <Avatar
              className={`h-11 w-11 shrink-0 ring-2 ring-offset-2 ring-offset-background ${ringClasses}`}
              data-connection-status={connectionStatus}
            >
              {avatarUrl && <AvatarImage src={avatarUrl} alt={doctorName} />}
              <AvatarFallback className="bg-primary/15 text-primary font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-tight text-foreground truncate">
                Dr. {doctorName}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground truncate">
                {email}
              </p>
            </div>
          </div>
          <div className="relative mt-3 flex flex-wrap items-center gap-1.5">
            {sacsVerified === true && (
              <span className="inline-flex items-center gap-1 rounded-full bg-success/12 px-2 py-0.5 text-[10px] font-medium text-success">
                <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                Verificado por SACS
              </span>
            )}
            {sacsVerified === false && (
              <span className="inline-flex items-center gap-1 rounded-full bg-warning/12 px-2 py-0.5 text-[10px] font-medium text-warning">
                <ShieldAlert className="h-3 w-3" aria-hidden="true" />
                Pendiente de verificar
              </span>
            )}
            <ConnectionStatusPill status={connectionStatus} />
          </div>
        </div>

        <SoftSeparator />

        {/* ─── Profile section ─────────────────────────────────────────── */}
        <div className="p-1">
          <MenuRow
            icon={Eye}
            label="Ver mi perfil público"
            onSelect={navigateTo('/dashboard/perfil-publico')}
            trailing={<ExternalHint />}
          />
          <MenuRow
            icon={User}
            label="Mi perfil"
            onSelect={navigateTo('/dashboard/configuracion/perfil')}
          />
          <MenuRow
            icon={Settings}
            label="Configuración"
            onSelect={navigateTo('/dashboard/configuracion')}
          />
        </div>

        <SoftSeparator />

        {/* ─── Security section ────────────────────────────────────────── */}
        <div className="p-1">
          <MenuRow
            icon={ShieldAlert}
            label="Seguridad"
            onSelect={navigateTo('/dashboard/configuracion/seguridad')}
          />
          <MenuRow
            icon={ShieldCheck}
            label="Verificación SACS"
            onSelect={navigateTo('/dashboard/verificacion')}
          />
        </div>

        <SoftSeparator />

        {/* ─── Theme picker (inline segmented) ─────────────────────────── */}
        <div className="px-3 pb-3 pt-2.5">
          <DropdownMenuLabel className="mb-1.5 p-0 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/80">
            Tema
          </DropdownMenuLabel>
          <div
            role="radiogroup"
            aria-label="Tema visual"
            className="inline-flex w-full gap-0.5 rounded-lg bg-muted/40 p-0.5"
          >
            <ThemeOption
              active={theme === 'light'}
              onClick={() => setTheme('light')}
              icon={Sun}
              label="Claro"
            />
            <ThemeOption
              active={theme === 'dark'}
              onClick={() => setTheme('dark')}
              icon={Moon}
              label="Oscuro"
            />
            <ThemeOption
              active={theme === 'system'}
              onClick={() => setTheme('system')}
              icon={Monitor}
              label="Auto"
            />
          </div>
        </div>

        <SoftSeparator />

        {/* ─── Search trigger preference ───────────────────────────────── */}
        <div className="px-3 pb-3 pt-2.5">
          <DropdownMenuLabel className="mb-1.5 p-0 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/80">
            Personalización
          </DropdownMenuLabel>
          <button
            type="button"
            onClick={(e) => {
              // Stop event so the dropdown doesn't dismiss after toggling.
              e.preventDefault();
              e.stopPropagation();
              toggleTrigger();
            }}
            className="group flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-sidebar-accent focus-visible:bg-sidebar-accent focus-visible:outline-none"
          >
            <span className="flex items-center gap-2.5">
              <Search
                className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground"
                aria-hidden="true"
              />
              <span className="flex flex-col">
                <span className="text-foreground/90 group-hover:text-foreground">
                  Mostrar buscador en el header
                </span>
                <span className="text-[11px] text-muted-foreground">
                  El atajo <kbd className="rounded border border-border bg-background px-1 font-mono text-[10px]">⌘K</kbd> sigue funcionando igual.
                </span>
              </span>
            </span>
            <span
              role="switch"
              aria-checked={triggerVisible}
              className={[
                'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors',
                triggerVisible ? 'bg-primary' : 'bg-muted',
              ].join(' ')}
            >
              <span
                className={[
                  'inline-block h-3.5 w-3.5 transform rounded-full bg-background shadow-sm transition-transform',
                  triggerVisible ? 'translate-x-[1.125rem]' : 'translate-x-0.5',
                ].join(' ')}
              />
            </span>
          </button>
        </div>

        <SoftSeparator />

        {/* ─── Help / feedback / legal ─────────────────────────────────── */}
        <div className="p-1">
          <MenuRow
            icon={HelpCircle}
            label="Centro de ayuda"
            onSelect={openExternal('https://red-salud.com/ayuda')}
            trailing={<ExternalHint />}
          />
          <MenuRow
            icon={MessageSquare}
            label="Enviar feedback"
            onSelect={openExternal('mailto:soporte@red-salud.com')}
          />
          <MenuRow
            icon={FileText}
            label="Términos y privacidad"
            onSelect={openExternal('/legal/terminos')}
            trailing={<ExternalHint />}
          />
        </div>

        <SoftSeparator />

        {/* ─── Logout ──────────────────────────────────────────────────── */}
        <div className="p-1">
          <DropdownMenuItem
            onSelect={() => {
              void handleLogout();
            }}
            className={[
              'group gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium text-destructive',
              'focus:bg-destructive/10 focus:text-destructive',
              'data-[highlighted]:bg-destructive/10 data-[highlighted]:text-destructive',
            ].join(' ')}
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Cerrar sesión
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Soft 1px divider that respects the popover surface — replaces the design
 * system's stronger separator so the menu reads as a single composed surface
 * instead of a stack of bordered cards.
 */
function SoftSeparator() {
  return (
    <div
      role="separator"
      aria-hidden="true"
      className="mx-2 h-px bg-border/50"
    />
  );
}

/**
 * Small "↗" badge that signals a menu row will leave the app or open a new
 * tab. Sits flush-right inside the row. Kept neutral so it doesn't compete
 * with the row's primary icon.
 */
function ExternalHint() {
  return (
    <ExternalLink
      className="h-3.5 w-3.5 text-muted-foreground/60 transition-colors group-data-[highlighted]:text-foreground/70"
      aria-hidden="true"
    />
  );
}

/**
 * Single menu row with consistent left icon + label + optional trailing
 * affordance. Centralises hover/highlight styling so every list entry feels
 * the same and the icon's color animates with the row state.
 */
function MenuRow({
  icon: Icon,
  label,
  onSelect,
  trailing,
}: {
  icon: typeof User;
  label: string;
  onSelect: () => void;
  trailing?: React.ReactNode;
}) {
  return (
    <DropdownMenuItem
      onSelect={onSelect}
      className={[
        'group gap-2.5 rounded-md px-2.5 py-2 text-sm',
        'text-foreground/90',
        'focus:bg-sidebar-accent focus:text-foreground',
        'data-[highlighted]:bg-sidebar-accent data-[highlighted]:text-foreground',
      ].join(' ')}
    >
      <Icon
        className="h-4 w-4 text-muted-foreground transition-colors group-data-[highlighted]:text-foreground"
        aria-hidden="true"
      />
      <span className="flex-1 truncate">{label}</span>
      {trailing}
    </DropdownMenuItem>
  );
}

function ThemeOption({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Sun;
  label: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={[
        'group inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium',
        'transition-all duration-150 motion-reduce:transition-none',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        active
          ? 'bg-background text-foreground shadow-sm ring-1 ring-border/40'
          : 'text-muted-foreground hover:bg-background/60 hover:text-foreground',
      ].join(' ')}
    >
      <Icon
        className={[
          'h-3.5 w-3.5 transition-transform duration-150',
          active ? 'text-primary' : '',
        ].join(' ')}
        aria-hidden="true"
      />
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Connection-status helpers — the avatar's ring and the in-menu pill share
// these so the colour/label coupling is in ONE place.
// ─────────────────────────────────────────────────────────────────────────

function connectionRingClasses(status: ConnectionStatus): string {
  switch (status) {
    case 'online':
      return 'ring-emerald-500';
    case 'reconnecting':
      return 'ring-amber-500 motion-safe:animate-pulse';
    case 'offline':
      return 'ring-amber-500 motion-safe:animate-pulse';
  }
}

function connectionLabel(status: ConnectionStatus): string {
  switch (status) {
    case 'online':
      return 'Conectado';
    case 'reconnecting':
      return 'Reconectando…';
    case 'offline':
      return 'Trabajando sin internet';
  }
}

function connectionDescription(status: ConnectionStatus): string {
  switch (status) {
    case 'online':
      return 'Tus datos se sincronizan en tiempo real.';
    case 'reconnecting':
      return 'Hay problemas para llegar al servidor. Reintentando…';
    case 'offline':
      return 'Los cambios se guardarán al volver la conexión.';
  }
}

function ConnectionStatusPill({ status }: { status: ConnectionStatus }) {
  const palette =
    status === 'online'
      ? 'bg-emerald-500/12 text-emerald-500'
      : 'bg-amber-500/12 text-amber-500';
  const dot =
    status === 'online'
      ? 'bg-emerald-500'
      : 'bg-amber-500 motion-safe:animate-pulse';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${palette}`}
      title={connectionDescription(status)}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden="true" />
      {connectionLabel(status)}
    </span>
  );
}
