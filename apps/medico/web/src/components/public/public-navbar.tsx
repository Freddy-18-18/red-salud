'use client';

import { useState, useEffect } from 'react';
import { Cross as MedicalCross, Menu, X } from 'lucide-react';
import Link from 'next/link';

const navLinks = [
  { label: 'Funcionalidades', href: '/#funcionalidades' },
  { label: 'Especialidades', href: '/#especialidades' },
  { label: 'Precios', href: '/precios' },
];

export function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-zinc-950/80 backdrop-blur-xl border-b border-white/5'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 transition-transform duration-300 group-hover:scale-105">
              <MedicalCross className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">
              Red Salud
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-zinc-400 hover:text-white transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/auth/login"
              className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition-all duration-200"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/auth/register"
              className="rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-2 text-sm font-medium text-white hover:from-teal-400 hover:to-cyan-400 transition-all duration-200 shadow-lg shadow-teal-500/20"
            >
              Comenzar Gratis
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden rounded-lg p-2 text-zinc-400 hover:text-white hover:bg-white/10 transition-all duration-200"
            aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          mobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-zinc-950/95 backdrop-blur-xl border-t border-white/5 px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-white/10 space-y-2">
            <Link
              href="/auth/login"
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg border border-white/20 px-4 py-2.5 text-center text-sm font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition-all duration-200"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/auth/register"
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-2.5 text-center text-sm font-medium text-white hover:from-teal-400 hover:to-cyan-400 transition-all duration-200"
            >
              Comenzar Gratis
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
