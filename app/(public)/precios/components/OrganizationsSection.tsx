/**
 * @file OrganizationsSection.tsx
 * @description Sección de organizaciones y sectores
 * Diseño estilo Enterprise mostrando los diferentes sectores soportados
 */

"use client";

import { motion } from "framer-motion";
import { ArrowRight, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { organizations } from "../data/precios-data";

/**
 * Sección que muestra los diferentes sectores y organizaciones
 * con un diseño estilo Enterprise
 */
export function OrganizationsSection() {
    return (
        <section className="py-20 px-4 md:px-6 bg-muted/30">
            <div className="max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background border border-border text-sm text-muted-foreground mb-6">
                        <Building2 className="h-4 w-4" />
                        <span>Soluciones Empresariales</span>
                    </div>

                    {/* Título */}
                    <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
                        Planes para organizaciones de salud
                    </h2>

                    {/* Descripción */}
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Digitaliza tu organización con planes personalizados según tu sector
                        y necesidades específicas. Incluye 1 mes gratis de prueba.
                    </p>
                </motion.div>

                {/* Grid de sectores */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-12"
                >
                    {organizations.map((org, idx) => (
                        <motion.div
                            key={org.slug}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.05 }}
                            className="flex flex-col items-center p-4 rounded-xl bg-background border border-border hover:border-primary/30 hover:shadow-sm transition-all duration-200 group"
                        >
                            {/* Icono */}
                            <span className="text-3xl mb-3 group-hover:scale-110 transition-transform">
                                {org.icon}
                            </span>

                            {/* Nombre */}
                            <h3 className="font-medium text-foreground text-sm mb-1">
                                {org.name}
                            </h3>

                            {/* Descripción corta */}
                            <p className="text-xs text-muted-foreground text-center line-clamp-2">
                                {org.description}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Button asChild size="lg" className="min-w-[200px]">
                        <Link href={ROUTES.CONTACTO}>
                            Hablar con ventas
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                    </Button>

                    <p className="text-sm text-muted-foreground">
                        ¿Tienes preguntas?{" "}
                        <Link
                            href={ROUTES.CONTACTO}
                            className="text-primary hover:underline"
                        >
                            Contáctanos
                        </Link>
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
