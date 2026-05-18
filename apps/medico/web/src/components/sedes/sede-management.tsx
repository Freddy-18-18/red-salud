'use client';

import { useState, useTransition, type FormEvent } from 'react';
import {
  Button,
  Input,
  Label,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@red-salud/design-system';
import { Pencil, Plus, Star, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

import {
  createSede,
  deleteSede,
  listSedes,
  setPrimarySede,
  updateSede,
} from '@/lib/sedes/service';
import {
  SEDE_HAS_APPOINTMENTS_PREFIX,
  type DoctorPracticeLocation,
} from '@/lib/sedes/types';

/**
 * @file components/sedes/sede-management.tsx
 * @description CRUD surface for the medico practice-locations (sedes).
 *
 * Spec coverage:
 *   - R7 list + create + update + delete + primary toggle
 *   - R3 atomic primary promotion (DB trigger demotes the previous primary)
 *   - R6 deletion guard with actionable message
 *
 * The Supabase mutations are awaited inline; a `useTransition` boundary
 * preserves UI responsiveness while the round-trip completes. The component
 * is purely presentational beyond the mutation triggers — the parent server
 * component prefetches the initial dataset.
 *
 * Individual doctor practice ONLY — no clinic / multi-org concepts.
 */

interface SedeManagementProps {
  doctorId: string;
  initialSedes: DoctorPracticeLocation[];
}

interface SedeFormState {
  name: string;
  address: string;
  isPrimary: boolean;
}

const EMPTY_FORM: SedeFormState = { name: '', address: '', isPrimary: false };

export function SedeManagement({
  doctorId,
  initialSedes,
}: SedeManagementProps): React.ReactElement {
  const [sedes, setSedes] = useState<DoctorPracticeLocation[]>(initialSedes);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState<boolean>(false);
  const [form, setForm] = useState<SedeFormState>(EMPTY_FORM);
  const [, startTransition] = useTransition();

  async function refresh(): Promise<void> {
    try {
      const next = await listSedes(doctorId);
      setSedes(next);
    } catch (err) {
      // Non-fatal: keep the stale list rather than wiping it.
      // eslint-disable-next-line no-console
      console.error('[sedes] refresh failed', err);
    }
  }

  function resetForm(): void {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setCreating(false);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }

    try {
      if (editingId) {
        await updateSede(editingId, {
          name: form.name.trim(),
          address: form.address.trim() || null,
          is_primary: form.isPrimary,
        });
        toast.success('Sede actualizada');
      } else {
        await createSede(doctorId, {
          name: form.name.trim(),
          address: form.address.trim() || null,
          is_primary: form.isPrimary,
        });
        toast.success('Sede creada');
      }
      resetForm();
      startTransition(() => {
        void refresh();
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'No se pudo guardar la sede',
      );
    }
  }

  function startEdit(sede: DoctorPracticeLocation): void {
    setEditingId(sede.id);
    setCreating(false);
    setForm({
      name: sede.name,
      address: sede.address ?? '',
      isPrimary: sede.is_primary,
    });
  }

  async function handleSetPrimary(sede: DoctorPracticeLocation): Promise<void> {
    if (sede.is_primary) return;
    try {
      await setPrimarySede(sede.id);
      toast.success(`Sede primaria: ${sede.name}`);
      startTransition(() => {
        void refresh();
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'No se pudo cambiar la sede primaria',
      );
    }
  }

  async function handleDelete(sede: DoctorPracticeLocation): Promise<void> {
    const confirmed =
      typeof window !== 'undefined'
        ? window.confirm(`Eliminar la sede "${sede.name}"?`)
        : true;
    if (!confirmed) return;

    try {
      await deleteSede(sede.id);
      toast.success('Sede eliminada');
      startTransition(() => {
        void refresh();
      });
    } catch (err) {
      // Pattern-match the deletion guard error (SEDE_HAS_APPOINTMENTS:<n>).
      const message = err instanceof Error ? err.message : '';
      if (message.startsWith(`${SEDE_HAS_APPOINTMENTS_PREFIX}:`)) {
        const count = message.split(':')[1];
        toast.error(
          `Esta sede tiene ${count} cita(s) asociada(s). Reasignalas antes de eliminar.`,
        );
        return;
      }
      toast.error(message || 'No se pudo eliminar la sede');
    }
  }

  async function handleToggleActive(
    sede: DoctorPracticeLocation,
  ): Promise<void> {
    try {
      await updateSede(sede.id, { active: !sede.active });
      toast.success(
        sede.active ? 'Sede desactivada' : 'Sede reactivada',
      );
      startTransition(() => {
        void refresh();
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'No se pudo actualizar la sede',
      );
    }
  }

  const showForm = creating || editingId !== null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        {!showForm && (
          <Button
            type="button"
            onClick={() => {
              setCreating(true);
              setEditingId(null);
              setForm(EMPTY_FORM);
            }}
            data-testid="sede-new-button"
          >
            <Plus aria-hidden="true" className="mr-2 h-4 w-4" /> Nueva sede
          </Button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          data-testid="sede-form"
          className="rounded-lg border border-border bg-card p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">
              {editingId ? 'Editar sede' : 'Nueva sede'}
            </h3>
            <button
              type="button"
              onClick={resetForm}
              aria-label="Cerrar formulario"
              className="text-foreground-lighter hover:text-foreground"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="sede-name">Nombre *</Label>
              <Input
                id="sede-name"
                name="name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Consultorio Centro"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sede-address">Dirección</Label>
              <Input
                id="sede-address"
                name="address"
                value={form.address}
                onChange={(e) =>
                  setForm({ ...form, address: e.target.value })
                }
                placeholder="Av. Principal, Caracas"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="sede-primary"
              checked={form.isPrimary}
              onCheckedChange={(checked) =>
                setForm({ ...form, isPrimary: Boolean(checked) })
              }
            />
            <Label htmlFor="sede-primary" className="text-sm">
              Marcar como sede primaria
            </Label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={resetForm}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingId ? 'Guardar cambios' : 'Crear sede'}
            </Button>
          </div>
        </form>
      )}

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Dirección</TableHead>
              <TableHead>Primaria</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sedes.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-sm text-foreground-lighter py-6"
                >
                  Aún no tenés sedes registradas. Creá la primera con
                  &ldquo;Nueva sede&rdquo;.
                </TableCell>
              </TableRow>
            ) : (
              sedes.map((sede) => (
                <TableRow
                  key={sede.id}
                  data-testid="sede-row"
                  data-sede-id={sede.id}
                >
                  <TableCell className="font-medium">{sede.name}</TableCell>
                  <TableCell className="text-foreground-lighter">
                    {sede.address ?? '—'}
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => void handleSetPrimary(sede)}
                      aria-label={
                        sede.is_primary
                          ? 'Sede primaria'
                          : 'Establecer como sede primaria'
                      }
                      className="inline-flex items-center gap-1 text-sm"
                    >
                      <Star
                        aria-hidden="true"
                        className={`h-4 w-4 ${sede.is_primary ? 'fill-amber-400 text-amber-500' : 'text-foreground-lighter'}`}
                      />
                      {sede.is_primary ? 'Primaria' : 'Hacer primaria'}
                    </button>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={sede.active}
                      onCheckedChange={() => void handleToggleActive(sede)}
                      aria-label={
                        sede.active
                          ? 'Sede activa, click para desactivar'
                          : 'Sede inactiva, click para reactivar'
                      }
                    />
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => startEdit(sede)}
                      aria-label="Editar sede"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => void handleDelete(sede)}
                      aria-label="Eliminar sede"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
