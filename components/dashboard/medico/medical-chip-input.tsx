"use client";

import { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface MedicalChipInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  suggestions: string[];
  placeholder: string;
  disabled?: boolean;
}

export function MedicalChipInput({
  value,
  onChange,
  suggestions,
  placeholder,
  disabled = false,
}: MedicalChipInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (inputValue.trim().length >= 2) {
      const filtered = suggestions.filter((s) =>
        s.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredSuggestions(filtered.slice(0, 8)); // Máximo 8 sugerencias
      setShowSuggestions(filtered.length > 0);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  }, [inputValue, suggestions]);

  const handleAdd = (item: string) => {
    const trimmed = item.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setInputValue("");
      setShowSuggestions(false);
    }
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      handleAdd(inputValue);
    }
  };

  return (
    <div className="space-y-2">
      {/* Input con sugerencias */}
      <div className="relative">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => inputValue.length >= 2 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1"
          />
          <Button
            type="button"
            onClick={() => handleAdd(inputValue)}
            disabled={!inputValue.trim() || disabled}
            size="sm"
            variant="outline"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Sugerencias dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
            {filteredSuggestions.map((suggestion, idx) => (
              <button
                key={idx}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleAdd(suggestion);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chips/Badges */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((item, idx) => (
            <Badge
              key={idx}
              variant="secondary"
              className="text-sm py-1.5 px-3 flex items-center gap-1"
            >
              <span>{item}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="hover:bg-gray-300 rounded-full p-0.5 ml-1"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
