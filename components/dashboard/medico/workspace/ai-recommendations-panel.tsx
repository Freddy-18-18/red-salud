"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, X, Sparkles, AlertCircle } from "lucide-react";

interface AIAnalysis {
  resumen: string;
  recomendaciones: string[];
  alertas: string[];
  diagnosticosSugeridos: string[];
}

interface AIRecommendationsPanelProps {
  aiAnalysis: AIAnalysis | null;
  onClose: () => void;
}

export function AIRecommendationsPanel({
  aiAnalysis,
  onClose,
}: AIRecommendationsPanelProps) {
  if (!aiAnalysis) return null;

  return (
    <div className="w-80 bg-white border-l flex flex-col overflow-hidden">
      <div className="flex-shrink-0 px-4 py-3 border-b bg-gradient-to-r from-purple-50 to-blue-50 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Brain className="h-4 w-4 text-purple-600" />
            Recomendaciones IA
          </h3>
          <p className="text-xs text-gray-600">Sugerencias para mejorar</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {aiAnalysis.resumen && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs font-medium text-blue-900 mb-1">Resumen</p>
            <p className="text-xs text-gray-700">{aiAnalysis.resumen}</p>
          </div>
        )}

        {aiAnalysis.recomendaciones.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
              Qué más preguntar/evaluar:
            </p>
            {aiAnalysis.recomendaciones.map((rec, index) => (
              <div key={index} className="flex items-start gap-2 p-2 bg-purple-50 rounded border border-purple-200">
                <Sparkles className="h-3 w-3 text-purple-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-700">{rec}</p>
              </div>
            ))}
          </div>
        )}

        {aiAnalysis.alertas.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
              Información faltante:
            </p>
            {aiAnalysis.alertas.map((alerta, index) => (
              <div key={index} className="flex items-start gap-2 p-2 bg-amber-50 rounded border border-amber-200">
                <AlertCircle className="h-3 w-3 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-700">{alerta}</p>
              </div>
            ))}
          </div>
        )}

        {aiAnalysis.diagnosticosSugeridos.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
              Diagnósticos sugeridos:
            </p>
            <div className="flex flex-wrap gap-2">
              {aiAnalysis.diagnosticosSugeridos.map((diag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {diag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
