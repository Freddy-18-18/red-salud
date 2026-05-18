import type { Appointment } from './agenda-shared';

/**
 * Devuelve el Set de appointment IDs que se superponen con AL MENOS otro
 * appointment activo del mismo día. Usado para marcar visualmente citas en
 * conflicto (badge rojo / ring).
 *
 * Status que NO bloquean: `cancelled`, `no_show` (no cuentan como ocupación).
 *
 * Algoritmo: sweep-line — O(n log n) por el sort + O(n·k) en el sweep donde
 * `k` es el tamaño del active-set en el peor momento (típicamente <5). La
 * versión naive era O(n²), que con 50+ citas/día se nota en re-renders.
 */
export function detectOverlapIds(dayAppts: Appointment[]): Set<string> {
  const overlaps = new Set<string>();

  const intervals = dayAppts
    .filter((a) => a.status !== 'cancelled' && a.status !== 'no_show')
    .map((a) => {
      const start = new Date(a.scheduled_at).getTime();
      const end = start + (a.duration_minutes || 30) * 60_000;
      return { id: a.id, start, end };
    });

  if (intervals.length < 2) return overlaps;

  intervals.sort((a, b) => a.start - b.start);

  const active: Array<{ id: string; end: number }> = [];

  for (const apt of intervals) {
    for (let i = active.length - 1; i >= 0; i--) {
      if (active[i].end <= apt.start) active.splice(i, 1);
    }

    if (active.length > 0) {
      overlaps.add(apt.id);
      for (const other of active) overlaps.add(other.id);
    }

    active.push({ id: apt.id, end: apt.end });
  }

  return overlaps;
}
