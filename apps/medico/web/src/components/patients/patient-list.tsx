'use client';

import { useState, useMemo, useCallback } from 'react';
import { EmptyState } from '@red-salud/design-system';
import {
  Search,
  ChevronRight,
  Calendar,
  Phone,
  User,
  SortAsc,
  SortDesc,
} from 'lucide-react';
import type { PatientSummary } from '@red-salud/types';

// Re-export for legacy callers — removed in T-2-36 (Batch P2 cleanup).
export type { PatientSummary } from '@red-salud/types';

interface PatientListProps {
  patients: PatientSummary[];
  isLoading?: boolean;
  onSelect: (patientId: string) => void;
}

type SortField = 'full_name' | 'last_visit_at' | 'total_visits';

function calculateAge(dob: string | null): string {
  if (!dob) return '--';
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return `${age} años`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '--';
  return new Date(dateStr).toLocaleDateString('es-VE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'America/Caracas',
  });
}

function PatientRowSkeleton() {
  return (
    <div
      data-testid="patient-row-skeleton"
      className="flex items-center gap-4 p-4 border-b border-border/50 animate-pulse"
    >
      <div className="h-10 w-10 bg-muted rounded-full" />
      <div className="flex-1">
        <div className="h-4 w-40 bg-muted rounded" />
        <div className="h-3 w-24 bg-muted rounded mt-2" />
      </div>
      <div className="h-3 w-20 bg-muted rounded" />
      <div className="h-3 w-20 bg-muted rounded" />
    </div>
  );
}

export function PatientList({
  patients,
  isLoading = false,
  onSelect,
}: PatientListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('full_name');
  const [sortAsc, setSortAsc] = useState(true);

  const toggleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortAsc((prev) => !prev);
      } else {
        setSortField(field);
        setSortAsc(true);
      }
    },
    [sortField],
  );

  const filteredPatients = useMemo(() => {
    let result = [...patients];

    if (searchQuery.trim()) {
      const norm = (s: string) =>
        s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
      const q = norm(searchQuery);
      result = result.filter(
        (p) =>
          norm(p.full_name).includes(q) ||
          (p.national_id && norm(p.national_id).includes(q)) ||
          (p.phone && p.phone.includes(q)),
      );
    }

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'full_name':
          comparison = a.full_name.localeCompare(b.full_name);
          break;
        case 'last_visit_at':
          comparison = (a.last_visit_at ?? '').localeCompare(
            b.last_visit_at ?? '',
          );
          break;
        case 'total_visits':
          comparison = a.total_visits - b.total_visits;
          break;
      }
      return sortAsc ? comparison : -comparison;
    });

    return result;
  }, [patients, searchQuery, sortField, sortAsc]);

  const SortIcon = sortAsc ? SortAsc : SortDesc;

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, cédula o teléfono..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent placeholder:text-muted-foreground/70"
          />
        </div>
      </div>

      <div className="hidden md:flex items-center gap-4 px-4 py-2.5 bg-muted text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
        <div className="w-10" />
        <button
          onClick={() => toggleSort('full_name')}
          className="flex-1 flex items-center gap-1 hover:text-foreground transition-colors"
        >
          Paciente{' '}
          {sortField === 'full_name' && <SortIcon className="h-3 w-3" />}
        </button>
        <div className="w-24">Edad</div>
        <button
          onClick={() => toggleSort('last_visit_at')}
          className="w-28 flex items-center gap-1 hover:text-foreground transition-colors"
        >
          Última visita{' '}
          {sortField === 'last_visit_at' && <SortIcon className="h-3 w-3" />}
        </button>
        <div className="w-28">Próxima cita</div>
        <button
          onClick={() => toggleSort('total_visits')}
          className="w-20 flex items-center gap-1 hover:text-foreground transition-colors text-right"
        >
          Consultas{' '}
          {sortField === 'total_visits' && <SortIcon className="h-3 w-3" />}
        </button>
        <div className="w-8" />
      </div>

      <div className="divide-y divide-border/50">
        {isLoading ? (
          <>
            <PatientRowSkeleton />
            <PatientRowSkeleton />
            <PatientRowSkeleton />
            <PatientRowSkeleton />
            <PatientRowSkeleton />
          </>
        ) : filteredPatients.length === 0 ? (
          <EmptyState
            icon={User}
            title={searchQuery ? 'Sin resultados' : 'Aún no tenés pacientes'}
            description={
              searchQuery
                ? `No encontramos pacientes para "${searchQuery}". Probá con otro término.`
                : 'Cuando un paciente reserve su primera cita, vas a verlo acá.'
            }
            size="compact"
            className="border-0 rounded-none"
          />
        ) : (
          filteredPatients.map((patient) => (
            <button
              key={patient.id}
              onClick={() => onSelect(patient.id)}
              className="w-full flex items-center gap-4 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
            >
              <div className="h-10 w-10 rounded-full flex items-center justify-center bg-primary text-primary-foreground text-sm font-bold flex-shrink-0">
                {patient.avatar_url ? (
                  <img
                    src={patient.avatar_url}
                    alt={patient.full_name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  patient.full_name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {patient.full_name}
                </p>
                <div className="flex items-center gap-3 mt-0.5">
                  {patient.national_id && (
                    <span className="text-xs text-muted-foreground/70">
                      CI: {patient.national_id}
                    </span>
                  )}
                  {patient.phone && (
                    <span className="hidden md:flex items-center gap-1 text-xs text-muted-foreground/70">
                      <Phone className="h-3 w-3" /> {patient.phone}
                    </span>
                  )}
                </div>
              </div>

              <div className="hidden md:block w-24 text-sm text-muted-foreground">
                {calculateAge(patient.date_of_birth)}
              </div>

              <div className="hidden md:flex items-center gap-1 w-28 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {formatDate(patient.last_visit_at)}
              </div>

              <div className="hidden md:block w-28 text-xs text-muted-foreground">
                {formatDate(patient.next_appointment_at)}
              </div>

              <div className="hidden md:block w-20 text-sm font-medium text-foreground text-right">
                {patient.total_visits}
              </div>

              <ChevronRight className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
            </button>
          ))
        )}
      </div>

      {!isLoading && filteredPatients.length > 0 && (
        <div className="px-4 py-2.5 bg-muted border-t border-border text-xs text-muted-foreground">
          {filteredPatients.length} paciente
          {filteredPatients.length !== 1 ? 's' : ''}
          {searchQuery && ` (filtrados de ${patients.length})`}
        </div>
      )}
    </div>
  );
}
