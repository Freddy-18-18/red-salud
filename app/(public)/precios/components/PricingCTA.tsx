/**
 * @file PricingCTA.tsx
 * @description Call to action final de la página de precios
 * Diseño minimalista que funciona con tema claro y oscuro
 */

"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AUTH_ROUTES } from "@/lib/constants";

/**
 * Sección final de CTA para registrarse
 */
export function PricingCTA() {
    return (
        <section className="py-20 px-4 md:px-6 bg-muted/50">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-2xl mx-auto text-center"
            >
                {/* Título */}
                <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
                    ¿Listo para comenzar?
                </h2>

                {/* Descripción */}
                <p className="text-muted-foreground mb-8">
                    Únete a miles de pacientes y profesionales que ya confían en Red-Salud.
                    <br className="hidden sm:block" />
                    Sin contratos. Cancela cuando quieras.
                </p>

                {/* Botón CTA */}
                <Button asChild size="lg" className="min-w-[200px]">
                    <Link href={AUTH_ROUTES.REGISTER}>
                        Crear cuenta gratis
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                </Button>

                {/* Nota */}
                <p className="mt-4 text-sm text-muted-foreground">
                    No se requiere tarjeta de crédito
                </p>
            </motion.div>
        </section>
    );
}
