/**
 * @file page.tsx
 * @description Página de Planes y Precios de Red-Salud Academy.
 * 
 * @module Academy/Planes
 */

import { Metadata } from 'next';
import Link from 'next/link';
import {
    Check,
    X,
    Sparkles,
    Crown,
    Building2,
    ArrowRight,
    Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
    title: 'Planes y Precios',
    description: 'Elige el plan que mejor se adapte a tus necesidades de aprendizaje.',
};

/** Definición de planes */
const PLANS = [
    {
        id: 'free',
        name: 'Gratuito',
        description: 'Ideal para explorar la plataforma',
        price: '$0',
        period: 'siempre',
        icon: Zap,
        color: 'slate',
        popular: false,
        features: [
            { text: 'Módulo básico de todas las especialidades', included: true },
            { text: '1 lección por día', included: true },
            { text: 'Acceso a la comunidad', included: true },
            { text: 'Progreso guardado', included: true },
            { text: 'Módulos intermedios y avanzados', included: false },
            { text: 'Descargas offline', included: false },
            { text: 'Certificaciones verificables', included: false },
            { text: 'Sin anuncios', included: false },
        ],
        cta: 'Comenzar Gratis',
        ctaVariant: 'outline' as const,
    },
    {
        id: 'premium',
        name: 'Premium',
        description: 'Para pacientes y aprendices dedicados',
        price: '$9.99',
        period: '/mes',
        icon: Sparkles,
        color: 'cyan',
        popular: true,
        features: [
            { text: 'Acceso ilimitado a todos los cursos', included: true },
            { text: 'Sin límite de lecciones diarias', included: true },
            { text: 'Módulos básico, intermedio y avanzado', included: true },
            { text: 'Descargas para estudio offline', included: true },
            { text: 'Certificaciones de Paciente Experto', included: true },
            { text: 'Sin anuncios', included: true },
            { text: 'Soporte prioritario', included: true },
            { text: 'Certificaciones profesionales (CME)', included: false },
        ],
        cta: 'Obtener Premium',
        ctaVariant: 'default' as const,
    },
    {
        id: 'professional',
        name: 'Profesional',
        description: 'Para médicos y estudiantes de medicina',
        price: '$24.99',
        period: '/mes',
        icon: Crown,
        color: 'amber',
        popular: false,
        features: [
            { text: 'Todo lo incluido en Premium', included: true },
            { text: 'Módulo Especialista (nivel experto)', included: true },
            { text: 'Certificaciones CME válidas', included: true },
            { text: 'Contenido exclusivo para profesionales', included: true },
            { text: 'Casos clínicos avanzados', included: true },
            { text: 'Actualizaciones de investigación', included: true },
            { text: 'Perfil profesional verificado', included: true },
            { text: 'Networking con colegas', included: true },
        ],
        cta: 'Obtener Profesional',
        ctaVariant: 'default' as const,
    },
];

/** FAQs sobre precios */
const FAQS = [
    {
        q: '¿Puedo cancelar en cualquier momento?',
        a: 'Sí, puedes cancelar tu suscripción en cualquier momento. Mantendrás el acceso hasta el final del período facturado.',
    },
    {
        q: '¿Hay descuentos para estudiantes?',
        a: 'Sí, ofrecemos 50% de descuento para estudiantes de medicina con correo universitario válido.',
    },
    {
        q: '¿Qué métodos de pago aceptan?',
        a: 'Aceptamos tarjetas de crédito/débito, PayPal y transferencias bancarias locales en Venezuela.',
    },
    {
        q: '¿Las certificaciones tienen validez oficial?',
        a: 'Las certificaciones Premium son reconocidas dentro del ecosistema Red-Salud. Las certificaciones CME del plan Profesional tienen validez para créditos de educación médica continua.',
    },
];

export default function PlanesPage() {
    return (
        <div className="min-h-screen py-8">
            {/* Header */}
            <section className="px-4 py-12 text-center">
                <div className="container mx-auto max-w-4xl">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Planes y Precios
                    </h1>
                    <p className="text-lg text-white/60 max-w-2xl mx-auto">
                        Elige el plan que mejor se adapte a tu camino de aprendizaje.
                        Todos incluyen acceso a nuestra metodología científica comprobada.
                    </p>
                </div>
            </section>

            {/* Planes */}
            <section className="px-4 py-12">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid md:grid-cols-3 gap-6">
                        {PLANS.map((plan) => (
                            <Card
                                key={plan.id}
                                className={`relative bg-white/[0.03] border-white/10 overflow-hidden ${plan.popular ? 'ring-2 ring-cyan-500' : ''
                                    }`}
                            >
                                {/* Popular badge */}
                                {plan.popular && (
                                    <div className="absolute top-0 right-0 bg-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                                        POPULAR
                                    </div>
                                )}

                                <CardContent className="p-6">
                                    {/* Header */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <div
                                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                                            style={{
                                                backgroundColor:
                                                    plan.color === 'slate'
                                                        ? '#64748b20'
                                                        : plan.color === 'cyan'
                                                            ? '#0891b220'
                                                            : '#f5920820',
                                                color:
                                                    plan.color === 'slate'
                                                        ? '#94a3b8'
                                                        : plan.color === 'cyan'
                                                            ? '#22d3ee'
                                                            : '#fcd34d',
                                            }}
                                        >
                                            <plan.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white">{plan.name}</h3>
                                            <p className="text-xs text-white/50">{plan.description}</p>
                                        </div>
                                    </div>

                                    {/* Precio */}
                                    <div className="mb-6">
                                        <span className="text-4xl font-bold text-white">{plan.price}</span>
                                        <span className="text-white/40">{plan.period}</span>
                                    </div>

                                    {/* CTA */}
                                    <Link
                                        href={`/registro?type=patient&plan=${plan.id}&redirect=/academy/dashboard`}
                                        className="block mb-6"
                                    >
                                        <Button
                                            className={`w-full ${plan.ctaVariant === 'default'
                                                    ? plan.popular
                                                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                                                        : 'bg-amber-500 hover:bg-amber-400 text-black'
                                                    : 'border-white/20 text-white hover:bg-white/5'
                                                }`}
                                            variant={plan.ctaVariant}
                                        >
                                            {plan.cta}
                                        </Button>
                                    </Link>

                                    {/* Features */}
                                    <ul className="space-y-3">
                                        {plan.features.map((feature, index) => (
                                            <li
                                                key={index}
                                                className={`flex items-start gap-2 text-sm ${feature.included ? 'text-white/70' : 'text-white/30'
                                                    }`}
                                            >
                                                {feature.included ? (
                                                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                                ) : (
                                                    <X className="w-4 h-4 text-white/20 flex-shrink-0 mt-0.5" />
                                                )}
                                                <span className={!feature.included ? 'line-through' : ''}>
                                                    {feature.text}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Institucional */}
            <section className="px-4 py-12">
                <div className="container mx-auto max-w-4xl">
                    <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-white/10">
                        <CardContent className="p-8 flex flex-col md:flex-row items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                <Building2 className="w-8 h-8 text-blue-400" />
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-xl font-bold text-white mb-2">
                                    ¿Eres una institución de salud?
                                </h3>
                                <p className="text-white/60 mb-4 md:mb-0">
                                    Planes corporativos con facturación centralizada, reportes de
                                    progreso y contenido personalizado para tu equipo.
                                </p>
                            </div>
                            <Link href="/contacto?type=institutional">
                                <Button variant="outline" className="border-white/20 text-white hover:bg-white/5">
                                    Contactar Ventas
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* FAQs */}
            <section className="px-4 py-12">
                <div className="container mx-auto max-w-3xl">
                    <h2 className="text-2xl font-bold text-white mb-8 text-center">
                        Preguntas Frecuentes
                    </h2>
                    <div className="space-y-4">
                        {FAQS.map((faq, index) => (
                            <Card key={index} className="bg-white/[0.03] border-white/5">
                                <CardContent className="p-6">
                                    <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
                                    <p className="text-sm text-white/60">{faq.a}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
