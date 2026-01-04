/**
 * @file specialties-ticker.tsx
 * @description Ticker de especialidades médicas para la página de inicio.
 * Muestra TODAS las especialidades en dos filas con scroll infinito.
 * Incluye buscador centrado arriba del ticker.
 *
 * @features
 * - Buscador centrado arriba del ticker
 * - Scroll infinito en dos filas (direcciones opuestas)
 * - Pausa automática de la fila al buscar
 * - Highlight visual de la especialidad encontrada
 */

"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Stethoscope,
  Activity,
  HeartPulse,
  Brain,
  Bone,
  Eye,
  Ear,
  Baby,
  Pill,
  Syringe,
  Heart,
  Microscope,
  Sparkles,
} from "lucide-react";
import { cn, slugify } from "@/lib/utils";
import { motion } from "framer-motion";
import { SpecialtySearch } from "./specialties/SpecialtySearch";

import { MASTER_SPECIALTIES } from "./specialties/master-list";

type ApiResponse<T> = { success: boolean; data: T };
type Specialty = {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  doctorCount: number;
};

/**
 * Mapeo de iconos por nombre de especialidad o palabra clave.
 */
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Cardiología: HeartPulse,
  Neurología: Brain,
  "Traumatología y Ortopedia": Bone,
  Oftalmología: Eye,
  Otorrinolaringología: Ear,
  Pediatría: Baby,
  "Medicina General": Stethoscope,
  "Medicina Familiar": Stethoscope,
  Ginecología: Heart,
  Dermatología: Microscope,
  Psiquiatría: Brain,
  default: Activity,
};

/**
 * Obtiene el icono apropiado para una especialidad.
 */
function getIconForSpecialty(name: string): React.ComponentType<{ className?: string }> {
  if (iconMap[name]) return iconMap[name];

  const lower = name.toLowerCase();
  if (lower.includes("cardio")) return HeartPulse;
  if (lower.includes("neuro")) return Brain;
  if (lower.includes("pediat")) return Baby;
  if (lower.includes("trauma") || lower.includes("ortop")) return Bone;
  if (lower.includes("oftalmo")) return Eye;
  if (lower.includes("otorrino")) return Ear;
  if (lower.includes("gineco") || lower.includes("obstet")) return Heart;
  if (lower.includes("dermato")) return Microscope;
  if (lower.includes("cirug")) return Syringe;
  if (lower.includes("medicina")) return Stethoscope;
  if (lower.includes("farmac")) return Pill;

  return Activity;
}

/**
 * Componente principal del ticker de especialidades.
 */
export function SpecialtiesTicker() {
  const [items, setItems] = useState<Specialty[]>([]);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [pausedRow, setPausedRow] = useState<1 | 2 | null>(null);

  // Referencias a las filas para scroll programático
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);

  // Cargar especialidades al montar
  useEffect(() => {
    let mounted = true;
    async function load() {
      // Inicializar con Master List (0 conteos)
      const initialItems = MASTER_SPECIALTIES.map((s) => ({
        ...s,
        doctorCount: 0,
      }));
      if (mounted) setItems(initialItems);

      try {
        const res = await fetch("/api/public/doctor-specialties", {
          cache: "no-store",
        });
        if (res.ok) {
          const json = (await res.json()) as ApiResponse<Specialty[]>;
          if (mounted && json.success && Array.isArray(json.data)) {
            // Crear mapa de especialidades de la DB
            const dbMap = new Map<string, Specialty>();
            json.data.forEach((s) => {
              // Normalizar clave: minusculas, sin tildes, trim
              const key = s.name
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .trim();
              dbMap.set(key, s);
            });

            // Procesar Master List: usar datos de DB si existen
            const merged = MASTER_SPECIALTIES.map((ms) => {
              const key = ms.name
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .trim();

              const dbItem = dbMap.get(key);

              if (dbItem) {
                dbMap.delete(key);
                return {
                  ...ms,
                  id: dbItem.id,
                  doctorCount: dbItem.doctorCount,
                };
              }
              return { ...ms, doctorCount: 0 }; // Si no hay match, asumimos 0 doctores
            });

            // Agregar nuevas especialidades de la DB que no estaban en Master List
            const newItems = Array.from(dbMap.values());
            const final = [...merged, ...newItems];

            setItems(final);
          }
        }
      } catch (error) {
        console.error("[SpecialtiesTicker] Error syncing specialties:", error);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  /**
   * Prepara el track para scroll infinito.
   */
  const prepareTrack = useCallback((arr: Specialty[]) => {
    let filled = [...arr];
    if (filled.length === 0) return [];

    // Expandir a mínimo 20 items para pantallas anchas
    while (filled.length < 20) {
      filled = [...filled, ...arr];
    }
    // Duplicar para el loop -50%
    return [...filled, ...filled];
  }, []);

  /**
   * Maneja la selección desde el buscador.
   */
  /* Navegación directa al seleccionar */
  const router = useRouter(); // Asegúrate de importar useRouter de next/navigation

  const handleSearchSelect = useCallback(
    (id: string, rowIndex: 1 | 2) => {
      // Encontrar el item para obtener el slug
      // Como optimization, podríamos pasar el nombre directo desde el Search,
      // pero aquí buscamos en items por seguridad.
      const item = items.find(i => i.id === id);
      if (item) {
        const slug = slugify(item.name);
        router.push(`/especialidades/${slug}`);
      }
    },
    [items, router]
  );

  /**
   * Limpia el estado de búsqueda
   */
  const handleSearchClear = useCallback(() => {
    setPausedRow(null);
    setHighlightedId(null);
  }, []);

  if (items.length === 0) return null;

  // Dividir items en dos filas
  const mid = Math.ceil(items.length / 2);
  const rawRow1 = items.slice(0, mid);
  const rawRow2 = items.slice(mid);

  const finalRow1 = prepareTrack(rawRow1);
  const finalRow2 = prepareTrack(rawRow2);

  return (
    <section className="py-16 bg-gradient-to-b from-background via-muted/10 to-background border-y border-border/30 relative">
      {/* Textura de fondo */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay pointer-events-none" />

      {/* Header con Buscador Centrado */}
      <div className="container mx-auto px-4 mb-12 relative z-10">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Directorio Médico Completo
            </span>
          </div>

          {/* Título */}
          <h3 className="text-3xl md:text-4xl font-black text-foreground mb-3">
            Explora Nuestras{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-500 to-primary">
              Especialidades
            </span>
          </h3>

          <p className="text-muted-foreground text-base max-w-lg mx-auto mb-8">
            Más de {items.length} especialidades médicas disponibles. Encuentra
            el especialista que necesitas.
          </p>

          {/* Buscador Centrado */}
          <SpecialtySearch
            items={items}
            row1Items={rawRow1}
            row2Items={rawRow2}
            onSelect={handleSearchSelect}
            onClear={handleSearchClear}
          />
        </div>
      </div>

      {/* Ticker Container */}
      <div className="relative w-full overflow-hidden flex flex-col gap-6 py-4">
        {/* Gradientes laterales */}
        <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-r from-background via-background/90 to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-l from-background via-background/90 to-transparent z-20 pointer-events-none" />

        {/* Fila 1 */}
        {finalRow1.length > 0 && (
          <div
            ref={row1Ref}
            className={cn(
              "flex w-max",
              pausedRow === 1
                ? ""
                : "animate-scroll hover:[animation-play-state:paused]"
            )}
            style={{
              animationDuration: "280s",
              animationPlayState: pausedRow === 1 ? "paused" : undefined,
            }}
          >
            <div className="flex gap-4 px-2">
              {finalRow1.map((item, index) => (
                <SpecialtyCard
                  key={`r1-${item.id}-${index}`}
                  item={item}
                  isHighlighted={highlightedId === item.id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Fila 2 (reversa) */}
        {finalRow2.length > 0 && (
          <div
            ref={row2Ref}
            className={cn(
              "flex w-max",
              pausedRow === 2
                ? ""
                : "animate-scroll hover:[animation-play-state:paused]"
            )}
            style={{
              animationDirection: "reverse",
              animationDuration: "300s",
              animationPlayState: pausedRow === 2 ? "paused" : undefined,
            }}
          >
            <div className="flex gap-4 px-2">
              {finalRow2.map((item, index) => (
                <SpecialtyCard
                  key={`r2-${item.id}-${index}`}
                  item={item}
                  isHighlighted={highlightedId === item.id}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * Props del componente de tarjeta de especialidad.
 */
interface SpecialtyCardProps {
  item: Specialty;
  isHighlighted?: boolean;
}

/**
 * Tarjeta individual de especialidad.
 */
function SpecialtyCard({ item, isHighlighted = false }: SpecialtyCardProps) {
  const Icon = getIconForSpecialty(item.name);
  const isLocked = item.doctorCount === 0;

  return (
    <Link href={`/especialidades/${slugify(item.name)}`} className="block">
      <motion.div
        data-specialty-id={item.id}
        animate={
          isHighlighted
            ? {
              scale: 1.08,
              boxShadow: "0 0 25px rgba(59, 130, 246, 0.4)",
            }
            : {}
        }
        transition={{ duration: 0.3 }}
        className={cn(
          "group/card relative flex items-center gap-3 pl-3 pr-5 py-3 rounded-2xl border transition-all duration-300 min-w-[200px]",
          "bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm",
          "hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg hover:shadow-primary/10",
          "hover:scale-[1.03] hover:z-30 hover:-translate-y-1",
          isHighlighted
            ? "ring-2 ring-primary ring-offset-2 bg-white dark:bg-slate-800 scale-[1.03] z-30 -translate-y-1"
            : "",
          isLocked
            ? "border-dashed border-border/40 opacity-60 grayscale hover:opacity-100 hover:grayscale-0 hover:border-primary/50"
            : "border-white/20 dark:border-white/5 hover:border-primary/30"
        )}
      >
        {/* Icono */}
        <div
          className={cn(
            "h-9 w-9 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm flex-shrink-0",
            isLocked
              ? "bg-muted text-muted-foreground"
              : "bg-gradient-to-br from-primary/10 to-blue-500/10 text-primary group-hover/card:from-primary group-hover/card:to-blue-600 group-hover/card:text-white",
            isHighlighted && "from-primary to-blue-600 text-white"
          )}
        >
          <Icon className="h-4 w-4" />
        </div>

        {/* Contenido */}
        <div className="flex flex-col min-w-0">
          <span
            className={cn(
              "text-sm font-bold leading-tight transition-colors truncate",
              isLocked
                ? "text-muted-foreground"
                : "text-foreground group-hover/card:text-primary",
              isHighlighted && "text-primary"
            )}
          >
            {item.name}
          </span>
          <span className="text-[10px] font-medium text-muted-foreground">
            {isLocked ? "Próximamente" : `${item.doctorCount} especialistas`}
          </span>
        </div>

        {/* Badge de highlight */}
        {isHighlighted && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shadow-lg"
          >
            ✓
          </motion.div>
        )}
      </motion.div>
    </Link>
  );
}

export default SpecialtiesTicker;
