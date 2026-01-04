"use client";

import { Button } from "@/components/ui/button";
import { Calendar, List, Grid3x3 } from "lucide-react";

export type CalendarView = "day" | "week" | "month" | "list";

interface CalendarViewSelectorProps {
  currentView: CalendarView;
  onViewChange: (view: CalendarView) => void;
}

export function CalendarViewSelector({ currentView, onViewChange }: CalendarViewSelectorProps) {
  const views: { value: CalendarView; label: string; icon: React.ReactNode }[] = [
    { value: "day", label: "Día", icon: <Calendar className="h-4 w-4" /> },
    { value: "week", label: "Semana", icon: <Grid3x3 className="h-4 w-4" /> },
    { value: "month", label: "Mes", icon: <Calendar className="h-4 w-4" /> },
    { value: "list", label: "Lista", icon: <List className="h-4 w-4" /> },
  ];

  return (
    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
      {views.map((view) => (
        <Button
          key={view.value}
          variant={currentView === view.value ? "default" : "ghost"}
          size="sm"
          onClick={() => onViewChange(view.value)}
          className={`gap-2 ${
            currentView === view.value
              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
              : "text-gray-700 hover:bg-gray-200"
          }`}
        >
          {view.icon}
          <span className="hidden sm:inline">{view.label}</span>
        </Button>
      ))}
    </div>
  );
}
