"use client";

import {
  Pill,
  CalendarCheck,
  FlaskConical,
  MessageCircle,
  Trophy,
  Shield,
  Users,
  LayoutGrid,
} from "lucide-react";
import type { NotificationType } from "@/lib/services/notification-service";

interface NotificationFiltersProps {
  activeFilter: NotificationType | undefined;
  onFilterChange: (filter: NotificationType | undefined) => void;
}

const FILTERS: { label: string; value: NotificationType | undefined; icon: typeof Pill }[] = [
  { label: "Todas", value: undefined, icon: LayoutGrid },
  { label: "Medicamentos", value: "medication", icon: Pill },
  { label: "Citas", value: "appointment", icon: CalendarCheck },
  { label: "Resultados", value: "lab_result", icon: FlaskConical },
  { label: "Mensajes", value: "message", icon: MessageCircle },
  { label: "Puntos", value: "reward", icon: Trophy },
  { label: "Seguro", value: "insurance", icon: Shield },
  { label: "Comunidad", value: "community", icon: Users },
];

export function NotificationFilters({ activeFilter, onFilterChange }: NotificationFiltersProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
      {FILTERS.map((f) => {
        const active = activeFilter === f.value;
        const Icon = f.icon;
        return (
          <button
            key={f.label}
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
