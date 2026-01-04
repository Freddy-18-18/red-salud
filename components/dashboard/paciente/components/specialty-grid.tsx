"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

interface Specialty {
  id: string;
  name?: string;
  description?: string | null;
}

interface Props {
  specialties: Specialty[];
  selectedSpecialty: string;
  onSelected: (id: string) => void;
  onContinue: () => void;
}

export function SpecialtyGrid({ specialties, selectedSpecialty, onSelected, onContinue }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSpecialties, setFilteredSpecialties] = useState<Specialty[]>(specialties);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSpecialties(specialties);
      return;
    }
    const q = searchQuery.toLowerCase();
    setFilteredSpecialties(
      specialties.filter((s) => (s.name?.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q)))
    );
  }, [searchQuery, specialties]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Selecciona una Especialidad</CardTitle>
        <CardDescription>Elige el tipo de consulta que necesitas</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar especialidad (ej: Cardiología, Pediatría, Dermatología...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {filteredSpecialties.length} especialidad{filteredSpecialties.length !== 1 ? "es" : ""} disponible{filteredSpecialties.length !== 1 ? "s" : ""}
          </span>
          {searchQuery && (
            <Button variant="ghost" size="sm" onClick={() => setSearchQuery("")} className="h-auto p-0 text-primary hover:text-primary/80">
              Limpiar búsqueda
            </Button>
          )}
        </div>
        {filteredSpecialties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {filteredSpecialties.slice(0, 12).map((specialty) => (
              <button
                key={specialty.id}
                onClick={() => onSelected(specialty.id)}
                className={`p-4 border rounded-lg text-left transition-colors ${selectedSpecialty === specialty.id ? "border-primary bg-primary/5" : "hover:border-primary/50"}`}
              >
                <h3 className="font-semibold text-sm">{specialty.name}</h3>
                {specialty.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{specialty.description}</p>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No se encontraron especialidades que coincidan con "{searchQuery}"</p>
            <Button variant="outline" onClick={() => setSearchQuery("")} className="mt-4">Ver todas las especialidades</Button>
          </div>
        )}
        <Button onClick={onContinue} disabled={!selectedSpecialty} className="w-full">Continuar</Button>
      </CardContent>
    </Card>
  );
}

