"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Button,
  Textarea,
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@red-salud/design-system";
import { Loader2, Save, Plus, X, AlertTriangle } from "lucide-react";
import { useState } from "react";

import type { PatientDetails } from "@/hooks/paciente/useSettings";

interface TabMedicalInfoProps {
  details: PatientDetails;
  setDetails: (details: PatientDetails) => void;
  saving: boolean;
  onSave: () => void;
}

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function TagInput({
  tags,
  onChange,
  placeholder,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder: string;
}) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const value = input.trim();
    if (value && !tags.includes(value)) {
      onChange([...tags, value]);
    }
    setInput("");
  };

  const removeTag = (idx: number) => {
    onChange(tags.filter((_, i) => i !== idx));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag, idx) => (
          <Badge key={idx} variant="secondary" className="gap-1 pr-1">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(idx)}
              className="ml-0.5 rounded-full hover:bg-[hsl(var(--muted))] p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button type="button" variant="outline" size="sm" onClick={addTag} className="shrink-0">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function TabMedicalInfo({
  details,
  setDetails,
  saving,
  onSave,
}: TabMedicalInfoProps) {
  const medicamentos = details.medicamentos_actuales ?? [];
  const cirugias = details.cirugias_previas ?? [];

  const addMedicamento = () => {
    setDetails({
      ...details,
      medicamentos_actuales: [
        ...medicamentos,
        { nombre: "", dosis: "", frecuencia: "" },
      ],
    });
  };

  const updateMedicamento = (
    idx: number,
    field: "nombre" | "dosis" | "frecuencia",
    value: string
  ) => {
    const updated = [...medicamentos];
    updated[idx] = { ...updated[idx], [field]: value };
    setDetails({ ...details, medicamentos_actuales: updated });
  };

  const removeMedicamento = (idx: number) => {
    setDetails({
      ...details,
      medicamentos_actuales: medicamentos.filter((_, i) => i !== idx),
    });
  };

  const addCirugia = () => {
    setDetails({
      ...details,
      cirugias_previas: [...cirugias, { nombre: "", fecha_aproximada: "" }],
    });
  };

  const updateCirugia = (
    idx: number,
    field: "nombre" | "fecha_aproximada",
    value: string
  ) => {
    const updated = [...cirugias];
    updated[idx] = { ...updated[idx], [field]: value };
    setDetails({ ...details, cirugias_previas: updated });
  };

  const removeCirugia = (idx: number) => {
    setDetails({
      ...details,
      cirugias_previas: cirugias.filter((_, i) => i !== idx),
    });
  };

  return (
    <div className="space-y-6">
      {/* Basic medical */}
      <Card>
        <CardHeader>
          <CardTitle>Datos medicos basicos</CardTitle>
          <CardDescription>
            Esta informacion es opcional pero recomendada para emergencias
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Blood type */}
          <div className="space-y-2">
            <Label>Tipo de sangre</Label>
            <Select
              value={details.grupo_sanguineo || ""}
              onValueChange={(value) =>
                setDetails({ ...details, grupo_sanguineo: value })
              }
            >
              <SelectTrigger className="w-full max-w-xs">
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                {BLOOD_TYPES.map((bt) => (
                  <SelectItem key={bt} value={bt}>
                    {bt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Alergias */}
          <div className="space-y-2">
            <Label>Alergias</Label>
            <TagInput
              tags={details.alergias ?? []}
              onChange={(alergias) => setDetails({ ...details, alergias })}
              placeholder="Ej: Penicilina, Mariscos..."
            />
          </div>

          {/* Condiciones cronicas */}
          <div className="space-y-2">
            <Label>Condiciones cronicas</Label>
            <TagInput
              tags={details.condiciones_cronicas ?? []}
              onChange={(condiciones_cronicas) =>
                setDetails({ ...details, condiciones_cronicas })
              }
              placeholder="Ej: Diabetes, Hipertension..."
            />
          </div>

          {/* Discapacidad */}
          <div className="space-y-2">
            <Label htmlFor="discapacidad">Discapacidad</Label>
            <Input
              id="discapacidad"
              value={details.discapacidad || ""}
              onChange={(e) =>
                setDetails({ ...details, discapacidad: e.target.value })
              }
              placeholder="Opcional"
            />
          </div>
        </CardContent>
      </Card>

      {/* Medicamentos actuales */}
      <Card>
        <CardHeader>
          <CardTitle>Medicamentos actuales</CardTitle>
          <CardDescription>Lista de medicamentos que tomas actualmente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {medicamentos.length === 0 && (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">No hay medicamentos registrados</p>
          )}
          {medicamentos.map((med, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end p-3 bg-[hsl(var(--muted))] rounded-lg"
            >
              <div className="space-y-1">
                <Label className="text-xs">Nombre</Label>
                <Input
                  value={med.nombre}
                  onChange={(e) => updateMedicamento(idx, "nombre", e.target.value)}
                  placeholder="Metformina"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Dosis</Label>
                <Input
                  value={med.dosis}
                  onChange={(e) => updateMedicamento(idx, "dosis", e.target.value)}
                  placeholder="500mg"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Frecuencia</Label>
                <Input
                  value={med.frecuencia}
                  onChange={(e) => updateMedicamento(idx, "frecuencia", e.target.value)}
                  placeholder="2 veces al dia"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeMedicamento(idx)}
                className="text-red-600 dark:text-red-400 hover:bg-[hsl(var(--muted))]"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addMedicamento} className="gap-1">
            <Plus className="h-4 w-4" />
            Agregar medicamento
          </Button>
        </CardContent>
      </Card>

      {/* Cirugias previas */}
      <Card>
        <CardHeader>
          <CardTitle>Cirugias previas</CardTitle>
          <CardDescription>Historial de procedimientos quirurgicos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {cirugias.length === 0 && (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">No hay cirugias registradas</p>
          )}
          {cirugias.map((cir, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 items-end p-3 bg-[hsl(var(--muted))] rounded-lg"
            >
              <div className="space-y-1">
                <Label className="text-xs">Nombre</Label>
                <Input
                  value={cir.nombre}
                  onChange={(e) => updateCirugia(idx, "nombre", e.target.value)}
                  placeholder="Apendicectomia"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Fecha aproximada</Label>
                <Input
                  value={cir.fecha_aproximada}
                  onChange={(e) => updateCirugia(idx, "fecha_aproximada", e.target.value)}
                  placeholder="2020 o Marzo 2020"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeCirugia(idx)}
                className="text-red-600 dark:text-red-400 hover:bg-[hsl(var(--muted))]"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addCirugia} className="gap-1">
            <Plus className="h-4 w-4" />
            Agregar cirugia
          </Button>
        </CardContent>
      </Card>

      {/* Contacto de emergencia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Contacto de emergencia
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardTitle>
          <CardDescription>
            Al menos un contacto de emergencia es altamente recomendado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergencia-nombre">Nombre</Label>
              <Input
                id="emergencia-nombre"
                value={details.contacto_emergencia_nombre || ""}
                onChange={(e) =>
                  setDetails({
                    ...details,
                    contacto_emergencia_nombre: e.target.value,
                  })
                }
                placeholder="Nombre del contacto"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencia-relacion">Relacion</Label>
              <Input
                id="emergencia-relacion"
                value={details.contacto_emergencia_relacion || ""}
                onChange={(e) =>
                  setDetails({
                    ...details,
                    contacto_emergencia_relacion: e.target.value,
                  })
                }
                placeholder="Madre, Esposo/a..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencia-telefono">Telefono</Label>
              <Input
                id="emergencia-telefono"
                value={details.contacto_emergencia_telefono || ""}
                onChange={(e) =>
                  setDetails({
                    ...details,
                    contacto_emergencia_telefono: e.target.value,
                  })
                }
                placeholder="+58 412 1234567"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notas medicas */}
      <Card>
        <CardHeader>
          <CardTitle>Notas medicas adicionales</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={details.notas_medicas || ""}
            onChange={(e) =>
              setDetails({ ...details, notas_medicas: e.target.value })
            }
            placeholder="Cualquier informacion medica adicional que consideres importante..."
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <Button onClick={onSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Guardar cambios
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
