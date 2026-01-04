"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Doctor {
  id: string;
  name: string;
  email: string;
}

interface DoctorSelectorProps {
  doctors: Doctor[];
  currentDoctorId: string | null;
  onDoctorChange: (doctorId: string) => void;
}

export function DoctorSelector({
  doctors,
  currentDoctorId,
  onDoctorChange,
}: DoctorSelectorProps) {
  const [open, setOpen] = useState(false);

  const currentDoctor = doctors.find((d) => d.id === currentDoctorId);

  if (doctors.length === 0) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
        <User className="h-4 w-4 text-yellow-600" />
        <span className="text-sm text-yellow-800">
          No tienes médicos asignados
        </span>
      </div>
    );
  }

  if (doctors.length === 1) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
        <User className="h-4 w-4 text-blue-600" />
        <div className="flex flex-col">
          <span className="text-sm font-medium text-blue-900">
            {currentDoctor?.name}
          </span>
          <span className="text-xs text-blue-600">{currentDoctor?.email}</span>
        </div>
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">
                {currentDoctor?.name || "Seleccionar médico"}
              </span>
              {currentDoctor && (
                <span className="text-xs text-muted-foreground">
                  {currentDoctor.email}
                </span>
              )}
            </div>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Buscar médico..." />
          <CommandEmpty>No se encontró el médico.</CommandEmpty>
          <CommandGroup>
            {doctors.map((doctor) => (
              <CommandItem
                key={doctor.id}
                value={doctor.id}
                onSelect={() => {
                  onDoctorChange(doctor.id);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    currentDoctorId === doctor.id ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex flex-col">
                  <span className="font-medium">{doctor.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {doctor.email}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
