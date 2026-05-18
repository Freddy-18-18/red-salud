'use client';

import { useMemo } from 'react';
import { ShieldAlert, UserCheck } from 'lucide-react';
import {
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@red-salud/design-system';

const RELATIONSHIPS = [
  'Madre',
  'Padre',
  'Tutor legal',
  'Abuelo/a',
  'Tío/a',
  'Hermano/a mayor',
  'Otro familiar',
] as const;

const INPUT_BASE =
  'flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30';

export interface CompanionData {
  name: string;
  relationship: string;
  phone: string;
}

interface CompanionFieldProps {
  /** Fecha de nacimiento del paciente seleccionado (YYYY-MM-DD) o null. */
  patientBirthDate: string | null;
  value: CompanionData;
  onChange: (next: CompanionData) => void;
}

function calcAge(isoBirth: string | null): number | null {
  if (!isoBirth) return null;
  try {
    const birth = new Date(`${isoBirth}T00:00:00`);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    return age;
  } catch {
    return null;
  }
}

/**
 * Bloque de acompañante / responsable legal. SOLO se renderiza cuando el
 * paciente es menor de 18 años (o cuando no sabemos la edad y el doctor
 * quiere registrarlo opcionalmente — vía toggle).
 *
 * Si el paciente es menor de 18, el bloque es REQUERIDO (validación visual).
 */
export function CompanionField({
  patientBirthDate,
  value,
  onChange,
}: CompanionFieldProps) {
  const age = useMemo(() => calcAge(patientBirthDate), [patientBirthDate]);
  const isMinor = age !== null && age < 18;

  // Si no es menor, no renderizamos nada (campo invisible para no agregar ruido).
  if (!isMinor) return null;

  return (
    <div className="space-y-2 rounded-lg border border-warning/30 bg-warning/5 p-3">
      <div className="flex items-start gap-2">
        <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0 text-warning" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-foreground">
            Paciente menor de edad ({age} años)
          </p>
          <p className="text-[11px] text-muted-foreground">
            Es obligatorio registrar al acompañante / responsable legal.
          </p>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="comp-name" className="text-xs">
            Nombre del responsable <span className="text-destructive">*</span>
          </Label>
          <input
            id="comp-name"
            type="text"
            value={value.name}
            onChange={(e) => onChange({ ...value, name: e.target.value })}
            placeholder="Ej: María González"
            className={INPUT_BASE}
            required={isMinor}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="comp-rel" className="text-xs">
            Parentesco <span className="text-destructive">*</span>
          </Label>
          <Select
            value={value.relationship || undefined}
            onValueChange={(v) => onChange({ ...value, relationship: v })}
          >
            <SelectTrigger id="comp-rel" className="w-full">
              <SelectValue placeholder="Elegí" />
            </SelectTrigger>
            <SelectContent>
              {RELATIONSHIPS.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="comp-phone" className="text-xs">
          Teléfono del responsable
        </Label>
        <input
          id="comp-phone"
          type="tel"
          value={value.phone}
          onChange={(e) => onChange({ ...value, phone: e.target.value })}
          placeholder="+58 412 1234567"
          className={INPUT_BASE}
        />
      </div>

      {value.name && value.relationship && (
        <div className="flex items-center gap-1.5 text-[11px] text-success">
          <UserCheck className="h-3.5 w-3.5" />
          Responsable registrado.
        </div>
      )}
    </div>
  );
}

export function isCompanionRequired(patientBirthDate: string | null): boolean {
  const age = calcAge(patientBirthDate);
  return age !== null && age < 18;
}

export function isCompanionComplete(data: CompanionData): boolean {
  return data.name.trim().length > 0 && data.relationship.length > 0;
}
