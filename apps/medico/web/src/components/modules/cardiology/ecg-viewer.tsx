'use client';

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Printer,
  Ruler,
  RotateCcw,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@red-salud/design-system';
import { cn } from '@red-salud/core/utils';
import type { EcgRecord, EcgWaveformData } from './use-ecg';

// ============================================================================
// CONSTANTS
// ============================================================================

/** Standard 12-lead layout: 4 columns x 3 rows */
const LEAD_LAYOUT: string[][] = [
  ['I', 'aVR', 'V1', 'V4'],
  ['II', 'aVL', 'V2', 'V5'],
  ['III', 'aVF', 'V3', 'V6'],
];

const ALL_LEADS = ['I', 'II', 'III', 'aVR', 'aVL', 'aVF', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6'];

/** Rhythm strip lead (bottom strip) */
const RHYTHM_LEAD = 'II';

/** ECG paper standard: 25mm/s paper speed */
const PAPER_SPEED_MM_S = 25;
/** ECG paper standard: 10mm/mV gain */
const GAIN_MM_MV = 10;
/** Small grid square = 1mm */
const SMALL_GRID_MM = 1;
/** Large grid square = 5mm (5 small squares) */
const LARGE_GRID_MM = 5;

// SVG scaling: 1mm = 4px for comfortable on-screen viewing
const PX_PER_MM = 4;

// Grid colors (standard ECG paper)
const GRID_COLOR_SMALL = '#F5CCCC';
const GRID_COLOR_LARGE = '#E09999';
const WAVEFORM_COLOR = '#1A1A1A';
const BACKGROUND_COLOR = '#FFF8F8';

// ============================================================================
// TYPES
// ============================================================================

interface EcgViewerProps {
  record: EcgRecord;
  onClose: () => void;
  onInterpret?: () => void;
  themeColor?: string;
}

interface CaliperState {
  active: boolean;
  startX: number | null;
  endX: number | null;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Convert waveform samples to SVG path data.
 * Each sample is one voltage reading at the given sample rate.
 */
function waveformToPath(
  samples: number[],
  sampleRate: number,
  offsetX: number,
  offsetY: number,
  widthPx: number,
): string {
  if (samples.length === 0) return '';

  const durationS = samples.length / sampleRate;
  const totalMmX = durationS * PAPER_SPEED_MM_S;
  const scaleX = widthPx / (totalMmX * PX_PER_MM) * (totalMmX * PX_PER_MM) / samples.length;
  // Actually: pixels per sample
  const pxPerSample = widthPx / samples.length;
  const pxPerMv = GAIN_MM_MV * PX_PER_MM;

  const parts: string[] = [];
  for (let i = 0; i < samples.length; i++) {
    const x = offsetX + i * pxPerSample;
    // Invert Y: positive voltage goes UP
    const y = offsetY - samples[i] * pxPerMv;
    parts.push(i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
  }
  return parts.join(' ');
}

/**
 * Generate a demo sine-like waveform for placeholder display.
 */
function generateDemoWaveform(lead: string, sampleRate: number, durationS: number): number[] {
  const samples = Math.floor(sampleRate * durationS);
  const data: number[] = [];

  // Seed based on lead name for variation
  const seed = lead.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const amplitude = 0.8 + (seed % 5) * 0.15;
  const heartRate = 72; // bpm
  const cycleSamples = sampleRate * (60 / heartRate);

  for (let i = 0; i < samples; i++) {
    const phase = (i % cycleSamples) / cycleSamples;
    let v = 0;

    // P wave (0.0 - 0.12)
    if (phase >= 0.0 && phase < 0.12) {
      const t = (phase - 0.0) / 0.12;
      v = 0.15 * amplitude * Math.sin(t * Math.PI);
    }
    // PR segment (0.12 - 0.16)
    // QRS complex (0.16 - 0.24)
    else if (phase >= 0.16 && phase < 0.18) {
      // Q wave
      const t = (phase - 0.16) / 0.02;
      v = -0.1 * amplitude * Math.sin(t * Math.PI);
    } else if (phase >= 0.18 && phase < 0.21) {
      // R wave
      const t = (phase - 0.18) / 0.03;
      v = 1.2 * amplitude * Math.sin(t * Math.PI);
    } else if (phase >= 0.21 && phase < 0.24) {
      // S wave
      const t = (phase - 0.21) / 0.03;
      v = -0.25 * amplitude * Math.sin(t * Math.PI);
    }
    // ST segment (0.24 - 0.32)
    // T wave (0.32 - 0.48)
    else if (phase >= 0.32 && phase < 0.48) {
      const t = (phase - 0.32) / 0.16;
      v = 0.3 * amplitude * Math.sin(t * Math.PI);
    }

    // Add inversion for aVR
    if (lead === 'aVR') v = -v;
    // Reduce amplitude for limb leads
    if (['aVL', 'aVF', 'III'].includes(lead)) v *= 0.7;

    data.push(v);
  }
  return data;
}

// ============================================================================
// LEAD CELL — renders one lead's grid + waveform
// ============================================================================

function LeadCell({
  lead,
  waveformData,
  sampleRate,
  widthMm,
  heightMm,
}: {
  lead: string;
  waveformData: EcgWaveformData | null;
  sampleRate: number;
  widthMm: number;
  heightMm: number;
}) {
  const widthPx = widthMm * PX_PER_MM;
  const heightPx = heightMm * PX_PER_MM;
  const midY = heightPx / 2;

  // Get waveform samples — use real data or generate demo
  const samples = useMemo(() => {
    if (waveformData && waveformData[lead] && waveformData[lead].length > 0) {
      return waveformData[lead];
    }
    const durationS = widthMm / PAPER_SPEED_MM_S;
    return generateDemoWaveform(lead, sampleRate, durationS);
  }, [lead, waveformData, sampleRate, widthMm]);

  const pathD = useMemo(
    () => waveformToPath(samples, sampleRate, 0, midY, widthPx),
    [samples, sampleRate, midY, widthPx],
  );

  // Grid lines
  const smallGridLines = useMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
    const stepPx = SMALL_GRID_MM * PX_PER_MM;
    // Vertical
    for (let x = 0; x <= widthPx; x += stepPx) {
      lines.push({ x1: x, y1: 0, x2: x, y2: heightPx });
    }
    // Horizontal
    for (let y = 0; y <= heightPx; y += stepPx) {
      lines.push({ x1: 0, y1: y, x2: widthPx, y2: y });
    }
    return lines;
  }, [widthPx, heightPx]);

  const largeGridLines = useMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
    const stepPx = LARGE_GRID_MM * PX_PER_MM;
    for (let x = 0; x <= widthPx; x += stepPx) {
      lines.push({ x1: x, y1: 0, x2: x, y2: heightPx });
    }
    for (let y = 0; y <= heightPx; y += stepPx) {
      lines.push({ x1: 0, y1: y, x2: widthPx, y2: y });
    }
    return lines;
  }, [widthPx, heightPx]);

  return (
    <svg
      width={widthPx}
      height={heightPx}
      viewBox={`0 0 ${widthPx} ${heightPx}`}
      className="block"
    >
      {/* Background */}
      <rect width={widthPx} height={heightPx} fill={BACKGROUND_COLOR} />

      {/* Small grid */}
      {smallGridLines.map((l, i) => (
        <line
          key={`s-${i}`}
          x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
          stroke={GRID_COLOR_SMALL}
          strokeWidth={0.5}
        />
      ))}

      {/* Large grid */}
      {largeGridLines.map((l, i) => (
        <line
          key={`l-${i}`}
          x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
          stroke={GRID_COLOR_LARGE}
          strokeWidth={1}
        />
      ))}

      {/* Waveform */}
      <path
        d={pathD}
        fill="none"
        stroke={WAVEFORM_COLOR}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Lead label */}
      <text
        x={6}
        y={14}
        fill="#333"
        fontSize={12}
        fontWeight={600}
        fontFamily="system-ui, sans-serif"
      >
        {lead}
      </text>
    </svg>
  );
}

// ============================================================================
// CALIPER OVERLAY
// ============================================================================

function CaliperOverlay({
  caliper,
  sampleRate,
  containerWidth,
  onReset,
}: {
  caliper: CaliperState;
  sampleRate: number;
  containerWidth: number;
  onReset: () => void;
}) {
  if (!caliper.active || caliper.startX === null) return null;

  const hasEnd = caliper.endX !== null;
  const startPx = caliper.startX;
  const endPx = caliper.endX ?? caliper.startX;
  const deltaPx = Math.abs(endPx - startPx);

  // Convert pixel distance to milliseconds
  // pixels -> mm -> seconds -> ms
  const deltaMm = deltaPx / PX_PER_MM;
  const deltaS = deltaMm / PAPER_SPEED_MM_S;
  const deltaMs = Math.round(deltaS * 1000);

  // Heart rate if interpreted as RR interval
  const hr = deltaS > 0 ? Math.round(60 / deltaS) : 0;

  const leftPx = Math.min(startPx, endPx);

  return (
    <>
      {/* Start line */}
      <div
        className="absolute top-0 bottom-0 w-px bg-blue-500 pointer-events-none z-10"
        style={{ left: startPx }}
      />
      {/* End line */}
      {hasEnd && (
        <div
          className="absolute top-0 bottom-0 w-px bg-blue-500 pointer-events-none z-10"
          style={{ left: endPx }}
        />
      )}
      {/* Highlight band */}
      {hasEnd && (
        <div
          className="absolute top-0 bottom-0 bg-blue-500/10 pointer-events-none z-10"
          style={{ left: leftPx, width: deltaPx }}
        />
      )}
      {/* Measurement label */}
      {hasEnd && deltaPx > 5 && (
        <div
          className="absolute top-2 z-20 bg-blue-600 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap"
          style={{ left: leftPx + deltaPx / 2, transform: 'translateX(-50%)' }}
        >
          {deltaMs} ms {hr > 20 && hr < 300 ? `(${hr} lpm)` : ''}
        </div>
      )}
    </>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export function EcgViewer({
  record,
  onClose,
  onInterpret,
  themeColor = '#DC2626',
}: EcgViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [caliperMode, setCaliperMode] = useState(false);
  const [caliper, setCaliper] = useState<CaliperState>({
    active: false,
    startX: null,
    endX: null,
  });
  const [showImageMode, setShowImageMode] = useState(false);

  const sampleRate = record.sample_rate ?? 500;
  const hasWaveform = record.waveform_data !== null && Object.keys(record.waveform_data).length > 0;
  const hasImage = !!record.image_url;

  // Default to image mode if no waveform data but image exists
  useEffect(() => {
    if (!hasWaveform && hasImage) {
      setShowImageMode(true);
    }
  }, [hasWaveform, hasImage]);

  // Grid dimensions per lead cell
  const leadWidthMm = 62.5; // ~2.5s of recording per column
  const leadHeightMm = 32;  // enough for +/- 1.6 mV
  const rhythmHeightMm = 24;

  // Heart rate from interpretation
  const heartRate = record.interpretation?.heart_rate ?? null;

  // Classification badge
  const classificationConfig: Record<string, { label: string; color: string }> = {
    normal: { label: 'Normal', color: 'bg-emerald-100 text-emerald-700' },
    borderline: { label: 'Limítrofe', color: 'bg-amber-100 text-amber-700' },
    abnormal: { label: 'Anormal', color: 'bg-orange-100 text-orange-700' },
    critical: { label: 'Crítico', color: 'bg-red-100 text-red-700' },
  };

  const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pendiente', color: 'bg-gray-100 text-gray-600' },
    interpreted: { label: 'Interpretado', color: 'bg-blue-100 text-blue-700' },
    reviewed: { label: 'Revisado', color: 'bg-emerald-100 text-emerald-700' },
    amended: { label: 'Enmendado', color: 'bg-amber-100 text-amber-700' },
  };

  const classCfg = record.classification
    ? classificationConfig[record.classification] ?? null
    : null;
  const statusCfg = statusConfig[record.status] ?? statusConfig.pending;

  // Zoom handlers
  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));

  // Caliper mouse handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!caliperMode) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = (e.clientX - rect.left + (containerRef.current?.scrollLeft ?? 0)) / zoom;
      setCaliper({ active: true, startX: x, endX: null });
    },
    [caliperMode, zoom],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!caliper.active || caliper.startX === null) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = (e.clientX - rect.left + (containerRef.current?.scrollLeft ?? 0)) / zoom;
      setCaliper((prev) => ({ ...prev, endX: x }));
    },
    [caliper.active, caliper.startX, zoom],
  );

  const handleMouseUp = useCallback(() => {
    if (!caliper.active) return;
    setCaliper((prev) => ({ ...prev, active: false }));
  }, [caliper.active]);

  const resetCaliper = useCallback(() => {
    setCaliper({ active: false, startX: null, endX: null });
  }, []);

  // Print handler
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Fullscreen toggle
  const handleFullscreen = () => setIsFullscreen(!isFullscreen);

  // Total SVG dimensions
  const totalWidthPx = leadWidthMm * 4 * PX_PER_MM;
  const totalHeightPx = (leadHeightMm * 3 + rhythmHeightMm) * PX_PER_MM;

  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col',
        isFullscreen && 'fixed inset-0 z-50 rounded-none border-none',
      )}
    >
      {/* ── Top bar ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-gray-700 truncate">
              Electrocardiograma
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              {record.patient_name && (
                <p className="text-xs text-gray-400 truncate">
                  {record.patient_name}
                </p>
              )}
              <p className="text-xs text-gray-400">
                {new Date(record.recording_date).toLocaleDateString('es-VE', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Status badge */}
          <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', statusCfg.color)}>
            {statusCfg.label}
          </span>

          {/* Classification badge */}
          {classCfg && (
            <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', classCfg.color)}>
              {classCfg.label}
            </span>
          )}

          {/* Heart rate display */}
          {heartRate && (
            <div className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
              <span className="inline-block h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              {heartRate} lpm
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Caliper toggle */}
          <Button
            variant={caliperMode ? 'default' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              setCaliperMode(!caliperMode);
              if (caliperMode) resetCaliper();
            }}
            title="Calibrador de intervalos"
            style={caliperMode ? { backgroundColor: themeColor } : undefined}
          >
            <Ruler className="h-4 w-4" />
          </Button>

          {caliperMode && caliper.startX !== null && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={resetCaliper}
              title="Reiniciar calibrador"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}

          <div className="w-px h-5 bg-gray-200 mx-1" />

          {/* Zoom */}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs text-gray-500 w-10 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>

          <div className="w-px h-5 bg-gray-200 mx-1" />

          {/* View mode toggle (waveform vs image) */}
          {hasImage && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={() => setShowImageMode(!showImageMode)}
            >
              {showImageMode ? 'Trazado' : 'Imagen'}
            </Button>
          )}

          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleFullscreen}>
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ── ECG Display ───────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">
        {/* Main ECG area */}
        <div
          ref={containerRef}
          className={cn(
            'flex-1 overflow-auto relative',
            caliperMode && 'cursor-crosshair',
            isFullscreen ? 'max-h-[calc(100vh-120px)]' : 'max-h-[600px]',
          )}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {showImageMode && hasImage ? (
            /* ── Image mode ──────────────────────────────────── */
            <div className="flex items-center justify-center min-h-[400px] bg-gray-50 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={record.image_url!}
                alt="ECG"
                className="max-w-full object-contain transition-transform"
                style={{ transform: `scale(${zoom})` }}
              />
            </div>
          ) : (
            /* ── Waveform mode ───────────────────────────────── */
            <div
              className="inline-block"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
            >
              {/* 12-lead grid: 3 rows x 4 columns */}
              <div className="flex flex-col">
                {LEAD_LAYOUT.map((row, rowIdx) => (
                  <div key={rowIdx} className="flex">
                    {row.map((lead) => (
                      <LeadCell
                        key={lead}
                        lead={lead}
                        waveformData={record.waveform_data}
                        sampleRate={sampleRate}
                        widthMm={leadWidthMm}
                        heightMm={leadHeightMm}
                      />
                    ))}
                  </div>
                ))}

                {/* Rhythm strip (lead II, full width) */}
                <div className="border-t-2 border-gray-300">
                  <LeadCell
                    lead={`${RHYTHM_LEAD} (ritmo)`}
                    waveformData={record.waveform_data}
                    sampleRate={sampleRate}
                    widthMm={leadWidthMm * 4}
                    heightMm={rhythmHeightMm}
                  />
                </div>
              </div>

              {/* Scale reference: 25mm/s | 10mm/mV */}
              <div className="flex items-center gap-4 px-2 py-1.5 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
                <span>25 mm/s</span>
                <span>10 mm/mV</span>
                {sampleRate && <span>{sampleRate} Hz</span>}
              </div>
            </div>
          )}

          {/* Caliper overlay */}
          {caliperMode && (
            <CaliperOverlay
              caliper={caliper}
              sampleRate={sampleRate}
              containerWidth={totalWidthPx}
              onReset={resetCaliper}
            />
          )}
        </div>

        {/* ── Side panel ─────────────────────────────────────────── */}
        <div className="w-64 border-l border-gray-100 p-4 space-y-4 shrink-0 bg-white overflow-y-auto">
          {/* Interpretation summary (if available) */}
          {record.interpretation ? (
            <>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Frecuencia Cardíaca
                </p>
                <p className="text-lg font-bold text-gray-700 mt-0.5">
                  {record.interpretation.heart_rate ?? '—'}{' '}
                  <span className="text-sm font-normal text-gray-400">lpm</span>
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Ritmo
                </p>
                <p className="text-sm text-gray-700 mt-0.5">
                  {record.interpretation.rhythm_type === 'sinus' ? 'Sinusal' : 'No sinusal'}
                  {record.interpretation.rhythm_regularity === 'regular' ? ', regular' : ', irregular'}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Intervalos
                </p>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-1">
                  <div className="text-xs">
                    <span className="text-gray-400">PR: </span>
                    <span className="text-gray-700 font-medium">
                      {record.interpretation.pr_interval ?? '—'} ms
                    </span>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-400">QRS: </span>
                    <span className="text-gray-700 font-medium">
                      {record.interpretation.qrs_duration ?? '—'} ms
                    </span>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-400">QT: </span>
                    <span className="text-gray-700 font-medium">
                      {record.interpretation.qt_interval ?? '—'} ms
                    </span>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-400">QTc: </span>
                    <span className="text-gray-700 font-medium">
                      {record.interpretation.qtc_interval ?? '—'} ms
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Eje
                </p>
                <p className="text-sm text-gray-700 mt-0.5">
                  {record.interpretation.axis === 'normal' && 'Normal'}
                  {record.interpretation.axis === 'left' && 'Desviación izquierda'}
                  {record.interpretation.axis === 'right' && 'Desviación derecha'}
                  {record.interpretation.axis === 'extreme' && 'Desviación extrema'}
                  {!record.interpretation.axis && '—'}
                </p>
              </div>

              {record.interpretation.interpretation_text && (
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Interpretación
                  </p>
                  <p className="text-sm text-gray-700 mt-0.5 whitespace-pre-wrap">
                    {record.interpretation.interpretation_text}
                  </p>
                </div>
              )}

              {record.interpretation.comparison_notes && (
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Comparación
                  </p>
                  <p className="text-sm text-gray-700 mt-0.5 whitespace-pre-wrap">
                    {record.interpretation.comparison_notes}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-gray-400">Sin interpretación</p>
              {onInterpret && (
                <button
                  type="button"
                  onClick={onInterpret}
                  className="mt-2 text-xs font-medium px-3 py-1.5 rounded-lg text-white"
                  style={{ backgroundColor: themeColor }}
                >
                  Interpretar ECG
                </button>
              )}
            </div>
          )}

          {/* Notes */}
          {record.notes && (
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                Notas
              </p>
              <p className="text-sm text-gray-700 mt-0.5 whitespace-pre-wrap">
                {record.notes}
              </p>
            </div>
          )}

          {/* Interpret button (when already has interpretation) */}
          {onInterpret && record.interpretation && (
            <button
              type="button"
              onClick={onInterpret}
              className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Editar interpretación
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
