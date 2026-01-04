"use client";

/**
 * @file BannerVariantD.tsx
 * @description Variante D: Statement Minimalista
 * Texto enorme y minimalista sobre fondo limpio.
 */

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AUTH_ROUTES } from "@/lib/constants";

export function BannerVariantD() {
    return (
        <section className="py-32 md:py-40 relative bg-background border-t border-border">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                >
                    {/* Statement */}
                    <h2 className="text-4xl md:text-5xl lg:text-7xl font-extralight tracking-tight mb-8 leading-tight">
                        Sé parte del
                        <span className="block font-bold mt-2">inicio de algo grande.</span>
                    </h2>

                    {/* Description */}
                    <p className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed mb-12 max-w-2xl mx-auto">
                        Tu feedback moldeará el futuro de la salud en Venezuela.
                    </p>

                    {/* CTA */}
                    <Button asChild size="lg" className="h-14 px-10 text-lg font-semibold">
                        <a href={AUTH_ROUTES.REGISTER}>
                            Ser un Pionero
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </a>
                    </Button>

                    {/* Divider and note */}
                    <div className="mt-12 pt-8 border-t border-border/50">
                        <p className="text-muted-foreground text-sm">
                            Red-Salud está en fase de validación activa. Tu participación es vital.
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
