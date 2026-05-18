'use client';

import dynamic from 'next/dynamic';
import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@red-salud/design-system';
import {
  MapPin,
  MoreVertical,
  Pencil,
  Phone,
  Star,
  Trash2,
  StickyNote,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  deleteSede,
  setPrimarySede,
} from '@/lib/sedes/service';
import {
  SEDE_HAS_APPOINTMENTS_PREFIX,
  type DoctorPracticeLocation,
} from '@/lib/sedes/types';

/**
 * @file components/sedes/sede-card.tsx
 * @description Visual card for a single sede shown in the management grid.
 *
 * Each card displays:
 *   - The mini map preview (Leaflet with all interaction disabled, just the
 *     tile + pin). Falls back to a styled placeholder when there are no
 *     coordinates yet.
 *   - Sede name + primary star + active badge
 *   - Address + phone + notes excerpt
 *   - Actions menu: Editar · Marcar como principal · Eliminar
 */

const SedePreviewMap = dynamic(
  () => import('./sede-preview-map').then((m) => m.SedePreviewMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-32 items-center justify-center bg-muted/40 text-xs text-muted-foreground">
        Cargando mapa...
      </div>
    ),
  },
);

interface SedeCardProps {
  sede: DoctorPracticeLocation;
  totalActive: number;
}

export function SedeCard({ sede, totalActive }: SedeCardProps): React.ReactElement {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSetPrimary() {
    startTransition(async () => {
      try {
        await setPrimarySede(sede.id);
        toast.success(`"${sede.name}" es ahora tu sede principal`);
        router.refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'No se pudo actualizar';
        toast.error(message);
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteSede(sede.id);
        toast.success(`Sede "${sede.name}" eliminada`);
        setConfirmDelete(false);
        router.refresh();
      } catch (err) {
        if (err instanceof Error && err.message.startsWith(SEDE_HAS_APPOINTMENTS_PREFIX)) {
          const count = err.message.split(':')[1];
          toast.error(
            `No se puede eliminar: esta sede tiene ${count} cita(s) asociada(s). Reasignalas primero.`,
          );
        } else {
          const message = err instanceof Error ? err.message : 'No se pudo eliminar';
          toast.error(message);
        }
        setConfirmDelete(false);
      }
    });
  }

  const hasCoordinates =
    typeof sede.latitude === 'number' && typeof sede.longitude === 'number';

  return (
    <>
      <article
        data-testid={`sede-card-${sede.id}`}
        className="group flex flex-col overflow-hidden rounded-xl border border-border bg-background transition-shadow hover:shadow-md"
      >
        <div className="relative h-36 w-full bg-muted/40">
          {hasCoordinates ? (
            <SedePreviewMap
              lat={sede.latitude as number}
              lng={sede.longitude as number}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-center">
              <div className="flex flex-col items-center gap-1 text-muted-foreground">
                <MapPin className="h-6 w-6" aria-hidden="true" />
                <span className="text-xs">Sin ubicación en el mapa</span>
              </div>
            </div>
          )}
          {sede.is_primary && (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-900 shadow-sm">
              <Star className="h-3 w-3 fill-amber-500 text-amber-500" aria-hidden="true" />
              Principal
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4">
          <header className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold">{sede.name}</h3>
              {sede.city && (
                <p className="text-xs text-muted-foreground">
                  {[sede.city, sede.state].filter(Boolean).join(', ')}
                </p>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Acciones de la sede"
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-sidebar-accent"
                >
                  <MoreVertical className="h-4 w-4" aria-hidden="true" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem asChild>
                  <Link
                    href={`/dashboard/sedes/${sede.id}`}
                    className="flex items-center gap-2"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    Editar sede
                  </Link>
                </DropdownMenuItem>
                {!sede.is_primary && (
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      handleSetPrimary();
                    }}
                    disabled={isPending}
                  >
                    <Star className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
                    Marcar como principal
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  disabled={totalActive <= 1 || isPending}
                  onSelect={(e) => {
                    e.preventDefault();
                    setConfirmDelete(true);
                  }}
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          <div className="mt-3 space-y-1.5 text-sm">
            {sede.address && (
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-foreground-lighter"
                  aria-hidden="true"
                />
                <span className="line-clamp-2">{sede.address}</span>
              </div>
            )}
            {sede.phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone
                  className="h-3.5 w-3.5 shrink-0 text-foreground-lighter"
                  aria-hidden="true"
                />
                <span className="truncate">{sede.phone}</span>
              </div>
            )}
            {sede.notes && (
              <div className="flex items-start gap-2 text-muted-foreground">
                <StickyNote
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-foreground-lighter"
                  aria-hidden="true"
                />
                <span className="line-clamp-2 italic">{sede.notes}</span>
              </div>
            )}
          </div>

          <div className="mt-auto pt-4">
            <Link
              href={`/dashboard/sedes/${sede.id}`}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              <Pencil className="h-3 w-3" aria-hidden="true" />
              Editar sede
            </Link>
          </div>
        </div>
      </article>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar sede</DialogTitle>
            <DialogDescription>
              Vas a eliminar <span className="font-semibold">{sede.name}</span>.
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmDelete(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? 'Eliminando...' : 'Eliminar sede'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
