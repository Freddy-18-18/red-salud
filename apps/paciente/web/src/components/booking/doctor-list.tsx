"use client";

import {
  ArrowLeft,
  ArrowUpDown,
  ChevronRight,
  Loader2,
  SlidersHorizontal,
  UserPlus,
  UserX,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { DoctorCard } from "./doctor-card";

import type { DoctorFilters, DoctorProfile } from "@/lib/services/booking-service";

const DOCTOR_REGISTRATION_HREF = "/para-profesionales";

// ─── Sort options ──────────────────────────────────────────────────────────

const SORT_OPTIONS: { value: NonNullable<DoctorFilters["sortBy"]>; label: string }[] = [
  { value: "relevance", label: "Más relevantes" },
  { value: "rating", label: "Mejor valorados" },
  { value: "price_asc", label: "Precio: menor a mayor" },
  { value: "price_desc", label: "Precio: mayor a menor" },
];

// ─── Skeleton row used while the list loads ────────────────────────────────

function DoctorRowSkeleton() {
  return (
    <div className="flex animate-pulse gap-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 sm:p-5">
      <div className="h-14 w-14 shrink-0 rounded-2xl bg-[hsl(var(--muted))] sm:h-16 sm:w-16" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-4 w-2/3 rounded bg-[hsl(var(--muted))]" />
        <div className="h-3 w-1/3 rounded bg-[hsl(var(--muted))]" />
        <div className="flex gap-2">
          <div className="h-3 w-12 rounded bg-[hsl(var(--muted))]" />
          <div className="h-3 w-12 rounded bg-[hsl(var(--muted))]" />
        </div>
      </div>
    </div>
  );
}

// ─── Sort dropdown ─────────────────────────────────────────────────────────

function SortMenu({
  value,
  onChange,
}: {
  value: DoctorFilters["sortBy"];
  onChange: (sort: DoctorFilters["sortBy"]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = SORT_OPTIONS.find((s) => s.value === (value ?? "relevance"));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-1.5 text-xs font-medium text-[hsl(var(--foreground))] transition-colors hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
      >
        <ArrowUpDown className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
        {current?.label ?? "Ordenar"}
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-lg ring-1 ring-black/5 animate-in fade-in slide-in-from-top-1 duration-150"
        >
          {SORT_OPTIONS.map((opt) => {
            const active = (value ?? "relevance") === opt.value;
            return (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-xs transition-colors ${
                    active
                      ? "bg-emerald-50 font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
                      : "text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
                  }`}
                >
                  {opt.label}
                  {active && <ChevronRight className="h-3 w-3" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────

interface DoctorListProps {
  doctors: DoctorProfile[];
  loading: boolean;
  selected: DoctorProfile | null;
  specialtyName: string;
  filters: DoctorFilters;
  onFiltersChange: (filters: DoctorFilters) => void;
  onSelect: (doctor: DoctorProfile) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function DoctorList({
  doctors,
  loading,
  selected,
  specialtyName,
  filters,
  onFiltersChange,
  onSelect,
  onBack,
  onContinue,
}: DoctorListProps) {
  const [showFilters, setShowFilters] = useState(false);
  const activeFilterCount =
    (filters.city ? 1 : 0) +
    (filters.gender ? 1 : 0) +
    (filters.accepts_insurance ? 1 : 0);

  // ─── Loading shell ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-5">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Cambiar especialidad
          </button>
          <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">
            Buscando doctores...
          </h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Cargando especialistas en {specialtyName}
          </p>
        </div>
        <div className="space-y-3">
          <DoctorRowSkeleton />
          <DoctorRowSkeleton />
          <DoctorRowSkeleton />
        </div>
      </div>
    );
  }

  // ─── Empty state ───────────────────────────────────────────────────────
  if (doctors.length === 0) {
    return (
      <div className="space-y-5">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Cambiar especialidad
        </button>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6 dark:border-amber-900/40 dark:bg-amber-950/30">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
              <UserX className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Sin resultados
              </p>
              <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                Aún no hay doctores en {specialtyName}
              </p>
              <p className="mt-1 text-xs text-amber-800/80 dark:text-amber-200/80">
                Estamos sumando especialistas. Intenta con otra especialidad o únete tú si eres médico de {specialtyName}.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Link
                  href={DOCTOR_REGISTRATION_HREF}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-amber-700"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  ¿Eres médico? Regístrate
                </Link>
                <button
                  type="button"
                  onClick={onBack}
                  className="text-xs font-medium text-amber-700 hover:underline dark:text-amber-300"
                >
                  Elegir otra especialidad
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Populated list ────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Cambiar especialidad
        </button>
        <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">
          Selecciona tu doctor
        </h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          {doctors.length} {doctors.length === 1 ? "especialista disponible" : "especialistas disponibles"} en {specialtyName}
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
            showFilters || activeFilterCount > 0
              ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
              : "border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filtros
          {activeFilterCount > 0 && (
            <span className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>

        <SortMenu
          value={filters.sortBy}
          onChange={(sortBy) => onFiltersChange({ ...filters, sortBy })}
        />

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={() =>
              onFiltersChange({
                sortBy: filters.sortBy,
                city: undefined,
                gender: undefined,
                accepts_insurance: undefined,
              })
            }
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
          >
            <X className="h-3 w-3" />
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Expandable filters */}
      {showFilters && (
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Ciudad
              </label>
              <input
                type="text"
                value={filters.city || ""}
                onChange={(e) =>
                  onFiltersChange({ ...filters, city: e.target.value || undefined })
                }
                placeholder="Caracas, Valencia..."
                className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Género del doctor
              </label>
              <select
                value={filters.gender || ""}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    gender: e.target.value || undefined,
                  })
                }
                className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="">Cualquiera</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-[hsl(var(--foreground))]">
                <input
                  type="checkbox"
                  checked={filters.accepts_insurance || false}
                  onChange={(e) =>
                    onFiltersChange({
                      ...filters,
                      accepts_insurance: e.target.checked || undefined,
                    })
                  }
                  className="h-4 w-4 rounded border-[hsl(var(--border))] text-emerald-600 focus:ring-emerald-500"
                />
                Acepta seguro médico
              </label>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {doctors.map((doctor) => (
          <DoctorCard
            key={doctor.id}
            doctor={doctor}
            isSelected={selected?.id === doctor.id}
            onSelect={() => onSelect(doctor)}
          />
        ))}
      </div>

      {/* Sticky-ish nav. Clean two-button row matching the rest of the wizard. */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-5 py-3 text-sm font-medium text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--muted))]"
        >
          <ArrowLeft className="h-4 w-4" />
          Atrás
        </button>
        <button
          type="button"
          onClick={onContinue}
          disabled={!selected}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continuar
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
