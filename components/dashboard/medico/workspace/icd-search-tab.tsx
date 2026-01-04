"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, X, Plus, AlertCircle, Sparkles, Clock, TrendingUp, Heart, Brain, Stethoscope, Activity } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ICDSearchTabProps {
  diagnosticos: string[];
  onAddDiagnostico: (codigo: string, descripcion: string) => void;
  onRemoveDiagnostico: (index: number) => void;
  notasMedicas?: string;
}

interface ICDResult {
  id: string;
  code: string;
  title: string;
  definition?: string;
  chapter?: string;
  score?: number;
}

// Categorías comunes de diagnósticos
const COMMON_CATEGORIES = [
  {
    name: "Respiratorio",
    icon: Activity,
    color: "bg-blue-100 text-blue-700 hover:bg-blue-200",
    searches: ["asma", "neumonía", "bronquitis", "gripe", "COVID-19"]
  },
  {
    name: "Cardiovascular",
    icon: Heart,
    color: "bg-red-100 text-red-700 hover:bg-red-200",
    searches: ["hipertensión", "arritmia", "insuficiencia cardíaca", "angina"]
  },
  {
    name: "Digestivo",
    icon: Stethoscope,
    color: "bg-green-100 text-green-700 hover:bg-green-200",
    searches: ["gastritis", "colitis", "reflujo", "diarrea", "estreñimiento"]
  },
  {
    name: "Endocrino",
    icon: TrendingUp,
    color: "bg-purple-100 text-purple-700 hover:bg-purple-200",
    searches: ["diabetes", "hipotiroidismo", "hipertiroidismo", "obesidad"]
  },
  {
    name: "Neurológico",
    icon: Brain,
    color: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200",
    searches: ["migraña", "cefalea", "epilepsia", "vértigo", "mareo"]
  }
];

export function ICDSearchTab({
  diagnosticos,
  onAddDiagnostico,
  onRemoveDiagnostico,
  notasMedicas = "",
}: ICDSearchTabProps) {
  const [icdSearchQuery, setIcdSearchQuery] = useState("");
  const [icdResults, setIcdResults] = useState<ICDResult[]>([]);
  const [isSearchingICD, setIsSearchingICD] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<ICDResult[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Cargar búsquedas recientes del localStorage
  useEffect(() => {
    const saved = localStorage.getItem("icd_recent_searches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading recent searches:", e);
      }
    }
  }, []);

  // Guardar búsqueda reciente
  const saveRecentSearch = useCallback((query: string) => {
    setRecentSearches(prev => {
      const updated = [query, ...prev.filter(q => q !== query)].slice(0, 5);
      localStorage.setItem("icd_recent_searches", JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Búsqueda con debounce
  useEffect(() => {
    if (!icdSearchQuery.trim() || icdSearchQuery.length < 2) {
      setIcdResults([]);
      return;
    }

    const timer = setTimeout(() => {
      handleSearchICD();
    }, 500);

    return () => clearTimeout(timer);
  }, [icdSearchQuery]);

  const handleSearchICD = async (query?: string) => {
    const searchQuery = query || icdSearchQuery;
    if (!searchQuery.trim()) return;

    setIsSearchingICD(true);
    setApiError(null);
    
    try {
      const response = await fetch(`/api/icd11/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();

      if (data.success && data.data) {
        setIcdResults(data.data.slice(0, 15));
        saveRecentSearch(searchQuery);
      } else {
        setIcdResults([]);
        setApiError(data.message || "No se encontraron resultados");
      }
    } catch (error) {
      console.error("Error searching ICD-11:", error);
      setIcdResults([]);
      setApiError("Error de conexión. Verifica tu configuración de ICD-11 API.");
    } finally {
      setIsSearchingICD(false);
    }
  };

  // Obtener sugerencias de IA basadas en las notas
  const handleAISuggestions = async () => {
    if (!notasMedicas.trim()) {
      alert("Escribe algunas notas médicas primero para obtener sugerencias de IA");
      return;
    }

    setIsLoadingAI(true);
    try {
      const response = await fetch("/api/gemini/suggest-icd11", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: notasMedicas }),
      });

      const data = await response.json();
      
      if (data.success && data.suggestions) {
        // Buscar cada sugerencia en ICD-11
        const suggestions: ICDResult[] = [];
        for (const suggestion of data.suggestions.slice(0, 5)) {
          const searchResponse = await fetch(`/api/icd11/search?q=${encodeURIComponent(suggestion.descripcion)}`);
          const searchData = await searchResponse.json();
          if (searchData.success && searchData.data && searchData.data.length > 0) {
            suggestions.push(searchData.data[0]);
          }
        }
        setAiSuggestions(suggestions);
      }
    } catch (error) {
      console.error("Error getting AI suggestions:", error);
      alert("Error al obtener sugerencias de IA");
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleCategoryClick = (searches: string[]) => {
    setSelectedCategory(searches[0]);
    setIcdSearchQuery(searches[0]);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 space-y-4 border-b bg-gray-50">
        {/* Barra de búsqueda principal */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar código o diagnóstico... (ej: gastritis, diabetes, K29)"
              value={icdSearchQuery}
              onChange={(e) => setIcdSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearchICD();
                }
              }}
              className="pl-10"
            />
          </div>
          <Button 
            onClick={handleAISuggestions} 
            disabled={isLoadingAI || !notasMedicas.trim()}
            variant="outline"
            className="gap-2"
          >
            {isLoadingAI ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            IA
          </Button>
        </div>

        {/* Búsquedas recientes */}
        {recentSearches.length > 0 && !icdSearchQuery && (
          <div className="flex items-center gap-2 flex-wrap">
            <Clock className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-500">Recientes:</span>
            {recentSearches.map((search, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="cursor-pointer hover:bg-gray-300"
                onClick={() => setIcdSearchQuery(search)}
              >
                {search}
              </Badge>
            ))}
          </div>
        )}

        {/* Error de API */}
        {apiError && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium">Usando base de datos local</p>
              <p className="text-xs mt-1">La API de ICD-11 no está disponible. Mostrando diagnósticos comunes de la base de datos local.</p>
            </div>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Diagnósticos seleccionados */}
          {diagnosticos.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Badge variant="default" className="rounded-full">
                  {diagnosticos.length}
                </Badge>
                Diagnósticos Seleccionados
              </h3>
              <div className="space-y-2">
                {diagnosticos.map((diagnostico, index) => (
                  <div
                    key={index}
                    className="p-3 border rounded-lg bg-blue-50 border-blue-200 flex items-start justify-between group hover:bg-blue-100 transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900 flex-1">{diagnostico}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRemoveDiagnostico(index)}
                      className="flex-shrink-0 ml-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sugerencias de IA */}
          {aiSuggestions.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                Sugerencias de IA
              </h3>
              <div className="space-y-2">
                {aiSuggestions.map((result, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg hover:bg-purple-50 cursor-pointer flex items-start justify-between transition-colors border-purple-200 bg-purple-50/50"
                    onClick={() => onAddDiagnostico(result.code, result.title)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs bg-white">
                          {result.code}
                        </Badge>
                        <h3 className="font-medium text-sm">{result.title}</h3>
                      </div>
                      {result.definition && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{result.definition}</p>
                      )}
                    </div>
                    <Button size="sm" variant="ghost" className="flex-shrink-0">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Categorías comunes */}
          {!icdSearchQuery && !isSearchingICD && icdResults.length === 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">Categorías Comunes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {COMMON_CATEGORIES.map((category) => (
                  <div
                    key={category.name}
                    className={cn(
                      "p-4 rounded-lg border cursor-pointer transition-all",
                      category.color
                    )}
                    onClick={() => handleCategoryClick(category.searches)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <category.icon className="h-5 w-5" />
                      <h4 className="font-semibold text-sm">{category.name}</h4>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {category.searches.slice(0, 3).map((search, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="text-xs bg-white/50"
                        >
                          {search}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resultados de búsqueda */}
          {isSearchingICD && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Buscando en ICD-11...</p>
              </div>
            </div>
          )}

          {!isSearchingICD && icdResults.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">
                Resultados ({icdResults.length})
              </h3>
              <div className="space-y-2">
                {icdResults.map((result, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer flex items-start justify-between transition-colors group"
                    onClick={() => onAddDiagnostico(result.code, result.title)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs font-mono">
                          {result.code}
                        </Badge>
                        {result.chapter && (
                          <Badge variant="secondary" className="text-xs">
                            {result.chapter}
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-medium text-sm mb-1">{result.title}</h3>
                      {result.definition && (
                        <p className="text-xs text-gray-600 line-clamp-2">{result.definition}</p>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isSearchingICD && icdSearchQuery && icdResults.length === 0 && !apiError && (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-900 mb-1">No se encontraron resultados</p>
              <p className="text-xs text-gray-500">
                Intenta con otros términos o usa las sugerencias de IA
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
