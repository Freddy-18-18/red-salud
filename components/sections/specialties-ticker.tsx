"use client";

import { useEffect, useState } from "react";
import { Stethoscope, LockKeyhole } from "lucide-react";
import { cn } from "@/lib/utils";

type ApiResponse<T> = { success: boolean; data: T };
type Specialty = { id: string; name: string; description?: string; icon?: string; doctorCount: number };

export function SpecialtiesTicker() {
  const [items, setItems] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch("/api/public/doctor-specialties", { cache: "no-store" });
        if (res.ok) {
          const json = (await res.json()) as ApiResponse<Specialty[]>;
          if (mounted && json.success) {
            setItems(json.data || []);
          }
        }
      } catch (error) {
        console.error("Failed to load specialties", error);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  if (loading) return null;
  if (items.length === 0) return null;

  // Duplicate for infinite scroll
  const displayItems = items;
  const tickerItems = [...displayItems, ...displayItems, ...displayItems];

  return (
    <section className="py-12 bg-background relative border-y border-border/50 overflow-hidden">
      {/* Title */}
      <div className="container mx-auto px-4 mb-8 text-center">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
          Ecosistema Médico en Expansión
        </p>
      </div>

      <div className="relative w-full overflow-hidden group">
        <div className="flex w-max animate-scroll hover:pause gap-6 px-6">
          {tickerItems.map((item, index) => {
            const isLocked = item.doctorCount === 0;
            return (
              <div
                key={`${item.id}-${index}`}
                className="flex-shrink-0 w-52"
              >
                <div className={cn(
                  "flex flex-col items-center justify-center p-6 rounded-xl border transition-all duration-300 h-full relative overflow-hidden group/card",
                  isLocked
                    ? "bg-muted/5 border-dashed border-border opacity-70"
                    : "bg-card border-border hover:border-primary/50 hover:shadow-lg hover:-translate-y-1"
                )}>

                  {/* Icon */}
                  <div className={cn(
                    "p-3 rounded-xl mb-4 transition-colors",
                    isLocked
                      ? "bg-muted text-muted-foreground"
                      : "bg-primary/10 text-primary group-hover/card:bg-primary group-hover/card:text-primary-foreground"
                  )}>
                    {isLocked ? (
                      <LockKeyhole className="w-6 h-6" />
                    ) : (
                      <Stethoscope className="w-6 h-6" />
                    )}
                  </div>

                  {/* Text */}
                  <span className={cn(
                    "text-sm font-medium text-center line-clamp-1 transition-colors",
                    isLocked ? "text-muted-foreground" : "text-foreground"
                  )}>
                    {item.name}
                  </span>

                  {/* Locked Overlay Effect */}
                  {isLocked && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-200">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-primary px-2 py-1 bg-primary/10 rounded-full border border-primary/20">
                        Próximamente
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gradient Fade Edges */}
      <div className="absolute top-0 left-0 h-full w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
    </section>
  );
}

export default SpecialtiesTicker;
