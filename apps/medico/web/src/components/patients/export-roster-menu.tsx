'use client';

/**
 * @file export-roster-menu.tsx
 * @description Export menu for the patient roster (T-3-10 UI).
 *
 * Wraps `usePatientExport` with a `DropdownMenu` of two options:
 *   1. CSV de pacientes — opens an AlertDialog with a PHI warning, then
 *      flattens `PatientSummary[]` to `PatientExportRow[]` and triggers
 *      `exportCsv()`. PHI fields like alergias/diagnoses are intentionally
 *      excluded from the export shape (see `PatientExportRow` doc).
 *   2. PDF por paciente — surfaces a "próximamente" toast (the hook itself
 *      already toasts but we mirror the messaging here so the dropdown
 *      affordance is honest).
 *
 * The dropdown is purely client-side: the export runs in the browser via
 * `Blob` + anchor download, no roundtrip to the gateway.
 */

import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@red-salud/design-system';

import { usePatientExport } from '@/hooks/use-patient-export';
import type { PatientExportRow, PatientSummary } from '@red-salud/types';

export interface ExportRosterMenuProps {
  patients: PatientSummary[];
}

function toExportRows(patients: PatientSummary[]): PatientExportRow[] {
  return patients.map((p) => ({
    full_name: p.full_name,
    national_id: p.national_id,
    phone: p.phone,
    date_of_birth: p.date_of_birth,
    // `PatientSummary` does not carry sede / alert counts yet — leave nullish
    // so the CSV stays honest. When the paginated roster surfaces those
    // fields (Phase 3 batch 2), wire them here.
    sede: null,
    last_visit_date: p.last_visit_at,
    chronic_tag_count: 0,
    alert_count: 0,
  }));
}

export function ExportRosterMenu({ patients }: ExportRosterMenuProps) {
  const { exportCsv } = usePatientExport();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleConfirmCsv() {
    if (patients.length === 0) {
      toast.info('Todavía no hay pacientes para exportar.');
      setConfirmOpen(false);
      return;
    }
    exportCsv(toExportRows(patients));
    setConfirmOpen(false);
  }

  function handlePdf() {
    toast.info(
      'Generar PDF por paciente estará disponible pronto. Te avisamos cuando se libere la integración.',
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>Opciones de exportación</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setConfirmOpen(true)}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Descargar CSV de pacientes
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handlePdf}>
            <FileText className="h-4 w-4 mr-2" />
            Generar PDF por paciente
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Descargar CSV de pacientes</AlertDialogTitle>
            <AlertDialogDescription>
              Este archivo contiene PHI (información clínica protegida).
              Manejalo según las políticas HIPAA-equivalentes: no lo subas a
              servicios públicos, borralo cuando termines y guardalo cifrado si
              necesitás conservarlo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCsv}>
              Descargar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
