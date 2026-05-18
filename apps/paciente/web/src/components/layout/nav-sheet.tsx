"use client";

import { Heart } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@red-salud/design-system";

import { PatientSidebarNav } from "./patient-sidebar-nav";

interface NavSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pathname: string;
}

export function NavSheet({ open, onOpenChange, pathname }: NavSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-[280px] p-0 sm:max-w-[280px] bg-[hsl(var(--card))] border-[hsl(var(--border))]"
      >
        <SheetHeader className="border-b border-[hsl(var(--border))]">
          <SheetTitle className="flex items-center gap-2 text-base">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[hsl(var(--primary))]">
              <Heart className="h-4 w-4 text-[hsl(var(--primary-foreground))] fill-[hsl(var(--primary-foreground))]" />
            </span>
            Red-Salud
          </SheetTitle>
        </SheetHeader>
        <PatientSidebarNav
          pathname={pathname}
          expanded
          onItemClick={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
