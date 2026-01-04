"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, Sparkles, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ICD11Code {
  id: string;
  code: string;
  title: string;
  definition?: string;
  chapter?: string;
  score?: number;
}

interface ICD10AutocompleteProps {
  value: string[];
  onChange: (codes: string[]) => void;
  placeholder?: string;
}

export function ICD10Autocomplete({ value, onChange, placeholder }: ICD10AutocompleteProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<ICD11Code[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const search = async () => {
      if (searchQuery.length >= 3) {
        setIsLoading(true);
        setError(null);
        
        try {
          const response = await fetch(
            `/api/icd11/search?q=${encodeURIComponent(searchQuery)}&mode=suggestions`
          );
          
          if (!response.ok) {
            throw new Error("Error al buscar códigos ICD-11");
          }
          
          const data = await response.json();
          
          if (data.success) {
            setSuggestions(data.data);
            setShowSuggestions(true);
          } else {
            setError(data.error || "Error desconocido");
            setSuggestions([]);
          }
        } catch (err) {
          console.error("Error searching ICD-11:", err);
          setError("Error al conectar con la API de ICD-11");
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const debounce = setTimeout(search, 500);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const addCode = (code: ICD11Code) => {
    const codeString = `${code.code} - ${code.title}`;
    if (!value.includes(codeString)) {
      onChange([...value, codeString]);
    }
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const removeCode = (codeToRemove: string) => {
    onChange(value.filter((c) => c !== codeToRemove));
  };

  return (
    <div ref={containerRef} className="space-y-3">
      {/* Selected Codes */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((code) => (
            <Badge key={code} variant="secondary" className="text-sm py-1.5 px-3">
              {code}
              <button
                onClick={() => removeCode(code)}
                className="ml-2 hover:bg-black/10 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <div className="relative flex-1">
          {isLoading ? (
            <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
          ) : (
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          )}
          <Input
            ref={inputRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder={placeholder || "Buscar código ICD-11 (CIE-11) - API OMS..."}
            className="pl-10"
            disabled={isLoading}
          />
        </div>

        {/* Error Message */}
        {error && (
          <Card className="absolute z-50 w-full mt-2 p-3 shadow-lg bg-red-50 border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </Card>
        )}

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <Card className="absolute z-50 w-full mt-2 max-h-96 overflow-y-auto shadow-lg">
            <div className="p-2">
              <div className="flex items-center gap-2 px-2 py-1 mb-2 text-xs font-medium text-blue-900 bg-blue-50 rounded">
                <Sparkles className="h-3 w-3" />
                Resultados de ICD-11 API (OMS)
              </div>
              {suggestions.map((code) => (
                <button
                  key={code.id}
                  onClick={() => addCode(code)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="font-mono text-sm font-semibold text-gray-900">
                        {code.code}
                      </div>
                      <div className="text-sm text-gray-600">{code.title}</div>
                      {code.chapter && (
                        <div className="text-xs text-gray-500 mt-1">
                          Capítulo: {code.chapter}
                        </div>
                      )}
                    </div>
                    {code.score && (
                      <Badge variant="outline" className="text-xs">
                        {Math.round(code.score * 100)}%
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </Card>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Busca códigos ICD-11 (CIE-11) usando la API oficial de la OMS. Escribe al menos 3 caracteres.
      </p>
    </div>
  );
}
