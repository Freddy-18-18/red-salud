"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Clock, Stethoscope } from "lucide-react";

type Profile = { id: string; nombre_completo?: string; avatar_url?: string };
type Specialty = { id: string; name: string };
type Doctor = {
  id: string;
  profile?: Profile;
  specialty?: Specialty;
  tarifa_consulta?: number;
  consultation_duration?: number;
};

// Especialidades placeholder para mostrar "Próximamente"
const placeholderSpecialties = [
  "Cardiología",
  "Dermatología", 
  "Pediatría",
  "Ginecología",
  "Neurología",
  "Oftalmología",
  "Traumatología",
  "Psiquiatría",
  "Endocrinología",
  "Urología",
];

function formatUSD(value?: number) {
  if (!value && value !== 0) return undefined;
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
  } catch {
    return `${value}`;
  }
}

// Componente para card de médico real
function DoctorCard({ doctor }: { doctor: Doctor }) {
  return (
    <Card className="h-full border border-border shadow-sm hover:shadow-lg hover:border-primary/50 group bg-card min-w-[280px] transition-all duration-300">
      <CardContent className="p-5 flex items-center gap-4">
        <div className="relative h-14 w-14 rounded-full overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 flex-shrink-0 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300">
          {doctor?.profile?.avatar_url ? (
            <Image 
              src={doctor.profile.avatar_url} 
              alt={doctor?.profile?.nombre_completo || "Médico"} 
              fill 
              className="object-cover" 
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-primary font-bold bg-primary/5">
              <Stethoscope className="w-5 h-5" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-foreground truncate">
            {doctor?.profile?.nombre_completo || "Dr. Especialista"}
          </div>
          <div className="text-sm text-muted-foreground truncate">
            {doctor?.specialty?.name || "Medicina General"}
          </div>
          {typeof doctor?.tarifa_consulta !== "undefined" && (
            <div className="flex items-center gap-2 text-sm text-primary font-semibold mt-1.5 tabular-nums">
              <span>{formatUSD(doctor.tarifa_consulta)}</span>
              <span className="text-muted-foreground/50">·</span>
              <span className="flex items-center gap-1 text-muted-foreground font-normal text-xs">
                <Clock className="w-3 h-3" />
                {doctor?.consultation_duration || 30} min
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Componente para card placeholder "Próximamente"
function PlaceholderCard({ specialty }: { specialty: string }) {
  return (
    <Card className="h-full border border-dashed border-muted-foreground/20 bg-muted/20 min-w-[280px] hover:border-muted-foreground/30 transition-all duration-300">
      <CardContent className="p-5 flex items-center gap-4">
        <div className="relative h-14 w-14 rounded-full overflow-hidden bg-muted flex-shrink-0 ring-2 ring-muted-foreground/10">
          <div className="h-full w-full flex items-center justify-center text-muted-foreground/40">
            <Stethoscope className="w-5 h-5" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-muted-foreground/70 truncate">
            Próximamente
          </div>
          <div className="text-sm text-muted-foreground/50 truncate">
            {specialty}
          </div>
          <div className="text-xs text-primary/60 font-medium mt-1.5">
            Buscando especialistas
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function FeaturedDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch("/api/public/doctors?featured=true&limit=6", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (mounted && json?.success) setDoctors(json.data || []);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  // Crear lista de items únicos (médicos reales + placeholders para completar)
  const createUniqueItems = () => {
    const items: { type: 'doctor' | 'placeholder'; data: Doctor | string; key: string }[] = [];
    
    // Agregar médicos reales
    doctors.forEach(doctor => {
      items.push({ type: 'doctor', data: doctor, key: `doctor-${doctor.id}` });
    });
    
    // Completar con placeholders hasta tener al menos 6 items
    const neededPlaceholders = Math.max(0, 6 - doctors.length);
    placeholderSpecialties.slice(0, neededPlaceholders).forEach((specialty, idx) => {
      items.push({ type: 'placeholder', data: specialty, key: `placeholder-${idx}` });
    });
    
    return items;
  };

  const uniqueItems = createUniqueItems();
  
  // Para el scroll infinito, duplicamos el set completo (no items individuales)
  // Esto evita que se repita el mismo médico seguido
  const scrollItems = [...uniqueItems, ...uniqueItems];

  if (loading) {
    return (
      <section className="py-16 bg-muted/20 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-6 bg-muted rounded w-32 mb-2" />
            <div className="h-8 bg-muted rounded w-64 mb-8" />
            <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 w-[300px] bg-muted rounded-xl flex-shrink-0" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-muted/20 relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10 dark:opacity-5">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-10"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={fadeInUp} className="text-center sm:text-left">
            <div className="inline-block px-4 py-2 rounded-full bg-primary/10 dark:bg-primary/20 text-primary text-sm font-semibold mb-3 border border-primary/20 dark:border-primary/30">
              Médicos destacados
            </div>
            <h3 className="text-3xl sm:text-4xl font-bold text-foreground">
              Profesionales verificados
            </h3>
            <p className="text-muted-foreground mt-2">
              {doctors.length > 0 
                ? "Atención de calidad con médicos recomendados"
                : "Próximamente más especialistas se unirán"
              }
            </p>
          </motion.div>
          <motion.div variants={fadeInUp}>
            <Link 
              href="/auth/register?role=medico" 
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-primary/20"
            >
              ¿Eres médico? Únete
              <span aria-hidden>→</span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll infinito mejorado */}
        <div 
          className="relative w-full overflow-visible py-4 -my-4"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Contenedor con overflow hidden solo horizontal */}
          <div className="overflow-x-hidden overflow-y-visible">
            {/* Contenedor del scroll */}
            <div 
              className="flex gap-5 py-2"
              style={{
                animation: `scroll-x 35s linear infinite`,
                animationPlayState: isPaused ? 'paused' : 'running',
                width: 'max-content',
              }}
            >
              {scrollItems.map((item, index) => (
                <div 
                  key={`${item.key}-${index}`} 
                  className="flex-shrink-0 transition-transform duration-300"
                >
                  {item.type === 'doctor' ? (
                    <DoctorCard doctor={item.data as Doctor} />
                  ) : (
                    <PlaceholderCard specialty={item.data as string} />
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Gradient masks para efecto fade en los bordes */}
          <div className="absolute top-0 left-0 h-full w-16 sm:w-24 bg-gradient-to-r from-[hsl(var(--muted)/0.2)] to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 right-0 h-full w-16 sm:w-24 bg-gradient-to-l from-[hsl(var(--muted)/0.2)] to-transparent z-10 pointer-events-none" />
        </div>
      </div>

      {/* CSS para la animación del scroll */}
      <style jsx>{`
        @keyframes scroll-x {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
}
