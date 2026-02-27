"use client";

import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { Button } from "./button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "./command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover";
import { cn } from "./lib/utils";

// Lista completa de zonas horarias agrupadas por región
const timezones = [
  // América
  { value: "America/New_York", label: "Nueva York", region: "América", offset: "GMT-5" },
  { value: "America/Chicago", label: "Chicago", region: "América", offset: "GMT-6" },
  { value: "America/Denver", label: "Denver", region: "América", offset: "GMT-7" },
  { value: "America/Los_Angeles", label: "Los Ángeles", region: "América", offset: "GMT-8" },
  { value: "America/Anchorage", label: "Anchorage", region: "América", offset: "GMT-9" },
  { value: "America/Caracas", label: "Caracas", region: "América", offset: "GMT-4" },
  { value: "America/Bogota", label: "Bogotá", region: "América", offset: "GMT-5" },
  { value: "America/Lima", label: "Lima", region: "América", offset: "GMT-5" },
  { value: "America/Santiago", label: "Santiago", region: "América", offset: "GMT-3" },
  { value: "America/Buenos_Aires", label: "Buenos Aires", region: "América", offset: "GMT-3" },
  { value: "America/Sao_Paulo", label: "São Paulo", region: "América", offset: "GMT-3" },
  { value: "America/Mexico_City", label: "Ciudad de México", region: "América", offset: "GMT-6" },
  { value: "America/Monterrey", label: "Monterrey", region: "América", offset: "GMT-6" },
  { value: "America/Guatemala", label: "Guatemala", region: "América", offset: "GMT-6" },
  { value: "America/Panama", label: "Panamá", region: "América", offset: "GMT-5" },
  { value: "America/Havana", label: "La Habana", region: "América", offset: "GMT-5" },
  { value: "America/Santo_Domingo", label: "Santo Domingo", region: "América", offset: "GMT-4" },
  { value: "America/Puerto_Rico", label: "Puerto Rico", region: "América", offset: "GMT-4" },
  { value: "America/Managua", label: "Managua", region: "América", offset: "GMT-6" },
  { value: "America/Costa_Rica", label: "San José", region: "América", offset: "GMT-6" },
  { value: "America/El_Salvador", label: "San Salvador", region: "América", offset: "GMT-6" },
  { value: "America/Tegucigalpa", label: "Tegucigalpa", region: "América", offset: "GMT-6" },
  { value: "America/Montevideo", label: "Montevideo", region: "América", offset: "GMT-3" },
  { value: "America/Asuncion", label: "Asunción", region: "América", offset: "GMT-4" },
  { value: "America/La_Paz", label: "La Paz", region: "América", offset: "GMT-4" },
  { value: "America/Guayaquil", label: "Guayaquil", region: "América", offset: "GMT-5" },

  // Europa
  { value: "Europe/London", label: "Londres", region: "Europa", offset: "GMT+0" },
  { value: "Europe/Paris", label: "París", region: "Europa", offset: "GMT+1" },
  { value: "Europe/Berlin", label: "Berlín", region: "Europa", offset: "GMT+1" },
  { value: "Europe/Madrid", label: "Madrid", region: "Europa", offset: "GMT+1" },
  { value: "Europe/Rome", label: "Roma", region: "Europa", offset: "GMT+1" },
  { value: "Europe/Amsterdam", label: "Ámsterdam", region: "Europa", offset: "GMT+1" },
  { value: "Europe/Brussels", label: "Bruselas", region: "Europa", offset: "GMT+1" },
  { value: "Europe/Vienna", label: "Viena", region: "Europa", offset: "GMT+1" },
  { value: "Europe/Zurich", label: "Zúrich", region: "Europa", offset: "GMT+1" },
  { value: "Europe/Stockholm", label: "Estocolmo", region: "Europa", offset: "GMT+1" },
  { value: "Europe/Oslo", label: "Oslo", region: "Europa", offset: "GMT+1" },
  { value: "Europe/Copenhagen", label: "Copenhague", region: "Europa", offset: "GMT+1" },
  { value: "Europe/Helsinki", label: "Helsinki", region: "Europa", offset: "GMT+2" },
  { value: "Europe/Athens", label: "Atenas", region: "Europa", offset: "GMT+2" },
  { value: "Europe/Istanbul", label: "Estambul", region: "Europa", offset: "GMT+3" },
  { value: "Europe/Moscow", label: "Moscú", region: "Europa", offset: "GMT+3" },
  { value: "Europe/Lisbon", label: "Lisboa", region: "Europa", offset: "GMT+0" },
  { value: "Europe/Dublin", label: "Dublín", region: "Europa", offset: "GMT+0" },
  { value: "Europe/Warsaw", label: "Varsovia", region: "Europa", offset: "GMT+1" },
  { value: "Europe/Prague", label: "Praga", region: "Europa", offset: "GMT+1" },
  { value: "Europe/Budapest", label: "Budapest", region: "Europa", offset: "GMT+1" },

  // Asia
  { value: "Asia/Dubai", label: "Dubái", region: "Asia", offset: "GMT+4" },
  { value: "Asia/Karachi", label: "Karachi", region: "Asia", offset: "GMT+5" },
  { value: "Asia/Kolkata", label: "Kolkata", region: "Asia", offset: "GMT+5:30" },
  { value: "Asia/Bangkok", label: "Bangkok", region: "Asia", offset: "GMT+7" },
  { value: "Asia/Singapore", label: "Singapur", region: "Asia", offset: "GMT+8" },
  { value: "Asia/Hong_Kong", label: "Hong Kong", region: "Asia", offset: "GMT+8" },
  { value: "Asia/Shanghai", label: "Shanghái", region: "Asia", offset: "GMT+8" },
  { value: "Asia/Tokyo", label: "Tokio", region: "Asia", offset: "GMT+9" },
  { value: "Asia/Seoul", label: "Seúl", region: "Asia", offset: "GMT+9" },
  { value: "Asia/Manila", label: "Manila", region: "Asia", offset: "GMT+8" },
  { value: "Asia/Jakarta", label: "Yakarta", region: "Asia", offset: "GMT+7" },
  { value: "Asia/Kuala_Lumpur", label: "Kuala Lumpur", region: "Asia", offset: "GMT+8" },
  { value: "Asia/Taipei", label: "Taipéi", region: "Asia", offset: "GMT+8" },
  { value: "Asia/Jerusalem", label: "Jerusalén", region: "Asia", offset: "GMT+2" },
  { value: "Asia/Riyadh", label: "Riad", region: "Asia", offset: "GMT+3" },
  { value: "Asia/Tehran", label: "Teherán", region: "Asia", offset: "GMT+3:30" },

  // África
  { value: "Africa/Cairo", label: "El Cairo", region: "África", offset: "GMT+2" },
  { value: "Africa/Johannesburg", label: "Johannesburgo", region: "África", offset: "GMT+2" },
  { value: "Africa/Lagos", label: "Lagos", region: "África", offset: "GMT+1" },
  { value: "Africa/Nairobi", label: "Nairobi", region: "África", offset: "GMT+3" },
  { value: "Africa/Casablanca", label: "Casablanca", region: "África", offset: "GMT+1" },
  { value: "Africa/Algiers", label: "Argel", region: "África", offset: "GMT+1" },
  { value: "Africa/Tunis", label: "Túnez", region: "África", offset: "GMT+1" },

  // Oceanía
  { value: "Australia/Sydney", label: "Sídney", region: "Oceanía", offset: "GMT+10" },
  { value: "Australia/Melbourne", label: "Melbourne", region: "Oceanía", offset: "GMT+10" },
  { value: "Australia/Brisbane", label: "Brisbane", region: "Oceanía", offset: "GMT+10" },
  { value: "Australia/Perth", label: "Perth", region: "Oceanía", offset: "GMT+8" },
  { value: "Pacific/Auckland", label: "Auckland", region: "Oceanía", offset: "GMT+12" },
  { value: "Pacific/Fiji", label: "Fiyi", region: "Oceanía", offset: "GMT+12" },
  { value: "Pacific/Honolulu", label: "Honolulu", region: "Oceanía", offset: "GMT-10" },
];

interface TimezoneSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
}

export function TimezoneSelect({
  value,
  onValueChange,
  placeholder = "Seleccionar zona horaria",
  searchPlaceholder = "Buscar zona horaria...",
  disabled = false,
}: TimezoneSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Agrupar zonas horarias por región
  const groupedTimezones = useMemo(() => {
    const groups: Record<string, typeof timezones> = {};

    timezones.forEach((tz) => {
      if (!groups[tz.region]) {
        groups[tz.region] = [];
      }
      groups[tz.region]!.push(tz);
    });

    return groups;
  }, []);

  // Filtrar zonas horarias por búsqueda
  const filteredTimezones = useMemo(() => {
    if (!search) return groupedTimezones;

    const filtered: Record<string, typeof timezones> = {};
    const searchLower = search.toLowerCase();

    Object.entries(groupedTimezones).forEach(([region, tzs]) => {
      const matchingTzs = tzs.filter(
        (tz) =>
          tz.label.toLowerCase().includes(searchLower) ||
          tz.value.toLowerCase().includes(searchLower) ||
          tz.offset.toLowerCase().includes(searchLower)
      );

      if (matchingTzs.length > 0) {
        filtered[region] = matchingTzs;
      }
    });

    return filtered;
  }, [search, groupedTimezones]);

  const selectedTimezone = timezones.find((tz) => tz.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedTimezone ? (
            <span className="flex items-center gap-2">
              <span>{selectedTimezone.label}</span>
              <span className="text-xs text-muted-foreground">
                {selectedTimezone.offset}
              </span>
            </span>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <CommandList className="max-h-[300px] overflow-y-auto">
            {Object.keys(filteredTimezones).length === 0 ? (
              <CommandEmpty>No se encontraron zonas horarias.</CommandEmpty>
            ) : (
              Object.entries(filteredTimezones).map(([region, tzs]) => (
                <CommandGroup key={region} heading={region}>
                  {tzs.map((tz) => (
                    <CommandItem
                      key={tz.value}
                      value={tz.value}
                      onSelect={(currentValue) => {
                        onValueChange(currentValue);
                        setOpen(false);
                        setSearch("");
                      }}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === tz.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-1 items-center justify-between">
                        <span>{tz.label}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {tz.offset}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
