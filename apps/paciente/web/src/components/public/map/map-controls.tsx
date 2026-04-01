'use client';

import { Search } from 'lucide-react';

interface MapControlsProps {
  onSearchArea?: () => void;
  isLoading?: boolean;
}

/**
 * Optional floating controls for the map view.
 * Currently provides a "Buscar en esta zona" button.
 */
export function MapControls({ onSearchArea, isLoading }: MapControlsProps) {
  if (!onSearchArea) return null;

  return (
    <div className="pointer-events-none absolute left-0 right-0 top-4 z-10 flex justify-center">
      <button
        type="button"
        onClick={onSearchArea}
        disabled={isLoading}
        className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2 text-sm font-medium text-[hsl(var(--card-foreground))] shadow-md transition-colors hover:bg-[hsl(var(--muted))] disabled:opacity-50"
      >
        <Search className="h-4 w-4" />
        {isLoading ? 'Buscando...' : 'Buscar en esta zona'}
      </button>
    </div>
  );
}
