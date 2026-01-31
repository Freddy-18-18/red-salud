"use client";

import { useState } from "react";
import { PanelLeftDashed, ChevronDown, Maximize2, Minimize2, MousePointer } from "lucide-react";
import { Button } from "@red-salud/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@red-salud/ui";
import { cn } from "@red-salud/core/utils";
import { useSidebarState, type SidebarMode } from "@/hooks/use-sidebar-state";

const modeConfig = {
  expanded: {
    label: "Expanded",
    icon: Maximize2,
    description: "Sidebar siempre expandido"
  },
  collapsed: {
    label: "Collapsed",
    icon: Minimize2,
    description: "Sidebar siempre colapsado"
  },
  hover: {
    label: "Expand on hover",
    icon: MousePointer,
    description: "Se expande al pasar el mouse"
  }
};

interface SidebarModeSelectorProps {
  isCollapsed?: boolean;
}

export function SidebarModeSelector({ isCollapsed }: SidebarModeSelectorProps) {
  const { mode, setMode } = useSidebarState();
  const [isOpen, setIsOpen] = useState(false);

  const currentConfig = modeConfig[mode];

  const handleModeChange = (newMode: SidebarMode) => {
    setIsOpen(false);
    setMode(newMode);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          data-size="tiny"
          type="button"
          className={cn(
            "relative justify-center cursor-pointer inline-flex items-center space-x-2 text-center font-regular",
            "ease-out duration-200 rounded-md outline-none transition-all outline-0",
            "focus-visible:outline-4 focus-visible:outline-offset-1",
            "border text-foreground hover:bg-surface-300 shadow-none",
            "focus-visible:outline-border-strong data-[state=open]:bg-surface-300 data-[state=open]:outline-border-strong",
            "border-transparent",
            "text-xs py-1 h-[26px] w-min px-1.5 mx-0.5 !px-2"
          )}
          title="Sidebar control"
        >
          <div className="[&_svg]:h-[14px] [&_svg]:w-[14px] text-foreground-lighter">
            <PanelLeftDashed />
          </div>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        side="right"
        className="w-56 ml-2"
        sideOffset={8}
      >
        <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
          Sidebar control
        </div>

        {Object.entries(modeConfig).map(([modeKey, config]) => {
          const Icon = config.icon;
          const isSelected = mode === modeKey;

          return (
            <DropdownMenuItem
              key={modeKey}
              onClick={() => handleModeChange(modeKey as SidebarMode)}
              className={cn(
                "flex items-center gap-3 px-2 py-2 cursor-pointer",
                isSelected && "bg-accent text-accent-foreground"
              )}
            >
              <div className="flex items-center gap-3 flex-1">
                <Icon className="h-4 w-4" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{config.label}</span>
                  <span className="text-xs text-muted-foreground">{config.description}</span>
                </div>
              </div>
              {isSelected && (
                <div className="w-2 h-2 rounded-full bg-primary" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
