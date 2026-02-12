"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@red-salud/ui";
import { Input } from "@red-salud/ui";
import { Badge } from "@red-salud/ui";
import { Search, Loader2, X, Plus, AlertCircle, Clock, TrendingUp, Heart, Brain, Stethoscope, Activity, Bone, Baby, Eye, Ear, Droplet, Bug } from "lucide-react";
import { ScrollArea } from "@red-salud/ui";
import { cn } from "@red-salud/core/utils";

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
  },
  {
    name: "Musculoesquelético",
    icon: Bone,
    color: "bg-orange-100 text-orange-700 hover:bg-orange-200",
    searches: ["artritis", "fractura", "dolor lumbar", "osteoporosis", "esguince"]
  },
  {
    name: "Dermatológico",
    icon: Eye,
    color: "bg-pink-100 text-pink-700 hover:bg-pink-200",
    searches: ["eczema", "psoriasis", "acné", "dermatitis", "urticaria"]
  },
  {
    name: "Psiquiátrico",
    icon: Brain,
    color: "bg-teal-100 text-teal-700 hover:bg-teal-200",
    searches: ["depresión", "ansiedad", "insomnio", "estrés", "trastorno bipolar"]
  },
  {
    name: "Ginecológico",
    icon: Baby,
    color: "bg-rose-100 text-rose-700 hover:bg-rose-200",
    searches: ["embarazo", "menstruación", "menopausia", "infección urinaria", "infertilidad"]
  },
  {
    name: "Pediátrico",
    icon: Baby,
    color: "bg-cyan-100 text-cyan-700 hover:bg-cyan-200",
    searches: ["fiebre", "bronquiolitis", "varicela", "deshidratación", "alergia"]
  },
  {
    name: "Oftalmológico",
    icon: Eye,
    color: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
    searches: ["conjuntivitis", "glaucoma", "catarata", "vista borrosa", "ojo seco"]
  },
  {
    name: "Otorrinolaringológico",
    icon: Ear,
    color: "bg-violet-100 text-violet-700 hover:bg-violet-200",
    searches: ["otitis", "sinusitis", "amigdalitis", "ronquera", "pérdida auditiva"]
  },
  {
    name: "Renal/Urológico",
    icon: Droplet,
    color: "bg-sky-100 text-sky-700 hover:bg-sky-200",
    searches: ["insuficiencia renal", "cálculos renales", "infección urinaria", "retención", "proteinuria"]
  },
  {
    name: "Infeccioso",
    icon: Bug,
    color: "bg-amber-100 text-amber-700 hover:bg-amber-200",
    searches: ["infección", "fiebre", "sepsis", "virus", "bacteria"]
  }
];

export function ICDSearchTab({
  diagnosticos,
  onAddDiagnostico,
  onRemoveDiagnostico,
}: ICDSearchTabProps) {
  const [icdSearchQuery, setIcdSearchQuery] = useState("");
  const [icdResults, setIcdResults] = useState<ICDResult[]>([]);
  const [isSearchingICD, setIsSearchingICD] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

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

  const handleSearchICD = useCallback(async (query?: string) => {
    const searchQuery = query || icdSearchQuery;
    if (!searchQuery.trim()) return;

    setIsSearchingICD(true);
    setApiError(null);

    try {
      const response = await fetch(`/api/icd11/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();

      if (data.success && data.data) {
        setIcdResults(data.data);
        saveRecentSearch(searchQuery);
        if (data.source === "local_fallback") {
          setApiError("Usando base de datos local (API oficial no disponible)");
        } else {
          setApiError(null); // Limpiar error si la API funciona
        }
      } else {
        setIcdResults([]);
        setApiError(data.message || "No se encontraron resultados");
      }
    } catch (error) {
      console.error("Error searching ICD-11:", error);
      setIcdResults([]);
      setApiError("Error de conexión. Se usará el respaldo local.");
    } finally {
      setIsSearchingICD(false);
    }
  }, [icdSearchQuery, saveRecentSearch]);

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
  }, [icdSearchQuery, handleSearchICD]);

  const handleCategoryClick = (searches: string[]) => {
    const term = searches[0] || "";
    setIcdSearchQuery(term);
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
              className="pl-10 pr-10"
            />
            {icdSearchQuery && (
              <button
                onClick={() => {
                  setIcdSearchQuery("");
                  setIcdResults([]);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
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
              <p className="font-medium">Base de datos local</p>
              <p className="text-xs mt-1">API oficial de ICD-11 no disponible. Mostrando resultados locales.</p>
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



          {/* Categorías comunes */}
          {!icdSearchQuery && !isSearchingICD && icdResults.length === 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">Categorías Comunes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
