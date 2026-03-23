'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, ChevronDown, ChevronRight, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { CATEGORY_META, getAllCategoriesSorted } from '@/lib/specialties/identity/category-meta';
import { getSpecialtyTheme } from '@/lib/specialty-theme';

export interface SpecialtyOption {
  id: string;
  name: string;
  slug: string | null;
  category: string | null;
  description: string | null;
  icon: string | null;
}

interface SpecialtySelectorProps {
  value: string | null;
  onChange: (specialty: SpecialtyOption | null) => void;
  error?: string;
}

export function SpecialtySelector({ value, onChange, error }: SpecialtySelectorProps) {
  const [specialties, setSpecialties] = useState<SpecialtyOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Fetch specialties from Supabase
  useEffect(() => {
    async function fetchSpecialties() {
      setLoading(true);
      setFetchError(null);

      const { data, error: queryError } = await supabase
        .from('specialties')
        .select('id, name, slug, category, description, icon')
        .eq('active', true)
        .order('name');

      if (queryError) {
        setFetchError('No se pudieron cargar las especialidades');
        setLoading(false);
        return;
      }

      setSpecialties(data ?? []);
      setLoading(false);
    }

    fetchSpecialties();
  }, []);

  // Normalize text for search
  const normalize = useCallback((text: string) => {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }, []);

  // Filter and group specialties
  const { filtered, grouped, allCategories } = useMemo(() => {
    const normalizedSearch = normalize(search);

    const filtered = normalizedSearch
      ? specialties.filter((s) => {
          const nameMatch = normalize(s.name).includes(normalizedSearch);
          const descMatch = s.description
            ? normalize(s.description).includes(normalizedSearch)
            : false;
          return nameMatch || descMatch;
        })
      : specialties;

    // Group by category
    const grouped = new Map<string, SpecialtyOption[]>();
    for (const specialty of filtered) {
      const cat = specialty.category || 'otros';
      const existing = grouped.get(cat) || [];
      existing.push(specialty);
      grouped.set(cat, existing);
    }

    // Get all categories sorted
    const allCategories = getAllCategoriesSorted();

    return { filtered, grouped, allCategories };
  }, [specialties, search, normalize]);

  // Auto-expand categories when searching
  useEffect(() => {
    if (search) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Syncing UI state with search filter
      setExpandedCategories(new Set(grouped.keys()));
    }
  }, [search, grouped]);

  const toggleCategory = useCallback((categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }, []);

  const selectedSpecialty = useMemo(
    () => specialties.find((s) => s.id === value) ?? null,
    [specialties, value]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        <span className="ml-2 text-sm text-gray-500">Cargando especialidades...</span>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-600">{fetchError}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-2 text-xs text-red-700 underline hover:no-underline"
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selected specialty banner */}
      {selectedSpecialty && (
        <div
          className="flex items-center gap-3 p-3 rounded-lg border-2 border-blue-200 bg-blue-50"
          style={{
            borderColor: getSpecialtyTheme(selectedSpecialty.slug).primary + '40',
            backgroundColor: getSpecialtyTheme(selectedSpecialty.slug).bgLight,
          }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: getSpecialtyTheme(selectedSpecialty.slug).primary }}
          >
            <Check className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {selectedSpecialty.name}
            </p>
            {selectedSpecialty.description && (
              <p className="text-xs text-gray-500 truncate">{selectedSpecialty.description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1"
          >
            Cambiar
          </button>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar especialidad... (ej: cardiologia, odontologia)"
          className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-gray-200 bg-white
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            placeholder:text-gray-400"
        />
        {search && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
            {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Category list */}
      <div className="max-h-[400px] overflow-y-auto rounded-lg border border-gray-200 bg-white divide-y divide-gray-100">
        {filtered.length === 0 && (
          <div className="p-6 text-center text-sm text-gray-400">
            No se encontraron especialidades con &quot;{search}&quot;
          </div>
        )}

        {allCategories.map((catMeta) => {
          const categorySpecialties = grouped.get(catMeta.id);
          if (!categorySpecialties || categorySpecialties.length === 0) return null;

          const isExpanded = expandedCategories.has(catMeta.id);

          return (
            <div key={catMeta.id}>
              {/* Category header */}
              <button
                type="button"
                onClick={() => toggleCategory(catMeta.id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ backgroundColor: catMeta.color }}
                >
                  {categorySpecialties.length}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-700">{catMeta.label}</p>
                  <p className="text-xs text-gray-400 truncate">{catMeta.description}</p>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                )}
              </button>

              {/* Specialty items */}
              {isExpanded && (
                <div className="bg-gray-50/50 py-1">
                  {categorySpecialties.map((specialty) => {
                    const isSelected = value === specialty.id;
                    const theme = getSpecialtyTheme(specialty.slug);

                    return (
                      <button
                        key={specialty.id}
                        type="button"
                        onClick={() => onChange(isSelected ? null : specialty)}
                        className={`
                          w-full flex items-center gap-3 px-6 py-2.5
                          text-left transition-all duration-150
                          ${
                            isSelected
                              ? 'bg-blue-50 border-l-4 border-blue-500'
                              : 'hover:bg-white border-l-4 border-transparent'
                          }
                        `}
                      >
                        <div
                          className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center"
                          style={{
                            backgroundColor: isSelected
                              ? theme.primary
                              : theme.primary + '20',
                          }}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm ${
                              isSelected ? 'font-semibold text-blue-700' : 'text-gray-700'
                            }`}
                          >
                            {specialty.name}
                          </p>
                          {specialty.description && (
                            <p className="text-xs text-gray-400 truncate">
                              {specialty.description}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Specialties without a known category */}
        {(() => {
          const uncategorized = grouped.get('otros') ?? [];
          const knownCatIds = new Set(allCategories.map((c) => c.id));
          const extraSpecialties: SpecialtyOption[] = [];
          for (const [catId, specs] of grouped.entries()) {
            if (!knownCatIds.has(catId as typeof allCategories[number]['id']) && catId !== 'otros') {
              extraSpecialties.push(...specs);
            }
          }
          const combined = [...uncategorized, ...extraSpecialties];
          if (combined.length === 0) return null;

          const isExpanded = expandedCategories.has('__otros');
          return (
            <div>
              <button
                type="button"
                onClick={() => toggleCategory('__otros')}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-400 text-white text-xs font-bold shrink-0">
                  {combined.length}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-700">Otras Especialidades</p>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                )}
              </button>
              {isExpanded && (
                <div className="bg-gray-50/50 py-1">
                  {combined.map((specialty) => {
                    const isSelected = value === specialty.id;
                    return (
                      <button
                        key={specialty.id}
                        type="button"
                        onClick={() => onChange(isSelected ? null : specialty)}
                        className={`
                          w-full flex items-center gap-3 px-6 py-2.5
                          text-left transition-all duration-150
                          ${
                            isSelected
                              ? 'bg-blue-50 border-l-4 border-blue-500'
                              : 'hover:bg-white border-l-4 border-transparent'
                          }
                        `}
                      >
                        <div
                          className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center ${
                            isSelected ? 'bg-blue-500' : 'bg-gray-200'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <p
                          className={`text-sm ${
                            isSelected ? 'font-semibold text-blue-700' : 'text-gray-700'
                          }`}
                        >
                          {specialty.name}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
