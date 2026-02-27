/**
 * Provider de contexto para el scope de clínica
 * 
 * Maneja la clínica y sedes activas seleccionadas
 */

'use client';

import React, { createContext, useContext, useState } from 'react';
import type { Clinic, ClinicLocation } from '@red-salud/types';

interface ClinicScopeContextValue {
  selectedClinicId: string | null;
  selectedLocationIds: string[];
  currentClinic: Clinic | null;
  currentLocations: ClinicLocation[];
  setSelectedClinicId: (clinicId: string | null) => void;
  setSelectedLocationIds: (locationIds: string[]) => void;
  setCurrentClinic: (clinic: Clinic | null) => void;
  setCurrentLocations: (locations: ClinicLocation[]) => void;
  selectAllLocations: () => void;
  selectMainLocation: () => void;
}

const ClinicScopeContext = createContext<ClinicScopeContextValue | undefined>(
  undefined
);

export function ClinicScopeProvider({ children }: { children: React.ReactNode }) {
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>([]);
  const [currentClinic, setCurrentClinic] = useState<Clinic | null>(null);
  const [currentLocations, setCurrentLocations] = useState<ClinicLocation[]>([]);

  // Auto-seleccionar todas las sedes cuando cambia la clínica
  // useEffect removed to prevent cascading renders

  const handleSetCurrentLocations = (locations: ClinicLocation[]) => {
    setCurrentLocations(locations);
    // Si hay locaciones y ninguna seleccionada, seleccionar todas por defecto
    if (locations.length > 0 && selectedLocationIds.length === 0) {
      setSelectedLocationIds(locations.map((l) => l.id));
    }
  };

  const selectAllLocations = () => {
    setSelectedLocationIds(currentLocations.map((l) => l.id));
  };

  const selectMainLocation = () => {
    const mainLocation = currentLocations.find((l) => l.is_main);
    if (mainLocation) {
      setSelectedLocationIds([mainLocation.id]);
    } else if (currentLocations.length > 0 && currentLocations[0]) {
      setSelectedLocationIds([currentLocations[0].id]);
    }
  };

  const value: ClinicScopeContextValue = {
    selectedClinicId,
    selectedLocationIds,
    currentClinic,
    currentLocations,
    setSelectedClinicId,
    setSelectedLocationIds,
    setCurrentClinic,
    setCurrentLocations: handleSetCurrentLocations,
    selectAllLocations,
    selectMainLocation,
  };

  return (
    <ClinicScopeContext.Provider value={value}>
      {children}
    </ClinicScopeContext.Provider>
  );
}

export function useClinicScope() {
  const context = useContext(ClinicScopeContext);
  if (context === undefined) {
    throw new Error('useClinicScope must be used within ClinicScopeProvider');
  }
  return context;
}
