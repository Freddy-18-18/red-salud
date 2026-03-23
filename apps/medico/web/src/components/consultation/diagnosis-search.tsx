'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, X, Plus, AlertCircle } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface DiagnosisEntry {
  code: string;
  title: string;
  isPrimary: boolean;
}

interface DiagnosisSearchProps {
  selected: DiagnosisEntry[];
  onChange: (diagnoses: DiagnosisEntry[]) => void;
  themeColor?: string;
  disabled?: boolean;
}

interface ICD11Result {
  code: string;
  title: string;
  definition?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function DiagnosisSearch({
  selected,
  onChange,
  themeColor = '#3B82F6',
  disabled = false,
}: DiagnosisSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ICD11Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchICD11 = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Try the API endpoint first
      const response = await fetch(`/api/icd11/search?q=${encodeURIComponent(searchQuery)}&limit=10`);

      if (response.ok) {
        const data = await response.json();
        setResults(data.results ?? []);
      } else {
        // Fallback: use a static search for common ICD-11 codes
        const fallbackResults = searchFallbackCodes(searchQuery);
        setResults(fallbackResults);
      }
    } catch {
      // Fallback to static codes
      const fallbackResults = searchFallbackCodes(searchQuery);
      setResults(fallbackResults);
    } finally {
      setLoading(false);
      setShowResults(true);
    }
  }, []);

  const handleQueryChange = useCallback(
    (value: string) => {
      setQuery(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => searchICD11(value), 350);
    },
    [searchICD11],
  );

  const addDiagnosis = useCallback(
    (result: ICD11Result) => {
      if (selected.some((d) => d.code === result.code)) return;
      const isPrimary = selected.length === 0;
      onChange([...selected, { code: result.code, title: result.title, isPrimary }]);
      setQuery('');
      setResults([]);
      setShowResults(false);
    },
    [selected, onChange],
  );

  const removeDiagnosis = useCallback(
    (code: string) => {
      const updated = selected.filter((d) => d.code !== code);
      // If we removed the primary, make the first one primary
      if (updated.length > 0 && !updated.some((d) => d.isPrimary)) {
        updated[0].isPrimary = true;
      }
      onChange(updated);
    },
    [selected, onChange],
  );

  const setPrimary = useCallback(
    (code: string) => {
      onChange(
        selected.map((d) => ({
          ...d,
          isPrimary: d.code === code,
        })),
      );
    },
    [selected, onChange],
  );

  return (
    <div ref={containerRef} className="space-y-3">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          disabled={disabled}
          placeholder="Buscar diagnóstico CIE-11 por nombre o código..."
          className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:border-transparent placeholder:text-gray-300"
          style={{ '--tw-ring-color': `${themeColor}40` } as React.CSSProperties}
          onFocus={() => results.length > 0 && setShowResults(true)}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Search results dropdown */}
      {showResults && results.length > 0 && (
        <div className="border border-gray-200 rounded-lg bg-white shadow-lg max-h-64 overflow-y-auto">
          {results.map((result) => {
            const isSelected = selected.some((d) => d.code === result.code);
            return (
              <button
                key={result.code}
                type="button"
                onClick={() => addDiagnosis(result)}
                disabled={isSelected}
                className={`
                  w-full flex items-start gap-3 px-4 py-3 text-left border-b border-gray-50 last:border-b-0
                  transition-colors
                  ${isSelected ? 'bg-gray-50 opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'}
                `}
              >
                <span
                  className="text-xs font-mono font-semibold px-2 py-0.5 rounded flex-shrink-0"
                  style={{
                    backgroundColor: `${themeColor}15`,
                    color: themeColor,
                  }}
                >
                  {result.code}
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-gray-800">{result.title}</p>
                  {result.definition && (
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{result.definition}</p>
                  )}
                </div>
                {!isSelected && (
                  <Plus className="h-4 w-4 text-gray-300 flex-shrink-0 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* No results */}
      {showResults && query.length >= 2 && results.length === 0 && !loading && (
        <div className="p-4 text-center text-sm text-gray-400 border border-gray-200 rounded-lg">
          <AlertCircle className="h-5 w-5 mx-auto mb-1 text-gray-300" />
          No se encontraron diagnósticos para &ldquo;{query}&rdquo;
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}

      {/* Selected diagnoses */}
      {selected.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Diagnósticos seleccionados
          </p>
          {selected.map((diag) => (
            <div
              key={diag.code}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg border
                ${diag.isPrimary ? 'border-2 bg-white' : 'border-gray-200 bg-gray-50'}
              `}
              style={diag.isPrimary ? { borderColor: themeColor } : undefined}
            >
              <span
                className="text-xs font-mono font-semibold px-2 py-0.5 rounded flex-shrink-0"
                style={{
                  backgroundColor: diag.isPrimary ? `${themeColor}15` : '#F3F4F6',
                  color: diag.isPrimary ? themeColor : '#6B7280',
                }}
              >
                {diag.code}
              </span>
              <p className="text-sm text-gray-800 flex-1 truncate">{diag.title}</p>
              <div className="flex items-center gap-1">
                {!diag.isPrimary && (
                  <button
                    type="button"
                    onClick={() => setPrimary(diag.code)}
                    className="text-xs text-gray-400 hover:text-gray-600 px-1.5 py-0.5 rounded hover:bg-gray-200 transition-colors"
                    title="Marcar como diagnóstico principal"
                  >
                    Principal
                  </button>
                )}
                {diag.isPrimary && (
                  <span className="text-xs font-medium px-1.5 py-0.5 rounded" style={{ color: themeColor }}>
                    Principal
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeDiagnosis(diag.code)}
                  disabled={disabled}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  title="Eliminar diagnóstico"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// FALLBACK ICD-11 CODES — Common codes for when the API is unavailable
// ============================================================================

function searchFallbackCodes(query: string): ICD11Result[] {
  const q = query.toLowerCase();
  return COMMON_ICD11.filter(
    (c) =>
      c.code.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q),
  ).slice(0, 10);
}

const COMMON_ICD11: ICD11Result[] = [
  { code: 'BA00', title: 'Hipertensión esencial' },
  { code: 'BA01', title: 'Hipertensión secundaria' },
  { code: '5A11', title: 'Diabetes mellitus tipo 2' },
  { code: '5A10', title: 'Diabetes mellitus tipo 1' },
  { code: 'CA40', title: 'Asma' },
  { code: 'MD11', title: 'Dolor lumbar crónico' },
  { code: 'DA0Z', title: 'Gastritis, no especificada' },
  { code: '8B11', title: 'Migraña sin aura' },
  { code: 'EJ40', title: 'Anemia por deficiencia de hierro' },
  { code: 'BA80', title: 'Insuficiencia cardíaca' },
  { code: 'CA07', title: 'Bronquitis aguda' },
  { code: 'MA02', title: 'Artritis reumatoide' },
  { code: 'FB20', title: 'Hipotiroidismo' },
  { code: 'DB90', title: 'Síndrome de intestino irritable' },
  { code: '1A00', title: 'Cólera' },
  { code: 'AA00', title: 'Infección de vías urinarias' },
  { code: 'BA02', title: 'Enfermedad cardíaca isquémica' },
  { code: 'BD10', title: 'Enfermedad cerebrovascular' },
  { code: '6A70', title: 'Trastorno depresivo, episodio único' },
  { code: '6B00', title: 'Trastorno de ansiedad generalizada' },
  { code: 'LA12', title: 'Caries dental' },
  { code: 'LA10', title: 'Gingivitis' },
  { code: 'LA15', title: 'Pulpitis dental' },
  { code: 'KA00', title: 'Dermatitis atópica' },
  { code: 'FA01', title: 'Obesidad' },
];
