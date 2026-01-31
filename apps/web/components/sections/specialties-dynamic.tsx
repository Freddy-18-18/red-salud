"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { Stethoscope } from "lucide-react";

type ApiResponse<T> = { success: boolean; data: T };
type Specialty = { id: string; name: string; description?: string; icon?: string };

export function SpecialtiesDynamic() {
  const [items, setItems] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch("/api/public/doctor-specialties?onlyWithDoctors=true", { cache: "no-store" });
        if (res.ok) {
          const json = (await res.json()) as ApiResponse<Specialty[]>;
          if (mounted && json.success) setItems(json.data || []);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  if (!loading && items.length === 0) return null; // no mostrar vacío

  return (
    <section id="next-section" className="py-16 bg-secondary/30 dark:bg-background relative overflow-hidden">
      {/* Fondo decorativo sutil */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-12"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={fadeInUp} className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-teal-100 dark:from-blue-900/30 dark:to-teal-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold mb-4 border border-blue-200 dark:border-blue-800">
            Especialidades disponibles
          </motion.div>
          <motion.h3 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-foreground">
            Encuentra al especialista que necesitas
          </motion.h3>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-6xl mx-auto"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          {(items.length ? items : Array.from({ length: 6 })).map((s, i) => {
            const specialty = s as Specialty | undefined;
            return (
              <motion.div 
                key={specialty?.id ?? i} 
                variants={fadeInUp} 
                className="bg-card text-card-foreground rounded-xl px-4 py-4 shadow-sm border transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-blue-400/50 dark:hover:border-blue-600/50 flex flex-col items-center gap-3 group"
              >
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <Stethoscope className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm font-semibold text-center text-foreground">
                  {specialty?.name ?? "Cargando..."}
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
