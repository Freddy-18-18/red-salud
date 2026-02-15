"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { cn } from "@red-salud/core/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@red-salud/ui";
import { Input } from "@red-salud/ui";
import { Checkbox } from "@red-salud/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@red-salud/ui";
import { Button } from "@red-salud/ui";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@red-salud/ui";
import { Separator } from "@red-salud/ui";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@red-salud/ui";
import { Badge } from "@red-salud/ui";
import { Label } from "@red-salud/ui";
import { Info, AlertTriangle, X } from "lucide-react";
import type {
  PerioToothData,
  PerioMeasurement,
  PerioSite,
  PerioExam,
} from "@/types/dental";
import {
  PERMANENT_TEETH_UPPER,
  PERMANENT_TEETH_LOWER,
  PERIO_SITES,
  getDepthSeverity,
  DEPTH_COLORS,
  calculateCAL,
} from "@/types/dental";
import {
  getSiteLabel,
  getMobilityLabel,
  getFurcationLabel,
  getBOPTooltip,
  getImplantTooltip,
  getMissingTooltip,
  getProbingDepthTooltip,
  getRecessionTooltip,
  getSuppurationTooltip,
  getPlaqueTooltip,
  getCALTooltip,
} from "./periodontogram-utils";

// ─── Default empty measurement ─────────────────────────────────────
function emptyMeasurement(toothCode: number, site: PerioSite): PerioMeasurement {
  return { toothCode, site, probingDepth: 0, recession: 0, bleeding: false, suppuration: false, plaque: false };
}

function emptyToothData(toothCode: number): PerioToothData {
  const measurements = {} as Record<PerioSite, PerioMeasurement>;
  PERIO_SITES.forEach((s) => { measurements[s] = emptyMeasurement(toothCode, s); });
  return { toothCode, mobility: 0, furcation: 0, implant: false, missing: false, measurements };
}

// ─── Periodontogram Component ──────────────────────────────────────
interface PeriodontogramProps {
  examData?: PerioExam;
  onDataChange?: (teeth: Record<number, PerioToothData>) => void;
  readOnly?: boolean;
  className?: string;
  comparisonData?: PerioExam; // for historical comparison
}

export function Periodontogram({
  examData,
  onDataChange,
  readOnly = false,
  className,
  comparisonData,
}: PeriodontogramProps) {
  const [teeth, setTeeth] = useState<Record<number, PerioToothData>>(() => {
    if (examData?.teeth) return examData.teeth;
    const t: Record<number, PerioToothData> = {};
    [...PERMANENT_TEETH_UPPER, ...PERMANENT_TEETH_LOWER].forEach((c) => { t[c] = emptyToothData(c); });
    return t;
  });

  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [activeInput, setActiveInput] = useState<{ tooth: number; site: PerioSite; field: "probingDepth" | "recession" } | null>(null);
  const [focusedToothIndex, setFocusedToothIndex] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Refs for PDF export
  const chartRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation
  useEffect(() => {
    if (readOnly) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const allTeeth = [...PERMANENT_TEETH_UPPER, ...PERMANENT_TEETH_LOWER];

      switch(e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          setFocusedToothIndex((prev) => Math.max(0, prev - 1));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setFocusedToothIndex((prev) => Math.min(allTeeth.length - 1, prev + 1));
          break;
        case 'Enter':
          e.preventDefault();
          setSelectedTooth(allTeeth[focusedToothIndex]);
          break;
        case 'Escape':
          e.preventDefault();
          setSelectedTooth(null);
          break;
        case 's':
          if (e.ctrlKey) {
            e.preventDefault();
            // Trigger save
            window.dispatchEvent(new CustomEvent('perio-save'));
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [readOnly, focusedToothIndex]);

  const updateMeasurement = useCallback(
    (toothCode: number, site: PerioSite, field: keyof PerioMeasurement, value: unknown) => {
      setTeeth((prev) => {
        const next = { ...prev };
        const existing = next[toothCode] ?? emptyToothData(toothCode);
        const tooth = { ...existing };
        const m = { ...tooth.measurements[site], [field]: value };
        tooth.measurements = { ...tooth.measurements, [site]: m };
        next[toothCode] = tooth;
        onDataChange?.(next);
        return next;
      });
    },
    [onDataChange]
  );

  const updateToothProp = useCallback(
    (toothCode: number, field: keyof PerioToothData, value: unknown) => {
      setTeeth((prev) => {
        const next = { ...prev };
        const existing = next[toothCode] ?? emptyToothData(toothCode);
        next[toothCode] = { ...existing, [field]: value };
        onDataChange?.(next);
        return next;
      });
    },
    [onDataChange]
  );

  // ─── Stats ──────────────────────────────────────────────────────
  const stats = useMemo(() => calculatePerioStats(teeth), [teeth]);

  // ─── Clinical Alerts ───────────────────────────────────────────
  const alerts = useMemo(() => {
    const newAlerts: Array<{type: 'warning' | 'danger', message: string}> = [];

    // Alert: High bleeding percentage
    if (stats.bopPercentage > 30) {
      newAlerts.push({
        type: 'danger',
        message: `${stats.bopPercentage.toFixed(0)}% de sangrado - Enfermedad periodontal activa`
      });
    }

    // Alert: Multiple deep pockets with bleeding
    const deepBleedingSites = Object.values(teeth).filter(t =>
      !t.missing && Object.values(t.measurements).some(m => m.probingDepth >= 5 && m.bleeding)
    ).length;

    if (deepBleedingSites >= 5) {
      newAlerts.push({
        type: 'warning',
        message: `${deepBleedingSites} dientes con bolsas >=5mm sangrantes - Tratamiento activo recomendado`
      });
    }

    // Alert: Multiple missing teeth
    if (stats.missingTeeth >= 4) {
      newAlerts.push({
        type: 'warning',
        message: `${stats.missingTeeth} dientes ausentes - Considerar rehabilitación`
      });
    }

    // Alert: Mobility in multiple teeth
    const mobileTeeth = Object.values(teeth).filter(t =>
      !t.missing && t.mobility >= 2
    ).length;

    if (mobileTeeth >= 3) {
      newAlerts.push({
        type: 'danger',
        message: `${mobileTeeth} dientes con movilidad grado 2+ - Evaluar tratamiento`
      });
    }

    return newAlerts;
  }, [stats, teeth]);

  // ─── Progression Indicators (comparison between exams) ─────
  const progressionIndicators = useMemo(() => {
    if (!comparisonData?.teeth) return [];

    const indicators: Array<{
      toothCode: number;
      status: 'improved' | 'worsened' | 'stable';
      amount: number;
    }> = [];

    Object.entries(teeth).forEach(([toothCode, currentTooth]) => {
      const prevTooth = comparisonData.teeth[Number(toothCode)];
      if (!prevTooth || currentTooth.missing || prevTooth.missing) return;

      PERIO_SITES.forEach(site => {
        const current = currentTooth.measurements[site].probingDepth;
        const previous = prevTooth.measurements[site].probingDepth;
        const diff = current - previous;

        if (Math.abs(diff) >= 2) {
          indicators.push({
            toothCode: Number(toothCode),
            status: diff > 0 ? 'worsened' : 'improved',
            amount: diff
          });
        }
      });
    });

    return indicators;
  }, [teeth, comparisonData]);

  // PDF Export function
  const exportToPDF = useCallback(() => {
    const element = chartRef.current;
    if (!element) return;

    // In a real implementation, you would use jsPDF or html2canvas
    // For now, we'll trigger a browser print
    setIsAnimating(true);
    setTimeout(() => {
      window.print();
      setIsAnimating(false);
    }, 300);
  }, []);

  return (
    <TooltipProvider>
      <div className={cn("space-y-6", className)}>
        {/* Clinical Alerts */}
        {alerts.length > 0 && (
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4" />
                Alertas Clínicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {alerts.map((alert, idx) => (
                <div key={idx} className={cn(
                  "text-sm px-4 py-3 rounded-lg transition-all",
                  alert.type === 'danger'
                    ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
                    : "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200"
                )}>
                  {alert.message}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Separator className="my-6" />

        {/* Summary Stats - Enhanced */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard label="Profundidad Promedio" value={`${stats.avgDepth.toFixed(1)} mm`} severity={getDepthSeverity(stats.avgDepth)} />
          <StatCard label="% Sangrado (BOP)" value={`${stats.bopPercentage.toFixed(0)}%`} severity={stats.bopPercentage > 30 ? "severe" : stats.bopPercentage > 10 ? "mild" : "healthy"} />
          <StatCard label="Bolsas >= 4mm" value={stats.pocketsOver4} severity={stats.pocketsOver4 > 0 ? "moderate" : "healthy"} />
          <StatCard label="Bolsas >= 6mm" value={stats.pocketsOver6} severity={stats.pocketsOver6 > 0 ? "severe" : "healthy"} />
          <StatCard label="Dientes Ausentes" value={stats.missingTeeth} severity="healthy" />
        </div>

        <Separator className="my-6" />

        {/* Progression Summary */}
        {progressionIndicators.length > 0 && (
          <Card className="border-blue-500/30 bg-blue-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Info className="w-4 h-4" />
                Resumen de Progresión
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-green-500"></span>
                  <span>Mejorado</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-red-500"></span>
                  <span>Empeorado</span>
                </div>
                <div className="text-muted-foreground">
                  {progressionIndicators.filter(i => i.status === 'improved').length} mejoras / {progressionIndicators.filter(i => i.status === 'worsened').length} empeoramientos
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Separator className="my-6" />

        {/* Keyboard Shortcuts Hint */}
        {!readOnly && (
          <div className="text-xs text-muted-foreground flex items-center gap-3 px-4 py-3 bg-muted/30 rounded-lg">
            <span className="font-semibold">Atajos:</span>
            <span className="px-2 py-1 bg-background rounded">← →</span> Navegar
            <span className="px-2 py-1 bg-background rounded">Enter</span> Editar
            <span className="px-2 py-1 bg-background rounded">Esc</span> Cerrar
            <span className="px-2 py-1 bg-background rounded">Ctrl+S</span> Guardar
          </div>
        )}

        <Separator className="my-6" />

        {/* Chart Container with ref for PDF export */}
        <div ref={chartRef} className={cn(
          "space-y-6 transition-all duration-300",
          isAnimating && "opacity-50"
        )}>
          {/* Upper Arch */}
          <Card className="transition-all hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">
                Arcada Superior
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <PerioArchRow
                toothCodes={[...PERMANENT_TEETH_UPPER]}
                teeth={teeth}
                sites={["MB", "B", "DB"]}
                selectedTooth={selectedTooth}
                focusedToothIndex={focusedToothIndex}
                activeInput={activeInput}
                onSelectTooth={setSelectedTooth}
                onSetActiveInput={setActiveInput}
                onUpdateMeasurement={updateMeasurement}
                readOnly={readOnly}
                comparisonTeeth={comparisonData?.teeth}
                progressionIndicators={progressionIndicators}
              />
              <Separator className="my-4" />
              <PerioArchRow
                toothCodes={[...PERMANENT_TEETH_UPPER]}
                teeth={teeth}
                sites={["ML", "L", "DL"]}
                selectedTooth={selectedTooth}
                focusedToothIndex={focusedToothIndex}
                activeInput={activeInput}
                onSelectTooth={setSelectedTooth}
                onSetActiveInput={setActiveInput}
                onUpdateMeasurement={updateMeasurement}
                readOnly={readOnly}
                comparisonTeeth={comparisonData?.teeth}
                progressionIndicators={progressionIndicators}
              />
            </CardContent>
          </Card>

          {/* Lower Arch */}
          <Card className="transition-all hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">
                Arcada Inferior
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <PerioArchRow
                toothCodes={[...PERMANENT_TEETH_LOWER]}
                teeth={teeth}
                sites={["MB", "B", "DB"]}
                selectedTooth={selectedTooth}
                focusedToothIndex={focusedToothIndex}
                activeInput={activeInput}
                onSelectTooth={setSelectedTooth}
                onSetActiveInput={setActiveInput}
                onUpdateMeasurement={updateMeasurement}
                readOnly={readOnly}
                comparisonTeeth={comparisonData?.teeth}
                progressionIndicators={progressionIndicators}
              />
              <Separator className="my-4" />
              <PerioArchRow
                toothCodes={[...PERMANENT_TEETH_LOWER]}
                teeth={teeth}
                sites={["ML", "L", "DL"]}
                selectedTooth={selectedTooth}
                focusedToothIndex={focusedToothIndex}
                activeInput={setActiveInput}
                onSelectTooth={setSelectedTooth}
                onSetActiveInput={setActiveInput}
                onUpdateMeasurement={updateMeasurement}
                readOnly={readOnly}
                comparisonTeeth={comparisonData?.teeth}
                progressionIndicators={progressionIndicators}
              />
            </CardContent>
          </Card>
        </div>

        <Separator className="my-6" />

        {/* Selected Tooth Detail Panel - AS DIALOG */}
        {selectedTooth && teeth[selectedTooth] && (
          <Dialog open={!!selectedTooth} onOpenChange={() => setSelectedTooth(null)}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Diente #{selectedTooth}</DialogTitle>
              </DialogHeader>
              <ToothDetailPanelContent
                tooth={teeth[selectedTooth]!}
                onUpdate={(field, value) => updateToothProp(selectedTooth, field, value)}
                onUpdateMeasurement={(site, field, value) => updateMeasurement(selectedTooth, site, field, value)}
                readOnly={readOnly}
              />
            </DialogContent>
          </Dialog>
        )}

        <Separator className="my-6" />

        {/* Legend */}
        <PerioLegend />
      </div>
    </TooltipProvider>
  );
}

// ─── Arch Row with SVG Probing Chart ──────────────────────────────────────
interface PerioArchRowProps {
  toothCodes: number[];
  teeth: Record<number, PerioToothData>;
  sites: PerioSite[];
  selectedTooth: number | null;
  focusedToothIndex?: number;
  activeInput: { tooth: number; site: PerioSite; field: string } | null;
  onSelectTooth: (code: number) => void;
  onSetActiveInput: (input: { tooth: number; site: PerioSite; field: "probingDepth" | "recession" } | null) => void;
  onUpdateMeasurement: (tooth: number, site: PerioSite, field: keyof PerioMeasurement, value: unknown) => void;
  readOnly: boolean;
  comparisonTeeth?: Record<number, PerioToothData>;
  progressionIndicators?: Array<{
    toothCode: number;
    status: 'improved' | 'worsened' | 'stable';
    amount: number;
  }>;
}

function PerioArchRow({
  toothCodes,
  teeth,
  sites,
  selectedTooth,
  focusedToothIndex = 0,
  onSelectTooth,
  onSetActiveInput,
  onUpdateMeasurement,
  readOnly,
  comparisonTeeth,
  progressionIndicators = [],
}: PerioArchRowProps) {
  // Adaptive cell width based on screen size
  const CELL_W_DESKTOP = 72;
  const CELL_W_TABLET = 64;
  const CELL_W_MOBILE = 56;

  const CELL_W = useMemo(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 768) return CELL_W_MOBILE;
      if (window.innerWidth < 1024) return CELL_W_TABLET;
      return CELL_W_DESKTOP;
    }
    return CELL_W_DESKTOP;
  }, []);

  const CHART_H = 60;
  const MAX_DEPTH = 10;

  return (
    <div className="overflow-x-auto scroll-smooth snap-x snap-mandatory">
      <div className="min-w-fit snap-start">
        {/* Tooth numbers with progression indicators */}
        <div className="flex">
          {toothCodes.map((code, idx) => {
            const progression = progressionIndicators.find(p => p.toothCode === code);
            return (
              <Tooltip key={code}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onSelectTooth(code)}
                    className={cn(
                      "flex-shrink-0 text-center text-sm font-bold py-2 border-b-2 transition-all relative",
                      "hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/50",
                      teeth[code]?.missing && "text-muted-foreground/40 line-through",
                      selectedTooth === code && "border-primary bg-primary/10 ring-2 ring-primary/30",
                      focusedToothIndex === idx && "ring-2 ring-amber-500/50",
                      !selectedTooth && !teeth[code]?.missing && "border-transparent hover:bg-muted/50"
                    )}
                    style={{ width: CELL_W }}
                  >
                    {code}
                    {teeth[code]?.implant && <span className="text-blue-500 ml-0.5 text-xs">I</span>}
                    {progression && (
                      <span className={cn(
                        "absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center",
                        progression.status === 'improved' && "bg-green-500 text-white",
                        progression.status === 'worsened' && "bg-red-500 text-white"
                      )}>
                        {progression.status === 'improved' ? '↓' : '↑'}
                      </span>
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-medium">Diente {code}</p>
                  {teeth[code]?.implant && <p className="text-xs text-muted-foreground">{getImplantTooltip()}</p>}
                  {teeth[code]?.missing && <p className="text-xs text-muted-foreground">{getMissingTooltip()}</p>}
                  {progression && (
                    <p className="text-xs">
                      {progression.status === 'improved' ? 'Mejorado' : 'Empeorado'} por {Math.abs(progression.amount)}mm
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* SVG Probing Depth Chart */}
        <svg width={CELL_W * toothCodes.length} height={CHART_H} className="block">
          {/* Grid lines */}
          {[3, 5, 7].map((mm) => (
            <line
              key={mm}
              x1={0}
              y1={(mm / MAX_DEPTH) * CHART_H}
              x2={CELL_W * toothCodes.length}
              y2={(mm / MAX_DEPTH) * CHART_H}
              stroke={mm === 3 ? "#22c55e" : mm === 5 ? "#f59e0b" : "#ef4444"}
              strokeWidth={0.5}
              strokeDasharray="4,4"
              opacity={0.5}
            />
          ))}

          {/* Probing depth areas + points */}
          {toothCodes.map((code, toothIdx) => {
            const td = teeth[code];
            if (!td || td.missing) return null;
            const points = sites.map((site, siteIdx) => {
              const m = td.measurements[site];
              const x = toothIdx * CELL_W + (siteIdx + 0.5) * (CELL_W / sites.length);
              const y = Math.min((m.probingDepth / MAX_DEPTH) * CHART_H, CHART_H - 2);
              return { x, y, m, site, siteIdx };
            });

            // Comparison line
            const compPoints = comparisonTeeth?.[code]
              ? sites.map((site, siteIdx) => {
                  const cm = comparisonTeeth[code]!.measurements[site];
                  const x = toothIdx * CELL_W + (siteIdx + 0.5) * (CELL_W / sites.length);
                  const y = Math.min((cm.probingDepth / MAX_DEPTH) * CHART_H, CHART_H - 2);
                  return { x, y };
                })
              : [];

            return (
              <g key={code}>
                {/* Current probing polygon */}
                {points.length >= 2 && (
                  <polyline
                    points={points.map((p) => `${p.x},${p.y}`).join(" ")}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth={1.5}
                    className="transition-all duration-300"
                  />
                )}

                {/* Comparison polyline */}
                {compPoints.length >= 2 && (
                  <polyline
                    points={compPoints.map((p) => `${p.x},${p.y}`).join(" ")}
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth={1}
                    strokeDasharray="3,3"
                    opacity={0.6}
                  />
                )}

                {/* Data points with animation */}
                {points.map((p) => {
                  const severity = getDepthSeverity(p.m.probingDepth);
                  return (
                    <g key={`${code}-${p.site}`}>
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={4}
                        fill={DEPTH_COLORS[severity]}
                        stroke="white"
                        strokeWidth={1}
                        className={cn(
                          "transition-all duration-200",
                          !readOnly && "cursor-pointer hover:r-[6] hover:stroke-2"
                        )}
                        onClick={() =>
                          !readOnly &&
                          onSetActiveInput({ tooth: code, site: p.site, field: "probingDepth" })
                        }
                      />
                      {p.m.bleeding && (
                        <circle cx={p.x} cy={p.y - 8} r={2.5} fill="#ef4444" opacity={0.8} className="animate-pulse" />
                      )}
                      {p.m.probingDepth > 0 && (
                        <text x={p.x} y={p.y + 12} textAnchor="middle" fontSize={8} fill="currentColor" className="select-none">
                          {p.m.probingDepth}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>

        {/* Probing depth input row */}
        <div className="flex items-center gap-2 mb-2">
          <Label className="text-xs font-semibold text-muted-foreground uppercase">
            Profundidad de Sondaje (mm)
          </Label>
          <Badge variant="secondary" className="text-[10px]">0-15mm</Badge>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-3 h-3 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p>{getProbingDepthTooltip()}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex">
          {toothCodes.map((code) => {
            const td = teeth[code];
            return (
              <div key={code} className="flex-shrink-0 flex gap-1" style={{ width: CELL_W }}>
                {sites.map((site) => (
                  <Tooltip key={`${code}-${site}`}>
                    <TooltipTrigger asChild>
                      <Input
                        type="number"
                        min={0}
                        max={15}
                        value={td?.measurements[site]?.probingDepth || 0}
                        onChange={(e) =>
                          onUpdateMeasurement(code, site, "probingDepth", parseInt(e.target.value) || 0)
                        }
                        disabled={readOnly || td?.missing}
                        className={cn(
                          "w-full text-center text-xs py-2",
                          td?.missing && "opacity-30"
                        )}
                        style={{ width: CELL_W / sites.length }}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Diente {code} - {getSiteLabel(site)}</p>
                      <p className="text-xs text-muted-foreground">Profundidad actual: {td?.measurements[site]?.probingDepth || 0}mm</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            );
          })}
        </div>

        {/* Recession row */}
        <div className="flex items-center gap-2 mb-2 mt-4">
          <Label className="text-xs font-semibold text-muted-foreground uppercase">
            Recesión Gingival (mm)
          </Label>
          <Badge variant="secondary" className="text-[10px]">-5 a 15mm</Badge>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-3 h-3 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p>{getRecessionTooltip()}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex">
          {toothCodes.map((code) => {
            const td = teeth[code];
            return (
              <div key={code} className="flex-shrink-0 flex gap-1" style={{ width: CELL_W }}>
                {sites.map((site) => (
                  <Tooltip key={`${code}-${site}-rec`}>
                    <TooltipTrigger asChild>
                      <Input
                        type="number"
                        min={-5}
                        max={15}
                        value={td?.measurements[site]?.recession || 0}
                        onChange={(e) =>
                          onUpdateMeasurement(code, site, "recession", parseInt(e.target.value) || 0)
                        }
                        disabled={readOnly || td?.missing}
                        className={cn(
                          "w-full text-center text-xs py-2 bg-amber-50/50 dark:bg-amber-950/20",
                          td?.missing && "opacity-30"
                        )}
                        style={{ width: CELL_W / sites.length }}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Diente {code} - {getSiteLabel(site)}</p>
                      <p className="text-xs text-muted-foreground">Recesión actual: {td?.measurements[site]?.recession || 0}mm</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            );
          })}
        </div>

        {/* Bleeding toggle row */}
        <div className="flex items-center gap-2 mb-2 mt-4">
          <Label className="text-xs font-semibold text-muted-foreground uppercase">
            Sangrado al Sondaje (BOP)
          </Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-3 h-3 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p>{getBOPTooltip()}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex mt-3">
          {toothCodes.map((code) => {
            const td = teeth[code];
            return (
              <div key={code} className="flex-shrink-0 flex justify-center gap-2" style={{ width: CELL_W }}>
                {sites.map((site) => (
                  <Tooltip key={`${code}-${site}-bop`}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => !readOnly && onUpdateMeasurement(code, site, "bleeding", !td?.measurements[site]?.bleeding)}
                        disabled={readOnly || td?.missing}
                        className={cn(
                          "w-6 h-6 rounded-full border-2 transition-all duration-200",
                          "focus:ring-2 focus:ring-primary/50",
                          td?.measurements[site]?.bleeding
                            ? "bg-red-500 border-red-600 shadow-sm shadow-red-500/50 hover:scale-110"
                            : "bg-transparent border-muted-foreground/30 hover:border-red-400 hover:bg-red-100",
                          !readOnly && "hover:scale-110 active:scale-95"
                        )}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Diente {code} - {getSiteLabel(site)}</p>
                      <p className="text-xs text-muted-foreground">
                        {td?.measurements[site]?.bleeding ? "Sangrado presente" : "Sin sangrado"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            );
          })}
        </div>

        {/* Row labels */}
        <div className="flex text-xs text-muted-foreground mt-2 font-medium">
          {toothCodes.map((code) => (
            <div key={code} className="flex justify-around" style={{ width: CELL_W }}>
              {sites.map((s) => (
                <Tooltip key={s}>
                  <TooltipTrigger asChild>
                    <span className="cursor-help text-center hover:text-foreground transition-colors"
                          style={{ width: CELL_W / sites.length }}>
                      {s}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{getSiteLabel(s)}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Tooth Detail Panel Content ──────────────────────────────────────────────────────
interface ToothDetailPanelContentProps {
  tooth: PerioToothData;
  onUpdate: (field: keyof PerioToothData, value: unknown) => void;
  onUpdateMeasurement: (site: PerioSite, field: keyof PerioMeasurement, value: unknown) => void;
  readOnly: boolean;
}

function ToothDetailPanelContent({ tooth, onUpdate, onUpdateMeasurement, readOnly }: ToothDetailPanelContentProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground">Movilidad</Label>
          <Select
            value={tooth.mobility.toString()}
            onValueChange={(v) => onUpdate("mobility", parseInt(v))}
            disabled={readOnly}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[0, 1, 2, 3].map((v) => (
                <SelectItem key={v} value={v.toString()}>
                  {getMobilityLabel(v)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground">Furcación</Label>
          <Select
            value={tooth.furcation.toString()}
            onValueChange={(v) => onUpdate("furcation", parseInt(v))}
            disabled={readOnly}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[0, 1, 2, 3].map((v) => (
                <SelectItem key={v} value={v.toString()}>
                  {getFurcationLabel(v)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={tooth.implant}
            onCheckedChange={(c) => onUpdate("implant", !!c)}
            disabled={readOnly}
            className="border-2"
          />
          <Label className="cursor-pointer">Implante</Label>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={tooth.missing}
            onCheckedChange={(c) => onUpdate("missing", !!c)}
            disabled={readOnly}
            className="border-2"
          />
          <Label className="cursor-pointer">Ausente</Label>
        </div>
      </div>

      {/* Measurements Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-muted-foreground border-b bg-muted/30">
              <th className="text-left py-2 px-3">Sitio</th>
              <th className="text-center py-2">Prof. (mm)</th>
              <th className="text-center py-2">Recesión</th>
              <th className="text-center py-2">NIC (CAL)</th>
              <th className="text-center py-2">BOP</th>
              <th className="text-center py-2">Supuración</th>
              <th className="text-center py-2">Placa</th>
            </tr>
          </thead>
          <tbody>
            {PERIO_SITES.map((site) => {
              const m = tooth.measurements[site];
              const cal = calculateCAL(m.probingDepth, m.recession);
              return (
                <tr key={site} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                  <td className="font-mono font-bold py-2 px-3">{site}</td>
                  <td className="text-center">
                    <Input
                      type="number"
                      min={0}
                      max={15}
                      value={m.probingDepth}
                      onChange={(e) => onUpdateMeasurement(site, "probingDepth", parseInt(e.target.value) || 0)}
                      disabled={readOnly}
                      className="w-16 text-center py-2"
                    />
                  </td>
                  <td className="text-center">
                    <Input
                      type="number"
                      min={-5}
                      max={15}
                      value={m.recession}
                      onChange={(e) => onUpdateMeasurement(site, "recession", parseInt(e.target.value) || 0)}
                      disabled={readOnly}
                      className="w-16 text-center py-2"
                    />
                  </td>
                  <td className="text-center font-semibold" style={{ color: DEPTH_COLORS[getDepthSeverity(cal)] }}>
                    {cal}
                  </td>
                  <td className="text-center">
                    <Checkbox
                      checked={m.bleeding}
                      onCheckedChange={(c) => onUpdateMeasurement(site, "bleeding", !!c)}
                      disabled={readOnly}
                      className="border-2 mx-auto"
                    />
                  </td>
                  <td className="text-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Checkbox
                          checked={m.suppuration}
                          onCheckedChange={(c) => onUpdateMeasurement(site, "suppuration", !!c)}
                          disabled={readOnly}
                          className="border-2 mx-auto"
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{getSuppurationTooltip()}</p>
                      </TooltipContent>
                    </Tooltip>
                  </td>
                  <td className="text-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Checkbox
                          checked={m.plaque}
                          onCheckedChange={(c) => onUpdateMeasurement(site, "plaque", !!c)}
                          disabled={readOnly}
                          className="border-2 mx-auto"
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{getPlaqueTooltip()}</p>
                      </TooltipContent>
                    </Tooltip>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────
function StatCard({ label, value, severity }: { label: string; value: string | number; severity: ReturnType<typeof getDepthSeverity> }) {
  const bgMap: Record<string, string> = {
    healthy: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200",
    mild: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200",
    moderate: "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-200",
    severe: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200",
  };

  const bgClass = bgMap[severity] || bgMap.healthy;

  return (
    <Card className={cn("rounded-xl border transition-all hover:shadow-lg hover:scale-[1.02]", bgClass)}>
      <CardContent className="p-4 text-center">
        <p className="text-sm font-semibold text-muted-foreground mb-1">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

// ─── Legend ──────────────────────────────────────────────────────────────────
function PerioLegend() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Leyenda Clínica</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
          {/* Profundidades */}
          <div className="space-y-3">
            <p className="font-semibold text-muted-foreground text-xs uppercase">
              Profundidad de Sondaje
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full" style={{ background: DEPTH_COLORS.healthy }} />
                <span className="text-xs">≤3mm - Sano</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full" style={{ background: DEPTH_COLORS.mild }} />
                <span className="text-xs">4-5mm - Leve</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full" style={{ background: DEPTH_COLORS.moderate }} />
                <span className="text-xs">6-7mm - Moderado</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full" style={{ background: DEPTH_COLORS.severe }} />
                <span className="text-xs">≥8mm - Severo</span>
              </div>
            </div>
          </div>

          {/* Indicadores */}
          <div className="space-y-3">
            <p className="font-semibold text-muted-foreground text-xs uppercase">
              Indicadores Clínicos
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-red-500"></span>
                <span className="text-xs">BOP - Sangrado al sondaje</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-blue-500"></span>
                <span className="text-xs">Implante</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs line-through opacity-50">18</span>
                <span className="text-xs">Diente ausente</span>
              </div>
            </div>
          </div>

          {/* Comparación */}
          <div className="space-y-3">
            <p className="font-semibold text-muted-foreground text-xs uppercase">
              Comparación Histórica
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="border-b-2 border-purple-500 w-8"></div>
                <span className="text-xs">Línea anterior</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-green-500 text-white flex items-center justify-center text-[10px]">
                  ↓
                </span>
                <span className="text-xs">Mejorado</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px]">
                  ↑
                </span>
                <span className="text-xs">Empeorado</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Stats Calculator ───────────────────────────────────────────────────────
function calculatePerioStats(teeth: Record<number, PerioToothData>) {
  let totalDepth = 0;
  let totalSites = 0;
  let bleedingSites = 0;
  let pocketsOver4 = 0;
  let pocketsOver6 = 0;
  let missingTeeth = 0;

  Object.values(teeth).forEach((t) => {
    if (t.missing) { missingTeeth++; return; }
    Object.values(t.measurements).forEach((m) => {
      totalDepth += m.probingDepth;
      totalSites++;
      if (m.bleeding) bleedingSites++;
      if (m.probingDepth >= 4) pocketsOver4++;
      if (m.probingDepth >= 6) pocketsOver6++;
    });
  });

  return {
    avgDepth: totalSites > 0 ? totalDepth / totalSites : 0,
    bopPercentage: totalSites > 0 ? (bleedingSites / totalSites) * 100 : 0,
    pocketsOver4,
    pocketsOver6,
    missingTeeth,
  };
}

export default Periodontogram;
