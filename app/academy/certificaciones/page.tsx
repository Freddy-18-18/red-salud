/**
 * @file page.tsx
 * @description Página informativa sobre Certificaciones de Red-Salud Academy.
 * 
 * @module Academy/Certificaciones
 */

import { Metadata } from 'next';
import Link from 'next/link';
import {
    Award,
    Shield,
    CheckCircle2,
    Share2,
    QrCode,
    ArrowRight,
    FileCheck,
    GraduationCap,
    Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
    title: 'Certificaciones',
    description:
        'Obtén certificados verificables por cada curso completado. Certificaciones CME válidas para profesionales.',
};

/** Tipos de certificaciones */
const CERTIFICATION_TYPES = [
    {
        icon: GraduationCap,
        name: 'Paciente Experto',
        description:
            'Certificado que acredita conocimiento básico a intermedio en una especialidad médica.',
        requirements: [
            'Completar módulos básico e intermedio',
            'Aprobar evaluación final (70%+)',
            'Mínimo 80% de asistencia a lecciones',
        ],
        color: 'emerald',
        available: ['Plan Premium', 'Plan Profesional'],
    },
    {
        icon: Award,
        name: 'Especialización',
        description:
            'Certificado avanzado que cubre todos los niveles de una especialidad completa.',
        requirements: [
            'Completar los 4 niveles del curso',
            'Aprobar evaluación final (80%+)',
            'Completar proyecto práctico',
        ],
        color: 'blue',
        available: ['Plan Premium', 'Plan Profesional'],
    },
    {
        icon: FileCheck,
        name: 'CME (Educación Médica Continua)',
        description:
            'Créditos de educación médica continua válidos para profesionales de la salud.',
        requirements: [
            'Verificación de título profesional',
            'Completar curso de nivel especialista',
            'Aprobar evaluación CME oficial (85%+)',
        ],
        color: 'amber',
        available: ['Plan Profesional'],
    },
];

/** Características de las certificaciones */
const FEATURES = [
    {
        icon: Shield,
        title: 'Verificación Digital',
        description:
            'Cada certificado incluye un código único y URL de verificación para validar autenticidad.',
    },
    {
        icon: QrCode,
        title: 'Código QR',
        description:
            'Escanea el código QR en el certificado para acceder a la validación instantánea.',
    },
    {
        icon: Share2,
        title: 'Compartir Fácilmente',
        description:
            'Comparte tus logros en LinkedIn, redes sociales o incluye en tu currículum.',
    },
    {
        icon: Building2,
        title: 'Reconocimiento',
        description:
            'Nuestras certificaciones son reconocidas dentro del ecosistema Red-Salud.',
    },
];

export default function CertificacionesPage() {
    return (
        <div className="min-h-screen py-8">
            {/* Hero */}
            <section className="px-4 py-12 md:py-20">
                <div className="container mx-auto max-w-4xl text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 rounded-full border border-amber-500/20 mb-6">
                        <Award className="w-4 h-4 text-amber-400" />
                        <span className="text-sm text-amber-300 font-medium">
                            Certificaciones Verificables
                        </span>
                    </div>

                    {/* Título */}
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Demuestra Tu{' '}
                        <span className="text-amber-400">Conocimiento</span>
                    </h1>

                    {/* Descripción */}
                    <p className="text-lg text-white/60 mb-8 max-w-2xl mx-auto">
                        Obtén certificados verificables por cada curso completado.
                        Comparte tus logros y demuestra tu compromiso con el aprendizaje.
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Link href="/academy/cursos">
                            <Button className="bg-amber-500 hover:bg-amber-400 text-black">
                                Ver Cursos Certificables
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                        <Link href="/academy/planes">
                            <Button variant="outline" className="border-white/20 text-white hover:bg-white/5">
                                Ver Planes
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Tipos de certificaciones */}
            <section className="px-4 py-12 bg-gradient-to-b from-transparent to-slate-900/50">
                <div className="container mx-auto max-w-6xl">
                    <h2 className="text-2xl font-bold text-white mb-8 text-center">
                        Tipos de Certificaciones
                    </h2>

                    <div className="grid md:grid-cols-3 gap-6">
                        {CERTIFICATION_TYPES.map((cert) => (
                            <Card
                                key={cert.name}
                                className="bg-white/[0.03] border-white/5 overflow-hidden"
                            >
                                <CardContent className="p-6">
                                    {/* Header */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                                            style={{
                                                backgroundColor:
                                                    cert.color === 'emerald'
                                                        ? '#10b98120'
                                                        : cert.color === 'blue'
                                                            ? '#3b82f620'
                                                            : '#f5920820',
                                                color:
                                                    cert.color === 'emerald'
                                                        ? '#10b981'
                                                        : cert.color === 'blue'
                                                            ? '#3b82f6'
                                                            : '#f59208',
                                            }}
                                        >
                                            <cert.icon className="w-6 h-6" />
                                        </div>
                                        <h3 className="font-bold text-white">{cert.name}</h3>
                                    </div>

                                    {/* Descripción */}
                                    <p className="text-sm text-white/50 mb-4">{cert.description}</p>

                                    {/* Requisitos */}
                                    <div className="mb-4">
                                        <div className="text-xs text-white/30 uppercase tracking-wider mb-2">
                                            Requisitos
                                        </div>
                                        <ul className="space-y-2">
                                            {cert.requirements.map((req, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                                    <span className="text-white/60">{req}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Disponible en */}
                                    <div className="pt-4 border-t border-white/5">
                                        <div className="text-xs text-white/30 mb-2">Disponible en:</div>
                                        <div className="flex flex-wrap gap-2">
                                            {cert.available.map((plan) => (
                                                <span
                                                    key={plan}
                                                    className="text-xs px-2 py-1 bg-white/5 rounded text-white/60"
                                                >
                                                    {plan}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Características */}
            <section className="px-4 py-12">
                <div className="container mx-auto max-w-4xl">
                    <h2 className="text-2xl font-bold text-white mb-8 text-center">
                        Características de Nuestras Certificaciones
                    </h2>

                    <div className="grid sm:grid-cols-2 gap-6">
                        {FEATURES.map((feature) => (
                            <Card key={feature.title} className="bg-white/[0.03] border-white/5">
                                <CardContent className="p-6 flex gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                                        <feature.icon className="w-5 h-5 text-amber-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                                        <p className="text-sm text-white/50">{feature.description}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Ejemplo de certificado */}
            <section className="px-4 py-12 bg-gradient-to-b from-slate-900/50 to-transparent">
                <div className="container mx-auto max-w-3xl">
                    <Card className="bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-orange-500/10 border-amber-500/20 overflow-hidden">
                        <CardContent className="p-8 md:p-12 text-center">
                            {/* Simulación de certificado */}
                            <div className="bg-white/5 rounded-xl p-8 mb-6 border border-white/10">
                                <Award className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                                <div className="text-xs text-white/40 uppercase tracking-widest mb-2">
                                    Certificado de Completación
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-1">
                                    Cardiología Básica
                                </h3>
                                <p className="text-white/60 text-sm mb-4">
                                    Red-Salud Academy
                                </p>
                                <div className="flex items-center justify-center gap-2 text-xs text-white/40">
                                    <Shield className="w-4 h-4" />
                                    <span>Verificable en academy.redsalud.com/verify</span>
                                </div>
                            </div>

                            <p className="text-white/50 mb-6">
                                Así lucen nuestros certificados. Cada uno incluye verificación
                                digital, código QR y puede compartirse en redes profesionales.
                            </p>

                            <Link href="/academy/cursos">
                                <Button className="bg-amber-500 hover:bg-amber-400 text-black">
                                    Ver Cursos Disponibles
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* CTA */}
            <section className="px-4 py-12">
                <div className="container mx-auto max-w-2xl text-center">
                    <h2 className="text-2xl font-bold text-white mb-3">
                        ¿Listo para Certificarte?
                    </h2>
                    <p className="text-white/50 mb-6">
                        Comienza hoy y obtén tu primer certificado.
                    </p>
                    <Link href="/registro?type=patient&redirect=/academy/dashboard">
                        <Button
                            size="lg"
                            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8"
                        >
                            Comenzar Ahora
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}
