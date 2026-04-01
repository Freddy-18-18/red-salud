"use client";

import {
  Users,
  Pill,
  Building2,
  FlaskConical,
  LayoutGrid,
} from "lucide-react";

import type { ProviderType } from "@/lib/services/directory-service";

type TabValue = ProviderType | "all";

interface ProviderTypeTabsProps {
  value: TabValue;
  onChange: (value: TabValue) => void;
  counts?: Partial<Record<TabValue, number>>;
}

const TABS: { value: TabValue; label: string; icon: typeof Users }[] = [
  { value: "all", label: "Todos", icon: LayoutGrid },
  { value: "doctor", label: "Doctores", icon: Users },
  { value: "pharmacy", label: "Farmacias", icon: Pill },
  { value: "clinic", label: "Clinicas", icon: Building2 },
  { value: "laboratory", label: "Laboratorios", icon: FlaskConical },
];

export function ProviderTypeTabs({
  value,
  onChange,
  counts,
}: ProviderTypeTabsProps) {
  return (
    <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
      {TABS.map((tab) => {
        const isActive = value === tab.value;
        const count = counts?.[tab.value];
        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
              isActive
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 border border-transparent"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
            {count != null && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  isActive
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
