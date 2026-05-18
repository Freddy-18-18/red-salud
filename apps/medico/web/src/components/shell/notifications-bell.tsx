'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@red-salud/design-system';
import {
  Bell,
  Calendar,
  CalendarOff,
  CheckCheck,
  FileText,
  FlaskConical,
  MessageSquare,
  Pill,
  Settings as SettingsIcon,
  Trash2,
  X,
  type LucideIcon,
} from 'lucide-react';

import { useNotifications } from '@/lib/notifications/use-notifications';
import {
  NOTIFICATION_TYPE_LABELS,
  type DoctorNotification,
  type DoctorNotificationType,
} from '@/lib/notifications/types';

/**
 * @file notifications-bell.tsx
 * @description Real notifications surface in the header action cluster.
 *
 * Distinct from the SACS Advisor button — that one handles identity /
 * verification pendings, this one is the doctor's daily-flow inbox:
 * appointments, messages, lab results, follow-ups.
 *
 * Visual language matches UserMenu / SedeSwitcher (soft border, deeper
 * shadow, glassy backdrop, gradient header).
 */

const TYPE_ICONS: Record<DoctorNotificationType, LucideIcon> = {
  appointment_created: Calendar,
  appointment_cancelled: CalendarOff,
  appointment_reminder: Calendar,
  message_received: MessageSquare,
  lab_result_arrived: FlaskConical,
  prescription_requested: Pill,
  follow_up_due: FileText,
  system: SettingsIcon,
};

const TYPE_COLORS: Record<DoctorNotificationType, string> = {
  appointment_created: 'text-emerald-500',
  appointment_cancelled: 'text-amber-500',
  appointment_reminder: 'text-sky-500',
  message_received: 'text-blue-500',
  lab_result_arrived: 'text-violet-500',
  prescription_requested: 'text-purple-500',
  follow_up_due: 'text-orange-500',
  system: 'text-muted-foreground',
};

export function NotificationsBell(): React.ReactElement {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    loading,
    markRead,
    markAllReadAction,
    dismiss,
    dismissAll,
  } = useNotifications();
  const [open, setOpen] = useState(false);

  // Hydration guard for Radix Popover's auto-generated IDs — same pattern as
  // SedeSwitcher / SpecialtyChip.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Notificaciones"
        data-testid="notifications-bell"
        className="relative inline-flex h-8 w-8 items-center justify-center rounded-full border border-strong text-foreground-lighter"
      >
        <Bell className="h-4 w-4" aria-hidden="true" />
      </button>
    );
  }

  const hasUnread = unreadCount > 0;

  async function handleSelect(notification: DoctorNotification) {
    setOpen(false);
    if (!notification.isRead) {
      void markRead(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={
            hasUnread
              ? `Notificaciones (${unreadCount} sin leer)`
              : 'Notificaciones'
          }
          data-testid="notifications-bell"
          className="relative inline-flex h-8 w-8 items-center justify-center rounded-full border border-strong text-foreground-lighter transition-colors hover:border-foreground-lighter hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          <Bell className="h-4 w-4" aria-hidden="true" />
          {hasUnread && (
            <span
              aria-hidden="true"
              data-testid="notifications-bell-badge"
              className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground shadow-sm"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={10}
        className={[
          'w-[22rem] overflow-hidden rounded-xl p-0',
          'border border-border/30 shadow-[0_18px_60px_-20px_rgba(0,0,0,0.55)]',
          'bg-popover/95 backdrop-blur-xl',
        ].join(' ')}
      >
        {/* ── Header with title + actions ───────────────────────────── */}
        <div className="relative px-4 pb-3 pt-4">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-primary/[0.06] to-transparent"
          />
          <div className="relative flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Notificaciones
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {hasUnread
                  ? `${unreadCount} sin leer`
                  : 'Estás al día'}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {hasUnread && (
                <button
                  type="button"
                  onClick={() => void markAllReadAction()}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-foreground"
                  aria-label="Marcar todas como leídas"
                >
                  <CheckCheck className="h-3 w-3" aria-hidden="true" />
                  Marcar todas
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={() => void dismissAll()}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
                  aria-label="Limpiar todas"
                  title="Limpiar todas"
                >
                  <Trash2 className="h-3 w-3" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        </div>

        <SoftSeparator />

        {/* ── List / states ────────────────────────────────────────── */}
        <div className="max-h-[24rem] overflow-y-auto">
          {loading ? (
            <SkeletonList />
          ) : notifications.length === 0 ? (
            <EmptyState />
          ) : (
            <ul role="list" className="flex flex-col">
              {notifications.map((n) => (
                <li key={n.id}>
                  <NotificationRow
                    notification={n}
                    onSelect={() => void handleSelect(n)}
                    onDismiss={() => void dismiss(n.id)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function NotificationRow({
  notification,
  onSelect,
  onDismiss,
}: {
  notification: DoctorNotification;
  onSelect: () => void;
  onDismiss: () => void;
}) {
  const Icon = TYPE_ICONS[notification.type] ?? Bell;
  const color = TYPE_COLORS[notification.type] ?? 'text-muted-foreground';
  const typeLabel = NOTIFICATION_TYPE_LABELS[notification.type];
  return (
    <div className="group relative">
      <button
        type="button"
        onClick={onSelect}
        className={[
          'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors',
          'hover:bg-sidebar-accent focus-visible:bg-sidebar-accent focus-visible:outline-none',
          notification.isRead ? '' : 'bg-primary/[0.04]',
        ].join(' ')}
      >
        <span className="relative mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
          <Icon className={`h-3.5 w-3.5 ${color}`} aria-hidden="true" />
          {!notification.isRead && (
            <span
              aria-hidden="true"
              className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary ring-2 ring-popover"
            />
          )}
        </span>
        <div className="flex-1 min-w-0 pr-7">
          <p
            className={[
              'truncate text-sm',
              notification.isRead ? 'font-normal text-foreground/80' : 'font-medium text-foreground',
            ].join(' ')}
          >
            {notification.title}
          </p>
          {notification.body && (
            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
              {notification.body}
            </p>
          )}
          <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground/70">
            {typeLabel} · {formatRelative(notification.createdAt)}
          </p>
        </div>
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDismiss();
        }}
        aria-label="Descartar notificación"
        className="absolute right-3 top-3 inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100"
      >
        <X className="h-3 w-3" aria-hidden="true" />
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
        <Bell className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </div>
      <p className="text-sm font-medium text-foreground">Sin notificaciones</p>
      <p className="text-xs text-muted-foreground">
        Te avisamos acá cuando llegue algo nuevo.
      </p>
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-2 px-4 py-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex animate-pulse items-start gap-3">
          <div className="h-7 w-7 rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-2/3 rounded bg-muted" />
            <div className="h-2.5 w-1/2 rounded bg-muted/60" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SoftSeparator() {
  return <div role="separator" aria-hidden="true" className="mx-2 h-px bg-border/50" />;
}

/**
 * "hace 2 horas" / "hace 3 días". Coarse but matches typical bell UX —
 * doctor doesn't need an exact timestamp at a glance. Falls back to a
 * plain date once the notification is older than a week.
 */
function formatRelative(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return 'hace un instante';
  if (diffMin < 60) return `hace ${diffMin} min`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `hace ${diffHr} h`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `hace ${diffDay} día${diffDay === 1 ? '' : 's'}`;
  return date.toLocaleDateString('es-VE', {
    day: 'numeric',
    month: 'short',
  });
}
