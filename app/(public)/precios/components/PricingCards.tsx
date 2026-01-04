/**
 * @file PricingCards.tsx
 * @description Tarjetas de planes de precios
 * Diseño de 4 columnas inspirado en Supabase: Paciente, Médico Pro, Organizaciones, Enterprise
 */

"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AUTH_ROUTES, ROUTES } from "@/lib/constants";
import {
    patientFeatures,
    doctorFeatures,
    organizationFeatures,
    enterpriseFeatures,
} from "../data/precios-data";
import { cn } from "@/lib/utils";

interface PricingCardsProps {
    /** true = precio anual ($20/mes), false = precio mensual ($30/mes) */
    isAnnual: boolean;
}

/**
 * Componente de tarjetas de precios con 4 planes
 */
export function PricingCards({ isAnnual }: PricingCardsProps) {
    const monthlyPrice = isAnnual ? 20 : 30;
    const annualTotal = 240;

    return (
        <section className="py-8 px-4 md:px-6">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-0">
                    {/* Plan Paciente - Gratis */}
                    <PricingCard
                        name="Paciente"
                        description="Para ti y tu familia"
                        price="Gratis"
                        priceDescription="Por siempre"
                        features={patientFeatures}
                        ctaText="Crear cuenta gratis"
                        ctaHref={`${AUTH_ROUTES.REGISTER}?tipo=paciente`}
                        variant="default"
                        position="first"
                    />

                    {/* Plan Médico Pro - Destacado */}
                    <PricingCard
                        name="Médico Pro"
                        description="Para profesionales de salud"
                        price={`$${monthlyPrice}`}
                        priceSuffix="/mes"
                        priceDescription={isAnnual ? `Facturado $${annualTotal}/año` : "Facturado mensualmente"}
                        features={doctorFeatures}
                        ctaText="Comenzar prueba gratis"
                        ctaHref={`${AUTH_ROUTES.REGISTER}?tipo=medico`}
                        variant="featured"
                        badge="Más Popular"
                        position="middle"
                    />

                    {/* Plan Organizaciones */}
                    <PricingCard
                        name="Organizaciones"
                        description="Clínicas, farmacias, laboratorios"
                        price="Personalizado"
                        priceDescription="Según tus necesidades"
                        features={organizationFeatures}
                        ctaText="Contactar ventas"
                        ctaHref={ROUTES.CONTACTO}
                        variant="default"
                        position="middle"
                    />

                    {/* Plan Enterprise */}
                    <PricingCard
                        name="Enterprise"
                        description="Grandes instituciones"
                        price="Contactar"
                        priceDescription="Solución a medida"
                        features={enterpriseFeatures}
                        ctaText="Hablar con un experto"
                        ctaHref={ROUTES.CONTACTO}
                        variant="ghost"
                        position="last"
                    />
                </div>
            </div>
        </section>
    );
}

// =============================================================================
// SUBCOMPONENTES
// =============================================================================

interface PricingCardProps {
    /** Nombre del plan */
    name: string;
    /** Descripción breve del plan */
    description: string;
    /** Precio a mostrar (puede ser número o texto) */
    price: string;
    /** Sufijo del precio (ej: "/mes") */
    priceSuffix?: string;
    /** Descripción adicional del precio */
    priceDescription: string;
    /** Lista de features incluidos */
    features: string[];
    /** Texto del botón CTA */
    ctaText: string;
    /** URL del botón CTA */
    ctaHref: string;
    /** Variante visual: default, featured (destacado), ghost */
    variant: "default" | "featured" | "ghost";
    /** Badge opcional (ej: "Más Popular") */
    badge?: string;
    /** Posición en el grid para bordes */
    position: "first" | "middle" | "last";
}

function PricingCard({
    name,
    description,
    price,
    priceSuffix,
    priceDescription,
    features,
    ctaText,
    ctaHref,
    variant,
    badge,
    position,
}: PricingCardProps) {
    const isFeatured = variant === "featured";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className={cn(
                "relative flex flex-col p-6 lg:p-8",
                // Bordes para desktop (grid conectado)
                "lg:border-y lg:border-r border border-border lg:first:border-l lg:first:rounded-l-xl lg:last:rounded-r-xl",
                // Móvil: bordes redondeados individuales
                "rounded-xl lg:rounded-none",
                // Fondo
                isFeatured ? "bg-muted/30" : "bg-background",
                // Ajuste para el featured (ligeramente elevado en desktop)
                isFeatured && "lg:-mt-4 lg:mb-4 lg:rounded-t-xl lg:border lg:shadow-lg lg:z-10"
            )}
        >
            {/* Badge de "Más Popular" */}
            {badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 text-xs font-semibold bg-primary text-primary-foreground rounded-full">
                        {badge}
                    </span>
                </div>
            )}

            {/* Nombre y descripción */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-1">{name}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>

            {/* Precio */}
            <div className="mb-6">
                <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-foreground">{price}</span>
                    {priceSuffix && (
                        <span className="text-lg text-muted-foreground">{priceSuffix}</span>
                    )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{priceDescription}</p>
            </div>

            {/* Botón CTA */}
            <Button
                asChild
                size="lg"
                variant={isFeatured ? "default" : variant === "ghost" ? "outline" : "secondary"}
                className={cn(
                    "w-full mb-6",
                    isFeatured && "bg-primary hover:bg-primary/90"
                )}
            >
                <Link href={ctaHref}>{ctaText}</Link>
            </Button>

            {/* Lista de features */}
            <ul className="space-y-3 flex-grow">
                {features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm">
                        {/* El primer item de planes superiores es "Todo lo de X, más:" */}
                        {feature.includes("Todo lo de") ? (
                            <span className="text-muted-foreground font-medium">{feature}</span>
                        ) : (
                            <>
                                <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                <span className="text-foreground/80">{feature}</span>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </motion.div>
    );
}
