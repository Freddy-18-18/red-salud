"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import Link from "next/link";

import { DoctorCard } from "./DoctorCard";
import { PlaceholderCard } from "./PlaceholderCard";
import { FeaturedDoctorsSkeleton } from "./FeaturedDoctorsSkeleton";
import { type Doctor, placeholderSpecialties } from "./featured-doctors-data";

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
    const scrollItems = [...uniqueItems, ...uniqueItems];

    if (loading) {
        return <FeaturedDoctorsSkeleton />;
    }

    return (
        <section className="py-16 bg-muted/20 relative overflow-hidden">
            {/* Background decoration */}
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

                {/* Infinite scroll */}
                <div
                    className="relative w-full overflow-visible py-4 -my-4"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    <div className="overflow-x-hidden overflow-y-visible">
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

                    {/* Gradient masks */}
                    <div className="absolute top-0 left-0 h-full w-16 sm:w-24 bg-gradient-to-r from-[hsl(var(--muted)/0.2)] to-transparent z-10 pointer-events-none" />
                    <div className="absolute top-0 right-0 h-full w-16 sm:w-24 bg-gradient-to-l from-[hsl(var(--muted)/0.2)] to-transparent z-10 pointer-events-none" />
                </div>
            </div>

            {/* CSS for scroll animation */}
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
