"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Save,
  Printer,
  Sparkles,
  Loader2,
  FileText,
  AlertCircle,
  Search,
  Plus,
  X,
  Calendar,
  Activity,
  ChevronRight,
  Brain,
  ChevronLeft,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TemplateMarketplace } from "./template-marketplace";
import { StructuredTemplateEditor } from "./structured-template-editor";
import { StructuredTemplateMarketplace } from "./structured-template-marketplace";
import { StructuredTemplate } from "@/lib/templates/structured-templates";

interface MedicalWorkspaceProps {
  paciente: {
    cedula: string;
    nombre_completo: string;
    edad: number | null;
    genero: string;
  };
  alergias: string[];
  setAlergias: (value: string[]) => void;
  condicionesCronicas: string[];
  setCondicionesCronicas: (value: string[]) => void;
  medicamentosActuales: string[];
  setMedicamentosActuales: (value: string[]) => void;
  notasMedicas: string;
  setNotasMedicas: (value: string) => void;
  diagnosticos: string[];
  setDiagnosticos: (value: string[]) => void;
  onSave: () => void;
  onBack: () => void;
  loading: boolean;
}

interface HistorialItem {
  id: string;
  fecha: string;
  diagnostico: string;
  notas: string;
  doctor: string;
}

interface AIAnalysis {
  resumen: string;
  recomendaciones: string[];
  alertas: string[];
  diagnosticosSugeridos: string[];
}

export function MedicalWorkspace({
  paciente,
  alergias,
  condicionesCronicas,
  medicamentosActuales,
  setMedicamentosActuales,
  notasMedicas,
  setNotasMedicas,
  diagnosticos,
  setDiagnosticos,
  onSave,
  onBack,
  loading,
}: MedicalWorkspaceProps) {
  const [icdSearchQuery, setIcdSearchQuery] = useState("");
  const [icdResults, setIcdResults] = useState<any[]>([]);
  const [isSearchingICD, setIsSearchingICD] = useState(false);
  const [activeTab, setActiveTab] = useState("estructurado");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [historialClinico, setHistorialClinico] = useState<HistorialItem[]>([]);
  const [selectedHistorial, setSelectedHistorial] = useState<HistorialItem | null>(null);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [showHistorial, setShowHistorial] = useState(true);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showMarketplace, setShowMarketplace] = useState(false);
  const [showStructuredMarketplace, setShowStructuredMarketplace] = useState(false);
  const [selectedStructuredTemplate, setSelectedStructuredTemplate] = useState<StructuredTemplate | null>(null);
  const [isLoadingAISuggestions, setIsLoadingAISuggestions] = useState(false);
  const [userId, setUserId] = useState<string>("");
  
  const notasTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Obtener userId
  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUserId();
  }, []);

  // Autocompletado inteligente mejorado con IA
  useEffect(() => {
    const cursorPosition = notasTextareaRef.current?.selectionStart || 0;
    const textBeforeCursor = notasMedicas.substring(0, cursorPosition);
    const lines = textBeforeCursor.split('\n');
    const currentLine = lines[lines.length - 1] || '';
    
    // Obtener la última palabra escrita
    const words = currentLine.split(/\s+/);
    const lastWord = words[words.length - 1] || '';
    
    if (lastWord.length > 1) {
      // Primero intentar con sugerencias locales (más rápido)
      const medicalPhrases = [
        "MOTIVO DE CONSULTA:",
        "HISTORIA DE LA ENFERMEDAD ACTUAL:",
        "ANTECEDENTES PERSONALES:",
        "ANTECEDENTES FAMILIARES:",
        "EXAMEN FÍSICO:",
        "SIGNOS VITALES:",
        "IMPRESIÓN DIAGNÓSTICA:",
        "PLAN DE TRATAMIENTO:",
        "INDICACIONES:",
        "RECOMENDACIONES:",
        "CONTROL:",
        "EVOLUCIÓN:",
        "LABORATORIOS:",
        "IMÁGENES:",
        "Estado General:",
        "Cabeza y Cuello:",
        "Tórax:",
        "Abdomen:",
        "Extremidades:",
        "Neurológico:",
        "Piel y Faneras:",
        "PA: [___] mmHg",
        "FC: [___] lpm",
        "FR: [___] rpm",
        "Temp: [___] °C",
        "Sat O2: [___] %",
        "Peso: [___] kg",
        "Talla: [___] cm",
        "IMC: [___]",
        "Paciente refiere",
        "Paciente niega",
        "Al examen físico se evidencia",
        "Se indica",
        "Se prescribe",
        "Control en",
        "Signos de alarma:",
        "Dieta:",
        "Reposo:",
        "consciente",
        "orientado",
        "hidratado",
        "afebril",
        "normotenso",
        "taquicárdico",
        "bradicárdico",
        "eupneico",
        "taquipneico",
      ];
      
      const filtered = medicalPhrases.filter((p) =>
        p.toLowerCase().startsWith(lastWord.toLowerCase()) && 
        p.toLowerCase() !== lastWord.toLowerCase()
      );
      
      if (filtered.length > 0) {
        setSuggestions(filtered.slice(0, 8));
        setShowSuggestions(true);
      } else if (currentLine.length > 10 && !isLoadingAISuggestions) {
        // Si no hay coincidencias locales y la línea es suficientemente larga, usar IA
        loadAISuggestions(currentLine, lines.slice(-5).join('\n'));
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  }, [notasMedicas]);

  const loadAISuggestions = async (currentLine: string, context: string) => {
    setIsLoadingAISuggestions(true);
    try {
      const response = await fetch("/api/gemini/autocomplete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context,
          currentLine,
          paciente: {
            edad: paciente.edad,
            genero: paciente.genero,
          },
        }),
      });

      const data = await response.json();
      if (data.success && data.data.suggestions.length > 0) {
        setSuggestions(data.data.suggestions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error("Error loading AI suggestions:", error);
    } finally {
      setIsLoadingAISuggestions(false);
    }
  };

  // Cargar historial clínico real desde Supabase
  useEffect(() => {
    const loadHistorialClinico = async () => {
      try {
        // Buscar notas médicas previas del paciente por cédula
        // Primero buscar el patient_id por cédula
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id')
          .eq('cedula', paciente.cedula)
          .single();

        if (!profileData) {
          // Si no hay perfil registrado, buscar en offline_patients
          const { data: offlineData } = await supabase
            .from('offline_patients')
            .select('notas_medico, created_at, doctor:profiles!offline_patients_doctor_id_fkey(nombre_completo)')
            .eq('cedula', paciente.cedula)
            .order('created_at', { ascending: false })
            .limit(10);

          if (offlineData && offlineData.length > 0) {
            const historial: HistorialItem[] = offlineData
              .filter(item => item.notas_medico)
              .map((item: any) => ({
                id: crypto.randomUUID(),
                fecha: item.created_at,
                diagnostico: 'Consulta previa',
                notas: item.notas_medico || 'Sin notas',
                doctor: item.doctor?.nombre_completo || 'Desconocido',
              }));
            setHistorialClinico(historial);
          }
          return;
        }

        // Buscar notas médicas del paciente
        const { data: notasData } = await supabase
          .from('medical_notes')
          .select(`
            id,
            created_at,
            diagnosis,
            content,
            doctor:profiles!medical_notes_doctor_id_fkey(nombre_completo)
          `)
          .eq('patient_id', profileData.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (notasData && notasData.length > 0) {
          const historial: HistorialItem[] = notasData.map((nota: any) => ({
            id: nota.id,
            fecha: nota.created_at,
            diagnostico: nota.diagnosis || 'Sin diagnóstico',
            notas: nota.content || 'Sin notas',
            doctor: nota.doctor?.nombre_completo || 'Desconocido',
          }));
          setHistorialClinico(historial);
        }
      } catch (error) {
        console.error('Error loading historial:', error);
      }
    };

    if (paciente.cedula) {
      loadHistorialClinico();
    }
  }, [paciente.cedula]);

  const handleAnalyzeWithAI = async () => {
    if (!notasMedicas.trim()) {
      alert("Por favor escribe información médica primero");
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/gemini/analyze-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nota: notasMedicas,
          paciente: {
            edad: paciente.edad,
            genero: paciente.genero,
            alergias,
            condicionesCronicas,
            medicamentosActuales,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAiAnalysis(data.data);
        setShowRecommendations(true);
        
        if (data.data.diagnosticosSugeridos && data.data.diagnosticosSugeridos.length > 0) {
          const nuevosDiagnosticos = data.data.diagnosticosSugeridos.filter(
            (d: string) => !diagnosticos.includes(d)
          );
          if (nuevosDiagnosticos.length > 0) {
            setDiagnosticos([...diagnosticos, ...nuevosDiagnosticos]);
          }
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error("Error analyzing note:", error);
      alert(`Error al analizar: ${error.message || "Intenta de nuevo"}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplySuggestion = (suggestion: string) => {
    const cursorPosition = notasTextareaRef.current?.selectionStart || notasMedicas.length;
    const textBefore = notasMedicas.substring(0, cursorPosition);
    const textAfter = notasMedicas.substring(cursorPosition);
    
    // Obtener la línea actual y la última palabra
    const lines = textBefore.split('\n');
    const currentLine = lines[lines.length - 1] || '';
    const words = currentLine.split(/\s+/);
    const lastWord = words[words.length - 1] || '';
    
    // Reemplazar solo la última palabra con la sugerencia
    const lineWithoutLastWord = currentLine.substring(0, currentLine.length - lastWord.length);
    lines[lines.length - 1] = lineWithoutLastWord + suggestion;
    
    const newText = lines.join('\n') + textAfter;
    setNotasMedicas(newText);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(0);
    
    // Enfocar el textarea y posicionar cursor
    setTimeout(() => {
      const newPosition = lines.join('\n').length;
      notasTextareaRef.current?.focus();
      notasTextareaRef.current?.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
      } else if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        handleApplySuggestion(suggestions[selectedSuggestionIndex]);
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
        setSelectedSuggestionIndex(0);
      }
    }
  };

  const handleTemplateSelect = (content: string) => {
    setNotasMedicas(content);
    setShowMarketplace(false);
    setTimeout(() => {
      notasTextareaRef.current?.focus();
    }, 0);
  };

  const handleSearchICD = async () => {
    if (!icdSearchQuery.trim()) return;

    setIsSearchingICD(true);
    try {
      const response = await fetch(`/api/icd11/search?q=${encodeURIComponent(icdSearchQuery)}`);
      const data = await response.json();

      if (data.success && data.data) {
        setIcdResults(data.data.slice(0, 10));
      } else {
        setIcdResults([]);
      }
    } catch (error) {
      console.error("Error searching ICD-11:", error);
      setIcdResults([]);
    } finally {
      setIsSearchingICD(false);
    }
  };

  const handleAddDiagnostico = (codigo: string, descripcion: string) => {
    const diagnostico = `${codigo} - ${descripcion}`;
    if (!diagnosticos.includes(diagnostico)) {
      setDiagnosticos([...diagnosticos, diagnostico]);
    }
  };

  const handleRemoveDiagnostico = (index: number) => {
    setDiagnosticos(diagnosticos.filter((_, i) => i !== index));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={onBack} className="h-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="h-4 w-px bg-gray-300" />
              <div>
                <h1 className="text-base font-semibold text-gray-900">{paciente.nombre_completo}</h1>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="font-mono">V-{paciente.cedula}</span>
                  {paciente.genero && (
                    <>
                      <span>•</span>
                      <Badge variant="outline" className="text-xs h-5">
                        {paciente.genero === "M" ? "Masculino" : "Femenino"}
                      </Badge>
                    </>
                  )}
                  {paciente.edad && (
                    <>
                      <span>•</span>
                      <span>{paciente.edad} años</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
              <Button size="sm" onClick={onSave} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">

        {/* Center Panel - Editor */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="flex-shrink-0 px-6 py-3 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TabsList className="grid w-full max-w-2xl grid-cols-3">
                  <TabsTrigger value="estructurado" className="text-sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Editor Estructurado
                  </TabsTrigger>
                  <TabsTrigger value="notas" className="text-sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Nota Libre
                  </TabsTrigger>
                  <TabsTrigger value="icd" className="text-sm">
                    <Search className="h-4 w-4 mr-2" />
                    ICD-11
                  </TabsTrigger>
                </TabsList>
                
                {activeTab === "estructurado" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowStructuredMarketplace(true)}
                    className="gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Templates Estructurados
                    <Badge variant="secondary" className="text-xs h-5">
                      <Sparkles className="h-3 w-3 mr-1" />
                      {selectedStructuredTemplate ? selectedStructuredTemplate.fields.length : "4"} campos
                    </Badge>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMarketplace(true)}
                    className="gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Templates
                    <Badge variant="secondary" className="text-xs h-5">
                      <Sparkles className="h-3 w-3 mr-1" />
                      IA
                    </Badge>
                  </Button>
                )}
              </div>
              
              <Button
                variant="default"
                size="sm"
                onClick={handleAnalyzeWithAI}
                disabled={isAnalyzing || !notasMedicas.trim()}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analizando...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    IA RED-SALUD
                  </>
                )}
              </Button>
            </div>

            {/* Tab Editor Estructurado */}
            <TabsContent value="estructurado" className="flex-1 m-0 flex flex-col overflow-hidden">
              <div className="flex-1 flex overflow-hidden">
                {/* Editor Estructurado con scroll interno */}
                <ScrollArea className="flex-1 bg-white">
                  <StructuredTemplateEditor
                    template={selectedStructuredTemplate}
                    onChange={(content: string) => setNotasMedicas(content)}
                    paciente={paciente}
                    medications={medicamentosActuales}
                    onMedicationsChange={setMedicamentosActuales}
                  />
                </ScrollArea>

                {/* Recomendaciones IA Panel */}
                {showRecommendations && aiAnalysis && (
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
                        onClick={() => setShowRecommendations(false)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {/* Resumen */}
                      {aiAnalysis.resumen && (
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-xs font-medium text-blue-900 mb-1">Resumen</p>
                          <p className="text-xs text-gray-700">{aiAnalysis.resumen}</p>
                        </div>
                      )}

                      {/* Sugerencias */}
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

                      {/* Alertas */}
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

                      {/* Diagnósticos Sugeridos */}
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
                )}
              </div>
            </TabsContent>

            <TabsContent value="notas" className="flex-1 m-0 flex flex-col overflow-hidden">
              <div className="flex-1 flex overflow-hidden">
                {/* Editor Area */}
                <div className="flex-1 flex flex-col border-r relative">
                  <div className="flex-1 relative overflow-hidden">
                    <textarea
                      ref={notasTextareaRef}
                      value={notasMedicas}
                      onChange={(e) => setNotasMedicas(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Escribe aquí la nota médica...&#10;&#10;Usa Tab o Enter para autocompletar&#10;&#10;Comienza escribiendo: MOTIVO, HISTORIA, EXAMEN..."
                      className="absolute inset-0 w-full h-full px-6 border-0 font-mono text-sm resize-none focus:outline-none"
                      style={{
                        backgroundImage: 'repeating-linear-gradient(transparent, transparent 23px, #e5e7eb 23px, #e5e7eb 24px)',
                        backgroundPosition: '0 11px',
                        lineHeight: '24px',
                        paddingTop: '11px',
                        paddingBottom: '11px',
                      }}
                    />
                    
                    {(showSuggestions && suggestions.length > 0) || isLoadingAISuggestions ? (
                      <div 
                        className="absolute bg-white border border-gray-300 rounded shadow-lg overflow-hidden z-20"
                        style={{
                          top: `${Math.min((notasMedicas.split('\n').length) * 24 + 11, 500)}px`,
                          left: '24px',
                          minWidth: '350px',
                          maxWidth: '500px',
                        }}
                      >
                        {isLoadingAISuggestions ? (
                          <div className="px-3 py-4 flex items-center gap-2 text-sm text-gray-600">
                            <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                            <span>Generando sugerencias con IA...</span>
                          </div>
                        ) : (
                          <>
                            {suggestions.map((suggestion, index) => (
                              <div
                                key={index}
                                onClick={() => handleApplySuggestion(suggestion)}
                                className={`px-3 py-2 text-sm font-mono cursor-pointer flex items-center gap-2 ${
                                  index === selectedSuggestionIndex 
                                    ? 'bg-blue-500 text-white' 
                                    : 'hover:bg-gray-100'
                                }`}
                              >
                                <Sparkles className={`h-3 w-3 flex-shrink-0 ${
                                  index === selectedSuggestionIndex ? 'text-white' : 'text-blue-600'
                                }`} />
                                <span className="flex-1">{suggestion}</span>
                                {index === selectedSuggestionIndex && (
                                  <kbd className="px-1.5 py-0.5 bg-white/20 border border-white/30 rounded text-xs">Tab</kbd>
                                )}
                              </div>
                            ))}
                            <div className="px-3 py-1.5 text-xs text-gray-500 bg-gray-50 border-t flex items-center gap-2">
                              <kbd className="px-1.5 py-0.5 bg-white border rounded text-xs">↑↓</kbd>
                              <span>navegar</span>
                              <kbd className="px-1.5 py-0.5 bg-white border rounded text-xs">Tab</kbd>
                              <span>aplicar</span>
                              <kbd className="px-1.5 py-0.5 bg-white border rounded text-xs">Esc</kbd>
                              <span>cerrar</span>
                            </div>
                          </>
                        )}
                      </div>
                    ) : null}
                  </div>
                  
                  {/* Footer Stats */}
                  <div className="flex-shrink-0 px-6 py-2 bg-gray-50 border-t flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      {notasMedicas.length} caracteres • {notasMedicas.split('\n').length} líneas
                    </p>
                    <div className="flex items-center gap-2">
                      {isLoadingAISuggestions && (
                        <Badge variant="outline" className="text-xs border-purple-300 text-purple-600">
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          IA activa
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Autocompletado IA
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Recomendaciones IA Panel - Solo visible después de análisis */}
                {showRecommendations && aiAnalysis && (
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
                        onClick={() => setShowRecommendations(false)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {/* Resumen */}
                      {aiAnalysis.resumen && (
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-xs font-medium text-blue-900 mb-1">Resumen</p>
                          <p className="text-xs text-gray-700">{aiAnalysis.resumen}</p>
                        </div>
                      )}

                      {/* Sugerencias */}
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

                      {/* Alertas */}
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

                      {/* Diagnósticos Sugeridos */}
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
                )}
              </div>
            </TabsContent>

            <TabsContent value="icd" className="flex-1 m-0 p-6 overflow-auto">
              <div className="max-w-5xl mx-auto space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Buscar código o diagnóstico... (ej: gastritis, diabetes)"
                    value={icdSearchQuery}
                    onChange={(e) => setIcdSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearchICD();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button onClick={handleSearchICD} disabled={isSearchingICD || !icdSearchQuery.trim()}>
                    {isSearchingICD ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Diagnósticos seleccionados */}
                {diagnosticos.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-900">Diagnósticos Seleccionados</h3>
                    {diagnosticos.map((diagnostico, index) => (
                      <div
                        key={index}
                        className="p-3 border rounded-lg bg-blue-50 border-blue-200 flex items-start justify-between"
                      >
                        <p className="text-sm font-medium text-gray-900 flex-1">{diagnostico}</p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveDiagnostico(index)}
                          className="flex-shrink-0 ml-2 h-6 w-6 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {icdResults.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-900">Resultados de Búsqueda</h3>
                    {icdResults.map((result, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer flex items-start justify-between transition-colors"
                        onClick={() => handleAddDiagnostico(result.code, result.title)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {result.code}
                            </Badge>
                            <h3 className="font-medium text-sm">{result.title}</h3>
                          </div>
                          {result.definition && (
                            <p className="text-xs text-gray-600 mt-1">{result.definition}</p>
                          )}
                        </div>
                        <Button size="sm" variant="ghost">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {!isSearchingICD && icdSearchQuery && icdResults.length === 0 && (
                  <div className="text-center py-8">
                    <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">No se encontraron resultados</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Intenta con otros términos de búsqueda o usa la IA para sugerencias
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Panel - Historial Clínico Colapsable */}
        <div className={`border-l bg-white flex flex-col transition-all duration-300 flex-shrink-0 ${
          showHistorial ? 'w-80' : 'w-12'
        }`}>
          <div className="flex-shrink-0 px-4 py-3 border-b bg-gradient-to-r from-blue-50 to-purple-50 flex items-center justify-between">
            {showHistorial ? (
              <>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-semibold text-gray-900 truncate">Historial Clínico</h2>
                  <p className="text-xs text-gray-600 truncate">Consultas anteriores</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistorial(false)}
                  className="h-8 w-8 p-0 flex-shrink-0 ml-2"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistorial(true)}
                className="h-8 w-8 p-0 mx-auto"
                title="Mostrar historial"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
          </div>

          {showHistorial && (
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4">
              {historialClinico.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Sin historial</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Primera consulta del paciente
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {historialClinico.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedHistorial(item)}
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span className="text-xs text-gray-600 truncate">
                            {new Date(item.fecha).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-1 break-words">
                        {item.diagnostico}
                      </h3>
                      <p className="text-xs text-gray-600 line-clamp-2 break-words">
                        {item.notas}
                      </p>
                      <p className="text-xs text-gray-500 mt-2 truncate">
                        Dr. {item.doctor}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>



      {/* Historial Detail Dialog */}
      <Dialog open={!!selectedHistorial} onOpenChange={() => setSelectedHistorial(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Consulta Anterior</DialogTitle>
            <DialogDescription>
              {selectedHistorial && new Date(selectedHistorial.fecha).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </DialogDescription>
          </DialogHeader>

          {selectedHistorial && (
            <div className="space-y-4 mt-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Diagnóstico</h3>
                <p className="text-sm text-gray-700">{selectedHistorial.diagnostico}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Notas Médicas</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedHistorial.notas}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Médico Tratante</h3>
                <p className="text-sm text-gray-700">{selectedHistorial.doctor}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Template Marketplace (Nota Libre) */}
      <TemplateMarketplace
        open={showMarketplace}
        onClose={() => setShowMarketplace(false)}
        onSelectTemplate={handleTemplateSelect}
        userId={userId}
      />

      {/* Structured Template Marketplace */}
      <StructuredTemplateMarketplace
        open={showStructuredMarketplace}
        onClose={() => setShowStructuredMarketplace(false)}
        onSelectTemplate={(template) => {
          setSelectedStructuredTemplate(template);
          setShowStructuredMarketplace(false);
        }}
      />
    </div>
  );
}
