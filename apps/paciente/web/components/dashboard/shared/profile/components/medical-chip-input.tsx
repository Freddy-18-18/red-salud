"use client";

import { useState, useRef, useMemo } from "react";
import { X, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@red-salud/design-system";
import { Input } from "@red-salud/design-system";

interface MedicalChipInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  suggestions: string[];
  placeholder: string;
  maxLength?: number;
  disabled?: boolean;
  template?: string;
}

export function MedicalChipInput({
  value,
  onChange,
  suggestions,
  placeholder,
  maxLength = 50,
  disabled = false,
  template,
}: MedicalChipInputProps) {
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredSuggestions = useMemo(() => {
    return inputValue.trim()
      ? suggestions.filter((s) =>
          s.toLowerCase().includes(inputValue.toLowerCase())
        )
      : [];
  }, [inputValue, suggestions]);

  const showSuggestions = filteredSuggestions.length > 0;

  const handleAdd = (item: string) => {
    const trimmed = item.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setInputValue("");
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

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="space-y-2">
      {/* Input con sugerencias */}
      <div className="relative">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            maxLength={maxLength}
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

        {/* Template hint */}
        {template && !inputValue && (
          <p className="text-xs text-gray-500 mt-1">
            Formato: {template}
          </p>
        )}

        {/* Sugerencias */}
        {showSuggestions && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
            {filteredSuggestions.map((suggestion, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAdd(suggestion)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chips horizontales con scroll */}
      {value.length > 0 && (
        <div className="relative">
          <div className="flex items-center gap-2">
            {value.length > 3 && (
              <Button
                type="button"
                onClick={() => scroll("left")}
                variant="ghost"
                size="sm"
                className="flex-shrink-0 h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}

            <div
              ref={scrollRef}
              className="flex gap-2 overflow-x-auto scrollbar-hide flex-1"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {value.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm whitespace-nowrap flex-shrink-0"
                >
                  <span>{item}</span>
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => handleRemove(idx)}
                      className="hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {value.length > 3 && (
              <Button
                type="button"
                onClick={() => scroll("right")}
                variant="ghost"
                size="sm"
                className="flex-shrink-0 h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
