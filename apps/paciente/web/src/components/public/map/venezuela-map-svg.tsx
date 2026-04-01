'use client';

import { useState, useCallback, useRef, type MouseEvent } from 'react';

import { VENEZUELA_SVG_PATHS, VENEZUELA_VIEWBOX } from '@/lib/data/venezuela-svg-paths';
import type { StateMapData } from '@/lib/types/public';

interface VenezuelaMapSVGProps {
  stateData: StateMapData[];
  selectedState?: string | null;
  onStateClick?: (stateName: string) => void;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  stateName: string;
  doctorCount: number;
}

/**
 * Compute a fill color based on doctor count relative to the max.
 * Gradient from muted gray (0 doctors) to emerald-500 (max doctors).
 */
function getDensityColor(count: number, maxCount: number): string {
  if (maxCount === 0 || count === 0) {
    return 'hsl(var(--muted))';
  }

  const ratio = count / maxCount;

  if (ratio < 0.1) return 'hsl(var(--muted))';
  if (ratio < 0.25) return 'hsl(160, 30%, 75%)';
  if (ratio < 0.5) return 'hsl(160, 50%, 60%)';
  if (ratio < 0.75) return 'hsl(160, 70%, 48%)';
  return 'hsl(160, 84%, 39%)';
}

export function VenezuelaMapSVG({ stateData, selectedState, onStateClick }: VenezuelaMapSVGProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    stateName: '',
    doctorCount: 0,
  });

  // Build a lookup map: stateName -> doctorCount
  const countMap = new Map<string, number>();
  stateData.forEach((s) => countMap.set(s.stateName, s.doctorCount));

  // Also try matching by normalized name (without accents)
  const normalizedCountMap = new Map<string, number>();
  stateData.forEach((s) => {
    const normalized = s.stateName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
    normalizedCountMap.set(normalized, s.doctorCount);
  });

  const maxCount = stateData.reduce((max, s) => Math.max(max, s.doctorCount), 0);

  const getCount = useCallback(
    (stateName: string): number => {
      if (countMap.has(stateName)) return countMap.get(stateName)!;

      const normalized = stateName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
      return normalizedCountMap.get(normalized) ?? 0;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stateData],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent<SVGPathElement>, stateName: string) => {
      if (!svgRef.current) return;

      const svgRect = svgRef.current.getBoundingClientRect();
      const x = e.clientX - svgRect.left;
      const y = e.clientY - svgRect.top;

      setTooltip({
        visible: true,
        x,
        y,
        stateName,
        doctorCount: getCount(stateName),
      });
    },
    [getCount],
  );

  const handleMouseEnter = useCallback((stateName: string) => {
    setHoveredState(stateName);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredState(null);
    setTooltip((prev) => ({ ...prev, visible: false }));
  }, []);

  const handleClick = useCallback(
    (stateName: string) => {
      if (onStateClick) {
        onStateClick(stateName);
      }
    },
    [onStateClick],
  );

  return (
    <div className="relative w-full">
      <svg
        ref={svgRef}
        viewBox={VENEZUELA_VIEWBOX}
        className="w-full h-auto"
        role="img"
        aria-label="Mapa interactivo de Venezuela mostrando doctores por estado"
      >
        {Object.entries(VENEZUELA_SVG_PATHS).map(([stateName, pathData]) => {
          const count = getCount(stateName);
          const isHovered = hoveredState === stateName;
          const isSelected = selectedState === stateName;
          const fillColor = getDensityColor(count, maxCount);

          // Selected state: bright emerald fill
          // Hovered state: slightly brighter than density color
          let currentFill = fillColor;
          if (isSelected) {
            currentFill = 'hsl(160, 84%, 45%)';
          } else if (isHovered) {
            currentFill = count > 0 ? 'hsl(160, 80%, 50%)' : 'hsl(160, 30%, 80%)';
          }

          let strokeColor = 'hsl(var(--border))';
          let strokeWidth = 1;
          if (isSelected) {
            strokeColor = 'hsl(160, 84%, 30%)';
            strokeWidth = 3;
          } else if (isHovered) {
            strokeColor = 'hsl(160, 84%, 39%)';
            strokeWidth = 2;
          }

          return (
            <path
              key={stateName}
              d={pathData.d}
              fill={currentFill}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              className="cursor-pointer transition-all duration-200"
              style={{
                paintOrder: isSelected ? 'stroke' : undefined,
              }}
              onMouseEnter={() => handleMouseEnter(stateName)}
              onMouseMove={(e) => handleMouseMove(e, stateName)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleClick(stateName)}
              role="button"
              tabIndex={0}
              aria-label={`${stateName}: ${count} doctores${isSelected ? ' (seleccionado)' : ''}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleClick(stateName);
                }
              }}
            />
          );
        })}
      </svg>

      {/* Tooltip */}
      {tooltip.visible && (
        <div
          className="pointer-events-none absolute z-10 rounded-lg px-3 py-2 text-sm shadow-lg"
          style={{
            left: tooltip.x + 12,
            top: tooltip.y - 40,
            backgroundColor: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
            border: '1px solid hsl(var(--border))',
          }}
        >
          <p className="font-semibold">{tooltip.stateName}</p>
          <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
            {tooltip.doctorCount === 0
              ? 'Sin doctores registrados'
              : `${tooltip.doctorCount} ${tooltip.doctorCount === 1 ? 'doctor' : 'doctores'}`}
          </p>
        </div>
      )}
    </div>
  );
}
