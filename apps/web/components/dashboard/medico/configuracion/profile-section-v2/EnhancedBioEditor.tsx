/**
 * @file EnhancedBioEditor.tsx
 * @description Editor de biografía mejorado con análisis en tiempo real y sugerencias de IA
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Loader2,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  FileText,
  Award,
  Languages,
  Target,
  Lightbulb,
} from "lucide-react";
import { Label } from "@red-salud/ui";
import { Textarea } from "@red-salud/ui";
import { Button } from "@red-salud/ui";
import { Badge } from "@red-salud/ui";
import { cn } from "@red-salud/core/utils";
import type { BioAnalysis } from "./types";

interface EnhancedBioEditorProps {
  value: string;
  onChange: (value: string) => void;
  specialty: string;
  doctorName: string;
}

export function EnhancedBioEditor({
  value,
  onChange,
  specialty,
  doctorName,
}: EnhancedBioEditorProps) {
  const [improving, setImproving] = useState(false);
  const [analysis, setAnalysis] = useState<BioAnalysis | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  /**
   * Analiza la biografía en tiempo real
   */
  const analyzeBio = useCallback((text: string): BioAnalysis => {
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    const sentences = text.split(/[.!?]+/).filter(Boolean);

    // Análisis de legibilidad (Flesch Reading Ease simplificado)
    const avgWordsPerSentence = sentences.length > 0 ? wordCount / sentences.length : 0;
    const readabilityScore = Math.max(0, Math.min(100, 100 - (avgWordsPerSentence * 2)));

    // Detectar elementos clave
    const hasCredentials = /certificad|diplomad|maestr|doctor|especialista|título/i.test(text);
    const hasExperience = /año|experiencia|práctica|atención|paciente/i.test(text);
    const hasSpecialties = /especializ|enfoque|área|interés/i.test(text);

    // Generar sugerencias
    const suggestions: string[] = [];

    if (wordCount < 50) {
      suggestions.push("Agrega más detalles sobre tu formación y experiencia");
    }
    if (!hasCredentials) {
      suggestions.push("Menciona tus certificaciones o títulos académicos");
    }
    if (!hasExperience) {
      suggestions.push("Incluye tus años de experiencia y áreas de práctica");
    }
    if (!hasSpecialties) {
      suggestions.push("Describe tus áreas de especialización o interés");
    }
    if (wordCount > 300) {
      suggestions.push("Considera acortar el texto para mejor legibilidad");
    }
    if (avgWordsPerSentence > 25) {
      suggestions.push("Usa oraciones más cortas para mejorar la claridad");
    }

    return {
      wordCount,
      readabilityScore,
      hasCredentials,
      hasExperience,
      hasSpecialties,
      suggestions,
    };
  }, []);

  useEffect(() => {
    if (value) {
      const result = analyzeBio(value);
      setAnalysis(result);
    } else {
      setAnalysis(null);
    }
  }, [value, analyzeBio]);

  /**
   * Mejora la biografía con IA
   */
  const handleImprove = async () => {
    if (!value || value.length < 20) {
      return;
    }

    setImproving(true);
    try {
      const response = await fetch("/api/ai/improve-bio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          biografia: value,
          nombre: doctorName,
          especialidad: specialty,
        }),
      });

      if (!response.ok) throw new Error("Error al mejorar la biografía");

      const data = await response.json();
      if (data.improved_bio) {
        onChange(data.improved_bio);
      }
    } catch (error) {
      console.error("[EnhancedBioEditor] Error:", error);
    } finally {
      setImproving(false);
    }
  };

  /**
   * Aplica un template de biografía
   */
  const applyTemplate = () => {
    const template = `Soy ${doctorName}, especialista en ${specialty || "medicina"} con amplia experiencia en la atención de pacientes.

Mi enfoque se centra en brindar atención médica de calidad, combinando conocimientos actualizados con un trato humano y personalizado.

Cuento con formación especializada y me mantengo en constante actualización para ofrecer las mejores opciones de tratamiento a mis pacientes.`;

    onChange(template);
  };

  const getQualityColor = () => {
    if (!analysis) return "text-gray-400";
    const score = (
      (analysis.wordCount >= 50 && analysis.wordCount <= 300 ? 25 : 0) +
      (analysis.hasCredentials ? 25 : 0) +
      (analysis.hasExperience ? 25 : 0) +
      (analysis.hasSpecialties ? 25 : 0)
    );

    if (score >= 75) return "text-green-500";
    if (score >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  const getQualityLabel = () => {
    if (!analysis) return "Sin analizar";
    const score = (
      (analysis.wordCount >= 50 && analysis.wordCount <= 300 ? 25 : 0) +
      (analysis.hasCredentials ? 25 : 0) +
      (analysis.hasExperience ? 25 : 0) +
      (analysis.hasSpecialties ? 25 : 0)
    );

    if (score >= 75) return "Excelente";
    if (score >= 50) return "Buena";
    if (score >= 25) return "Mejorable";
    return "Básica";
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Label htmlFor="biografia" className="text-base font-semibold">
          Biografía Profesional
        </Label>
        <div className="flex items-center gap-2">
          {value.length === 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={applyTemplate}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
            >
              <FileText className="h-4 w-4 mr-1.5" />
              Usar Template
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleImprove}
            disabled={improving || value.length < 20}
            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20"
          >
            {improving ? (
              <>
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                Mejorando...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-1.5" />
                Mejorar con IA
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="relative">
        <Textarea
          id="biografia"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Cuéntanos sobre tu experiencia, formación y enfoque profesional...

Ejemplo:
• Tu especialidad y años de experiencia
• Formación académica y certificaciones
• Áreas de interés o subespecialidades
• Enfoque de atención al paciente
• Idiomas que hablas"
          rows={8}
          className="resize-none text-sm leading-relaxed"
        />

        {/* Contador de palabras */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <Badge
            variant="secondary"
            className={cn(
              "text-xs",
              analysis && analysis.wordCount < 50 && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
              analysis && analysis.wordCount >= 50 && analysis.wordCount <= 300 && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
              analysis && analysis.wordCount > 300 && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
            )}
          >
            {analysis?.wordCount || 0} palabras
          </Badge>
        </div>
      </div>

      {/* Análisis en tiempo real */}
      <AnimatePresence>
        {analysis && value.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            {/* Barra de calidad */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Calidad de la Biografía
                </span>
                <span className={cn("text-sm font-semibold", getQualityColor())}>
                  {getQualityLabel()}
                </span>
              </div>

              {/* Indicadores */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex items-center gap-2">
                  {analysis.wordCount >= 50 && analysis.wordCount <= 300 ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Longitud óptima
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {analysis.hasCredentials ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Credenciales
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {analysis.hasExperience ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Experiencia
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {analysis.hasSpecialties ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Especialidades
                  </span>
                </div>
              </div>

              {/* Legibilidad */}
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Legibilidad</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {Math.round(analysis.readabilityScore)}/100
                  </span>
                </div>
                <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${analysis.readabilityScore}%` }}
                    transition={{ duration: 0.5 }}
                    className={cn(
                      "h-full rounded-full",
                      analysis.readabilityScore >= 70 && "bg-green-500",
                      analysis.readabilityScore >= 40 && analysis.readabilityScore < 70 && "bg-yellow-500",
                      analysis.readabilityScore < 40 && "bg-red-500"
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Sugerencias */}
            {analysis.suggestions.length > 0 && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <button
                  type="button"
                  onClick={() => setShowSuggestions(!showSuggestions)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      Sugerencias de Mejora ({analysis.suggestions.length})
                    </span>
                  </div>
                  <motion.div
                    animate={{ rotate: showSuggestions ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {showSuggestions && (
                    <motion.ul
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 space-y-2"
                    >
                      {analysis.suggestions.map((suggestion, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-2 text-sm text-blue-600 dark:text-blue-400"
                        >
                          <span className="text-blue-400 dark:text-blue-500 mt-0.5">•</span>
                          <span>{suggestion}</span>
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ayuda */}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        💡 Esta información será visible para tus pacientes. Una biografía completa aumenta la confianza y las conversiones hasta un 40%.
      </p>
    </div>
  );
}
