'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import { RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '@red-salud/core/utils';
import {
  BODY_REGION_LABELS,
  type LesionRecord,
  type BodyView,
  type BodyRegion,
  type MalignancyRisk,
} from './use-dermatology';

// ============================================================================
// CONSTANTS
// ============================================================================

const RISK_COLORS: Record<MalignancyRisk, string> = {
  low: '#22C55E',
  moderate: '#EAB308',
  high: '#EF4444',
  confirmed: '#1A1A1A',
};

const RISK_LABELS: Record<MalignancyRisk, string> = {
  low: 'Bajo',
  moderate: 'Moderado',
  high: 'Alto',
  confirmed: 'Confirmado',
};

/** SVG viewBox dimensions for the body silhouette */
const SVG_WIDTH = 300;
const SVG_HEIGHT = 700;

/**
 * Body region bounding boxes for click detection.
 * Coordinates in SVG viewBox space (300x700).
 */
const FRONT_REGIONS: Array<{
  region: BodyRegion;
  x: number;
  y: number;
  w: number;
  h: number;
}> = [
  { region: 'head', x: 118, y: 10, w: 64, h: 50 },
  { region: 'face', x: 118, y: 35, w: 64, h: 40 },
  { region: 'neck', x: 128, y: 75, w: 44, h: 25 },
  { region: 'chest', x: 100, y: 100, w: 100, h: 90 },
  { region: 'abdomen', x: 105, y: 190, w: 90, h: 85 },
  { region: 'left_arm', x: 52, y: 110, w: 48, h: 160 },
  { region: 'right_arm', x: 200, y: 110, w: 48, h: 160 },
  { region: 'left_hand', x: 40, y: 270, w: 35, h: 50 },
  { region: 'right_hand', x: 225, y: 270, w: 35, h: 50 },
  { region: 'genitals', x: 120, y: 275, w: 60, h: 40 },
  { region: 'left_leg', x: 100, y: 315, w: 50, h: 240 },
  { region: 'right_leg', x: 150, y: 315, w: 50, h: 240 },
  { region: 'left_foot', x: 90, y: 555, w: 50, h: 40 },
  { region: 'right_foot', x: 160, y: 555, w: 50, h: 40 },
];

const BACK_REGIONS: Array<{
  region: BodyRegion;
  x: number;
  y: number;
  w: number;
  h: number;
}> = [
  { region: 'head', x: 118, y: 10, w: 64, h: 65 },
  { region: 'neck', x: 128, y: 75, w: 44, h: 25 },
  { region: 'upper_back', x: 100, y: 100, w: 100, h: 90 },
  { region: 'lower_back', x: 105, y: 190, w: 90, h: 85 },
  { region: 'left_arm', x: 52, y: 110, w: 48, h: 160 },
  { region: 'right_arm', x: 200, y: 110, w: 48, h: 160 },
  { region: 'left_hand', x: 40, y: 270, w: 35, h: 50 },
  { region: 'right_hand', x: 225, y: 270, w: 35, h: 50 },
  { region: 'left_leg', x: 100, y: 315, w: 50, h: 240 },
  { region: 'right_leg', x: 150, y: 315, w: 50, h: 240 },
  { region: 'left_foot', x: 90, y: 555, w: 50, h: 40 },
  { region: 'right_foot', x: 160, y: 555, w: 50, h: 40 },
];

// ============================================================================
// ZOOMED REGION VIEWS
// ============================================================================

/**
 * Zoomed view configurations: viewBox crop for each region.
 * When user clicks a region header, we zoom into that area.
 */
const ZOOM_VIEWBOXES: Partial<Record<BodyRegion, { x: number; y: number; w: number; h: number }>> = {
  head: { x: 100, y: 0, w: 100, h: 100 },
  face: { x: 100, y: 20, w: 100, h: 80 },
  neck: { x: 110, y: 65, w: 80, h: 50 },
  chest: { x: 85, y: 90, w: 130, h: 110 },
  abdomen: { x: 90, y: 175, w: 120, h: 110 },
  upper_back: { x: 85, y: 90, w: 130, h: 110 },
  lower_back: { x: 90, y: 175, w: 120, h: 110 },
  left_arm: { x: 30, y: 100, w: 80, h: 200 },
  right_arm: { x: 190, y: 100, w: 80, h: 200 },
  left_hand: { x: 25, y: 255, w: 65, h: 80 },
  right_hand: { x: 210, y: 255, w: 65, h: 80 },
  left_leg: { x: 80, y: 300, w: 90, h: 270 },
  right_leg: { x: 130, y: 300, w: 90, h: 270 },
  left_foot: { x: 75, y: 540, w: 80, h: 70 },
  right_foot: { x: 145, y: 540, w: 80, h: 70 },
};

// ============================================================================
// BODY SVG PATHS
// ============================================================================

/** Gender-neutral front body silhouette outline */
const FRONT_BODY_PATH = `
  M 150 15
  C 130 15, 120 30, 120 45
  C 120 60, 130 72, 150 72
  C 170 72, 180 60, 180 45
  C 180 30, 170 15, 150 15
  Z
  M 140 75
  L 135 80
  L 130 95
  L 100 102
  L 70 120
  L 55 170
  L 50 220
  L 45 270
  L 42 290
  L 50 310
  L 55 300
  L 60 270
  L 65 230
  L 75 180
  L 90 140
  L 100 120
  L 100 190
  L 103 240
  L 105 280
  L 108 310
  L 110 350
  L 108 400
  L 105 450
  L 102 500
  L 100 540
  L 95 565
  L 90 580
  L 92 590
  L 105 590
  L 110 580
  L 115 560
  L 120 500
  L 125 440
  L 130 380
  L 140 310
  L 150 310
  L 160 310
  L 170 380
  L 175 440
  L 180 500
  L 185 560
  L 190 580
  L 195 590
  L 208 590
  L 210 580
  L 205 565
  L 200 540
  L 198 500
  L 195 450
  L 192 400
  L 190 350
  L 192 310
  L 195 280
  L 197 240
  L 200 190
  L 200 120
  L 210 140
  L 225 180
  L 235 230
  L 240 270
  L 245 300
  L 250 310
  L 258 290
  L 255 270
  L 250 220
  L 245 170
  L 230 120
  L 200 102
  L 170 95
  L 165 80
  L 160 75
  Z
`;

/** Gender-neutral back body silhouette outline */
const BACK_BODY_PATH = `
  M 150 15
  C 130 15, 120 30, 120 45
  C 120 60, 130 72, 150 72
  C 170 72, 180 60, 180 45
  C 180 30, 170 15, 150 15
  Z
  M 140 75
  L 135 80
  L 130 95
  L 100 102
  L 70 120
  L 55 170
  L 50 220
  L 45 270
  L 42 290
  L 50 310
  L 55 300
  L 60 270
  L 65 230
  L 75 180
  L 90 140
  L 100 120
  L 100 190
  L 103 240
  L 105 280
  L 108 310
  L 110 350
  L 108 400
  L 105 450
  L 102 500
  L 100 540
  L 95 565
  L 90 580
  L 92 590
  L 105 590
  L 110 580
  L 115 560
  L 120 500
  L 125 440
  L 130 380
  L 140 310
  L 150 310
  L 160 310
  L 170 380
  L 175 440
  L 180 500
  L 185 560
  L 190 580
  L 195 590
  L 208 590
  L 210 580
  L 205 565
  L 200 540
  L 198 500
  L 195 450
  L 192 400
  L 190 350
  L 192 310
  L 195 280
  L 197 240
  L 200 190
  L 200 120
  L 210 140
  L 225 180
  L 235 230
  L 240 270
  L 245 300
  L 250 310
  L 258 290
  L 255 270
  L 250 220
  L 245 170
  L 230 120
  L 200 102
  L 170 95
  L 165 80
  L 160 75
  Z
  M 120 105
  L 115 115
  L 115 170
  L 120 180
  L 150 185
  L 180 180
  L 185 170
  L 185 115
  L 180 105
  Z
`;

// ============================================================================
// TYPES
// ============================================================================

interface BodyMapProps {
  lesions: LesionRecord[];
  view: BodyView;
  onViewChange: (view: BodyView) => void;
  onBodyClick: (x: number, y: number, region: BodyRegion, view: BodyView) => void;
  onLesionClick: (lesion: LesionRecord) => void;
  selectedLesionId?: string | null;
  themeColor?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

function getRegionFromPoint(
  x: number,
  y: number,
  view: BodyView,
): BodyRegion | null {
  const regions = view === 'front' ? FRONT_REGIONS : BACK_REGIONS;

  for (const r of regions) {
    if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) {
      return r.region;
    }
  }
  return null;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function BodyMap({
  lesions,
  view,
  onViewChange,
  onBodyClick,
  onLesionClick,
  selectedLesionId,
  themeColor = '#8B5CF6',
}: BodyMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredRegion, setHoveredRegion] = useState<BodyRegion | null>(null);
  const [zoomedRegion, setZoomedRegion] = useState<BodyRegion | null>(null);
  const [scale, setScale] = useState(1);

  // Filter lesions for current view
  const visibleLesions = useMemo(
    () => lesions.filter((l) => l.body_view === view),
    [lesions, view],
  );

  const regions = view === 'front' ? FRONT_REGIONS : BACK_REGIONS;
  const bodyPath = view === 'front' ? FRONT_BODY_PATH : BACK_BODY_PATH;

  // ViewBox based on zoom
  const viewBox = useMemo(() => {
    if (zoomedRegion && ZOOM_VIEWBOXES[zoomedRegion]) {
      const z = ZOOM_VIEWBOXES[zoomedRegion]!;
      return `${z.x} ${z.y} ${z.w} ${z.h}`;
    }
    return `0 0 ${SVG_WIDTH} ${SVG_HEIGHT * 0.86}`;
  }, [zoomedRegion]);

  // Handle SVG click
  const handleSvgClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current) return;

      const svg = svgRef.current;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;

      const ctm = svg.getScreenCTM();
      if (!ctm) return;

      const svgPt = pt.matrixTransform(ctm.inverse());
      const region = getRegionFromPoint(svgPt.x, svgPt.y, view);

      if (region) {
        onBodyClick(svgPt.x, svgPt.y, region, view);
      }
    },
    [view, onBodyClick],
  );

  // Handle mouse move for hover regions
  const handleSvgMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current) return;

      const svg = svgRef.current;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;

      const ctm = svg.getScreenCTM();
      if (!ctm) return;

      const svgPt = pt.matrixTransform(ctm.inverse());
      const region = getRegionFromPoint(svgPt.x, svgPt.y, view);
      setHoveredRegion(region);
    },
    [view],
  );

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.25, 2));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5));

  const handleResetZoom = useCallback(() => {
    setZoomedRegion(null);
    setScale(1);
  }, []);

  const handleRegionZoom = useCallback((region: BodyRegion) => {
    setZoomedRegion((prev) => (prev === region ? null : region));
  }, []);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* ── Controls ─────────────────────────────────────────── */}
      <div className="flex items-center gap-2 w-full justify-between">
        {/* View toggle */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => { onViewChange('front'); handleResetZoom(); }}
            className={cn(
              'text-xs font-medium px-3 py-1.5 rounded-md transition-colors',
              view === 'front'
                ? 'bg-white text-gray-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700',
            )}
          >
            Vista Frontal
          </button>
          <button
            type="button"
            onClick={() => { onViewChange('back'); handleResetZoom(); }}
            className={cn(
              'text-xs font-medium px-3 py-1.5 rounded-md transition-colors',
              view === 'back'
                ? 'bg-white text-gray-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700',
            )}
          >
            Vista Posterior
          </button>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1">
          {zoomedRegion && (
            <button
              type="button"
              onClick={handleResetZoom}
              className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded transition-colors flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              Vista completa
            </button>
          )}
          <button
            type="button"
            onClick={handleZoomOut}
            className="h-7 w-7 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <span className="text-xs text-gray-400 w-10 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            className="h-7 w-7 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ── Body SVG ─────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-b from-gray-50 to-white"
        style={{ maxHeight: 520 }}
      >
        <svg
          ref={svgRef}
          viewBox={viewBox}
          className="w-full cursor-crosshair transition-all"
          style={{
            height: 500 * scale,
            maxWidth: 320 * scale,
          }}
          onClick={handleSvgClick}
          onMouseMove={handleSvgMouseMove}
          onMouseLeave={() => setHoveredRegion(null)}
        >
          {/* Body silhouette */}
          <path
            d={bodyPath}
            fill="#F3F4F6"
            stroke="#D1D5DB"
            strokeWidth={1.5}
            strokeLinejoin="round"
          />

          {/* Region highlight on hover */}
          {hoveredRegion &&
            regions
              .filter((r) => r.region === hoveredRegion)
              .map((r) => (
                <rect
                  key={r.region}
                  x={r.x}
                  y={r.y}
                  width={r.w}
                  height={r.h}
                  fill={`${themeColor}15`}
                  stroke={`${themeColor}40`}
                  strokeWidth={0.8}
                  strokeDasharray="3 2"
                  rx={4}
                  className="pointer-events-none"
                />
              ))}

          {/* Region labels (only on full view) */}
          {!zoomedRegion &&
            regions.map((r) => (
              <text
                key={`label-${r.region}`}
                x={r.x + r.w / 2}
                y={r.y + r.h / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fill={hoveredRegion === r.region ? themeColor : 'transparent'}
                fontSize={8}
                fontWeight={500}
                fontFamily="system-ui, sans-serif"
                className="pointer-events-none select-none"
              >
                {hoveredRegion === r.region ? '' : ''}
              </text>
            ))}

          {/* Lesion dots */}
          {visibleLesions.map((lesion) => {
            const isSelected = lesion.id === selectedLesionId;
            const color = RISK_COLORS[lesion.malignancy_risk];

            return (
              <g key={lesion.id} className="cursor-pointer">
                {/* Outer ring for selected */}
                {isSelected && (
                  <circle
                    cx={lesion.position_x}
                    cy={lesion.position_y}
                    r={9}
                    fill="none"
                    stroke={themeColor}
                    strokeWidth={1.5}
                    strokeDasharray="3 2"
                  >
                    <animate
                      attributeName="r"
                      values="8;10;8"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* Lesion dot */}
                <circle
                  cx={lesion.position_x}
                  cy={lesion.position_y}
                  r={isSelected ? 6 : 5}
                  fill={color}
                  stroke="#FFFFFF"
                  strokeWidth={1.5}
                  onClick={(e) => {
                    e.stopPropagation();
                    onLesionClick(lesion);
                  }}
                  className="transition-all hover:opacity-80"
                />

                {/* Biopsy indicator */}
                {lesion.biopsy_recommended && (
                  <text
                    x={lesion.position_x}
                    y={lesion.position_y + 1}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#FFFFFF"
                    fontSize={6}
                    fontWeight={700}
                    className="pointer-events-none select-none"
                  >
                    B
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover tooltip */}
        {hoveredRegion && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none">
            {BODY_REGION_LABELS[hoveredRegion] ?? hoveredRegion}
          </div>
        )}
      </div>

      {/* ── Region quick-zoom buttons ────────────────────────── */}
      <div className="flex flex-wrap gap-1 justify-center max-w-xs">
        {regions.map((r) => {
          const count = visibleLesions.filter((l) => l.body_region === r.region).length;
          return (
            <button
              key={r.region}
              type="button"
              onClick={() => handleRegionZoom(r.region)}
              className={cn(
                'text-[10px] px-1.5 py-0.5 rounded border transition-colors',
                zoomedRegion === r.region
                  ? 'text-white border-transparent'
                  : count > 0
                    ? 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                    : 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50',
              )}
              style={
                zoomedRegion === r.region
                  ? { backgroundColor: themeColor }
                  : undefined
              }
            >
              {BODY_REGION_LABELS[r.region] ?? r.region}
              {count > 0 && (
                <span className="ml-0.5 font-semibold">{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Legend ────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 text-[10px] text-gray-500">
        {(Object.keys(RISK_COLORS) as MalignancyRisk[]).map((risk) => (
          <div key={risk} className="flex items-center gap-1">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full border border-white shadow-sm"
              style={{ backgroundColor: RISK_COLORS[risk] }}
            />
            {RISK_LABELS[risk]}
          </div>
        ))}
      </div>
    </div>
  );
}

export { RISK_COLORS, RISK_LABELS };
