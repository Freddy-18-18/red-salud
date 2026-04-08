"use client";

import {
  Bell,
  BellOff,
  CalendarCheck,
  CheckCheck,
  FlaskConical,
  Loader2,
  MessageCircle,
} from "lucide-react";
import { useState, useCallback } from "react";

import { NotificationCard } from "./notification-card";
import { groupNotificationsByDate } from "@/hooks/use-notifications";
import type { AppNotification } from "@/lib/services/notification-service";

// ─── Props ───────────────────────────────────────────────────────────────────

interface NotificationListProps {
  notifications: AppNotification[];
  loading: boolean;
  loadingMore?: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onMarkAsRead: (ids: string[]) => void;
  onDelete: (id: string) => void;
}

// ─── Empty states ────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <Bell className="h-8 w-8 text-gray-300" />
          </div>
        </div>
        <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
          <CalendarCheck className="h-4 w-4 text-blue-400" />
        </div>
        <div className="absolute -bottom-1 -left-2 w-7 h-7 rounded-full bg-green-50 flex items-center justify-center">
          <MessageCircle className="h-3.5 w-3.5 text-green-400" />
        </div>
        <div className="absolute top-1 -left-3 w-6 h-6 rounded-full bg-purple-50 flex items-center justify-center">
          <FlaskConical className="h-3 w-3 text-purple-400" />
        </div>
      </div>

      <h3 className="text-base font-semibold text-gray-800">
        No tenes notificaciones
      </h3>
      <p className="text-sm text-gray-500 mt-1.5 max-w-xs leading-relaxed">
        Las notificaciones de citas, mensajes, resultados y alertas apareceran aca.
      </p>
    </div>
  );
}

function FilterEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
        <BellOff className="h-7 w-7 text-gray-300" />
      </div>
      <p className="text-sm font-medium text-gray-600">Sin resultados</p>
      <p className="text-xs text-gray-400 mt-1">
        No hay notificaciones con este filtro
      </p>
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex gap-3 p-3.5"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
            <div className="h-3 w-1/2 bg-gray-50 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Bulk action bar ─────────────────────────────────────────────────────────

function BulkActionBar({
  selectedCount,
  onMarkAsRead,
  onClearSelection,
}: {
  selectedCount: number;
  onMarkAsRead: () => void;
  onClearSelection: () => void;
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl mb-3 animate-fade-in">
      <span className="text-xs font-medium text-emerald-700">
        {selectedCount} seleccionada{selectedCount > 1 ? "s" : ""}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onMarkAsRead}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors"
        >
          <CheckCheck className="h-3.5 w-3.5" />
          Marcar como leidas
        </button>
        <button
          type="button"
          onClick={onClearSelection}
          className="px-2.5 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export function NotificationList({
  notifications,
  loading,
  loadingMore = false,
  hasMore,
  onLoadMore,
  onMarkAsRead,
  onDelete,
}: NotificationListProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState(false);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      // Exit select mode if nothing selected
      if (next.size === 0) setSelectMode(false);
      return next;
    });
    if (!selectMode) setSelectMode(true);
  }, [selectMode]);

  const handleBulkMarkAsRead = useCallback(() => {
    if (selectedIds.size > 0) {
      onMarkAsRead(Array.from(selectedIds));
      setSelectedIds(new Set());
      setSelectMode(false);
    }
  }, [selectedIds, onMarkAsRead]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setSelectMode(false);
  }, []);

  // Initial loading
  if (loading && notifications.length === 0) {
    return <SkeletonList />;
  }

  // Truly empty
  if (!loading && notifications.length === 0) {
    return <EmptyState />;
  }

  const groups = groupNotificationsByDate(notifications);

  // Filter returned empty
  if (groups.length === 0 && !loading) {
    return <FilterEmptyState />;
  }

  return (
    <div className="space-y-6">
      {/* Bulk action bar */}
      <BulkActionBar
        selectedCount={selectedIds.size}
        onMarkAsRead={handleBulkMarkAsRead}
        onClearSelection={clearSelection}
      />

      {groups.map((group) => (
        <div key={group.label}>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
            {group.label}
          </h3>
          <div className="space-y-1">
            {group.items.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkAsRead={(id) => onMarkAsRead([id])}
                onDelete={onDelete}
                showSelect={selectMode}
                selected={selectedIds.has(notification.id)}
                onToggleSelect={toggleSelect}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center pt-2 pb-4">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors disabled:opacity-50"
          >
            {loadingMore ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando...
              </>
            ) : (
              "Cargar mas"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
