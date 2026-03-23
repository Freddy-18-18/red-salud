'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Search,
  ChevronRight,
  Calendar,
  Phone,
  User,
  SortAsc,
  SortDesc,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface PatientSummary {
  id: string;
  nombre_completo: string;
  cedula: string | null;
  telefono: string | null;
  fecha_nacimiento: string | null;
  avatar_url: string | null;
  ultima_visita: string | null;
  proxima_cita: string | null;
  total_consultas: number;
}

interface PatientListProps {
  patients: PatientSummary[];
  isLoading?: boolean;
  onSelect: (patientId: string) => void;
  themeColor?: string;
}

type SortField = 'nombre_completo' | 'ultima_visita' | 'total_consultas';

// ============================================================================
// HELPERS
// ============================================================================

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
  });
}

// ============================================================================
// LOADING SKELETON
// ============================================================================

function PatientRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-gray-100 animate-pulse">
      <div className="h-10 w-10 bg-gray-200 rounded-full" />
      <div className="flex-1">
        <div className="h-4 w-40 bg-gray-200 rounded" />
        <div className="h-3 w-24 bg-gray-100 rounded mt-2" />
      </div>
      <div className="h-3 w-20 bg-gray-100 rounded" />
      <div className="h-3 w-20 bg-gray-100 rounded" />
    </div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export function PatientList({
  patients,
  isLoading = false,
  onSelect,
  themeColor = '#3B82F6',
}: PatientListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('nombre_completo');
  const [sortAsc, setSortAsc] = useState(true);

  const toggleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortAsc((prev) => !prev);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  }, [sortField]);

  const filteredPatients = useMemo(() => {
    let result = [...patients];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.nombre_completo.toLowerCase().includes(q) ||
          (p.cedula && p.cedula.includes(q)) ||
          (p.telefono && p.telefono.includes(q)),
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'nombre_completo':
          comparison = a.nombre_completo.localeCompare(b.nombre_completo);
          break;
        case 'ultima_visita':
          comparison = (a.ultima_visita ?? '').localeCompare(b.ultima_visita ?? '');
          break;
        case 'total_consultas':
          comparison = a.total_consultas - b.total_consultas;
          break;
      }
      return sortAsc ? comparison : -comparison;
    });

    return result;
  }, [patients, searchQuery, sortField, sortAsc]);

  const SortIcon = sortAsc ? SortAsc : SortDesc;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Search bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, cédula o teléfono..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:border-transparent placeholder:text-gray-300"
            style={{ '--tw-ring-color': `${themeColor}40` } as React.CSSProperties}
          />
        </div>
      </div>

      {/* Table header */}
      <div className="hidden md:flex items-center gap-4 px-4 py-2.5 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
        <div className="w-10" /> {/* Avatar space */}
        <button
          onClick={() => toggleSort('nombre_completo')}
          className="flex-1 flex items-center gap-1 hover:text-gray-700 transition-colors"
        >
          Paciente {sortField === 'nombre_completo' && <SortIcon className="h-3 w-3" />}
        </button>
        <div className="w-24">Edad</div>
        <button
          onClick={() => toggleSort('ultima_visita')}
          className="w-28 flex items-center gap-1 hover:text-gray-700 transition-colors"
        >
          Última visita {sortField === 'ultima_visita' && <SortIcon className="h-3 w-3" />}
        </button>
        <div className="w-28">Próxima cita</div>
        <button
          onClick={() => toggleSort('total_consultas')}
          className="w-20 flex items-center gap-1 hover:text-gray-700 transition-colors text-right"
        >
          Consultas {sortField === 'total_consultas' && <SortIcon className="h-3 w-3" />}
        </button>
        <div className="w-8" /> {/* Arrow space */}
      </div>

      {/* Patient rows */}
      <div className="divide-y divide-gray-100">
        {isLoading ? (
          <>
            <PatientRowSkeleton />
            <PatientRowSkeleton />
            <PatientRowSkeleton />
            <PatientRowSkeleton />
            <PatientRowSkeleton />
          </>
        ) : filteredPatients.length === 0 ? (
          <div className="p-8 text-center">
            <User className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">
              {searchQuery ? 'Sin resultados' : 'Sin pacientes registrados'}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {searchQuery
                ? `No se encontraron pacientes para "${searchQuery}"`
                : 'Los pacientes aparecerán aquí después de su primera cita'}
            </p>
          </div>
        ) : (
          filteredPatients.map((patient) => (
            <button
              key={patient.id}
              onClick={() => onSelect(patient.id)}
              className="w-full flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
            >
              {/* Avatar */}
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ backgroundColor: themeColor }}
              >
                {patient.avatar_url ? (
                  <img
                    src={patient.avatar_url}
                    alt={patient.nombre_completo}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  patient.nombre_completo.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                )}
              </div>

              {/* Name + contact */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {patient.nombre_completo}
                </p>
                <div className="flex items-center gap-3 mt-0.5">
                  {patient.cedula && (
                    <span className="text-xs text-gray-400">CI: {patient.cedula}</span>
                  )}
                  {patient.telefono && (
                    <span className="hidden md:flex items-center gap-1 text-xs text-gray-400">
                      <Phone className="h-3 w-3" /> {patient.telefono}
                    </span>
                  )}
                </div>
              </div>

              {/* Age */}
              <div className="hidden md:block w-24 text-sm text-gray-600">
                {calculateAge(patient.fecha_nacimiento)}
              </div>

              {/* Last visit */}
              <div className="hidden md:flex items-center gap-1 w-28 text-xs text-gray-500">
                <Calendar className="h-3 w-3" />
                {formatDate(patient.ultima_visita)}
              </div>

              {/* Next appointment */}
              <div className="hidden md:block w-28 text-xs text-gray-500">
                {formatDate(patient.proxima_cita)}
              </div>

              {/* Total consultations */}
              <div className="hidden md:block w-20 text-sm font-medium text-gray-700 text-right">
                {patient.total_consultas}
              </div>

              {/* Arrow */}
              <ChevronRight className="h-4 w-4 text-gray-300 flex-shrink-0" />
            </button>
          ))
        )}
      </div>

      {/* Footer: Count */}
      {!isLoading && filteredPatients.length > 0 && (
        <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
          {filteredPatients.length} paciente{filteredPatients.length !== 1 ? 's' : ''}
          {searchQuery && ` (filtrados de ${patients.length})`}
        </div>
      )}
    </div>
  );
}
