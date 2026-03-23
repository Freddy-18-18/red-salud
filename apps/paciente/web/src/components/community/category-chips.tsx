"use client";

import { cn } from "@red-salud/core/utils";

interface CategoryChipsProps<T extends string> {
  categories: { value: T; label: string }[];
  selected: T | null;
  onSelect: (value: T | null) => void;
}

export function CategoryChips<T extends string>({
  categories,
  selected,
  onSelect,
}: CategoryChipsProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={cn(
          "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
          selected === null
            ? "bg-emerald-500 text-white"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        )}
      >
        Todos
      </button>
      {categories.map((cat) => (
        <button
          key={cat.value}
          type="button"
          onClick={() => onSelect(selected === cat.value ? null : cat.value)}
          className={cn(
            "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
            selected === cat.value
              ? "bg-emerald-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
