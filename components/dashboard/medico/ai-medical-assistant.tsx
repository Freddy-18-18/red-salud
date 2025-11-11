"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Loader2, 
  Wand2, 
  FileText, 
  AlertCircle,
  CheckCircle2,
  Copy,
  RefreshCw
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AIAssistantProps {
  onNotaGenerada: (nota: string) => void;
  onCodigosICD11Sugeridos: (codigos: string[]) => void;
  notaActual?: string;
  alergias?: string[];
  condicionesCronicas?: string[];
  medicamentosActuales?: string[];
}

export function AIMedicalAssistant({
  onNotaGenerada,
  onCodigosICD11Sugeridos,
  notaActual = "",
  alergias = [],
  condicionesCronicas = [],
  medicamentosActuales = [],
}: AIAssistantProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Campos del formulario de síntomas
  const [motivoConsulta, setMotivoConsulta] = useState("");
  const [sintomas, setSintomas] = useState("");
  const [duracion, setDuracion] = useState("");

  const handleGenerateNote = async () => {
    if (!motivoConsulta && !sintomas) {
      setError("Ingresa al menos el motivo de consulta o los síntomas");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/gemini/generate-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          motivoConsulta,
          sintomas,
          duracion,
          antecedentesMedicos: condicionesCronicas,
          alergias,
          medicamentosActuales,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Error al generar la nota");
      }

      // Aplicar la nota generada
      onNotaGenerada(data.data.notaCompleta);

      // Sugerir códigos ICD-11 si hay
      if (data.data.codigosICD11Sugeridos && data.data.codigosICD11Sugeridos.length > 0) {
        const codigos = data.data.codigosICD11Sugeridos.map(
          (c: any) => `${c.codigo} - ${c.descripcion}`
        );
        onCodigosICD11Sugeridos(codigos);
      }

      setSuccess("✨ Nota médica generada exitosamente");
      
      // Limpiar campos
      setMotivoConsulta("");
      setSintomas("");
      setDuracion("");
    } catch (err: any) {
      console.error("Error generando nota:", err);
      setError(err.message || "Error al generar la nota médica");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImproveNote = async () => {
    if (!notaActual) {
      setError("No hay nota para mejorar. Escribe algo primero.");
      return;
    }

    setIsImproving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/gemini/improve-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nota: notaActual }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Error al mejorar la nota");
      }

      onNotaGenerada(data.data.notaMejorada);
      setSuccess("✨ Nota mejorada y estructurada");
    } catch (err: any) {
      console.error("Error mejorando nota:", err);
      setError(err.message || "Error al mejorar la nota");
    } finally {
      setIsImproving(false);
    }
  };

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-base">Asistente IA Médico</CardTitle>
              <CardDescription className="text-xs">
                Powered by Google Gemini
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            Beta
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-xs text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* Opción 1: Generar desde síntomas */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-purple-600" />
            <Label className="text-sm font-semibold">Generar Nota desde Síntomas</Label>
          </div>

          <div className="space-y-2">
            <div>
              <Label htmlFor="motivo" className="text-xs">
                Motivo de Consulta
              </Label>
              <Textarea
                id="motivo"
                placeholder="Ej: Dolor abdominal, Fiebre, Tos..."
                value={motivoConsulta}
                onChange={(e) => setMotivoConsulta(e.target.value)}
                rows={2}
                className="text-sm"
              />
            </div>

            <div>
              <Label htmlFor="sintomas" className="text-xs">
                Síntomas Detallados
              </Label>
              <Textarea
                id="sintomas"
                placeholder="Ej: Dolor en epigastrio, tipo ardor, que aumenta después de comer..."
                value={sintomas}
                onChange={(e) => setSintomas(e.target.value)}
                rows={3}
                className="text-sm"
              />
            </div>

            <div>
              <Label htmlFor="duracion" className="text-xs">
                Duración (opcional)
              </Label>
              <Textarea
                id="duracion"
                placeholder="Ej: 3 días, 2 semanas..."
                value={duracion}
                onChange={(e) => setDuracion(e.target.value)}
                rows={1}
                className="text-sm"
              />
            </div>
          </div>

          <Button
            onClick={handleGenerateNote}
            disabled={isGenerating || (!motivoConsulta && !sintomas)}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            size="sm"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generando con IA...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generar Nota Completa
              </>
            )}
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-gradient-to-br from-purple-50 to-blue-50 px-2 text-gray-500">
              o
            </span>
          </div>
        </div>

        {/* Opción 2: Mejorar nota existente */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-600" />
            <Label className="text-sm font-semibold">Mejorar Nota Existente</Label>
          </div>

          <p className="text-xs text-gray-600">
            La IA estructurará y mejorará la nota que ya escribiste, siguiendo el formato SOAP profesional.
          </p>

          <Button
            onClick={handleImproveNote}
            disabled={isImproving || !notaActual}
            variant="outline"
            className="w-full border-blue-300 hover:bg-blue-50"
            size="sm"
          >
            {isImproving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Mejorando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Mejorar y Estructurar Nota
              </>
            )}
          </Button>
        </div>

        {/* Info */}
        <div className="pt-2 border-t border-purple-200">
          <p className="text-xs text-gray-600">
            💡 <strong>Tip:</strong> La IA usa la información médica del paciente (alergias, condiciones, medicamentos) para generar notas más precisas.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
