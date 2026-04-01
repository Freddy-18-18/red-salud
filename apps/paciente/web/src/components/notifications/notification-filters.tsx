"use client";

import {
  Pill,
  CalendarCheck,
  FlaskConical,
  MessageCircle,
  LayoutGrid,
  BellOff,
} from "lucide-react";

import type { NotificationType } from "@/lib/services/notification-service";

interface NotificationFiltersProps {
  activeFilter: NotificationType | undefined;
  onFilterChange: (filter: NotificationType | undefined) => void;
  unreadOnly: boolean;
  onUnreadOnlyChange: (unreadOnly: boolean) => void;
}

const FILTERS: { label: string; value: NotificationType | undefined; icon: typeof Pill }[] = [
  { label: "Todas", value: undefined, icon: LayoutGrid },
  { label: "Citas", value: "appointment", icon: CalendarCheck },
  { label: "Mensajes", value: "message", icon: MessageCircle },
  { label: "Laboratorio", value: "lab_result", icon: FlaskConical },
  { label: "Medicamentos", value: "medication", icon: Pill },
];

export function NotificationFilters({
  activeFilter,
  onFilterChange,
  unreadOnly,
  onUnreadOnlyChange,
}: NotificationFiltersProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
      {/* Unread toggle */}
      <button
        onClick={() => onUnreadOnlyChange(!unreadOnly)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
          unreadOnly
            ? "bg-emerald-600 text-white border-emerald-600 dark:bg-emerald-500 dark:border-emerald-500"
            : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
        }`}
      >
        <BellOff className="h-3.5 w-3.5" />
        No leidas
      </button>

      {/* Divider */}
      <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 flex-shrink-0" />

      {/* Type filters */}
      {FILTERS.map((f) => {
        const active = activeFilter === f.value;
        const Icon = f.icon;
        return (
          <button
            key={f.label}
            onClick={() => onFilterChange(f.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              active
                ? "bg-emerald-600 text-white dark:bg-emerald-500"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {f.label}
          </button>
        );
      })}
    </div>
  );
}
