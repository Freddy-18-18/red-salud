'use client'

import { Menu, X, Heart } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

import { ThemeToggle } from '@/components/theme/theme-toggle'
import type { ActiveFeatures } from '@/lib/services/feature-flags-service'

interface NavLink {
  href: string
  label: string
}

const BASE_NAV_LINKS: NavLink[] = [
  { href: '/especialidades', label: 'Especialidades' },
  { href: '/buscar', label: 'Buscar Doctores' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/soporte', label: 'Soporte' },
]

function buildNavLinks(features?: ActiveFeatures): NavLink[] {
  const links = [...BASE_NAV_LINKS]

  if (features?.hasBlog) {
    const nosotrosIdx = links.findIndex((l) => l.href === '/nosotros')
    links.splice(nosotrosIdx, 0, { href: '/blog', label: 'Blog' })
  }

  if (features?.hasTestimonials) {
    const soporteIdx = links.findIndex((l) => l.href === '/soporte')
    links.splice(soporteIdx, 0, {
      href: '/testimonios',
      label: 'Testimonios',
    })
  }

  return links
}

interface PublicNavbarProps {
  activeFeatures?: ActiveFeatures
}

export function PublicNavbar({ activeFeatures }: PublicNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navLinks = buildNavLinks(activeFeatures)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-200 ${
        scrolled
          ? 'bg-[hsl(var(--background))] border-[hsl(var(--border))] shadow-sm'
          : 'bg-[hsl(var(--background)/0.8)] backdrop-blur-md border-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500">
            <Heart className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg text-[hsl(var(--foreground))]">
            Red-<span className="font-bold">Salud</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <ul className="hidden items-center gap-1 md:flex">
          {navLinks.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop right side: theme toggle + auth buttons */}
        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <Link
            href="/auth/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--muted))]"
          >
            Iniciar Sesion
          </Link>
          <Link
            href="/auth/register"
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
          >
            Registrarse
          </Link>
        </div>

        {/* Mobile hamburger button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-lg p-2 text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] md:hidden"
          aria-label={mobileMenuOpen ? 'Cerrar menu' : 'Abrir menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </nav>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[57px] z-50 bg-[hsl(var(--background))] md:hidden">
          <div className="flex h-full flex-col px-4 py-6">
            {/* Nav links */}
            <ul className="flex flex-col gap-1">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-lg px-4 py-3 text-base font-medium text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--muted))]"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Divider */}
            <div className="my-6 border-t border-[hsl(var(--border))]" />

            {/* Auth buttons */}
            <div className="flex flex-col gap-3">
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg border border-[hsl(var(--border))] px-4 py-3 text-center text-base font-medium text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--muted))]"
              >
                Iniciar Sesion
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg bg-emerald-500 px-4 py-3 text-center text-base font-medium text-white transition-colors hover:bg-emerald-600"
              >
                Registrarse
              </Link>
            </div>

            {/* Theme toggle at bottom */}
            <div className="mt-auto flex items-center justify-center pb-8">
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
