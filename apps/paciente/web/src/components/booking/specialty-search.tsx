"use client";

import {
  Activity,
  Baby,
  Bone,
  Brain,
  ChevronRight,
  Eye,
  Heart,
  Loader2,
  Search,
  SearchX,
  Stethoscope,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import type { Specialty } from "@/lib/services/booking-service";

// ─── Specialty icon resolver ───────────────────────────────────────────────

function getSpecialtyIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("cardio")) return Heart;
  if (lower.includes("neuro") || lower.includes("psiq")) return Brain;
  if (lower.includes("oftalm")) return Eye;
  if (lower.includes("pediatr")) return Baby;
  if (lower.includes("traumat") || lower.includes("ortop")) return Bone;
  if (lower.includes("general") || lower.includes("intern")) return Stethoscope;
  return Activity;
}

// Six fast-pick specialties surfaced when the input is empty. Order matters —
// these become the quick chips below the search box.
const QUICK_PICKS = [
  "medicina general",
  "pediatria",
  "cardiologia",
  "ginecologia",
  "dermatologia",
  "oftalmologia",
] as const;

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Lower-case + strip diacritics. Without this, "Cardiología" doesn't match
 * the user typing "cardiologia" (and vice-versa).
 */
function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Highlight matching substring inside a name. Returns React nodes so we can
 * render <mark> for matches without dangerouslySetInnerHTML.
 */
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const haystack = normalize(text);
  const needle = normalize(query);
  const idx = haystack.indexOf(needle);
  if (idx < 0) return text;
  // Map back from the normalized index to the original by walking char-by-char.
  // Diacritics are single chars in NFD-stripped input but the original may
  // have combining marks; this naive approach is fine because indices align
  // for the unaccent-only normalize() used here.
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-emerald-100 text-emerald-800 font-semibold rounded-sm px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────

interface SpecialtySearchProps {
  specialties: Specialty[];
  loading: boolean;
  selected: { id: string; name: string } | null;
  onSelect: (specialty: { id: string; name: string }) => void;
  onContinue: () => void;
}

export function SpecialtySearch({
  specialties,
  loading,
  selected,
  onSelect,
  onContinue,
}: SpecialtySearchProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [mounted, setMounted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  // Server renders the loading state; defer to client so the React Query
  // cache can repopulate without triggering a hydration mismatch.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Surface up to 4 best matches. When the query is empty, suggestions are
  // empty too (chips below take over). When it has text, we filter first by
  // name then by description, dedup, cap at 4.
  const suggestions = useMemo(() => {
    const q = normalize(query);
    if (!q) return [] as Specialty[];
    const byName = specialties.filter((s) => normalize(s.name).includes(q));
    if (byName.length >= 4) return byName.slice(0, 4);

    const byDesc = specialties
      .filter(
        (s) =>
          s.description &&
          normalize(s.description).includes(q) &&
          !byName.some((b) => b.id === s.id),
      )
      .slice(0, 4 - byName.length);

    return [...byName, ...byDesc];
  }, [specialties, query]);

  // Hydrate quick picks from the actual specialty list. The naive
  // .includes() matched Odontopediatria when looking for "pediatria"
  // (Odonto-PEDIATRIA), so we go strictest-first: exact, then
  // startsWith, then includes. This keeps the chips representing the
  // canonical specialty for each pick.
  const quickPicks = useMemo(() => {
    return QUICK_PICKS.map((qp) => {
      const exact = specialties.find((s) => normalize(s.name) === qp);
      if (exact) return exact;
      const starts = specialties.find((s) => normalize(s.name).startsWith(qp));
      if (starts) return starts;
      return specialties.find((s) => normalize(s.name).includes(qp));
    }).filter((s): s is Specialty => Boolean(s));
  }, [specialties]);

  // Keep the active highlight clamped whenever the suggestion list shrinks.
  useEffect(() => {
    if (activeIdx >= suggestions.length) setActiveIdx(0);
  }, [suggestions.length, activeIdx]);

  // Click-outside closes the suggestion popover so the page feels modal-free.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handlePick = useCallback(
    (s: Specialty) => {
      onSelect({ id: s.id, name: s.name });
      setOpen(false);
      setQuery("");
      // Move focus back to the input briefly so keyboard users can keep going.
      inputRef.current?.blur();
    },
    [onSelect],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
        setOpen(true);
        e.preventDefault();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        if (suggestions[activeIdx]) {
          e.preventDefault();
          handlePick(suggestions[activeIdx]);
        }
      } else if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    },
    [open, suggestions, activeIdx, handlePick],
  );

  // ─── Loading shell ─────────────────────────────────────────────────────
  if (loading || !mounted) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-[hsl(var(--foreground))] mb-1">
            Que especialidad necesitas?
          </h2>
          <p className="text-[hsl(var(--muted-foreground))] text-sm">
            Buscaremos los doctores disponibles segun tu eleccion
          </p>
        </div>
        <div className="flex items-center gap-3 px-4 py-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
          <span className="text-sm text-[hsl(var(--muted-foreground))]">
            Cargando especialidades...
          </span>
        </div>
      </div>
    );
  }

  const SelectedIcon = selected ? getSpecialtyIcon(selected.name) : null;

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div>
        <h2 className="text-xl font-bold text-[hsl(var(--foreground))] mb-1">
          Que especialidad necesitas?
        </h2>
        <p className="text-[hsl(var(--muted-foreground))] text-sm">
          Escribi y elegi entre las coincidencias, o tocá un atajo
        </p>
      </div>

      {/* Combobox */}
      <div ref={containerRef} className="relative">
        <div
          className={`group flex items-center gap-2 rounded-2xl border bg-[hsl(var(--card))] px-4 py-3.5 shadow-sm transition-all ${
            open
              ? "border-emerald-500 ring-2 ring-emerald-500/20"
              : "border-[hsl(var(--border))] hover:border-emerald-200"
          }`}
        >
          <Search className="h-5 w-5 shrink-0 text-[hsl(var(--muted-foreground))] group-focus-within:text-emerald-600 transition-colors" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              setActiveIdx(0);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={
              selected
                ? "Cambiar especialidad..."
                : "Buscar especialidad (ej: cardiologia, dermatolog...)"
            }
            className="flex-1 bg-transparent text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none text-sm"
            role="combobox"
            aria-expanded={open}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={
              open && suggestions[activeIdx]
                ? `${listboxId}-${suggestions[activeIdx].id}`
                : undefined
            }
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="p-1 rounded-full text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
              aria-label="Limpiar busqueda"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Dropdown */}
        {open && query && (
          <ul
            id={listboxId}
            role="listbox"
            className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-lg shadow-black/5 ring-1 ring-black/5 dark:ring-white/5 animate-in fade-in slide-in-from-top-1 duration-150"
          >
            {suggestions.length === 0 ? (
              <li className="flex items-center gap-3 px-4 py-4 text-sm text-[hsl(var(--muted-foreground))]">
                <SearchX className="h-5 w-5 shrink-0" />
                <div>
                  <p className="font-medium text-[hsl(var(--foreground))]">
                    Sin coincidencias
                  </p>
                  <p className="text-xs">
                    No encontramos especialidades para &ldquo;{query}&rdquo;
                  </p>
                </div>
              </li>
            ) : (
              suggestions.map((s, idx) => {
                const Icon = getSpecialtyIcon(s.name);
                const active = idx === activeIdx;
                const isSelected = selected?.id === s.id;
                return (
                  <li
                    id={`${listboxId}-${s.id}`}
                    key={s.id}
                    role="option"
                    aria-selected={active}
                  >
                    <button
                      type="button"
                      onMouseEnter={() => setActiveIdx(idx)}
                      onClick={() => handlePick(s)}
                      className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                        active
                          ? "bg-emerald-50 dark:bg-emerald-950/30"
                          : "hover:bg-[hsl(var(--muted))]"
                      } ${idx > 0 ? "border-t border-[hsl(var(--border))]" : ""}`}
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                          active
                            ? "bg-emerald-600 text-white"
                            : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
                        } transition-colors`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-medium text-[hsl(var(--foreground))] truncate">
                          {highlightMatch(s.name, query)}
                        </span>
                        {s.description && (
                          <span className="block text-xs text-[hsl(var(--muted-foreground))] truncate">
                            {s.description}
                          </span>
                        )}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                          Actual
                        </span>
                      )}
                      <ChevronRight
                        className={`h-4 w-4 shrink-0 transition-transform ${
                          active
                            ? "translate-x-0.5 text-emerald-600"
                            : "text-[hsl(var(--muted-foreground))]"
                        }`}
                      />
                    </button>
                  </li>
                );
              })
            )}
            {suggestions.length > 0 && (
              <li className="flex items-center justify-between gap-3 px-4 py-2 bg-[hsl(var(--muted))]/50 text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                <span>Mostrando {suggestions.length} de hasta 4</span>
                <span className="hidden sm:flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded border border-[hsl(var(--border))] bg-[hsl(var(--card))] font-sans text-[10px]">
                    ↑↓
                  </kbd>
                  <span>navegar</span>
                  <kbd className="ml-2 px-1.5 py-0.5 rounded border border-[hsl(var(--border))] bg-[hsl(var(--card))] font-sans text-[10px]">
                    ↵
                  </kbd>
                  <span>elegir</span>
                </span>
              </li>
            )}
          </ul>
        )}
      </div>

      {/* Selected card — appears below the search once the user picks one */}
      {selected && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/50 px-4 py-3 dark:border-emerald-900/40 dark:bg-emerald-950/30 animate-in fade-in slide-in-from-top-1 duration-200">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
            {SelectedIcon ? <SelectedIcon className="h-5 w-5" /> : null}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Especialidad elegida
            </p>
            <p className="text-sm font-semibold text-[hsl(var(--foreground))] truncate">
              {selected.name}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              onSelect({ id: "", name: "" });
              inputRef.current?.focus();
              setOpen(true);
            }}
            className="text-xs font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 hover:underline"
          >
            Cambiar
          </button>
        </div>
      )}

      {/* Quick picks — minimalist chips, only when nothing is selected and the
          input is idle. They give the user a "I don't know what to type"
          escape hatch. */}
      {!selected && !query && quickPicks.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-2">
            Mas buscadas
          </p>
          <div className="flex flex-wrap gap-2">
            {quickPicks.map((s) => {
              const Icon = getSpecialtyIcon(s.name);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handlePick(s)}
                  className="group flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-1.5 text-xs font-medium text-[hsl(var(--foreground))] hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                >
                  <Icon className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))] group-hover:text-emerald-600 transition-colors" />
                  {s.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Continue */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onContinue}
          disabled={!selected}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continuar
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
