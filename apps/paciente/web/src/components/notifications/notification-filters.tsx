"use client";

import {
  LayoutGrid,
  CalendarCheck,
  FlaskConical,
  Pill,
  MessageCircle,
  HeartPulse,
  Tag,
  BellOff,
} from "lucide-react";

// ─── Filter tabs ─────────────────────────────────────────────────────────────

interface FilterTab {
  label: string;
  value: string | undefined;
  icon: typeof LayoutGrid;
}

const FILTERS: FilterTab[] = [
  { label: "Todas", value: undefined, icon: LayoutGrid },
  { label: "Citas", value: "appointment", icon: CalendarCheck },
  { label: "Lab", value: "lab_result", icon: FlaskConical },
  { label: "Recetas", value: "medication", icon: Pill },
  { label: "Mensajes", value: "message", icon: MessageCircle },
  { label: "Alertas", value: "chronic_alert", icon: HeartPulse },
  { label: "Precios", value: "price_alert", icon: Tag },
];

// ─── Props ───────────────────────────────────────────────────────────────────

interface NotificationFiltersProps {
  activeFilter: string | undefined;
  onFilterChange: (filter: string | undefined) => void;
  unreadOnly: boolean;
  onUnreadOnlyChange: (unreadOnly: boolean) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function NotificationFilters({
  activeFilter,
  onFilterChange,
  unreadOnly,
  onUnreadOnlyChange,
}: NotificationFiltersProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
      {/* Unread-only toggle */}
      <button
        type="button"
        onClick={() => onUnreadOnlyChange(!unreadOnly)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
          unreadOnly
            ? "bg-emerald-600 text-white border-emerald-600"
            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
        }`}
      >
        <BellOff className="h-3.5 w-3.5" />
        No leidas
      </button>

      {/* Divider */}
      <div className="w-px h-5 bg-gray-200 flex-shrink-0" />

      {/* Type filters */}
      {FILTERS.map((f) => {
        const active = activeFilter === f.value;
        const Icon = f.icon;
        return (
          <button
            key={f.label}
            type="button"
            onClick={() => onFilterChange(f.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              active
                ? "bg-emerald-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
