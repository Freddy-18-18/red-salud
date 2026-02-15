"use client";

import { useState, useRef, useCallback } from "react";
import { cn } from "@red-salud/core/utils";
import {
  Brain, Upload, Image as ImageIcon, ZoomIn, ZoomOut,
  RotateCw, ArrowLeft, Sparkles, AlertTriangle, CheckCircle2,
  Eye, Download, ChevronRight, Loader2
} from "lucide-react";
import {
  Button, Card, CardContent, CardHeader, CardTitle, Badge
} from "@red-salud/ui";
import Link from "next/link";
import type { DiagnosticImage, AIAnalysisResult, AIFinding } from "@/types/dental";

// ─── Demo Analysis Results ───────────────────────────────────────────────────
const DEMO_ANALYSES: Array<DiagnosticImage & { analysis?: AIAnalysisResult }> = [
  {
    id: "img-1",
    patientId: "p1",
    imageType: "periapical",
    imageUrl: "/demo/xray-periapical.jpg",
    toothNumbers: [36, 37],
    capturedAt: "2026-02-10T10:00:00",
    notes: "Radiografía periapical zona molar inferior izquierda",
    analysis: {
      id: "a1",
      imageId: "img-1",
      model: "gemini-2.0-flash",
      findings: [
        { id: "f1", type: "caries", confidence: 0.92, description: "Caries interproximal mesial en diente 37, profundidad media afectando dentina", severity: "moderate", boundingBox: { x: 55, y: 30, width: 12, height: 15 } },
        { id: "f2", type: "bone_loss", confidence: 0.78, description: "Pérdida ósea horizontal leve en zona interproximal 36-37", severity: "mild", boundingBox: { x: 45, y: 60, width: 25, height: 10 } },
        { id: "f3", type: "restoration", confidence: 0.98, description: "Restauración de amalgama en diente 36 distal, en buen estado", severity: "info", boundingBox: { x: 35, y: 25, width: 10, height: 12 } },
      ],
      summary: "Se detecta caries interproximal en diente 37 que requiere tratamiento restaurador. Pérdida ósea horizontal incipiente sugiere evaluación periodontal. Restauración existente en 36 sin signos de filtración.",
      recommendations: [
        "Restauración directa de resina en diente 37 cara mesial",
        "Evaluación periodontal completa (sondaje)",
        "Seguimiento radiográfico en 6 meses para monitoring óseo",
      ],
      analyzedAt: "2026-02-10T10:05:00",
    },
  },
  {
    id: "img-2",
    patientId: "p2",
    imageType: "panoramic",
    imageUrl: "/demo/xray-panoramic.jpg",
    capturedAt: "2026-02-08T14:00:00",
    notes: "Panorámica inicial para evaluación general",
    analysis: {
      id: "a2",
      imageId: "img-2",
      model: "gemini-2.0-flash",
      findings: [
        { id: "f4", type: "impacted_tooth", confidence: 0.95, description: "Tercer molar inferior derecho (48) impactado mesioangular clase II", severity: "moderate", boundingBox: { x: 15, y: 65, width: 10, height: 12 } },
        { id: "f5", type: "impacted_tooth", confidence: 0.91, description: "Tercer molar inferior izquierdo (38) semi-impactado vertical", severity: "mild", boundingBox: { x: 80, y: 65, width: 10, height: 12 } },
        { id: "f6", type: "caries", confidence: 0.85, description: "Posible caries oclusal en diente 16", severity: "mild", boundingBox: { x: 25, y: 20, width: 8, height: 8 } },
      ],
      summary: "Panorámica muestra terceros molares inferiores: 48 impactado requiere exodoncia quirúrgica, 38 semi-impactado a evaluar. Posible caries en 16 requiere confirmación con radiografía periapical.",
      recommendations: [
        "Cirugía de tercer molar 48 (impactado mesioangular)",
        "Evaluación clínica de tercer molar 38",
        "Radiografía periapical de diente 16 para confirmar caries",
      ],
      analyzedAt: "2026-02-08T14:10:00",
    },
  },
];

const SEVERITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  critical: { label: "Crítico", color: "text-red-600", bg: "bg-red-100 dark:bg-red-950/30 border-red-300" },
  moderate: { label: "Moderado", color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-950/30 border-amber-300" },
  mild: { label: "Leve", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-950/30 border-blue-300" },
  info: { label: "Info", color: "text-gray-600", bg: "bg-gray-100 dark:bg-gray-800/30 border-gray-300" },
};

const FINDING_TYPE_MAP: Record<string, string> = {
  caries: "Caries",
  bone_loss: "Pérdida ósea",
  periapical_lesion: "Lesión periapical",
  impacted_tooth: "Diente impactado",
  restoration: "Restauración",
  fracture: "Fractura",
  root_canal: "Conducto radicular",
  calculus: "Cálculo",
};

export default function AIRadiographyPage() {
  const [images] = useState(DEMO_ANALYSES);
  const [selectedId, setSelectedId] = useState<string>(images[0]?.id || "");
  const [zoom, setZoom] = useState(1);
  const [showFindings, setShowFindings] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [highlightedFinding, setHighlightedFinding] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const selected = images.find((i) => i.id === selectedId);
  const analysis = selected?.analysis;

  const handleUpload = useCallback(() => {
    fileRef.current?.click();
  }, []);

  const simulateAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => setIsAnalyzing(false), 3000);
  };

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
              <Brain className="w-6 h-6 text-primary" />
              IA Diagnóstica de Radiografías
            </h1>
            <p className="text-sm text-muted-foreground">Análisis automatizado con inteligencia artificial (Gemini Vision)</p>
          </div>
        </div>
        <div className="flex gap-2">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" />
          <Button variant="outline" size="sm" onClick={handleUpload}>
            <Upload className="w-4 h-4 mr-1" />Subir Imagen
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Image List */}
        <div className="space-y-2">
          <p className="text-sm font-semibold">Imágenes</p>
          {images.map((img) => (
            <Card
              key={img.id}
              className={cn("cursor-pointer transition-all hover:shadow-md", selectedId === img.id && "ring-2 ring-primary")}
              onClick={() => { setSelectedId(img.id); setZoom(1); }}
            >
              <CardContent className="pt-3 pb-3">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium capitalize">{img.imageType}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {img.toothNumbers?.length ? `Dientes: ${img.toothNumbers.join(", ")}` : "Panorámica"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{new Date(img.capturedAt).toLocaleDateString("es-VE")}</p>
                  </div>
                  {img.analysis && <Sparkles className="w-4 h-4 text-primary shrink-0" />}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Viewer */}
        <div className="lg:col-span-2 space-y-3">
          <Card className="overflow-hidden">
            <div className="bg-black relative aspect-[4/3] flex items-center justify-center overflow-hidden">
              {/* Placeholder for actual X-ray image */}
              <div
                className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative"
                style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
              >
                <div className="text-center text-gray-500">
                  <ImageIcon className="w-16 h-16 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Radiografía {selected?.imageType}</p>
                  <p className="text-xs">{selected?.notes}</p>
                </div>

                {/* Finding overlays */}
                {showFindings && analysis?.findings.map((f) => (
                  <div
                    key={f.id}
                    className={cn(
                      "absolute border-2 rounded transition-all cursor-pointer",
                      highlightedFinding === f.id ? "border-white bg-white/20 shadow-lg" :
                      f.severity === "critical" ? "border-red-500 bg-red-500/10" :
                      f.severity === "moderate" ? "border-amber-500 bg-amber-500/10" :
                      f.severity === "mild" ? "border-blue-400 bg-blue-400/10" :
                      "border-gray-400 bg-gray-400/10"
                    )}
                    style={{
                      left: `${f.boundingBox?.x || 0}%`,
                      top: `${f.boundingBox?.y || 0}%`,
                      width: `${f.boundingBox?.width || 10}%`,
                      height: `${f.boundingBox?.height || 10}%`,
                    }}
                    onMouseEnter={() => setHighlightedFinding(f.id)}
                    onMouseLeave={() => setHighlightedFinding(null)}
                  >
                    {highlightedFinding === f.id && (
                      <div className="absolute -top-8 left-0 bg-white text-black text-[10px] px-2 py-1 rounded shadow whitespace-nowrap z-10">
                        {FINDING_TYPE_MAP[f.type] || f.type} ({Math.round(f.confidence * 100)}%)
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Analyzing overlay */}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                  <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
                  <p className="text-white text-sm font-medium">Analizando con IA...</p>
                  <p className="text-gray-400 text-xs">Procesando imagen con Gemini Vision</p>
                </div>
              )}
            </div>

            {/* Controls */}
            <CardContent className="pt-2 pb-2 flex items-center justify-between">
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}><ZoomOut className="w-4 h-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => setZoom(1)}>{Math.round(zoom * 100)}%</Button>
                <Button size="sm" variant="ghost" onClick={() => setZoom((z) => Math.min(3, z + 0.25))}><ZoomIn className="w-4 h-4" /></Button>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant={showFindings ? "default" : "outline"} onClick={() => setShowFindings(!showFindings)}>
                  <Eye className="w-4 h-4 mr-1" />{showFindings ? "Ocultar" : "Mostrar"} Hallazgos
                </Button>
                {!analysis && (
                  <Button size="sm" onClick={simulateAnalysis} disabled={isAnalyzing}>
                    <Sparkles className="w-4 h-4 mr-1" />Analizar con IA
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analysis Results */}
        <div className="space-y-4">
          {analysis ? (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Análisis IA
                  </CardTitle>
                  <p className="text-[10px] text-muted-foreground">Modelo: {analysis.model} • {new Date(analysis.analyzedAt).toLocaleString("es-VE")}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs leading-relaxed">{analysis.summary}</p>
                </CardContent>
              </Card>

              {/* Findings */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Hallazgos ({analysis.findings.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {analysis.findings.map((f) => {
                    const sev = SEVERITY_CONFIG[f.severity];
                    return (
                      <div
                        key={f.id}
                        className={cn(
                          "p-2 rounded-lg border text-xs transition-all cursor-pointer",
                          sev?.bg,
                          highlightedFinding === f.id && "ring-2 ring-primary"
                        )}
                        onMouseEnter={() => setHighlightedFinding(f.id)}
                        onMouseLeave={() => setHighlightedFinding(null)}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <Badge variant="outline" className="text-[10px]">
                            {FINDING_TYPE_MAP[f.type] || f.type}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Badge className={cn("text-[10px]", sev?.bg)}>{sev?.label}</Badge>
                            <span className="text-[10px] font-mono">{Math.round(f.confidence * 100)}%</span>
                          </div>
                        </div>
                        <p className="text-xs mt-1">{f.description}</p>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Recomendaciones</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1.5">
                    {(analysis.recommendations ?? []).map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs">
                        <ChevronRight className="w-3 h-3 mt-0.5 text-primary shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <div className="text-[10px] text-muted-foreground bg-muted/50 p-2 rounded border">
                <AlertTriangle className="w-3 h-3 inline mr-1" />
                El análisis de IA es una herramienta de apoyo diagnóstico. Todas las decisiones clínicas deben ser validadas por el profesional tratante.
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Brain className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">Sin análisis</p>
                <p className="text-xs">Presione &quot;Analizar con IA&quot; para obtener hallazgos automáticos.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
