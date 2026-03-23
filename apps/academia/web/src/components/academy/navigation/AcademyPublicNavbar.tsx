
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
    Menu,
    X,
    ChevronRight,
    ArrowLeft,
    ChevronDown,
    Sparkles,
} from 'lucide-react';
import { cn } from "@red-salud/core/utils";
import { Button } from "@red-salud/design-system";
import { useSupabaseAuth } from "@red-salud/identity";
import { ACADEMY_CATEGORIES, FEATURED_COURSES_NAV } from "@/lib/constants/academy-navigation";

const NAV_LINKS = [
    {
        label: 'Metodología',
        href: '/academy/metodologia',
        icon: FlaskConical,
    },
    {
        label: 'Planes',
        href: '/academy/planes',
        icon: CreditCard,
    },
];

export function AcademyPublicNavbar() {
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCoursesOpen, setIsCoursesOpen] = useState(false);
    const { user, isLoading } = useSupabaseAuth();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const [prevPathname, setPrevPathname] = useState(pathname);
    if (pathname !== prevPathname) {
        setPrevPathname(pathname);
        setIsMobileMenuOpen(false);
        setIsCoursesOpen(false);
    }

    return (
        <>
            <header
                className={cn(
                    'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
                    isScrolled
                        ? 'bg-slate-950/90 backdrop-blur-xl border-b border-white/5 shadow-lg'
                        : 'bg-transparent'
                )}
            >
                {/* Top System Bar - Distinct from Academy Nav */}
                <div
                    className={cn(
                        "h-8 hidden md:flex items-center justify-between px-4 sm:px-6 lg:px-8 text-[10px] sm:text-xs transition-colors duration-300",
                        isScrolled
                            ? "bg-slate-950/50 backdrop-blur-sm border-b border-white/5"
                            : "bg-transparent border-b border-white/5"
                    )}
                >
                    <Link
                        href="/"
                        className="group flex items-center gap-1.5 text-white/40 hover:text-cyan-400 transition-colors"
                    >
                        <div className="bg-white/10 p-0.5 rounded group-hover:bg-cyan-500/20 transition-colors">
                            <ArrowLeft className="w-3 h-3" />
                        </div>
                        <span className="font-medium tracking-wide">VOLVER A RED-SALUD</span>
                    </Link>
                    <div className="text-white/20 font-medium tracking-wider">
                        EDUCACIÓN MÉDICA CONTINUA
                    </div>
                </div>

                <nav className="container mx-auto max-w-7xl px-4 sm:px-6 h-16 md:h-20 flex items-center justify-between">
                    {/* Logo Area */}
                    <div className="flex items-center gap-8">
                        <Link
                            href="/academy"
                            className="flex items-center gap-2.5 group"
                            aria-label="Ir a Academy"
                        >
                            <div className="relative">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-300">
                                    <GraduationCap className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-white font-bold text-xl tracking-tight leading-none group-hover:text-cyan-100 transition-colors">
                                    Academy
                                </span>
                            </div>
                        </Link>

                        {/* Configuration Desktop Link (Hidden on mobile) */}
                        <div className="hidden lg:flex items-center gap-1">
                            {/* Mega Menu Trigger */}
                            <div
                                className="relative group"
                                onMouseEnter={() => setIsCoursesOpen(true)}
                                onMouseLeave={() => setIsCoursesOpen(false)}
                            >
                                <button
                                    className={cn(
                                        "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                                        isCoursesOpen ? "bg-white/10 text-white" : "text-white/70 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <BookOpen className="w-4 h-4" />
                                    Cursos
                                    <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", isCoursesOpen && "rotate-180")} />
                                </button>

                                {/* Mega Menu Dropdown */}
                                <AnimatePresence>
                                    {isCoursesOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                            transition={{ duration: 0.15, ease: "easeOut" }}
                                            className="absolute top-full left-0 mt-2 w-[800px] p-1.5 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden grid grid-cols-12 gap-0"
                                        >
                                            {/* Left: Categories (8 cols) */}
                                            <div className="col-span-8 p-6 bg-slate-950/30">
                                                <div className="text-xs font-bold text-white/40 uppercase tracking-wider mb-4 px-2">
                                                    Explorar por Categoría
                                                </div>
                                                <div className="grid grid-cols-3 gap-3">
                                                    {ACADEMY_CATEGORIES.map((cat) => (
                                                        <Link
                                                            key={cat.title}
                                                            href={cat.href}
                                                            className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group/item"
                                                        >
                                                            <div className="mt-0.5 w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover/item:bg-cyan-500/20 group-hover/item:text-cyan-300 transition-colors shrink-0">
                                                                <cat.icon className="w-3.5 h-3.5" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="text-sm font-medium text-white group-hover/item:text-cyan-100 truncate">{cat.title}</div>
                                                                <div className="text-[10px] text-white/40 leading-tight mt-0.5 truncate">{cat.description}</div>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                                <div className="mt-6 pt-4 border-t border-white/5 px-2">
                                                    <Link href="/academy/cursos" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 group/link w-fit">
                                                        Ver catálogo completo
                                                        <ChevronRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
                                                    </Link>
                                                </div>
                                            </div>

                                            {/* Right: Featured (4 cols) */}
                                            <div className="col-span-4 bg-gradient-to-br from-indigo-900/40 to-slate-900/40 p-6 border-l border-white/5 flex flex-col">
                                                <div className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">
                                                    Destacados
                                                </div>
                                                <div className="space-y-3 flex-1">
                                                    {FEATURED_COURSES_NAV.map((course) => (
                                                        <Link
                                                            key={course.title}
                                                            href={course.href}
                                                            className="block p-3 rounded-xl bg-slate-950/50 border border-white/5 hover:border-white/10 hover:shadow-lg transition-all group/card relative overflow-hidden"
                                                        >
                                                            <div className={`absolute inset-0 bg-gradient-to-r ${course.color} opacity-0 group-hover/card:opacity-10 transition-opacity`} />
                                                            <div className="relative">
                                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-yellow-400 mb-1">
                                                                    <Sparkles className="w-3 h-3" />
                                                                    NUEVO
                                                                </div>
                                                                <div className="font-semibold text-sm text-white leading-tight mb-1">
                                                                    {course.title}
                                                                </div>
                                                                <div className="text-[10px] text-white/50 line-clamp-2">
                                                                    {course.description}
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {NAV_LINKS.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
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
                    </div>


                    {/* Auth Actions */}
                    <div className="flex items-center gap-3">
                        {/* Mobile Menu Toggle */}
                        <button
                            className="lg:hidden p-2 text-white/70 hover:text-white transition-colors"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>

                        {/* Desktop Auth Buttons */}
                        <div className="hidden md:flex items-center gap-3">
                            {isLoading ? (
                                <div className="h-10 w-32 bg-white/5 animate-pulse rounded-lg" />
                            ) : user ? (
                                <div className="flex items-center gap-4">
                                    <Link href="/academy/dashboard">
                                        <Button
                                            variant="ghost"
                                            className="text-white hover:bg-white/10 gap-2 px-3 pl-4 rounded-full border border-white/5 hover:border-white/10"
                                        >
                                            <div className="flex flex-col items-end text-xs hidden lg:flex">
                                                <span className="font-bold">{user.user_metadata?.full_name || 'Estudiante'}</span>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-slate-950">
                                                {user.email?.charAt(0).toUpperCase()}
                                            </div>
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    <Link href="/login?redirect=/academy/dashboard">
                                        <Button
                                            variant="ghost"
                                            className="text-white/70 hover:text-white hover:bg-white/5 rounded-full"
                                        >
                                            Iniciar Sesión
                                        </Button>
                                    </Link>
                                    <Link href="/registro?type=patient&redirect=/academy/dashboard">
                                        <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all rounded-full px-6">
                                            Comenzar Gratis
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </nav>
            </header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-40 lg:hidden"
                    >
                        <div
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                        <motion.nav
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="absolute top-0 right-0 bottom-0 w-full max-w-sm bg-slate-900 border-l border-white/10 pt-safe-top overflow-y-auto"
                        >
                            <div className="p-6 pt-20 space-y-6">
                                {/* Mobile Categories */}
                                <div>
                                    <div className="text-xs font-bold text-white/40 uppercase tracking-wider mb-4 px-2">Cursos</div>
                                    <div className="grid grid-cols-1 gap-1">
                                        {ACADEMY_CATEGORIES.map((cat) => (
                                            <Link
                                                key={cat.title}
                                                href={cat.href}
                                                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-white/80"
                                            >
                                                <cat.icon className="w-5 h-5 text-cyan-500/70" />
                                                <span className="font-medium">{cat.title}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                                <div className="h-px bg-white/10 my-2" />

                                {NAV_LINKS.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span className="font-medium">{item.label}</span>
                                    </Link>
                                ))}

                                <div className="h-px bg-white/10 my-2" />

                                <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-white transition-colors">
                                    <ArrowLeft className="w-5 h-5" />
                                    Volver a Red-Salud
                                </Link>
                            </div>
                        </motion.nav>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Spacer Removed to allow Hero to be behind navbar */}
            {/* <div className="h-24 md:h-28" /> */}
        </>
    );
}
