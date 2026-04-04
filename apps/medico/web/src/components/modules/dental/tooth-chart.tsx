'use client';

import { useCallback, useMemo } from 'react';
import { cn } from '@red-salud/core/utils';

// ============================================================================
// TYPES
// ============================================================================

export type NomenclatureSystem = 'FDI' | 'Palmer';

export type ToothConditionColor =
  | 'healthy'
  | 'caries'
  | 'restoration'
  | 'crown'
  | 'bridge'
  | 'implant'
  | 'missing'
  | 'root_canal'
  | 'fracture'
  | 'sealant';

export interface ToothChartTooth {
  code: string;
  condition?: ToothConditionColor;
  /** Surface conditions for 5-surface odontogram view */
  surfaces?: {
    M?: string; // mesial
    D?: string; // distal
    O?: string; // occlusal/incisal
    B?: string; // buccal
    L?: string; // lingual
  };
  /** If true, tooth is drawn as missing (X overlay) */
  isMissing?: boolean;
  /** Optional label beneath the tooth number */
  sublabel?: string;
  /** Highlight ring color */
  highlight?: string;
}

interface ToothChartProps {
  /** Array of tooth data to render */
  teeth: ToothChartTooth[];
  /** Which tooth is currently selected */
  selectedTooth?: string | null;
  /** Callback when a tooth is clicked */
  onToothClick?: (code: string) => void;
  /** FDI or Palmer numbering */
  nomenclature?: NomenclatureSystem;
  /** Show 5-surface detail per tooth (odontogram mode) */
  showSurfaces?: boolean;
  /** Whether to show pediatric arch */
  isPediatric?: boolean;
  /** Theme color for selection */
  themeColor?: string;
  /** Additional CSS class */
  className?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CONDITION_COLORS: Record<ToothConditionColor, string> = {
  healthy: '#E5E7EB',
  caries: '#EF4444',
  restoration: '#3B82F6',
  crown: '#0EA5E9',
  bridge: '#06B6D4',
  implant: '#14B8A6',
  missing: '#D1D5DB',
  root_canal: '#8B5CF6',
  fracture: '#F97316',
  sealant: '#22C55E',
};

const SURFACE_FALLBACK = '#E5E7EB';

/** Convert FDI to Palmer notation */
function fdiToPalmer(fdi: string): string {
  const num = parseInt(fdi, 10);
  const quadrant = Math.floor(num / 10);
  const tooth = num % 10;

  const symbols: Record<number, string> = {
    1: `${tooth}\u2518`, // upper right ┘
    2: `\u2514${tooth}`, // upper left └
    3: `\u2510${tooth}`, // lower left ┐
    4: `${tooth}\u250C`, // lower right ┌
    5: `${tooth})`,
    6: `(${tooth}`,
    7: `${tooth}]`,
    8: `[${tooth}`,
  };

  return symbols[quadrant] ?? fdi;
}

// ============================================================================
// SINGLE TOOTH SVG
// ============================================================================

interface SingleToothSVGProps {
  code: string;
  x: number;
  y: number;
  tooth: ToothChartTooth;
  isSelected: boolean;
  showSurfaces: boolean;
  nomenclature: NomenclatureSystem;
  themeColor: string;
  onClick?: (code: string) => void;
  isUpper: boolean;
}

function SingleToothSVG({
  code,
  x,
  y,
  tooth,
  isSelected,
  showSurfaces,
  nomenclature,
  themeColor,
  onClick,
  isUpper,
}: SingleToothSVGProps) {
  const size = showSurfaces ? 36 : 28;
  const halfSize = size / 2;
  const cx = x + halfSize;
  const cy = y + halfSize;

  const fillColor = tooth.condition
    ? CONDITION_COLORS[tooth.condition] ?? CONDITION_COLORS.healthy
    : CONDITION_COLORS.healthy;

  const label = nomenclature === 'Palmer' ? fdiToPalmer(code) : code;

  // Number position: above for upper arch, below for lower arch
  const numberY = isUpper ? y - 6 : y + size + 14;

  const handleClick = useCallback(() => onClick?.(code), [onClick, code]);

  // ── 5-surface rendering (odontogram mode) ──────────────────────────────
  if (showSurfaces) {
    const s = tooth.surfaces ?? {};
    const getColor = (surface: string | undefined) =>
      surface ? CONDITION_COLORS[surface as ToothConditionColor] ?? surface : SURFACE_FALLBACK;

    // Build the 5-surface cross pattern
    const innerSize = size * 0.35;
    const innerHalf = innerSize / 2;

    return (
      <g
        className="cursor-pointer transition-transform hover:scale-110"
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label={`Diente ${code}`}
      >
        {/* Selection ring */}
        {isSelected && (
          <rect
            x={x - 3}
            y={y - 3}
            width={size + 6}
            height={size + 6}
            rx={6}
            fill="none"
            stroke={themeColor}
            strokeWidth={2}
            className="animate-pulse"
          />
        )}

        {/* Outer rectangle (tooth boundary) */}
        <rect
          x={x}
          y={y}
          width={size}
          height={size}
          rx={4}
          fill="#FAFAFA"
          stroke={tooth.isMissing ? '#9CA3AF' : '#D1D5DB'}
          strokeWidth={1}
        />

        {/* Buccal (top) */}
        <path
          d={`M ${x + 4} ${y} L ${x + size - 4} ${y} Q ${x + size} ${y} ${x + size} ${y + 4} L ${cx + innerHalf} ${cy - innerHalf} L ${cx - innerHalf} ${cy - innerHalf} L ${x} ${y + 4} Q ${x} ${y} ${x + 4} ${y} Z`}
          fill={getColor(s.B)}
          stroke="#D1D5DB"
          strokeWidth={0.5}
        />

        {/* Lingual (bottom) */}
        <path
          d={`M ${x} ${y + size - 4} Q ${x} ${y + size} ${x + 4} ${y + size} L ${x + size - 4} ${y + size} Q ${x + size} ${y + size} ${x + size} ${y + size - 4} L ${cx + innerHalf} ${cy + innerHalf} L ${cx - innerHalf} ${cy + innerHalf} Z`}
          fill={getColor(s.L)}
          stroke="#D1D5DB"
          strokeWidth={0.5}
        />

        {/* Mesial (left) */}
        <path
          d={`M ${x} ${y + 4} Q ${x} ${y} ${x + 4} ${y} L ${cx - innerHalf} ${cy - innerHalf} L ${cx - innerHalf} ${cy + innerHalf} L ${x + 4} ${y + size} Q ${x} ${y + size} ${x} ${y + size - 4} Z`}
          fill={getColor(s.M)}
          stroke="#D1D5DB"
          strokeWidth={0.5}
        />

        {/* Distal (right) */}
        <path
          d={`M ${x + size} ${y + 4} L ${cx + innerHalf} ${cy - innerHalf} L ${cx + innerHalf} ${cy + innerHalf} L ${x + size} ${y + size - 4} Q ${x + size} ${y + size} ${x + size - 4} ${y + size} L ${x + size - 4} ${y + size} Q ${x + size} ${y + size} ${x + size} ${y + size - 4} Z`}
          fill={getColor(s.D)}
          stroke="#D1D5DB"
          strokeWidth={0.5}
        />

        {/* Occlusal/Incisal (center) */}
        <rect
          x={cx - innerHalf}
          y={cy - innerHalf}
          width={innerSize}
          height={innerSize}
          fill={getColor(s.O)}
          stroke="#D1D5DB"
          strokeWidth={0.5}
        />

        {/* Missing X */}
        {tooth.isMissing && (
          <>
            <line x1={x + 4} y1={y + 4} x2={x + size - 4} y2={y + size - 4} stroke="#6B7280" strokeWidth={2} />
            <line x1={x + size - 4} y1={y + 4} x2={x + 4} y2={y + size - 4} stroke="#6B7280" strokeWidth={2} />
          </>
        )}

        {/* Tooth number */}
        <text
          x={cx}
          y={numberY}
          textAnchor="middle"
          className="select-none"
          fill={isSelected ? themeColor : '#374151'}
          fontSize={10}
          fontWeight={isSelected ? 700 : 500}
          fontFamily="system-ui, sans-serif"
        >
          {label}
        </text>

        {/* Sublabel */}
        {tooth.sublabel && (
          <text
            x={cx}
            y={isUpper ? y - 16 : y + size + 24}
            textAnchor="middle"
            fill="#9CA3AF"
            fontSize={8}
            fontFamily="system-ui, sans-serif"
          >
            {tooth.sublabel}
          </text>
        )}
      </g>
    );
  }

  // ── Simple circle rendering (periodontogram mode) ──────────────────────
  return (
    <g
      className="cursor-pointer transition-transform hover:scale-110"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`Diente ${code}`}
    >
      {/* Selection ring */}
      {isSelected && (
        <circle
          cx={cx}
          cy={cy}
          r={halfSize + 3}
          fill="none"
          stroke={themeColor}
          strokeWidth={2}
          className="animate-pulse"
        />
      )}

      {/* Tooth circle */}
      <circle
        cx={cx}
        cy={cy}
        r={halfSize}
        fill={tooth.isMissing ? '#F3F4F6' : fillColor}
        stroke={isSelected ? themeColor : '#D1D5DB'}
        strokeWidth={isSelected ? 2 : 1}
      />

      {/* Missing X */}
      {tooth.isMissing && (
        <>
          <line x1={cx - 8} y1={cy - 8} x2={cx + 8} y2={cy + 8} stroke="#6B7280" strokeWidth={2} strokeLinecap="round" />
          <line x1={cx + 8} y1={cy - 8} x2={cx - 8} y2={cy + 8} stroke="#6B7280" strokeWidth={2} strokeLinecap="round" />
        </>
      )}

      {/* Tooth number */}
      <text
        x={cx}
        y={numberY}
        textAnchor="middle"
        fill={isSelected ? themeColor : '#374151'}
        fontSize={10}
        fontWeight={isSelected ? 700 : 500}
        fontFamily="system-ui, sans-serif"
        className="select-none"
      >
        {label}
      </text>

      {/* Highlight dot */}
      {tooth.highlight && (
        <circle
          cx={cx + halfSize - 2}
          cy={cy - halfSize + 2}
          r={4}
          fill={tooth.highlight}
          stroke="white"
          strokeWidth={1}
        />
      )}
    </g>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ToothChart({
  teeth,
  selectedTooth,
  onToothClick,
  nomenclature = 'FDI',
  showSurfaces = false,
  isPediatric = false,
  themeColor = '#3B82F6',
  className,
}: ToothChartProps) {
  // Build tooth lookup
  const toothMap = useMemo(() => {
    const map = new Map<string, ToothChartTooth>();
    for (const t of teeth) {
      map.set(t.code, t);
    }
    return map;
  }, [teeth]);

  // Tooth layout: 2 arches (upper/lower), each with teeth arranged L-R
  const teethPerArch = isPediatric ? 10 : 16;
  const cellSize = showSurfaces ? 44 : 36;
  const archWidth = teethPerArch * cellSize;
  const archGap = showSurfaces ? 60 : 50;
  const padding = 20;
  const labelPadding = showSurfaces ? 24 : 18;

  const svgWidth = archWidth + padding * 2;
  const svgHeight = (cellSize + labelPadding) * 2 + archGap + padding * 2;

  // Upper arch tooth codes
  const upperCodes = isPediatric
    ? ['55', '54', '53', '52', '51', '61', '62', '63', '64', '65']
    : ['18', '17', '16', '15', '14', '13', '12', '11', '21', '22', '23', '24', '25', '26', '27', '28'];

  // Lower arch tooth codes
  const lowerCodes = isPediatric
    ? ['85', '84', '83', '82', '81', '71', '72', '73', '74', '75']
    : ['48', '47', '46', '45', '44', '43', '42', '41', '31', '32', '33', '34', '35', '36', '37', '38'];

  const toothSize = showSurfaces ? 36 : 28;

  return (
    <div className={cn('overflow-x-auto', className)}>
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        width="100%"
        preserveAspectRatio="xMidYMid meet"
        className="max-w-full"
        role="img"
        aria-label="Carta dental"
      >
        {/* Midline */}
        <line
          x1={svgWidth / 2}
          y1={padding}
          x2={svgWidth / 2}
          y2={svgHeight - padding}
          stroke="#E5E7EB"
          strokeWidth={1}
          strokeDasharray="4 4"
        />

        {/* Arch labels */}
        <text
          x={svgWidth / 2}
          y={padding + 8}
          textAnchor="middle"
          fill="#9CA3AF"
          fontSize={9}
          fontFamily="system-ui, sans-serif"
        >
          ARCADA SUPERIOR
        </text>
        <text
          x={svgWidth / 2}
          y={svgHeight - padding + 4}
          textAnchor="middle"
          fill="#9CA3AF"
          fontSize={9}
          fontFamily="system-ui, sans-serif"
        >
          ARCADA INFERIOR
        </text>

        {/* Upper arch teeth */}
        {upperCodes.map((code, i) => {
          const tooth = toothMap.get(code) ?? { code };
          const x = padding + i * cellSize + (cellSize - toothSize) / 2;
          const y = padding + labelPadding + 8;
          return (
            <SingleToothSVG
              key={code}
              code={code}
              x={x}
              y={y}
              tooth={tooth}
              isSelected={selectedTooth === code}
              showSurfaces={showSurfaces}
              nomenclature={nomenclature}
              themeColor={themeColor}
              onClick={onToothClick}
              isUpper
            />
          );
        })}

        {/* Lower arch teeth */}
        {lowerCodes.map((code, i) => {
          const tooth = toothMap.get(code) ?? { code };
          const x = padding + i * cellSize + (cellSize - toothSize) / 2;
          const y = padding + labelPadding + 8 + toothSize + archGap;
          return (
            <SingleToothSVG
              key={code}
              code={code}
              x={x}
              y={y}
              tooth={tooth}
              isSelected={selectedTooth === code}
              showSurfaces={showSurfaces}
              nomenclature={nomenclature}
              themeColor={themeColor}
              onClick={onToothClick}
              isUpper={false}
            />
          );
        })}
      </svg>
    </div>
  );
}

export { CONDITION_COLORS };
