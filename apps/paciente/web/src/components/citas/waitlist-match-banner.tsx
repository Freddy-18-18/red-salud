"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  ChevronRight,
  Loader2,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";

import { fetchJson, postJson } from "@/lib/utils/fetch";

// -------------------------------------------------------------------
// Waitlist match banner
// -------------------------------------------------------------------
// Surfaces unread `waitlist_slot_available` notifications at the top of the
// /dashboard/citas page. The S4.2 trigger writes these rows when another
// patient cancels a slot earlier than the current user's cita with the same
// doctor — high-value moment that deserves a dedicated banner instead of
// being buried in the general notifications inbox.
//
// We poll every 60s while the page is open so the banner appears within a
// minute of the trigger firing. The Realtime channel is the future
// optimization but a short poll is honest about the current setup and works
// without extra subscriptions.
// -------------------------------------------------------------------

interface NotificationRow {
  id: string;
  type: string;
  title: string;
  // GET /api/notifications maps the DB `message` column to `body` on the
  // wire — accept either to be defensive against future cleanup.
  body?: string | null;
  message?: string | null;
  action_url: string | null;
  is_read: boolean;
  created_at: string;
}

const REFETCH_INTERVAL_MS = 60_000;

const QUERY_KEY = ["notifications", "waitlist-unread"] as const;

export function WaitlistMatchBanner() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      // The route accepts `unread_only=true` and `type=...`, NOT `is_read`
      // and `limit` — match those param names.
      const data = await fetchJson<NotificationRow[]>(
        "/api/notifications?type=waitlist_slot_available&unread_only=true&page_size=5",
      );
      return data;
    },
    refetchInterval: REFETCH_INTERVAL_MS,
    refetchOnWindowFocus: true,
  });

  const dismissMutation = useMutation({
    mutationFn: (id: string) =>
      postJson<NotificationRow>(
        `/api/notifications/${id}`,
        { is_read: true },
        "PATCH",
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  const notifications = query.data ?? [];
  if (notifications.length === 0) return null;

  return (
    <div className="space-y-2">
      {notifications.map((n) => (
        <BannerRow
          key={n.id}
          notification={n}
          dismissing={
            dismissMutation.isPending &&
            dismissMutation.variables === n.id
          }
          onDismiss={() => dismissMutation.mutate(n.id)}
        />
      ))}
    </div>
  );
}

interface BannerRowProps {
  notification: NotificationRow;
  dismissing: boolean;
  onDismiss: () => void;
}

function BannerRow({ notification, dismissing, onDismiss }: BannerRowProps) {
  const hasAction = !!notification.action_url;

  const inner = (
    <div className="flex items-start gap-3 p-4 bg-cyan-50 border border-cyan-200 rounded-2xl">
      <div className="w-9 h-9 rounded-xl bg-cyan-100 flex items-center justify-center flex-shrink-0">
        <Sparkles className="h-4 w-4 text-cyan-700" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-cyan-900 flex items-center gap-1.5">
          <Bell className="h-3.5 w-3.5" />
          {notification.title}
        </p>
        {(notification.body ?? notification.message) && (
          <p className="text-xs text-cyan-800 mt-0.5">
            {notification.body ?? notification.message}
          </p>
        )}
      </div>
      <div className="flex items-center gap-1">
        {hasAction && (
          <span className="text-xs font-medium text-cyan-700 hidden sm:inline-flex items-center gap-0.5">
            Ver
            <ChevronRight className="h-3 w-3" />
          </span>
        )}
        <button
          type="button"
          onClick={(e) => {
            // The wrapping <Link> would otherwise navigate when the user
            // clicks the dismiss icon. Stop the click here.
            e.preventDefault();
            e.stopPropagation();
            onDismiss();
          }}
          disabled={dismissing}
          className="p-1.5 rounded-lg hover:bg-cyan-100 transition disabled:opacity-50"
          aria-label="Descartar notificación"
        >
          {dismissing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-700" />
          ) : (
            <X className="h-3.5 w-3.5 text-cyan-700" />
          )}
        </button>
      </div>
    </div>
  );

  if (hasAction && notification.action_url) {
    return (
      <Link href={notification.action_url} className="block">
        {inner}
      </Link>
    );
  }
  return inner;
}
