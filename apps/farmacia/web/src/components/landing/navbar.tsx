'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Pill } from 'lucide-react';

const navLinks = [
  { href: '#problemas', label: 'Problemas' },
  { href: '#funcionalidades', label: 'Funcionalidades' },
  { href: '#como-funciona', label: 'Como Funciona' },
  { href: '#precios', label: 'Precios' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between lg:h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 group">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors duration-300 ${
                scrolled
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/20 text-white backdrop-blur-sm'
              }`}
            >
              <Pill className="h-5 w-5" />
            </div>
            <span
              className={`text-lg font-bold tracking-tight transition-colors duration-300 ${
                scrolled ? 'text-gray-900' : 'text-white'
              }`}
            >
              Red Salud
              <span
                className={`ml-1 text-sm font-medium transition-colors duration-300 ${
                  scrolled ? 'text-blue-600' : 'text-blue-200'
                }`}
              >
                Farmacia
              </span>
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors duration-200 ${
                  scrolled
                    ? 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    : 'text-blue-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden items-center gap-3 lg:flex">
            <a
              href="/auth/login"
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                scrolled
                  ? 'text-gray-700 hover:text-gray-900'
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              Iniciar Sesion
            </a>
            <a
              href="/auth/register"
              className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                scrolled
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30'
                  : 'bg-white text-blue-700 shadow-lg shadow-black/10 hover:bg-blue-50'
              }`}
            >
              Registrar Farmacia
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`rounded-lg p-2 lg:hidden transition-colors duration-200 ${
              scrolled
                ? 'text-gray-700 hover:bg-gray-100'
                : 'text-white hover:bg-white/10'
            }`}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`overflow-hidden transition-all duration-300 lg:hidden ${
            isOpen ? 'max-h-96 pb-4' : 'max-h-0'
          }`}
        >
          <div className="rounded-2xl bg-white p-4 shadow-xl border border-gray-100">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <hr className="my-3 border-gray-100" />
            <a
              href="/auth/login"
              className="block rounded-xl px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Iniciar Sesion
            </a>
            <a
              href="/auth/register"
              className="mt-2 block rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Registrar Farmacia
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
