'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  Loader2,
  ShieldCheck,
  UserPlus,
  UserSearch,
  X,
} from 'lucide-react';
import { Button, Label } from '@red-salud/design-system';
import {
  useCedulaLookup,
  type CedulaLookupResult,
} from '../_hooks/use-cedula-lookup';

/**
 * Resultado seleccionado por el doctor para asociar a la cita.
 * Discriminated union — `kind` indica de dónde vino el paciente.
 *
 * Los campos CNE (rif, ubicación) son opcionales — solo presentes cuando
 * la fuente fue CNE o cuando un offline patient los tenía guardados.
 */
export interface PatientCneInfo {
  rif?: string | null;
  cne_estado?: string | null;
  cne_municipio?: string | null;
  cne_parroquia?: string | null;
  cne_centro_electoral?: string | null;
}

export type SelectedPatient =
  | ({
      kind: 'registered' | 'platform';
      patient_id: string;
      full_name: string;
      national_id: string;
      nacionalidad: 'V' | 'E';
    } & PatientCneInfo)
  | ({
      kind: 'offline';
      offline_patient_id: string;
      full_name: string;
      national_id: string;
      nacionalidad: 'V' | 'E';
    } & PatientCneInfo);

interface PatientPickerProps {
  value: SelectedPatient | null;
  onChange: (next: SelectedPatient | null) => void;
}

const CEDULA_MIN_LENGTH = 6;
const DEBOUNCE_MS = 400;

/**
 * Sub-routine de auto-create offline patient via /api/patients.
 * Devuelve el offline_patient_id o lanza.
 */
async function createOfflinePatient(payload: Record<string, unknown>): Promise<{
  offline_patient_id: string;
  full_name: string;
  national_id: string;
  nacionalidad: 'V' | 'E';
  rif?: string | null;
  cne_estado?: string | null;
  cne_municipio?: string | null;
  cne_parroquia?: string | null;
  cne_centro_electoral?: string | null;
}> {
  const res = await fetch('/api/patients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(
      json?.message ?? 'No pudimos registrar al paciente automáticamente.',
    );
  }
  return {
    offline_patient_id: json.data.offline_patient_id,
    full_name: payload.full_name as string,
    national_id: payload.cedula as string,
    nacionalidad: (payload.nacionalidad as 'V' | 'E') ?? 'V',
    // Pasamos lo que enviamos para que la UI lo muestre inmediatamente
    // sin tener que re-fetchear desde /api/patients/lookup.
    rif: (payload.rif as string | null) ?? null,
    cne_estado: (payload.cne_estado as string | null) ?? null,
    cne_municipio: (payload.cne_municipio as string | null) ?? null,
    cne_parroquia: (payload.cne_parroquia as string | null) ?? null,
    cne_centro_electoral: (payload.cne_centro_electoral as string | null) ?? null,
  };
}

export function PatientPicker({ value, onChange }: PatientPickerProps) {
  const [nacionalidad, setNacionalidad] = useState<'V' | 'E'>('V');
  const [cedulaInput, setCedulaInput] = useState('');
  const { result, lookup, reset } = useCedulaLookup();

  // Auto-create state
  const [autoCreating, setAutoCreating] = useState(false);
  const [autoCreateError, setAutoCreateError] = useState<string | null>(null);

  // Manual fallback (cuando CNE no encuentra) — solo nombre necesario
  const [manualName, setManualName] = useState('');
  const [manualSubmitting, setManualSubmitting] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);

  // Para evitar dispararlo dos veces para la misma cédula
  const autoCreatedKeyRef = useRef<string | null>(null);

  // Debounce: cuando el doctor termina de escribir cédula, disparar lookup.
  useEffect(() => {
    if (value) return;
    const clean = cedulaInput.replace(/\D/g, '');
    if (clean.length < CEDULA_MIN_LENGTH) {
      reset();
      autoCreatedKeyRef.current = null;
      return;
    }
    const timer = setTimeout(() => {
      lookup({ nacionalidad, cedula: clean });
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [cedulaInput, nacionalidad, value, lookup, reset]);

  // Auto-seleccionar cuando el lookup retorna un paciente ya vinculable.
  // Propagamos campos CNE si vinieron — la card los muestra al doctor.
  useEffect(() => {
    if (value) return;
    if (result.kind === 'registered' || result.kind === 'platform') {
      onChange({
        kind: result.kind,
        patient_id: result.patient_id!,
        full_name: result.full_name!,
        national_id: result.national_id!,
        nacionalidad: result.nacionalidad ?? nacionalidad,
      });
    } else if (result.kind === 'offline') {
      onChange({
        kind: 'offline',
        offline_patient_id: result.offline_patient_id!,
        full_name: result.full_name!,
        national_id: result.national_id!,
        nacionalidad: result.nacionalidad ?? nacionalidad,
        rif: result.rif ?? null,
        cne_estado: result.cne_estado ?? null,
        cne_municipio: result.cne_municipio ?? null,
        cne_parroquia: result.cne_parroquia ?? null,
        cne_centro_electoral: result.cne_centro_electoral ?? null,
      });
    }
  }, [result, nacionalidad, value, onChange]);

  // AUTO-CREATE cuando CNE retorna OK.
  // Se ejecuta UNA vez por (nacionalidad, cedula) — el ref previene re-disparos.
  useEffect(() => {
    if (value || result.kind !== 'cne' || autoCreating) return;
    if (!result.national_id || !result.full_name) return;

    const key = `${result.nacionalidad ?? nacionalidad}-${result.national_id}`;
    if (autoCreatedKeyRef.current === key) return;
    autoCreatedKeyRef.current = key;

    setAutoCreating(true);
    setAutoCreateError(null);

    createOfflinePatient({
      nacionalidad: result.nacionalidad ?? nacionalidad,
      cedula: result.national_id,
      full_name: result.full_name,
      first_name: result.primer_nombre,
      middle_name: result.segundo_nombre,
      last_name: result.primer_apellido,
      second_last_name: result.segundo_apellido,
      rif: result.rif,
      cne_estado: result.cne_estado,
      cne_municipio: result.cne_municipio,
      cne_parroquia: result.cne_parroquia,
      cne_centro_electoral: result.cne_centro_electoral,
    })
      .then((created) => {
        onChange({
          kind: 'offline',
          offline_patient_id: created.offline_patient_id,
          full_name: created.full_name,
          national_id: created.national_id,
          nacionalidad: created.nacionalidad,
          rif: created.rif,
          cne_estado: created.cne_estado,
          cne_municipio: created.cne_municipio,
          cne_parroquia: created.cne_parroquia,
          cne_centro_electoral: created.cne_centro_electoral,
        });
      })
      .catch((err) => {
        setAutoCreateError(err.message ?? 'Error al registrar.');
        // NO nullificamos autoCreatedKeyRef acá — sino el useEffect se re-dispara
        // en loop infinito (setAutoCreating(false) abajo causa re-render y
        // result.kind sigue siendo 'cne'). El usuario decide reintentar via
        // botón "Reintentar" en LookupStatusBanner (ese sí nullifica el ref).
      })
      .finally(() => setAutoCreating(false));
  }, [result, nacionalidad, value, onChange, autoCreating]);

  /**
   * Reintento manual del auto-create cuando falló. Limpia el error, libera
   * el ref de "ya intentado" y deja que el useEffect dispare otra vez con
   * los mismos datos del CNE (que aún están en `result`).
   */
  const retryAutoCreate = useCallback(() => {
    setAutoCreateError(null);
    autoCreatedKeyRef.current = null;
  }, []);

  const clear = useCallback(() => {
    setCedulaInput('');
    setManualName('');
    setManualError(null);
    setAutoCreateError(null);
    autoCreatedKeyRef.current = null;
    reset();
    onChange(null);
  }, [reset, onChange]);

  const submitManual = useCallback(async () => {
    const name = manualName.trim();
    const clean = cedulaInput.replace(/\D/g, '');
    if (name.length < 3) {
      setManualError('Ingresá el nombre del paciente (mínimo 3 letras).');
      return;
    }
    if (clean.length < CEDULA_MIN_LENGTH) return;

    setManualSubmitting(true);
    setManualError(null);

    try {
      const created = await createOfflinePatient({
        nacionalidad,
        cedula: clean,
        full_name: name,
      });
      onChange({
        kind: 'offline',
        offline_patient_id: created.offline_patient_id,
        full_name: created.full_name,
        national_id: created.national_id,
        nacionalidad: created.nacionalidad,
      });
    } catch (err) {
      setManualError((err as Error).message);
    } finally {
      setManualSubmitting(false);
    }
  }, [cedulaInput, manualName, nacionalidad, onChange]);

  // ---- Render: paciente seleccionado ---------------------------------------
  // Card compacta: nombre + cédula + fuente. La info CNE (ubicación/centro
  // electoral/RIF) se persiste en DB pero NO se muestra acá para no saturar
  // la UI — vive en el detalle de paciente, no en el flujo de cita.
  if (value) {
    return (
      <div className="rounded-xl border border-success/30 bg-success/5 p-3 sm:p-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-success" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">
              {value.full_name}
            </p>
            <p className="text-xs text-muted-foreground">
              {value.nacionalidad}-{value.national_id}
              {' · '}
              <SourceBadge kind={value.kind} />
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clear}
            aria-label="Cambiar paciente"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // ---- Render: form de búsqueda --------------------------------------------
  return (
    <div className="space-y-2.5">
      <div className="space-y-1.5">
        <Label htmlFor="cita-cedula" className="text-xs">
          Cédula del paciente
        </Label>
        {/* Single compact input — V/E pill integrated as left prefix */}
        <div className="flex h-10 items-stretch overflow-hidden rounded-md border border-input bg-transparent shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 dark:bg-input/30">
          {/* V/E inline toggle */}
          <div
            role="group"
            aria-label="Nacionalidad"
            className="flex items-center gap-0 border-r border-input bg-muted/40 px-1"
          >
            {(['V', 'E'] as const).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setNacionalidad(n)}
                aria-pressed={nacionalidad === n}
                className={`min-w-7 rounded px-1.5 py-1 text-sm font-bold transition-colors ${
                  nacionalidad === n
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          {/* Cédula input */}
          <input
            id="cita-cedula"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="12345678"
            value={cedulaInput}
            onChange={(e) =>
              setCedulaInput(e.target.value.replace(/\D/g, '').slice(0, 9))
            }
            className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
          />

          {/* Right-side status icon */}
          <div className="flex items-center pr-2">
            {result.kind === 'loading' || autoCreating ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : cedulaInput.length > 0 ? (
              <button
                type="button"
                onClick={clear}
                aria-label="Limpiar"
                className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : (
              <UserSearch className="h-4 w-4 text-muted-foreground/60" />
            )}
          </div>
        </div>
      </div>

      {/* Estado del lookup */}
      <LookupStatusBanner
        result={result}
        autoCreating={autoCreating}
        autoCreateError={autoCreateError}
        onRetryAutoCreate={retryAutoCreate}
        cedula={cedulaInput.replace(/\D/g, '')}
        nacionalidad={nacionalidad}
        manualName={manualName}
        onManualNameChange={setManualName}
        manualError={manualError}
        manualSubmitting={manualSubmitting}
        onManualSubmit={submitManual}
      />
    </div>
  );
}

// ============================================================================
// SUB: estado del lookup (banner inline)
// ============================================================================

function LookupStatusBanner({
  result,
  autoCreating,
  autoCreateError,
  onRetryAutoCreate,
  cedula,
  nacionalidad,
  manualName,
  onManualNameChange,
  manualError,
  manualSubmitting,
  onManualSubmit,
}: {
  result: CedulaLookupResult;
  autoCreating: boolean;
  autoCreateError: string | null;
  onRetryAutoCreate: () => void;
  cedula: string;
  nacionalidad: 'V' | 'E';
  manualName: string;
  onManualNameChange: (v: string) => void;
  manualError: string | null;
  manualSubmitting: boolean;
  onManualSubmit: () => void;
}) {
  // Auto-creating spinner over CNE result
  if (autoCreating) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-info/30 bg-info/5 p-3 text-sm">
        <Loader2 className="h-4 w-4 animate-spin text-info" />
        <span className="text-foreground">
          Registrando paciente automáticamente desde el CNE…
        </span>
      </div>
    );
  }

  if (autoCreateError) {
    return (
      <div className="space-y-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
        <div className="flex items-start gap-2 text-sm text-destructive">
          <UserSearch className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-medium">Auto-registro falló</p>
            <p className="mt-0.5 text-[11px] text-destructive/80">
              {autoCreateError}
            </p>
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onRetryAutoCreate}
          className="w-full"
        >
          Reintentar registro
        </Button>
      </div>
    );
  }

  if (result.kind === 'idle') {
    return (
      <p className="text-[11px] text-muted-foreground">
        Escribí la cédula. Si no está en tu sistema, la registramos
        automáticamente con los datos del CNE.
      </p>
    );
  }

  if (result.kind === 'loading') {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Buscando paciente…
      </div>
    );
  }

  if (result.kind === 'error') {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
        {result.message ?? 'Error al consultar la cédula.'}
      </div>
    );
  }

  if (result.kind === 'cne') {
    // Pre-loading state mientras dispara el auto-create del useEffect
    return (
      <div className="flex items-center gap-2 rounded-lg border border-info/30 bg-info/5 p-3 text-sm">
        <ShieldCheck className="h-4 w-4 text-info" />
        <span className="text-foreground">
          Encontrado en CNE: <span className="font-semibold">{result.full_name}</span>
        </span>
      </div>
    );
  }

  if (result.kind === 'not_found') {
    // Fallback inline — sin Sheet — solo pide el nombre
    return (
      <div className="space-y-2 rounded-lg border border-warning/30 bg-warning/5 p-3">
        <div className="flex items-start gap-2">
          <UserSearch className="mt-0.5 h-4 w-4 flex-shrink-0 text-warning" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">
              No encontramos esta cédula
            </p>
            <p className="text-[11px] text-muted-foreground">
              {result.message ??
                'No está en tu roster ni en el CNE.'}{' '}
              Registralo con solo el nombre.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
          <input
            type="text"
            value={manualName}
            onChange={(e) => onManualNameChange(e.target.value)}
            placeholder="Nombre completo del paciente"
            className="flex h-9 flex-1 rounded-md border border-input bg-card px-3 py-1 text-sm text-foreground shadow-xs outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
          />
          <Button
            type="button"
            size="sm"
            onClick={onManualSubmit}
            disabled={manualSubmitting || manualName.trim().length < 3}
            className="h-9"
          >
            {manualSubmitting ? (
              <>
                <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                Registrando…
              </>
            ) : (
              <>
                <UserPlus className="mr-1 h-3.5 w-3.5" />
                Registrar y usar
              </>
            )}
          </Button>
        </div>
        {manualError && (
          <p className="text-[11px] font-medium text-destructive">{manualError}</p>
        )}
        <p className="text-[10px] text-muted-foreground">
          {nacionalidad}-{cedula}
        </p>
      </div>
    );
  }

  // registered / platform / offline — manejados via auto-onChange en el hook
  return null;
}

// ============================================================================
// SUB: badge "fuente del paciente"
// ============================================================================

function SourceBadge({ kind }: { kind: SelectedPatient['kind'] }) {
  if (kind === 'registered') return <span className="text-success">En tu roster</span>;
  if (kind === 'platform') return <span className="text-info">Registrado en plataforma</span>;
  return <span className="text-warning">Paciente offline</span>;
}
