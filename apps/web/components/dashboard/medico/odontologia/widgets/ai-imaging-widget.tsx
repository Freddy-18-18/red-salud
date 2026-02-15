"use client";

import { useState } from "react";
import { Card } from "@red-salud/ui";
import { Sparkles, Upload, FileText, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@red-salud/ui";
import { cn } from "@red-salud/core/utils";

export function AIImagingWidget() {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<{
        findings: string[];
        confidence: number;
        recommendation: string;
    } | null>(null);

    const simulateAnalysis = () => {
        setIsAnalyzing(true);
        // Simulating Gemini Vision API call
        setTimeout(() => {
            setAnalysisResult({
                findings: [
                    "Caries distal en pieza 36",
                    "Pérdida ósea leve en sector anteroinferior",
                    "Sombra compatible con quiste periapical en 12"
                ],
                confidence: 94,
                recommendation: "Realizar pruebas de vitalidad pulpar en pieza 12."
            });
            setIsAnalyzing(false);
        }, 3000);
    };

    return (
        <Card className="p-6 h-full flex flex-col space-y-4 bg-gradient-to-br from-indigo-500/5 to-primary/5 border-primary/20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-500">
                    <Sparkles className="w-5 h-5" />
                    <h3 className="font-bold text-lg">AI Vision: Analizador de Rayos X</h3>
                </div>
                <div className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">
                    Gemini Flash 1.5
                </div>
            </div>

            {!analysisResult && !isAnalyzing ? (
                <div className="flex-1 border-2 border-dashed border-indigo-500/20 rounded-xl flex flex-col items-center justify-center p-6 text-center space-y-4 hover:border-indigo-500/40 transition-colors">
                    <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center">
                        <Upload className="w-8 h-8 text-indigo-500" />
                    </div>
                    <div className="space-y-1">
                        <p className="font-semibold">Subir Radiografía</p>
                        <p className="text-xs text-muted-foreground">
                            Soporta panorámicas, periapicales y cefalometrías (JPG, PNG, DICOM).
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="border-indigo-500/50 hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                        onClick={simulateAnalysis}
                    >
                        Seleccionar archivo
                    </Button>
                </div>
            ) : isAnalyzing ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                    <div className="relative">
                        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                        <Sparkles className="w-5 h-5 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-sm font-medium animate-pulse">Analizando densidad ósea y patrones de caries...</p>
                </div>
            ) : (
                <div className="flex-1 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground font-medium uppercase">Hallazgos Detectados</span>
                            <span className="text-indigo-500 font-bold">{analysisResult?.confidence}% Confianza</span>
                        </div>
                        <div className="space-y-1.5">
                            {analysisResult?.findings.map((finding, i) => (
                                <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-indigo-500/5 border border-indigo-500/10 text-xs">
                                    <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                                    <span>{finding}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10 space-y-1">
                        <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold text-[10px] uppercase">
                            <AlertCircle className="w-3 h-3" /> Sugerencia de Plan
                        </div>
                        <p className="text-[11px] leading-relaxed italic text-muted-foreground">
                            "{analysisResult?.recommendation}"
                        </p>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs text-muted-foreground hover:text-indigo-500"
                        onClick={() => setAnalysisResult(null)}
                    >
                        Analizar otra imagen
                    </Button>
                </div>
            )}

            <div className="text-[9px] text-center text-muted-foreground border-t border-border/50 pt-2">
                La IA es una herramienta de apoyo. El diagnóstico final debe ser validado por el profesional médico.
            </div>
        </Card>
    );
}
