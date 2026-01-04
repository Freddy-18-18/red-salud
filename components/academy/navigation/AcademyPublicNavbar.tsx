/**
 * @file AcademyPublicNavbar.tsx
 * @description Navbar para las páginas públicas de Red-Salud Academy.
 * Diseño profesional y diferenciado del navbar principal de Red-Salud.
 * 
 * @example
 * <AcademyPublicNavbar />
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    GraduationCap,
    BookOpen,
    FlaskConical,
    CreditCard,
    Stethoscope,
    Heart,
    Menu,
    X,
    ChevronRight,
    ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

/** Elementos de navegación del navbar público */
const NAV_ITEMS = [
    {
        label: 'Cursos',
        href: '/academy/cursos',
        icon: BookOpen,
        description: 'Explora nuestro catálogo de especialidades',
    },
    {
        label: 'Metodología',
        href: '/academy/metodologia',
        icon: FlaskConical,
        description: 'Ciencia del aprendizaje',
    },
    {
        label: 'Para Profesionales',
        href: '/academy/profesionales',
        icon: Stethoscope,
        description: 'Médicos y estudiantes de medicina',
    },
    {
        label: 'Para Pacientes',
        href: '/academy/pacientes',
        icon: Heart,
        description: 'Educación en salud personal',
    },
    {
        label: 'Planes',
        href: '/academy/planes',
        icon: CreditCard,
        description: 'Precios y suscripciones',
    },
];

/**
 * Navbar público de Red-Salud Academy
 * Incluye navegación, logo diferenciado y CTAs
 */
export function AcademyPublicNavbar() {
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Detectar scroll para cambiar estilo del navbar
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Cerrar menú móvil al cambiar de ruta
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    return (
        <>
            <header
                className={cn(
                    'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
                    isScrolled
                        ? 'bg-slate-950/95 backdrop-blur-xl border-b border-white/5 shadow-lg'
                        : 'bg-transparent'
                )}
            >
                <nav className="container mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="flex items-center justify-between h-16 md:h-20">
                        {/* Logo y enlace a Red-Salud */}
                        <div className="flex items-center gap-4">
                            {/* Enlace de vuelta a Red-Salud */}
                            <Link
                                href="/"
                                className="hidden md:flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors"
                                aria-label="Volver a Red-Salud"
                            >
                                <ArrowLeft className="w-3 h-3" />
                                <span>Red-Salud</span>
                            </Link>

                            {/* Separador */}
                            <div className="hidden md:block w-px h-6 bg-white/10" />

                            {/* Logo Academy */}
                            <Link
                                href="/academy"
                                className="flex items-center gap-2 group"
                                aria-label="Ir a Academy"
                            >
                                <div className="relative">
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-shadow">
                                        <GraduationCap className="w-5 h-5 text-white" />
                                    </div>
                                    {/* Efecto de brillo */}
                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-white font-bold text-lg tracking-tight">
                                        Academy
                                    </span>
                                    <span className="text-[10px] text-cyan-400/80 font-medium -mt-1 hidden sm:block">
                                        by Red-Salud
                                    </span>
                                </div>
                            </Link>
                        </div>

                        {/* Navegación Desktop */}
                        <div className="hidden lg:flex items-center gap-1">
                            {NAV_ITEMS.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                                            isActive
                                                ? 'bg-white/10 text-white'
                                                : 'text-white/60 hover:text-white hover:bg-white/5'
                                        )}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* CTAs Desktop */}
                        <div className="hidden md:flex items-center gap-3">
                            <Link href="/login?redirect=/academy/dashboard">
                                <Button
                                    variant="ghost"
                                    className="text-white/70 hover:text-white hover:bg-white/5"
                                >
                                    Iniciar Sesión
                                </Button>
                            </Link>
                            <Link href="/registro?type=patient&redirect=/academy/dashboard">
                                <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all">
                                    Comenzar Gratis
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </Link>
                        </div>

                        {/* Botón menú móvil */}
                        <button
                            className="lg:hidden p-2 text-white/70 hover:text-white transition-colors"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </nav>
            </header>

            {/* Menú Móvil */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-40 lg:hidden"
                    >
                        {/* Overlay */}
                        <div
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />

                        {/* Panel de navegación */}
                        <motion.nav
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="absolute top-0 right-0 bottom-0 w-full max-w-sm bg-slate-900 border-l border-white/10 pt-20"
                        >
                            <div className="p-6 space-y-2">
                                {/* Link a Red-Salud (móvil) */}
                                <Link
                                    href="/"
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                    <span className="font-medium">Volver a Red-Salud</span>
                                </Link>

                                <div className="h-px bg-white/10 my-4" />

                                {/* Items de navegación */}
                                {NAV_ITEMS.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={cn(
                                                'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
                                                isActive
                                                    ? 'bg-cyan-500/10 text-cyan-400'
                                                    : 'text-white/70 hover:text-white hover:bg-white/5'
                                            )}
                                        >
                                            <item.icon className="w-5 h-5" />
                                            <div>
                                                <div className="font-medium">{item.label}</div>
                                                <div className="text-xs text-white/40">
                                                    {item.description}
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}

                                <div className="h-px bg-white/10 my-4" />

                                {/* CTAs móvil */}
                                <div className="space-y-3 px-4">
                                    <Link
                                        href="/registro?type=patient&redirect=/academy/dashboard"
                                        className="block"
                                    >
                                        <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
                                            Comenzar Gratis
                                        </Button>
                                    </Link>
                                    <Link
                                        href="/login?redirect=/academy/dashboard"
                                        className="block"
                                    >
                                        <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/5">
                                            Iniciar Sesión
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </motion.nav>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Spacer para compensar el navbar fixed */}
            <div className="h-16 md:h-20" />
        </>
    );
}
