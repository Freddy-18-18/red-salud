// TODO: Implement medication search hooks
// This is a stub to allow the app to compile.

import { useState } from 'react';

interface MedicationResult {
  id: string;
  nombre: string;
  nombreComercial: string[];
  principioActivo?: string;
  presentacion?: string;
  categoria?: string;
}

interface UseMedicationSearchOptions {
  maxResults?: number;
}

export function useMedicationSearch(_options?: UseMedicationSearchOptions) {
  const [query, setQuery] = useState('');
  const [results] = useState<MedicationResult[]>([]);
  const [isSearching] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<MedicationResult | null>(null);

  const selectMedication = (med: MedicationResult) => {
    setSelectedMedication(med);
  };

  const clearSelection = () => {
    setSelectedMedication(null);
    setQuery('');
  };

  return {
    query,
    setQuery,
    results,
    isSearching,
    selectedMedication,
    selectMedication,
    clearSelection,
  };
}

export function useMedicationDetails(_medicationId: string | null) {
  return {
    dosisComunes: [] as string[],
    presentaciones: [] as string[],
    frecuenciasComunes: [] as string[],
  };
}
