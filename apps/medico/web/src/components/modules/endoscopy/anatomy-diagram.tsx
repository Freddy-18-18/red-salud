'use client';

import { useState, useMemo } from 'react';
import { cn } from '@red-salud/core/utils';
import type {
  EndoscopyProcedureType,
  AnatomicSegment,
  SegmentFinding,
} from './endoscopy-procedures-data';
import {
  getSegmentsForProcedure,
  SEVERITY_COLORS,
  COMMON_FINDINGS,
} from './endoscopy-procedures-data';

// ============================================================================
// TYPES
// ============================================================================

interface AnatomyDiagramProps {
  procedureType: EndoscopyProcedureType;
  findings: SegmentFinding[];
  onSegmentClick: (segmentId: string) => void;
  selectedSegment?: string | null;
  themeColor?: string;
}

// ============================================================================
// SEGMENT COORDINATE MAPS (SVG positions for each procedure type)
// ============================================================================

interface SegmentCoord {
  x: number;
  y: number;
  /** Width/height for layout — segments are rendered as rounded rects */
  w: number;
  h: number;
}

// Gastroscopy — vertical GI tract (esophagus → stomach → duodenum)
const GASTROSCOPY_COORDS: Record<string, SegmentCoord> = {
  'esophagus-upper': { x: 140, y: 20, w: 120, h: 30 },
  'esophagus-middle': { x: 140, y: 60, w: 120, h: 30 },
  'esophagus-lower': { x: 140, y: 100, w: 120, h: 30 },
  'gej': { x: 140, y: 140, w: 120, h: 28 },
  'fundus': { x: 80, y: 178, w: 100, h: 40 },
  'body': { x: 130, y: 228, w: 140, h: 50 },
  'antrum': { x: 180, y: 288, w: 120, h: 40 },
  'pylorus': { x: 200, y: 338, w: 100, h: 28 },
  'duodenal-bulb': { x: 220, y: 376, w: 120, h: 34 },
  'duodenum-d2': { x: 240, y: 420, w: 120, h: 34 },
};

// Colonoscopy — colon loop layout
const COLONOSCOPY_COORDS: Record<string, SegmentCoord> = {
  'rectum': { x: 170, y: 400, w: 100, h: 34 },
  'sigmoid': { x: 120, y: 350, w: 100, h: 34 },
  'descending': { x: 40, y: 250, w: 90, h: 70 },
  'splenic-flexure': { x: 40, y: 190, w: 110, h: 34 },
  'transverse': { x: 130, y: 150, w: 140, h: 34 },
  'hepatic-flexure': { x: 260, y: 190, w: 110, h: 34 },
  'ascending': { x: 280, y: 250, w: 90, h: 70 },
  'cecum': { x: 280, y: 340, w: 90, h: 40 },
  'terminal-ileum': { x: 280, y: 400, w: 110, h: 34 },
};

// Bronchoscopy — bronchial tree
const BRONCHOSCOPY_COORDS: Record<string, SegmentCoord> = {
  'trachea': { x: 160, y: 20, w: 80, h: 60 },
  'carina': { x: 160, y: 90, w: 80, h: 28 },
  'right-main': { x: 60, y: 130, w: 110, h: 28 },
  'right-upper-lobe': { x: 20, y: 170, w: 100, h: 28 },
  'right-middle-lobe': { x: 40, y: 210, w: 100, h: 28 },
  'right-lower-lobe': { x: 60, y: 250, w: 100, h: 28 },
  'left-main': { x: 230, y: 130, w: 110, h: 28 },
  'left-upper-lobe': { x: 280, y: 170, w: 100, h: 28 },
  'lingula': { x: 260, y: 210, w: 100, h: 28 },
  'left-lower-lobe': { x: 240, y: 250, w: 100, h: 28 },
};

// ERCP — biliary/pancreatic tree
const ERCP_COORDS: Record<string, SegmentCoord> = {
  'ampulla': { x: 160, y: 380, w: 120, h: 28 },
  'cbd-distal': { x: 160, y: 330, w: 120, h: 28 },
  'cbd-mid': { x: 160, y: 280, w: 120, h: 28 },
  'cbd-proximal': { x: 160, y: 230, w: 120, h: 28 },
  'chd': { x: 160, y: 180, w: 120, h: 28 },
  'right-hepatic': { x: 60, y: 130, w: 130, h: 28 },
  'left-hepatic': { x: 230, y: 130, w: 130, h: 28 },
  'cystic-duct': { x: 50, y: 230, w: 100, h: 28 },
  'pancreatic-duct': { x: 250, y: 340, w: 130, h: 28 },
};

function getCoordsForProcedure(
  type: EndoscopyProcedureType,
): Record<string, SegmentCoord> | null {
  switch (type) {
    case 'gastroscopy': return GASTROSCOPY_COORDS;
    case 'colonoscopy': return COLONOSCOPY_COORDS;
    case 'bronchoscopy': return BRONCHOSCOPY_COORDS;
    case 'ercp': return ERCP_COORDS;
    default: return null;
  }
}

// ============================================================================
// FINDING MARKER
// ============================================================================

function FindingMarker({
  x,
  y,
  count,
  severity,
}: {
  x: number;
  y: number;
  count: number;
  severity: string;
}) {
  const color = SEVERITY_COLORS[severity] ?? '#F59E0B';
  return (
    <g>
      <circle cx={x} cy={y} r={8} fill={color} opacity={0.9} />
      <text
        x={x}
        y={y + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontSize={9}
        fontWeight="bold"
      >
        {count}
      </text>
    </g>
  );
}

// ============================================================================
// SVG DIAGRAM COMPONENT
// ============================================================================

function SvgDiagram({
  procedureType,
  segments,
  coords,
  findings,
  onSegmentClick,
  selectedSegment,
  themeColor,
}: {
  procedureType: EndoscopyProcedureType;
  segments: AnatomicSegment[];
  coords: Record<string, SegmentCoord>;
  findings: SegmentFinding[];
  onSegmentClick: (segmentId: string) => void;
  selectedSegment?: string | null;
  themeColor: string;
}) {
  // Count findings per segment and max severity
  const segmentFindingMap = useMemo(() => {
    const map: Record<string, { count: number; maxSeverity: string }> = {};
    for (const f of findings) {
      if (!map[f.segmentId]) {
        map[f.segmentId] = { count: 0, maxSeverity: 'low' };
      }
      map[f.segmentId].count++;
      const def = COMMON_FINDINGS.find((cf) => cf.id === f.findingId);
      if (def) {
        const severityOrder = { low: 0, moderate: 1, high: 2 };
        const current = severityOrder[map[f.segmentId].maxSeverity as keyof typeof severityOrder] ?? 0;
        const incoming = severityOrder[def.severity] ?? 0;
        if (incoming > current) {
          map[f.segmentId].maxSeverity = def.severity;
        }
      }
    }
    return map;
  }, [findings]);

  return (
    <svg viewBox="0 0 400 470" className="w-full max-w-md mx-auto">
      {/* Connection lines for anatomy */}
      {procedureType === 'gastroscopy' && (
        <g stroke="#E5E7EB" strokeWidth={2} fill="none">
          <path d="M200 50 L200 140" />
          <path d="M200 140 C200 160, 130 165, 130 198" />
          <path d="M130 218 C130 240, 200 248, 200 253" />
          <path d="M200 278 L240 308" />
          <path d="M250 338 L280 376" />
          <path d="M280 410 L300 437" />
        </g>
      )}
      {procedureType === 'colonoscopy' && (
        <g stroke="#E5E7EB" strokeWidth={2} fill="none">
          <path d="M220 417 C170 395, 150 370, 170 367" />
          <path d="M120 367 C60 340, 85 320, 85 285" />
          <path d="M85 250 C85 210, 95 207, 95 207" />
          <path d="M150 207 L270 207" />
          <path d="M370 207 C370 250, 325 250, 325 285" />
          <path d="M325 320 L325 360" />
          <path d="M325 380 L335 417" />
        </g>
      )}
      {procedureType === 'bronchoscopy' && (
        <g stroke="#E5E7EB" strokeWidth={2} fill="none">
          <path d="M200 80 L200 90" />
          <path d="M160 104 L115 130" />
          <path d="M240 104 L285 130" />
          <path d="M70 158 L70 170" />
          <path d="M90 158 L90 210" />
          <path d="M110 158 L110 250" />
          <path d="M330 158 L330 170" />
          <path d="M310 158 L310 210" />
          <path d="M290 158 L290 250" />
        </g>
      )}

      {/* Segment rectangles */}
      {segments.map((seg) => {
        const coord = coords[seg.id];
        if (!coord) return null;

        const isSelected = selectedSegment === seg.id;
        const hasFindings = !!segmentFindingMap[seg.id];

        return (
          <g
            key={seg.id}
            onClick={() => onSegmentClick(seg.id)}
            className="cursor-pointer"
          >
            <rect
              x={coord.x}
              y={coord.y}
              width={coord.w}
              height={coord.h}
              rx={6}
              ry={6}
              fill={
                isSelected
                  ? `${themeColor}20`
                  : hasFindings
                    ? `${SEVERITY_COLORS[segmentFindingMap[seg.id].maxSeverity] ?? themeColor}10`
                    : '#F9FAFB'
              }
              stroke={
                isSelected
                  ? themeColor
                  : hasFindings
                    ? SEVERITY_COLORS[segmentFindingMap[seg.id].maxSeverity] ?? '#D1D5DB'
                    : '#E5E7EB'
              }
              strokeWidth={isSelected ? 2 : 1}
            />
            <text
              x={coord.x + coord.w / 2}
              y={coord.y + coord.h / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={isSelected ? themeColor : '#374151'}
              fontSize={10}
              fontWeight={isSelected ? 600 : 400}
              className="pointer-events-none select-none"
            >
              {seg.label.length > 18
                ? `${seg.label.substring(0, 16)}...`
                : seg.label}
            </text>

            {/* Finding count markers */}
            {segmentFindingMap[seg.id] && (
              <FindingMarker
                x={coord.x + coord.w - 4}
                y={coord.y + 4}
                count={segmentFindingMap[seg.id].count}
                severity={segmentFindingMap[seg.id].maxSeverity}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ============================================================================
// LIST-BASED DIAGRAM (for procedures without SVG map)
// ============================================================================

function ListDiagram({
  segments,
  findings,
  onSegmentClick,
  selectedSegment,
  themeColor,
}: {
  segments: AnatomicSegment[];
  findings: SegmentFinding[];
  onSegmentClick: (segmentId: string) => void;
  selectedSegment?: string | null;
  themeColor: string;
}) {
  // Group segments
  const grouped = useMemo(() => {
    const groups: Record<string, AnatomicSegment[]> = {};
    for (const seg of segments) {
      const group = seg.group ?? 'General';
      if (!groups[group]) groups[group] = [];
      groups[group].push(seg);
    }
    return groups;
  }, [segments]);

  const findingCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const f of findings) {
      counts[f.segmentId] = (counts[f.segmentId] ?? 0) + 1;
    }
    return counts;
  }, [findings]);

  return (
    <div className="space-y-3">
      {Object.entries(grouped).map(([groupName, segs]) => (
        <div key={groupName}>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            {groupName}
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {segs.map((seg) => {
              const isSelected = selectedSegment === seg.id;
              const count = findingCounts[seg.id] ?? 0;

              return (
                <button
                  key={seg.id}
                  type="button"
                  onClick={() => onSegmentClick(seg.id)}
                  className={cn(
                    'flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-xs transition-colors text-left',
                    isSelected
                      ? 'border-2 font-medium'
                      : 'border-gray-200 hover:bg-gray-50',
                  )}
                  style={
                    isSelected
                      ? { borderColor: themeColor, backgroundColor: `${themeColor}08`, color: themeColor }
                      : undefined
                  }
                >
                  <span className={cn(!isSelected && 'text-gray-700')}>
                    {seg.label}
                  </span>
                  {count > 0 && (
                    <span
                      className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ backgroundColor: themeColor }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AnatomyDiagram({
  procedureType,
  findings,
  onSegmentClick,
  selectedSegment,
  themeColor = '#3B82F6',
}: AnatomyDiagramProps) {
  const segments = useMemo(() => getSegmentsForProcedure(procedureType), [procedureType]);
  const coords = useMemo(() => getCoordsForProcedure(procedureType), [procedureType]);

  // If we have SVG coordinates, render SVG; otherwise, list-based diagram
  if (coords) {
    return (
      <div className="space-y-2">
        <SvgDiagram
          procedureType={procedureType}
          segments={segments}
          coords={coords}
          findings={findings}
          onSegmentClick={onSegmentClick}
          selectedSegment={selectedSegment}
          themeColor={themeColor}
        />
        <div className="flex items-center justify-center gap-4 text-[10px] text-gray-400">
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Leve
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            Moderado
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            Severo
          </span>
        </div>
      </div>
    );
  }

  return (
    <ListDiagram
      segments={segments}
      findings={findings}
      onSegmentClick={onSegmentClick}
      selectedSegment={selectedSegment}
      themeColor={themeColor}
    />
  );
}
