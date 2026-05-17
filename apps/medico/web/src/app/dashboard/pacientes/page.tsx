'use client';

/**
 * @file /dashboard/pacientes — patient roster (Phase 3 redesign).
 *
 * Replaces the P1 implementation that merged appointment rows in-memory with
 * the cursor-paginated server-side roster + filters + KPIs (T-3-08/09/10).
 *
 * Composition (top → bottom):
 *   PageHeader (title + ExportRosterMenu + Nuevo paciente)
 *   RosterKpiStrip                — six attention tiles
 *   RosterFiltersBar              — search + chip filters
 *   PatientList (unchanged)       — reuses the P1 list component
 *   "Cargar más" trigger          — manual pagination, surfaces `hasNextPage`
 *
 * `useActiveSede` is read for parity with the rest of the doctor surface; the
 * paginator does not yet wire `sede_id` into the filter set — Phase 3 batch 2
 * TODO.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Users } from 'lucide-react';
import { Button, EmptyState } from '@red-salud/design-system';

import { supabase } from '@/lib/supabase/client';
import { PageHeader } from '@/components/shell';
import { PatientList } from '@/components/patients/patient-list';
import { CreatePatientDialog } from '@/components/patients/create-patient-dialog';
import { ExportRosterMenu } from '@/components/patients/export-roster-menu';
import {
  RosterFiltersBar,
} from '@/components/patients/roster-filters';
import { RosterKpiStrip } from '@/components/patients/roster-kpi-strip';
import { usePatientRosterPaginated } from '@/hooks/use-patient-roster-paginated';
import { usePatientFilters } from '@/hooks/use-patient-filters';
import { useActiveSede } from '@/hooks/use-active-sede';

export default function PacientesPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  // Kept for parity with the rest of the doctor surface. The paginator does
  // not yet honor sede_id — see TODO in listPatientsPaginated.
  useActiveSede();

  const {
    filters,
    isDirty,
    setSearch,
    toggleChronicTag,
    setAgeRange,
    setLastVisitWindow,
    toggleHasFollowup,
    toggleAlertsOnly,
    reset: resetFilters,
  } = usePatientFilters();

  const {
    patients,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = usePatientRosterPaginated({
    doctorId: userId,
    filters,
    limit: 25,
  });

  const [createOpen, setCreateOpen] = useState(false);

  const isEmpty = !isLoading && patients.length === 0;

  return (
    <div className="space-y-4">
      <PageHeader>
        <PageHeader.Title>Pacientes</PageHeader.Title>
        <PageHeader.Meta>
          {isLoading
            ? 'Cargando registro...'
            : `${patients.length} paciente${patients.length !== 1 ? 's' : ''} cargado${patients.length !== 1 ? 's' : ''}${hasNextPage ? ' (más disponibles)' : ''}`}
        </PageHeader.Meta>
        <PageHeader.Actions>
          <ExportRosterMenu patients={patients} />
          <Button type="button" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Nuevo paciente
          </Button>
        </PageHeader.Actions>
      </PageHeader>

      <RosterKpiStrip doctorId={userId} />

      <RosterFiltersBar
        filters={filters}
        isDirty={isDirty}
        onSearchChange={setSearch}
        onToggleChronicTag={toggleChronicTag}
        onAgeRangeChange={setAgeRange}
        onLastVisitWindowChange={setLastVisitWindow}
        onToggleHasFollowup={toggleHasFollowup}
        onToggleAlertsOnly={toggleAlertsOnly}
        onReset={resetFilters}
      />

      {error && patients.length > 0 && (
        <div className="p-3 bg-warning/10 border border-warning/30 rounded-lg text-sm text-warning">
          <p className="font-medium">No pudimos actualizar la lista</p>
          <p className="mt-0.5 text-xs text-warning/80">
            Mostramos la última versión disponible. Reintentá en unos segundos.
          </p>
        </div>
      )}

      {isEmpty && isDirty ? (
        <EmptyState
          icon={Users}
          title="No encontramos pacientes con esos filtros"
          description="Probá quitar alguna condición o ampliar el rango de fechas."
          action={{ label: 'Limpiar filtros', onClick: resetFilters }}
        />
      ) : isEmpty ? (
        <EmptyState
          icon={Users}
          title="Todavía no tenés pacientes en tu agenda"
          description="Creá el primero para empezar a registrar consultas, recetas y seguimientos."
          action={{
            label: '+ Crear primer paciente',
            onClick: () => setCreateOpen(true),
          }}
        />
      ) : (
        <PatientList
          patients={patients}
          isLoading={isLoading}
          onSelect={(id) => router.push(`/dashboard/pacientes/${id}`)}
        />
      )}

      {!isEmpty && hasNextPage && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => void fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando más...
              </>
            ) : (
              'Cargar más'
            )}
          </Button>
        </div>
      )}

      <CreatePatientDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(result) => {
          setCreateOpen(false);
          router.push(`/dashboard/pacientes/${result.patient_id}`);
        }}
      />
    </div>
  );
}
