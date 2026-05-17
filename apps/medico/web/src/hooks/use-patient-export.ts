'use client';

import { useCallback } from 'react';
import { toast } from 'sonner';
import type {
  PatientClinicalOverview,
  PatientExportRow,
  PatientFull,
} from '@red-salud/types';

interface UsePatientExportResult {
  exportCsv: (rows: PatientExportRow[], filename?: string) => void;
  exportPdfForPatient: (
    patient: PatientFull,
    overview: PatientClinicalOverview | null,
    filename?: string,
  ) => void;
}

/**
 * Client-side exporter for the roster (CSV) and per-patient summary (PDF).
 * No queries — pure side-effects on the DOM (Blob + anchor) + toast for
 * unimplemented PDF (T-3-10).
 *
 * PHI rule (REQ-X.1): both filenames carry a `PHI_` prefix + ISO timestamp
 * so a doctor downloading multiple exports doesn't accidentally overwrite
 * one, and so any local-disk indexer flags them as sensitive.
 *
 * CSV escaping follows RFC 4180:
 *   - fields containing comma, quote, or newline get wrapped in double quotes
 *   - embedded quotes are doubled (`"` ⇒ `""`)
 *   - line endings are CRLF (`\r\n`) for Excel compatibility
 */
export function usePatientExport(): UsePatientExportResult {
  const exportCsv = useCallback((rows: PatientExportRow[], filename?: string) => {
    const csv = buildCsv(rows);
    const ts = isoForFilename(new Date());
    const finalName = filename
      ? withPhiPrefix(filename)
      : `PHI_pacientes_${ts}.csv`;
    triggerDownload(csv, finalName, 'text/csv;charset=utf-8;');
  }, []);

  const exportPdfForPatient = useCallback(
    (
      _patient: PatientFull,
      _overview: PatientClinicalOverview | null,
      _filename?: string,
    ) => {
      // TODO(P3-batch3): wire a real PDF renderer. `usePdfGeneration` from
      // `@red-salud/core` operates on a DOM element (html2canvas + jsPDF) —
      // we need a hidden printable component that mirrors the patient
      // overview, mount it conditionally, then call generatePdf on its id.
      // For now we surface a "próximamente" toast so the button is wired
      // without misleading the doctor.
      toast.info('Exportar PDF estará disponible pronto.');
    },
    [],
  );

  return { exportCsv, exportPdfForPatient };
}

// ---------------------------------------------------------------------------
// helpers (kept inside this module to avoid bloating `@red-salud/core`)
// ---------------------------------------------------------------------------

const CSV_COLUMNS: Array<{
  key: keyof PatientExportRow;
  header: string;
  format?: (value: unknown) => string;
}> = [
  { key: 'full_name', header: 'Nombre completo' },
  { key: 'national_id', header: 'Cédula' },
  { key: 'phone', header: 'Teléfono' },
  { key: 'date_of_birth', header: 'Fecha de nacimiento' },
  { key: 'sede', header: 'Sede' },
  { key: 'last_visit_date', header: 'Última visita' },
  { key: 'chronic_tag_count', header: 'Condiciones crónicas' },
  { key: 'alert_count', header: 'Alertas' },
];

function buildCsv(rows: PatientExportRow[]): string {
  const header = CSV_COLUMNS.map((c) => escapeCsv(c.header)).join(',');
  const body = rows
    .map((row) =>
      CSV_COLUMNS.map((c) => {
        const raw = (row as unknown as Record<string, unknown>)[c.key as string];
        const formatted = c.format ? c.format(raw) : stringifyCell(raw);
        return escapeCsv(formatted);
      }).join(','),
    )
    .join('\r\n');
  return `${header}\r\n${body}`;
}

function stringifyCell(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'number') return String(value);
  return String(value);
}

/**
 * RFC 4180 escape: wrap in double quotes when the field contains a comma,
 * double quote, CR, or LF; double any embedded quote.
 */
function escapeCsv(value: string): string {
  if (value === '') return '';
  const needsQuotes = /[",\r\n]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

function triggerDownload(content: string, filename: string, mimeType: string): void {
  // Prepend the UTF-8 BOM so Excel honors accent characters in es-VE.
  const blob = new Blob([`﻿${content}`], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  // Defer revocation so iOS Safari has time to attach the download.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function isoForFilename(date: Date): string {
  // 2026-05-18T14-32-05 — strip colons (illegal on Windows filenames).
  return date.toISOString().slice(0, 19).replace(/:/g, '-');
}

function withPhiPrefix(filename: string): string {
  return filename.startsWith('PHI_') ? filename : `PHI_${filename}`;
}
