"use client";

import { Button } from "@red-salud/ui";
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
    <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
      {views.map((view) => (
        <Button
          key={view.value}
          variant={currentView === view.value ? "default" : "ghost"}
          size="sm"
          onClick={() => onViewChange(view.value)}
          className={`gap-2 ${currentView === view.value
              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
        >
          {view.icon}
          <span className="hidden sm:inline">{view.label}</span>
        </Button>
      ))}
    </div>
  );
}
