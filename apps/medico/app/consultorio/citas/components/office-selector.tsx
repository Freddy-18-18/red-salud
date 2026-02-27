"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@red-salud/design-system";
import { MapPin } from "lucide-react";

interface Office {
  id: string;
  nombre: string;
  direccion?: string;
  ciudad?: string;
  estado?: string;
  es_principal: boolean;
}

interface OfficeSelectorProps {
  selectedOfficeId: string | null;
  onOfficeChange: (officeId: string) => void;
}

export function OfficeSelector({ selectedOfficeId, onOfficeChange }: OfficeSelectorProps) {
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOffices();
  }, []);

  async function loadOffices() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("doctor_offices")
        .select("id, nombre, direccion, ciudad, estado, es_principal")
        .eq("doctor_id", user.id)
        .eq("activo", true)
        .order("es_principal", { ascending: false });

      if (error) throw error;
      
      if (data) {
        setOffices(data);
        
        // Si no hay oficina seleccionada, seleccionar la principal o la primera
        if (!selectedOfficeId && data.length > 0) {
          const principal = data.find(o => o.es_principal) || data[0];
          if (principal) {
            onOfficeChange(principal.id);
          }
        }
      }
    } catch (error) {
      console.error("Error loading offices:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading || offices.length === 0) {
    return null;
  }

  // Si solo hay un consultorio, mostrarlo sin selector
  if (offices.length === 1 && offices[0]) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4" />
        <span>{offices[0].nombre}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <MapPin className="h-4 w-4 text-muted-foreground" />
      <Select value={selectedOfficeId || undefined} onValueChange={onOfficeChange}>
        <SelectTrigger className="w-[240px]">
          <SelectValue placeholder="Selecciona consultorio" />
        </SelectTrigger>
        <SelectContent>
          {offices.map((office) => (
            <SelectItem key={office.id} value={office.id}>
              <div className="flex flex-col">
                <span>{office.nombre}</span>
                {office.ciudad && (
                  <span className="text-xs text-muted-foreground">
                    {office.ciudad}
                    {office.estado && `, ${office.estado}`}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
