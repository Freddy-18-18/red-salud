/**
 * @file agenda-export.ts
 * @description Export utilities for agenda data: CSV, Excel (XLSX), PDF, ICS.
 */

import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { WaitingRoomEntry } from "@/lib/supabase/services/checkin-service";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface AgendaExportRow {
  fecha:         string;
  hora:          string;
  paciente:      string;
  motivo:        string | null;
  tipo_cita:     string | null;
  duracion_min:  number | null;
  duracion_real: number | null;
  estado:        string;
  precio:        number | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// CSV
// ─────────────────────────────────────────────────────────────────────────────

export function exportToCSV(rows: AgendaExportRow[], filename?: string) {
  const headers = [
    "Fecha", "Hora", "Paciente", "Motivo/Procedimiento",
    "Tipo de cita", "Duración programada (min)", "Duración real (min)",
    "Estado", "Precio",
  ];

  const escape = (v: string | number | null | undefined) => {
    if (v == null) return "";
    const s = String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const lines = [
    headers.map(escape).join(","),
    ...rows.map((r) => [
      r.fecha, r.hora, r.paciente, r.motivo ?? "", r.tipo_cita ?? "",
      r.duracion_min ?? "", r.duracion_real ?? "", r.estado, r.precio ?? "",
    ].map(escape).join(",")),
  ];

  downloadText(lines.join("\n"), filename ?? `agenda_${today()}.csv`, "text/csv;charset=utf-8;");
}

// ─────────────────────────────────────────────────────────────────────────────
// EXCEL (XLSX) — uses xlsx library if available, falls back to CSV-in-xls trick
// ─────────────────────────────────────────────────────────────────────────────

export async function exportToExcel(rows: AgendaExportRow[], filename?: string) {
  // Dynamically import xlsx to keep bundle small
  try {
    const XLSX = await import("xlsx");

    const wsData = [
      ["Fecha","Hora","Paciente","Motivo","Tipo","Duración (min)","Duración Real (min)","Estado","Precio"],
      ...rows.map((r) => [
        r.fecha, r.hora, r.paciente, r.motivo ?? "", r.tipo_cita ?? "",
        r.duracion_min, r.duracion_real, r.estado, r.precio,
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Column widths
    ws["!cols"] = [
      { wch: 12 }, { wch: 8 }, { wch: 28 }, { wch: 24 }, { wch: 14 },
      { wch: 18 }, { wch: 18 }, { wch: 14 }, { wch: 10 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Agenda");
    XLSX.writeFile(wb, filename ?? `agenda_${today()}.xlsx`);
  } catch {
    // Fallback to CSV if xlsx is not installed
    exportToCSV(rows, (filename ?? `agenda_${today()}`).replace(".xlsx", ".csv"));
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PDF — builds a simple HTML print layout and triggers browser print
// ─────────────────────────────────────────────────────────────────────────────

export function exportToPDF(rows: AgendaExportRow[], title = "Agenda de citas") {
  const tableRows = rows.map((r) => `
    <tr>
      <td>${r.fecha}</td>
      <td>${r.hora}</td>
      <td>${r.paciente}</td>
      <td>${r.motivo ?? ""}</td>
      <td>${r.tipo_cita ?? ""}</td>
      <td>${r.duracion_min ?? ""}${r.duracion_real != null ? ` (${r.duracion_real}*)` : ""}</td>
      <td><span class="badge ${r.estado}">${r.estado}</span></td>
      <td>${r.precio != null ? r.precio.toLocaleString() : ""}</td>
    </tr>`).join("");

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${title}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 11px; color: #1a1a1a; }
  h1 { font-size: 16px; margin-bottom: 4px; }
  p.sub { color: #555; font-size: 10px; margin-bottom: 12px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #f5f5f5; text-align: left; padding: 6px 8px; font-size: 10px; border-bottom: 2px solid #ddd; }
  td { padding: 5px 8px; border-bottom: 1px solid #ebebeb; vertical-align: top; }
  .badge { padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 600; text-transform: uppercase; }
  .completada { background: #d1fae5; color: #065f46; }
  .cancelada  { background: #fee2e2; color: #991b1b; }
  .no_asistio { background: #fef3c7; color: #92400e; }
  .confirmada { background: #dbeafe; color: #1e40af; }
  .pendiente  { background: #f3f4f6; color: #374151; }
  @media print { @page { margin: 1.5cm; } }
</style>
</head>
<body>
<h1>${title}</h1>
<p class="sub">Generado el ${format(new Date(), "d 'de' MMMM yyyy 'a las' HH:mm", { locale: es })} · ${rows.length} registros</p>
<table>
  <thead>
    <tr>
      <th>Fecha</th><th>Hora</th><th>Paciente</th><th>Motivo</th>
      <th>Tipo</th><th>Duración (min)</th><th>Estado</th><th>Precio</th>
    </tr>
  </thead>
  <tbody>${tableRows}</tbody>
</table>
<p style="font-size:9px;color:#999;margin-top:12px">* Duración real en paréntesis cuando disponible</p>
</body>
</html>`;

  const w = window.open("", "_blank", "width=900,height=700");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => { w.print(); }, 300);
}

// ─────────────────────────────────────────────────────────────────────────────
// ICS (Calendar export)
// ─────────────────────────────────────────────────────────────────────────────

export interface IcsAppointment {
  id:           string;
  fecha_hora:   string;
  duracion_min: number;
  summary:      string;
  description?: string;
  location?:    string;
  patient?:     string;
}

export function exportToICS(appointments: IcsAppointment[], filename?: string) {
  const formatDt = (dt: string) =>
    new Date(dt).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");

  const events = appointments
    .map((apt) => {
      const start = formatDt(apt.fecha_hora);
      const end   = formatDt(
        new Date(new Date(apt.fecha_hora).getTime() + apt.duracion_min * 60000).toISOString()
      );
      return [
        "BEGIN:VEVENT",
        `UID:${apt.id}@red-salud`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:${apt.summary}${apt.patient ? ` – ${apt.patient}` : ""}`,
        apt.description ? `DESCRIPTION:${apt.description}` : "",
        apt.location ? `LOCATION:${apt.location}` : "",
        "END:VEVENT",
      ].filter(Boolean).join("\r\n");
    })
    .join("\r\n");

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Red Salud//Agenda//ES",
    "CALSCALE:GREGORIAN",
    events,
    "END:VCALENDAR",
  ].join("\r\n");

  downloadText(ics, filename ?? `agenda_${today()}.ics`, "text/calendar;charset=utf-8");
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function downloadText(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function today(): string {
  return format(new Date(), "yyyy-MM-dd");
}

// ─────────────────────────────────────────────────────────────────────────────
// Appointment row mapper (from Supabase appointments query)
// ─────────────────────────────────────────────────────────────────────────────

export function mapAppointmentToExportRow(apt: {
  id: string;
  fecha_hora: string;
  duracion_minutos?: number | null;
  actual_duration_minutes?: number | null;
  status: string;
  motivo?: string | null;
  tipo_cita?: string | null;
  price?: number | null;
  paciente?: { nombre_completo: string } | null;
}): AgendaExportRow {
  const dt = new Date(apt.fecha_hora);
  return {
    fecha:         format(dt, "dd/MM/yyyy"),
    hora:          format(dt, "HH:mm"),
    paciente:      apt.paciente?.nombre_completo ?? "Paciente",
    motivo:        apt.motivo ?? null,
    tipo_cita:     apt.tipo_cita ?? null,
    duracion_min:  apt.duracion_minutos ?? null,
    duracion_real: apt.actual_duration_minutes ?? null,
    estado:        apt.status,
    precio:        apt.price ?? null,
  };
}
