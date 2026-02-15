"use client";

import { useState, useCallback, useRef } from "react";
import { cn } from "@red-salud/core/utils";
import {
  MonitorUp, ZoomIn, ZoomOut, RotateCw, Contrast, Sun,
  ArrowLeft, Ruler, Move, FlipHorizontal, FlipVertical,
  Maximize2, Download, ChevronLeft, ChevronRight, Grid3X3
} from "lucide-react";
import {
  Button, Card, CardContent, CardHeader, CardTitle, Badge
} from "@red-salud/ui";
import Link from "next/link";
import type { DICOMStudy } from "@/types/dental";

// ─── Demo Studies ────────────────────────────────────────────────────────────
const DEMO_STUDIES: DICOMStudy[] = [
  {
    id: "dcm-1",
    patientId: "p1",
    studyDate: "2026-02-10",
    modality: "IO",
    description: "Periapical diente 36-37",
    seriesCount: 2,
    instanceCount: 2,
    bodyPart: "JAW",
    institutionName: "Clínica Red Salud",
    referringPhysician: "Dr. López",
    thumbnailUrl: "/demo/dicom-thumb-1.jpg",
    createdAt: "2026-02-10T10:00:00",
  },
  {
    id: "dcm-2",
    patientId: "p2",
    studyDate: "2026-02-08",
    modality: "PX",
    description: "Panorámica digital",
    seriesCount: 1,
    instanceCount: 1,
    bodyPart: "JAW",
    institutionName: "Clínica Red Salud",
    referringPhysician: "Dr. López",
    thumbnailUrl: "/demo/dicom-thumb-2.jpg",
    createdAt: "2026-02-08T14:00:00",
  },
  {
    id: "dcm-3",
    patientId: "p1",
    studyDate: "2026-02-05",
    modality: "CT",
    description: "CBCT implante zona 46",
    seriesCount: 1,
    instanceCount: 120,
    bodyPart: "JAW",
    institutionName: "Centro Radiológico Dental",
    referringPhysician: "Dr. Martínez",
    thumbnailUrl: "/demo/dicom-thumb-3.jpg",
    createdAt: "2026-02-05T11:00:00",
  },
];

const MODALITY_LABELS: Record<string, string> = {
  IO: "Intraoral",
  PX: "Panorámica",
  CT: "CBCT/Tomografía",
  CR: "Radiografía digital",
  MG: "Cefalometría",
};

type Tool = "pan" | "zoom" | "window" | "measure" | "rotate";

const TOOLS: Array<{ key: Tool; label: string; icon: React.ReactNode }> = [
  { key: "pan", label: "Mover", icon: <Move className="w-4 h-4" /> },
  { key: "zoom", label: "Zoom", icon: <ZoomIn className="w-4 h-4" /> },
  { key: "window", label: "Ventana", icon: <Contrast className="w-4 h-4" /> },
  { key: "measure", label: "Medir", icon: <Ruler className="w-4 h-4" /> },
  { key: "rotate", label: "Rotar", icon: <RotateCw className="w-4 h-4" /> },
];

export default function DICOMViewerPage() {
  const [studies] = useState(DEMO_STUDIES);
  const [selectedStudy, setSelectedStudy] = useState<string>(studies[0]?.id || "");
  const [activeTool, setActiveTool] = useState<Tool>("pan");
  const [windowLevel, setWindowLevel] = useState(128);
  const [windowWidth, setWindowWidth] = useState(256);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentSlice, setCurrentSlice] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const study = studies.find((s) => s.id === selectedStudy);
  const isCT = study?.modality === "CT";

  const resetView = () => {
    setZoom(1);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setBrightness(100);
    setContrast(100);
    setWindowLevel(128);
    setWindowWidth(256);
  };

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const imageTransform = `scale(${flipH ? -zoom : zoom}, ${flipV ? -zoom : zoom}) rotate(${rotation}deg)`;
  const imageFilter = `brightness(${brightness}%) contrast(${contrast}%)`;

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/medico">
            <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <MonitorUp className="w-6 h-6 text-primary" />
              Visor DICOM
            </h1>
            <p className="text-sm text-muted-foreground">Visor de imágenes médicas con controles de ventana</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Study List */}
        <div className="space-y-2">
          <p className="text-sm font-semibold">Estudios</p>
          {studies.map((s) => (
            <Card
              key={s.id}
              className={cn("cursor-pointer hover:shadow-md transition-all", selectedStudy === s.id && "ring-2 ring-primary")}
              onClick={() => { setSelectedStudy(s.id); resetView(); setCurrentSlice(1); }}
            >
              <CardContent className="pt-3 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded bg-gray-800 flex items-center justify-center shrink-0">
                    <MonitorUp className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{s.description}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Badge variant="outline" className="text-[10px]">{MODALITY_LABELS[s.modality] || s.modality}</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{s.studyDate} • {s.instanceCount} img</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Viewer */}
        <div className="lg:col-span-3" ref={containerRef}>
          <Card className="overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-muted/50 border-b flex-wrap gap-1">
              <div className="flex gap-0.5">
                {TOOLS.map((tool) => (
                  <Button
                    key={tool.key}
                    size="sm"
                    variant={activeTool === tool.key ? "default" : "ghost"}
                    className="h-7 text-xs"
                    onClick={() => setActiveTool(tool.key)}
                    title={tool.label}
                  >
                    {tool.icon}
                  </Button>
                ))}
              </div>
              <div className="flex gap-0.5">
                <Button size="sm" variant="ghost" className="h-7" onClick={() => setFlipH(!flipH)} title="Voltear H">
                  <FlipHorizontal className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" className="h-7" onClick={() => setFlipV(!flipV)} title="Voltear V">
                  <FlipVertical className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" className="h-7" onClick={resetView} title="Reset">
                  <RotateCw className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" className="h-7" onClick={toggleFullscreen} title="Pantalla completa">
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Image Area */}
            <div
              className="bg-black relative aspect-[4/3] flex items-center justify-center overflow-hidden cursor-move"
              onWheel={(e) => {
                e.preventDefault();
                setZoom((z) => Math.max(0.25, Math.min(5, z + (e.deltaY > 0 ? -0.1 : 0.1))));
              }}
            >
              <div
                className="w-full h-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center"
                style={{ transform: imageTransform, filter: imageFilter, transition: "transform 0.2s" }}
              >
                <div className="text-center text-gray-600">
                  <MonitorUp className="w-20 h-20 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">{study?.description}</p>
                  <p className="text-xs text-gray-700">{MODALITY_LABELS[study?.modality || ""] || study?.modality}</p>
                </div>
              </div>

              {/* DICOM Info Overlay */}
              <div className="absolute top-2 left-2 text-[10px] text-green-400 font-mono space-y-0.5 pointer-events-none">
                <p>{study?.institutionName}</p>
                <p>{study?.description}</p>
                <p>Fecha: {study?.studyDate}</p>
              </div>
              <div className="absolute top-2 right-2 text-[10px] text-green-400 font-mono text-right space-y-0.5 pointer-events-none">
                <p>W: {windowWidth} L: {windowLevel}</p>
                <p>Zoom: {Math.round(zoom * 100)}%</p>
                <p>Rot: {rotation}°</p>
              </div>
              <div className="absolute bottom-2 left-2 text-[10px] text-green-400 font-mono pointer-events-none">
                <p>{study?.referringPhysician}</p>
                <p>{study?.modality} • {study?.bodyPart}</p>
              </div>

              {/* CT Slice Navigation */}
              {isCT && (
                <div className="absolute bottom-2 right-2 flex items-center gap-1">
                  <Button size="sm" variant="ghost" className="h-6 text-white" onClick={() => setCurrentSlice((s) => Math.max(1, s - 1))}>
                    <ChevronLeft className="w-3 h-3" />
                  </Button>
                  <span className="text-[10px] text-green-400 font-mono">{currentSlice}/{study.instanceCount ?? 0}</span>
                  <Button size="sm" variant="ghost" className="h-6 text-white" onClick={() => setCurrentSlice((s) => Math.min(study.instanceCount ?? 0, s + 1))}>
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>

            {/* Slice Slider for CT */}
            {isCT && (
              <div className="px-3 py-1.5 bg-muted/50 border-t">
                <input
                  type="range"
                  min={1}
                  max={study.instanceCount}
                  value={currentSlice}
                  onChange={(e) => setCurrentSlice(Number(e.target.value))}
                  className="w-full h-1 accent-primary"
                />
              </div>
            )}
          </Card>
        </div>

        {/* Controls Panel */}
        <div className="space-y-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-xs">Windowing</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-[10px] text-muted-foreground flex justify-between">
                  <span>Window Level</span><span>{windowLevel}</span>
                </label>
                <input type="range" min={0} max={255} value={windowLevel} onChange={(e) => setWindowLevel(Number(e.target.value))} className="w-full h-1 accent-primary" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground flex justify-between">
                  <span>Window Width</span><span>{windowWidth}</span>
                </label>
                <input type="range" min={1} max={512} value={windowWidth} onChange={(e) => setWindowWidth(Number(e.target.value))} className="w-full h-1 accent-primary" />
              </div>
              <div className="flex gap-1 flex-wrap">
                <Button size="sm" variant="outline" className="text-[10px] h-6" onClick={() => { setWindowLevel(40); setWindowWidth(400); }}>Hueso</Button>
                <Button size="sm" variant="outline" className="text-[10px] h-6" onClick={() => { setWindowLevel(50); setWindowWidth(350); }}>Tejido</Button>
                <Button size="sm" variant="outline" className="text-[10px] h-6" onClick={() => { setWindowLevel(128); setWindowWidth(256); }}>Default</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-xs">Imagen</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-[10px] text-muted-foreground flex justify-between">
                  <span><Sun className="w-3 h-3 inline" /> Brillo</span><span>{brightness}%</span>
                </label>
                <input type="range" min={0} max={200} value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} className="w-full h-1 accent-primary" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground flex justify-between">
                  <span><Contrast className="w-3 h-3 inline" /> Contraste</span><span>{contrast}%</span>
                </label>
                <input type="range" min={0} max={200} value={contrast} onChange={(e) => setContrast(Number(e.target.value))} className="w-full h-1 accent-primary" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground flex justify-between">
                  <span><ZoomIn className="w-3 h-3 inline" /> Zoom</span><span>{Math.round(zoom * 100)}%</span>
                </label>
                <input type="range" min={25} max={500} value={Math.round(zoom * 100)} onChange={(e) => setZoom(Number(e.target.value) / 100)} className="w-full h-1 accent-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-xs">Info del Estudio</CardTitle></CardHeader>
            <CardContent className="space-y-1 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Modalidad</span><span>{MODALITY_LABELS[study?.modality || ""]}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Fecha</span><span>{study?.studyDate}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Series</span><span>{study?.seriesCount}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Imágenes</span><span>{study?.instanceCount}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Institución</span><span className="text-right">{study?.institutionName}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Médico</span><span>{study?.referringPhysician}</span></div>
            </CardContent>
          </Card>

          <Button variant="outline" size="sm" className="w-full">
            <Download className="w-4 h-4 mr-1" />Exportar Imagen
          </Button>
        </div>
      </div>
    </div>
  );
}
