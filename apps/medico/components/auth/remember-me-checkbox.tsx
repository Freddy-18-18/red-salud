"use client";

import { Checkbox } from "@red-salud/design-system";
import { Label } from "@red-salud/design-system";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@red-salud/design-system";

interface RememberMeCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  role?: string;
}

const SESSION_DURATIONS = {
  temporary: "hasta que cierres el navegador",
  paciente: "30 minutos de inactividad",
  medico: "1 hora de inactividad",
  default: "1 hora de inactividad",
};

export function RememberMeCheckbox({
  checked,
  onCheckedChange,
  role,
}: RememberMeCheckboxProps) {
  const duration = role
    ? SESSION_DURATIONS[role as keyof typeof SESSION_DURATIONS] ||
      SESSION_DURATIONS.default
    : SESSION_DURATIONS.temporary;

  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id="remember-me"
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
      <Label
        htmlFor="remember-me"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
      >
        Mantener sesión iniciada
      </Label>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-4 w-4 text-gray-400 cursor-help" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="text-xs">
              {checked ? (
                <>
                  <strong>Sesión persistente:</strong> Tu sesión permanecerá
                  activa hasta {duration}. Recomendado solo en dispositivos
                  personales.
                </>
              ) : (
                <>
                  <strong>Sesión temporal:</strong> Tu sesión se cerrará
                  automáticamente al cerrar el navegador. Más seguro para
                  dispositivos compartidos.
                </>
              )}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
