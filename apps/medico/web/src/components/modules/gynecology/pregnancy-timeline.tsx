'use client';

import { useMemo } from 'react';
import { cn } from '@red-salud/core/utils';
import type { PrenatalVisit, GestationalAge } from './use-prenatal';

// ============================================================================
// TYPES
// ============================================================================

interface PregnancyTimelineProps {
  gestationalAge: GestationalAge | null;
  visits: PrenatalVisit[];
  riskFactors?: string[];
  themeColor?: string;
  className?: string;
}

interface Milestone {
  week: number;
  label: string;
  type: 'screening' | 'scan' | 'lab' | 'appointment';
}

// ============================================================================
// MILESTONE DATA (Venezuelan obstetric protocol)
// ============================================================================

const MILESTONES: Milestone[] = [
  { week: 8, label: 'Primera consulta', type: 'appointment' },
  { week: 11, label: 'Screening 1er trimestre', type: 'screening' },
  { week: 12, label: 'Eco translucencia nucal', type: 'scan' },
  { week: 16, label: 'Control 2do trimestre', type: 'appointment' },
  { week: 20, label: 'Eco morfológico', type: 'scan' },
  { week: 24, label: 'Prueba de glucosa (PTOG)', type: 'lab' },
  { week: 28, label: 'Control 3er trimestre', type: 'appointment' },
  { week: 32, label: 'Eco crecimiento', type: 'scan' },
  { week: 34, label: 'NST / Monitoreo fetal', type: 'screening' },
  { week: 36, label: 'Cultivo GBS', type: 'lab' },
  { week: 37, label: 'Control semanal', type: 'appointment' },
  { week: 40, label: 'Fecha probable de parto', type: 'appointment' },
];

const MILESTONE_COLORS: Record<Milestone['type'], string> = {
  screening: '#8b5cf6',
  scan: '#3b82f6',
  lab: '#f59e0b',
  appointment: '#22c55e',
};

// ============================================================================
// TIMELINE COMPONENT
// ============================================================================

export function PregnancyTimeline({
  gestationalAge,
  visits,
  riskFactors = [],
  themeColor = '#ec4899',
  className,
}: PregnancyTimelineProps) {
  const currentWeek = gestationalAge?.weeks ?? 0;

  // ── Visit weeks set ──────────────────────────────────────────────────

  const visitWeeks = useMemo(() => {
    const set = new Set<number>();
    for (const v of visits) {
      set.add(v.gestational_weeks);
    }
    return set;
  }, [visits]);

  // ── Upcoming recommended visits ──────────────────────────────────────

  const upcomingMilestones = useMemo(() => {
    return MILESTONES.filter((m) => m.week > currentWeek && m.week <= currentWeek + 8);
  }, [currentWeek]);

  // ── SVG dimensions ───────────────────────────────────────────────────

  const SVG_WIDTH = 700;
  const SVG_HEIGHT = 140;
  const TRACK_Y = 60;
  const TRACK_LEFT = 40;
  const TRACK_RIGHT = SVG_WIDTH - 20;
  const TRACK_WIDTH = TRACK_RIGHT - TRACK_LEFT;

  const weekToX = (week: number) =>
    TRACK_LEFT + (Math.min(42, Math.max(0, week)) / 42) * TRACK_WIDTH;

  // ── Trimester boundaries ─────────────────────────────────────────────

  const trimesters = [
    { label: '1er Trimestre', start: 0, end: 13, color: '#DBEAFE' },
    { label: '2do Trimestre', start: 13, end: 27, color: '#D1FAE5' },
    { label: '3er Trimestre', start: 27, end: 42, color: '#FEF3C7' },
  ];

  return (
    <div className={cn('', className)}>
      <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="w-full h-auto">
        {/* Trimester background bands */}
        {trimesters.map((t) => (
          <g key={t.label}>
            <rect
              x={weekToX(t.start)}
              y={TRACK_Y - 20}
              width={weekToX(t.end) - weekToX(t.start)}
              height={40}
              rx={4}
              fill={t.color}
              opacity={0.5}
            />
            <text
              x={(weekToX(t.start) + weekToX(t.end)) / 2}
              y={TRACK_Y - 26}
              fill="#6b7280"
              fontSize={9}
              fontWeight={500}
              textAnchor="middle"
            >
              {t.label}
            </text>
          </g>
        ))}

        {/* Track line */}
        <line
          x1={TRACK_LEFT}
          y1={TRACK_Y}
          x2={TRACK_RIGHT}
          y2={TRACK_Y}
          stroke="#d1d5db"
          strokeWidth={2}
          strokeLinecap="round"
        />

        {/* Progress line */}
        {currentWeek > 0 && (
          <line
            x1={TRACK_LEFT}
            y1={TRACK_Y}
            x2={weekToX(Math.min(currentWeek, 42))}
            y2={TRACK_Y}
            stroke={themeColor}
            strokeWidth={3}
            strokeLinecap="round"
          />
        )}

        {/* Week tick marks (every 4 weeks) */}
        {[0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40].map((w) => (
          <g key={`tick-${w}`}>
            <line
              x1={weekToX(w)}
              y1={TRACK_Y + 20}
              x2={weekToX(w)}
              y2={TRACK_Y + 26}
              stroke="#9ca3af"
              strokeWidth={1}
            />
            <text
              x={weekToX(w)}
              y={TRACK_Y + 36}
              fill="#9ca3af"
              fontSize={9}
              textAnchor="middle"
            >
              {w}
            </text>
          </g>
        ))}

        {/* Milestones */}
        {MILESTONES.map((m) => {
          const x = weekToX(m.week);
          const isPast = m.week <= currentWeek;
          const isUpcoming = m.week > currentWeek && m.week <= currentWeek + 8;
          const color = MILESTONE_COLORS[m.type];
          const opacity = isPast ? 0.4 : isUpcoming ? 1 : 0.3;

          return (
            <g key={`${m.type}-${m.week}`}>
              {/* Vertical connector */}
              <line
                x1={x}
                y1={TRACK_Y - 20}
                x2={x}
                y2={TRACK_Y - 6}
                stroke={color}
                strokeWidth={1}
                opacity={opacity}
                strokeDasharray={isPast ? undefined : '2,2'}
              />
              {/* Diamond marker */}
              <polygon
                points={`${x},${TRACK_Y - 22} ${x + 4},${TRACK_Y - 18} ${x},${TRACK_Y - 14} ${x - 4},${TRACK_Y - 18}`}
                fill={isPast ? `${color}60` : color}
                stroke={color}
                strokeWidth={1}
                opacity={opacity}
              />
            </g>
          );
        })}

        {/* Past visits (dots below track) */}
        {visits.map((v) => {
          const x = weekToX(v.gestational_weeks + v.gestational_days / 7);
          return (
            <g key={v.id}>
              <circle
                cx={x}
                cy={TRACK_Y + 10}
                r={4}
                fill="white"
                stroke={themeColor}
                strokeWidth={1.5}
              />
              {/* Risk indicator */}
              {v.risk_factors.length > 0 && (
                <circle
                  cx={x + 3}
                  cy={TRACK_Y + 7}
                  r={2}
                  fill="#ef4444"
                />
              )}
            </g>
          );
        })}

        {/* Current week marker */}
        {currentWeek > 0 && currentWeek <= 42 && (
          <g>
            <circle
              cx={weekToX(currentWeek)}
              cy={TRACK_Y}
              r={7}
              fill={themeColor}
              opacity={0.2}
            />
            <circle
              cx={weekToX(currentWeek)}
              cy={TRACK_Y}
              r={5}
              fill="white"
              stroke={themeColor}
              strokeWidth={2.5}
            />
            <text
              x={weekToX(currentWeek)}
              y={TRACK_Y + 50}
              fill={themeColor}
              fontSize={10}
              fontWeight={600}
              textAnchor="middle"
            >
              Sem {currentWeek}
            </text>
          </g>
        )}

        {/* Week axis label */}
        <text
          x={SVG_WIDTH / 2}
          y={SVG_HEIGHT - 2}
          fill="#6b7280"
          fontSize={10}
          textAnchor="middle"
        >
          Semanas de Gestación
        </text>
      </svg>

      {/* Upcoming milestones list */}
      {upcomingMilestones.length > 0 && (
        <div className="mt-3 space-y-1.5">
          <h4 className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">
            Próximos hitos
          </h4>
          {upcomingMilestones.map((m) => (
            <div
              key={`${m.type}-${m.week}`}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-100"
            >
              <div
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: MILESTONE_COLORS[m.type] }}
              />
              <span className="text-xs text-gray-600 flex-1">{m.label}</span>
              <span className="text-[10px] text-gray-400 font-medium">
                Sem {m.week}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Risk factors */}
      {riskFactors.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {riskFactors.map((rf) => (
            <span
              key={rf}
              className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-600"
            >
              {rf}
            </span>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="mt-3 flex items-center gap-4 flex-wrap">
        {Object.entries(MILESTONE_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-[10px] text-gray-400 capitalize">
              {type === 'screening'
                ? 'Tamizaje'
                : type === 'scan'
                  ? 'Ecografía'
                  : type === 'lab'
                    ? 'Laboratorio'
                    : 'Control'}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div
            className="h-3 w-3 rounded-full border-2"
            style={{ borderColor: themeColor }}
          />
          <span className="text-[10px] text-gray-400">Visitas realizadas</span>
        </div>
      </div>
    </div>
  );
}
