"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Search, Check, Users, X, Loader2, UserPlus, CreditCard } from "lucide-react";
import {
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  Separator,
  Badge,
  Avatar,
  AvatarFallback,
} from "@red-salud/design-system";
import { cn } from "@red-salud/core/utils";
import { supabase } from "@/lib/supabase/client";
import { validateCedulaWithCNE } from "@/lib/services/cedula-validation";
import { toast } from "sonner";

interface Patient {
  id: string;
  email: string;
  cedula?: string | null;
  nombre_completo?: string;
  user_metadata?: {
    nombre_completo?: string;
    avatar_url?: string;
  };
}

interface PatientSelectorProps {
  selectedPatientId: string | null;
  onSelectPatient: (patientId: string, patientName: string) => void;
  limit?: number;
  className?: string;
}

export function PatientSelector({
  selectedPatientId,
  onSelectPatient,
  limit = 50,
  className,
}: PatientSelectorProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [cedulaSearch, setCedulaSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchingCNE, setIsSearchingCNE] = useState(false);
  const [cneNotFound, setCneNotFound] = useState(false);

  // Cargar lista de pacientes
  useEffect(() => {
    const loadPatients = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, cedula, nombre_completo, user_metadata")
        .order("nombre_completo", { ascending: true })
        .limit(limit);

      if (!error && data) {
        setPatients(data as Patient[]);
      }
      setIsLoading(false);
    };

    loadPatients();
  }, [limit]);

  // Buscar en CNE por cédula
  const searchByCedula = useCallback(async (cedula: string) => {
    if (cedula.length < 6) return;

    setIsSearchingCNE(true);
    setCneNotFound(false);

    try {
      // 1. Buscar localmente primero
      const localPatient = patients.find(p => {
        if (!p.cedula) return false;
        const pCedula = p.cedula.toString().replace(/\D/g, "");
        return pCedula === cedula;
      });

      if (localPatient) {
        const name = localPatient.nombre_completo || localPatient.user_metadata?.nombre_completo || localPatient.email;
        onSelectPatient(localPatient.id, name);
        setIsOpen(false);
        setCedulaSearch("");
        setIsSearchingCNE(false);
        return;
      }

      // 2. Buscar en CNE si no está local
      const result = await validateCedulaWithCNE(cedula);

      if (result.found && result.nombre_completo) {
        toast.info("Paciente encontrado en CNE, pero no está registrado en el sistema");
        setCneNotFound(false);
      } else {
        setCneNotFound(true);
      }
    } catch (error) {
      console.error("Error buscando paciente:", error);
    } finally {
      setIsSearchingCNE(false);
    }
  }, [patients, onSelectPatient]);

  // Filtrar pacientes por nombre, email o cédula
  const filteredPatients = useMemo(() => {
    if (!searchQuery) return patients;
    const query = searchQuery.toLowerCase();
    return patients.filter((p) => {
      const name = p.nombre_completo || p.user_metadata?.nombre_completo || p.email;
      const cedula = p.cedula || "";
      return (
        name.toLowerCase().includes(query) ||
        p.email.toLowerCase().includes(query) ||
        cedula.toString().includes(query)
      );
    });
  }, [patients, searchQuery]);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  const handleCedulaKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && cedulaSearch.length >= 6) {
      e.preventDefault();
      searchByCedula(cedulaSearch);
    }
  };

  return (
    <div className={cn("max-w-md", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className={cn(
              "w-full justify-between h-auto min-h-[44px] py-2",
              !selectedPatient && "text-muted-foreground"
            )}
          >
            {selectedPatient ? (
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-xs font-bold">
                    {(selectedPatient.nombre_completo || selectedPatient.user_metadata?.nombre_completo || selectedPatient.email)
                      .charAt(0)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium truncate">
                    {selectedPatient.nombre_completo || selectedPatient.user_metadata?.nombre_completo || selectedPatient.email}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {selectedPatient.cedula && `CI: ${selectedPatient.cedula}`}
                    {selectedPatient.email && !selectedPatient.cedula && selectedPatient.email}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Seleccionar Paciente</span>
              </div>
            )}
            <Badge variant="secondary" className="ml-2 shrink-0">
              {patients.length}
            </Badge>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Buscar por nombre, email o cédula..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            
            {/* Búsqueda por cédula CNE */}
            <div className="border-b p-3 space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <CreditCard className="w-3 h-3" />
                <span>Búsqueda por cédula (CNE)</span>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    placeholder="Ej: 12345678"
                    value={cedulaSearch}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setCedulaSearch(val);
                      setCneNotFound(false);
                    }}
                    onKeyDown={handleCedulaKeyDown}
                    maxLength={9}
                    className="h-9 pr-8"
                  />
                  {isSearchingCNE && (
                    <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-primary" />
                  )}
                  {!isSearchingCNE && cedulaSearch.length > 0 && (
                    <button
                      onClick={() => {
                        setCedulaSearch("");
                        setCneNotFound(false);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 hover:text-foreground text-muted-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={() => searchByCedula(cedulaSearch)}
                  disabled={isSearchingCNE || cedulaSearch.length < 6}
                  className="h-9 px-3"
                >
                  {isSearchingCNE ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {cneNotFound && (
                <p className="text-xs text-red-600 dark:text-red-400 animate-in fade-in slide-in-from-top-1">
                  No se encontró paciente con CI: V-{cedulaSearch}
                </p>
              )}
            </div>

            <CommandEmpty>
              {isLoading ? (
                <div className="py-6 text-center text-sm">
                  <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                  Cargando pacientes...
                </div>
              ) : (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  No se encontraron pacientes
                </div>
              )}
            </CommandEmpty>
            
            <CommandGroup className="max-h-[300px] overflow-auto">
              {filteredPatients.map((patient) => {
                const isSelected = patient.id === selectedPatientId;
                const name = patient.nombre_completo || patient.user_metadata?.nombre_completo || patient.email;

                return (
                  <CommandItem
                    key={patient.id}
                    value={patient.id}
                    onSelect={() => {
                      onSelectPatient(patient.id, name);
                      setIsOpen(false);
                      setSearchQuery("");
                    }}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-xs font-bold">
                        {name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {patient.cedula && `CI: ${patient.cedula}`}
                        {patient.email && ` • ${patient.email}`}
                      </div>
                    </div>
                    <Check
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
