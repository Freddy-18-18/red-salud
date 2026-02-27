"use client";

import { useState } from "react";
import { Card, Button, Badge, Progress } from "@red-salud/design-system";
import {
    Scan,
    Upload,
    Maximize2,
    Download,
    Share2,
    Sparkles,
    Activity,
    AlertCircle,
    FileText,
    ChevronRight,
    History
} from "lucide-react";
import { cn } from "@red-salud/core/utils";

export default function ImagingPage() {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const findings = [
        { zone: "Pieza 4.7", finding: "Caries oclusal profunda", confidence: 98, type: "danger" },
        { zone: "Pieza 1.2", finding: "Sombra radiolúcida periapical", confidence: 85, type: "warning" },
        { zone: "Maxilar Superior", finding: "Densidad ósea normal", confidence: 94, type: "success" },
    ];

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <h1 className="text-3xl font-bold tracking-tight">Dental Imaging AI</h1>
                        <Badge variant="outline" className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20 gap-1 capitalize">
                            <Sparkles className="w-3 h-3" /> Powered by Gemini
                        </Badge>
                    </div>
                    <p className="text-muted-foreground">Diagnóstico asistido por visión artificial y análisis de densidad.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="gap-2">
                        <History className="w-4 h-4" /> Historial
                    </Button>
                    <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                        <Upload className="w-4 h-4" /> Nueva Radiografía
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Viewer Area */}
                <div className="lg:col-span-2 space-y-4">
                    <Card className="aspect-video bg-black relative overflow-hidden ring-1 ring-border group border-indigo-500/20">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center space-y-4">
                                <Scan className="w-16 h-16 text-indigo-500/40 animate-pulse mx-auto" />
                                <p className="text-sm text-indigo-500/60 font-medium">Visor de Imágenes Médicas DICOM/HD</p>
                                <Button variant="ghost" className="text-white hover:bg-white/10 border border-white/20">
                                    Cargar Imagen de Paciente
                                </Button>
                            </div>
                        </div>

                        {/* HUD Overlay */}
                        <div className="absolute top-4 left-4 p-2 bg-black/60 backdrop-blur-md rounded border border-white/10 text-[10px] text-white/80 font-mono space-y-1">
                            <p>ID: P-992348</p>
                            <p>SCALE: 1.2x</p>
                            <p>CONTRAST: AUTO</p>
                        </div>

                        <div className="absolute bottom-4 right-4 flex gap-2">
                            <Button size="icon" variant="ghost" className="bg-black/60 text-white rounded-full hover:bg-indigo-600">
                                <Maximize2 className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="bg-black/60 text-white rounded-full hover:bg-indigo-600">
                                <Download className="w-4 h-4" />
                            </Button>
                        </div>
                    </Card>

                    <div className="grid grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <Card key={i} className="aspect-square bg-muted/20 border-dashed border-2 border-border/50 flex items-center justify-center hover:bg-indigo-500/5 transition-colors cursor-pointer group">
                                <Upload className="w-6 h-6 text-muted-foreground group-hover:text-indigo-500" />
                            </Card>
                        ))}
                    </div>
                </div>

                {/* AI Analysis Sidebar */}
                <div className="space-y-6">
                    <Card className="p-6 bg-gradient-to-br from-indigo-500/5 to-primary/5 border-indigo-500/20 space-y-6">
                        <div className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-indigo-600" />
                            <h2 className="font-bold text-lg">Análisis de IA</h2>
                        </div>

                        <div className="space-y-4">
                            {findings.map((f, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{f.zone}</span>
                                        <span className="text-muted-foreground">{f.confidence}% Confianza</span>
                                    </div>
                                    <div className={cn(
                                        "p-3 rounded-lg border text-sm flex items-start gap-2",
                                        f.type === 'danger' ? "bg-red-500/5 border-red-500/20 text-red-700 dark:text-red-400" :
                                            f.type === 'warning' ? "bg-amber-500/5 border-amber-500/20 text-amber-700 dark:text-amber-400" :
                                                "bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                                    )}>
                                        <AlertCircle className="w-4 h-4 mt-0.5" />
                                        <p className="font-medium">{f.finding}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4 border-t border-border/50 space-y-4">
                            <div className="space-y-2">
                                <p className="text-xs font-bold uppercase text-muted-foreground">Sugerencia Automática</p>
                                <Card className="p-3 bg-indigo-500/10 border-indigo-500/20 text-xs text-indigo-700 dark:text-indigo-300 italic">
                                    "Se recomienda exploración clínica de la pieza 4.7. Probable compromiso pulpar por profundidad de la lesión detectada."
                                </Card>
                            </div>
                            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 h-10 gap-2">
                                <FileText className="w-4 h-4" /> Generar Reporte PDF
                            </Button>
                        </div>
                    </Card>

                    <Card className="p-5 border-emerald-500/20 bg-emerald-500/5 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-600 uppercase">Estado de Salud Dental</span>
                            <span className="text-xs font-bold text-emerald-600">82%</span>
                        </div>
                        <Progress value={82} className="h-1.5 bg-emerald-500/10" />
                        <p className="text-[10px] text-muted-foreground">Comparado con el promedio de su rango de edad (74%)</p>
                    </Card>
                </div>
            </div>
        </div>
    );
}
