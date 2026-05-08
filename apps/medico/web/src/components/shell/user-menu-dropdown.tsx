'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  useTheme,
} from '@red-salud/design-system';
import { ChevronDown, LogOut, Settings, ShieldCheck, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { toast } from 'sonner';

import { supabase } from '@/lib/supabase/client';

/**
 * @file user-menu-dropdown.tsx
 * @description Sidebar footer user menu (T-007).
 *
 * Avatar trigger that opens a dropdown with identity, profile, verification,
 * theme switcher, settings, and logout. Implements FR-4 + FR-8 of the
 * medico-shell-sanvia spec.
 *
 * Logout uses the shared `supabase` browser client from `@/lib/supabase/client`,
 * which wraps `@supabase/ssr`'s `createBrowserClient` — the canonical pattern
 * used everywhere else in the medico app (e.g. /auth/login). The `<AuthProvider>`
 * from `@red-salud/auth-sdk` is intentionally NOT mounted in this app, so
 * `useAuth()` would throw at runtime. On error a destructive toast appears and
 * the user stays logged in (graceful failure per FR-8 edge case).
 *
 * Theme is rendered as a flat `DropdownMenuRadioGroup` (Claro / Oscuro / Auto)
 * inside the same dropdown — NOT a Radix Sub menu. The Sub-portal pattern
 * interacts poorly with mobile touch events (design.md trade-off).
 *
 * Individual doctor practice ONLY — no clinic/multi-org concepts.
 */

export interface UserMenuDropdownProps {
  /** Doctor display name (e.g. "Marianella Suarez"). */
  doctorName: string;
  /** Doctor email; rendered as secondary text in the trigger and dropdown header. */
  email: string;
  /** URL to the avatar image, or `null` to fall back to initials. */
  avatarUrl: string | null;
  /**
   * When true (collapsed sidebar), the trigger renders only the avatar.
   * When false, it renders avatar + name + email + chevron.
   */
  collapsed?: boolean;
}

/**
 * Computes 2-letter initials from a display name. Falls back to the first
 * two characters of a single-word name. Used as the `<AvatarFallback>` text
 * when no `avatarUrl` is supplied.
 *
 * Examples:
 *   "Marianella Suarez" → "MS"
 *   "Doctor"            → "DO"
 *   ""                  → "?"
 */
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
  collapsed = false,
}: UserMenuDropdownProps): React.ReactElement {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const initials = computeInitials(doctorName);

  const navigateTo = useCallback(
    (path: string) => () => {
      router.push(path);
    },
    [router],
  );

  const handleLogout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/auth/login');
      router.refresh();
    } catch {
      // Spec FR-8 edge case: toast error and keep user logged in.
      toast.error('No se pudo cerrar sesión. Intentalo de nuevo.');
    }
  }, [router]);

  const handleThemeChange = useCallback(
    (value: string) => {
      // Coerce to the design-system `Theme` type — the radio values are
      // hard-coded to the same domain, so this cast is safe.
      if (value === 'light' || value === 'dark' || value === 'system') {
        setTheme(value);
      }
    },
    [setTheme],
  );

  // ---- Trigger ----
  // Two visual modes — collapsed (icon-only) and expanded (avatar + identity
  // + chevron). Both are buttons for keyboard accessibility.
  const triggerClassName = collapsed
    ? 'flex w-full items-center justify-center rounded-xl p-2 transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
    : 'flex w-full items-center gap-3 rounded-xl p-2 transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Abrir menu de usuario"
          className={triggerClassName}
          // `title` doubles as a tooltip when collapsed — keeps the trigger
          // discoverable when name + email are not visible.
          title={collapsed ? doctorName : undefined}
        >
          <Avatar className="h-10 w-10">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={doctorName} />}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <>
              <span className="flex min-w-0 flex-col text-left">
                <span className="truncate text-sm font-semibold">{doctorName}</span>
                <span className="truncate text-xs text-muted-foreground">{email}</span>
              </span>
              <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" side="top" className="w-64">
        <DropdownMenuLabel className="flex flex-col">
          <span className="text-sm font-semibold">{doctorName}</span>
          <span className="text-xs font-normal text-muted-foreground">{email}</span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem onSelect={navigateTo('/dashboard/configuracion/perfil')}>
          <User className="mr-2 h-4 w-4" aria-hidden="true" />
          Mi perfil
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={navigateTo('/dashboard/verificacion')}>
          <ShieldCheck className="mr-2 h-4 w-4" aria-hidden="true" />
          Verificación SACS
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Tema
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup value={theme} onValueChange={handleThemeChange}>
          <DropdownMenuRadioItem value="light">Claro</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">Oscuro</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">Auto</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem onSelect={navigateTo('/dashboard/configuracion')}>
          <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
          Configuración
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onSelect={() => {
            // `onSelect` doesn't await async handlers — fire and forget.
            void handleLogout();
          }}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
