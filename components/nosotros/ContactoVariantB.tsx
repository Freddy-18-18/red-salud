"use client";

/**
 * @file ContactoVariantB.tsx
 * @description Variante B: Centered CTA
 * Diseño centrado con un solo CTA prominente.
 */

import { motion } from "framer-motion";
import { ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AUTH_ROUTES } from "@/lib/constants";

export function ContactoVariantB() {
    return (
        <section className="py-24 md:py-32 relative bg-muted/30 border-y border-border">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    {/* Icon */}
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8">
                        <Mail className="h-10 w-10 text-primary" />
                    </div>

                    {/* Title */}
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                        ¿Listo para comenzar?
                    </h2>

                    {/* Description */}
                    <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
                        Estamos aquí para escucharte. Ya sea que quieras ser parte de la validación o simplemente tengas curiosidad.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button asChild size="lg" className="h-14 px-8 text-base">
                            <a href={AUTH_ROUTES.REGISTER}>
                                Crear cuenta gratis
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </a>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="h-14 px-8 text-base">
                            <a href="mailto:soporte@red-salud.com">
                                Enviar mensaje
                            </a>
                        </Button>
                    </div>

                    {/* Contact Info */}
                    <div className="mt-12 pt-8 border-t border-border">
                        <p className="text-muted-foreground">
                            <span className="font-medium text-foreground">Respondemos personalmente:</span>{" "}
                            <a href="mailto:soporte@red-salud.com" className="text-primary hover:underline">
                                soporte@red-salud.com
                            </a>
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
