import Link from 'next/link';
import { heroContent } from '@/lib/data/public-content';
import { ArrowRight, Sparkles } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-teal-500/10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/5 blur-[80px]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/10 px-4 py-1.5">
          <Sparkles className="h-3.5 w-3.5 text-teal-400" />
          <span className="text-xs font-medium text-teal-300">
            Plataforma adaptativa por especialidad
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
          <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
            {heroContent.headline}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400 sm:text-xl">
          {heroContent.subtitle}
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/auth/register"
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-teal-500/25 hover:from-teal-400 hover:to-cyan-400 hover:shadow-teal-400/30 transition-all duration-300"
          >
            {heroContent.ctaPrimary}
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
          <Link
            href="/#funcionalidades"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-8 py-3.5 text-base font-semibold text-zinc-300 hover:bg-white/5 hover:text-white hover:border-white/30 transition-all duration-300"
          >
            {heroContent.ctaSecondary}
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-zinc-500">
          {heroContent.trustIndicators.map((indicator, i) => (
            <span key={indicator} className="flex items-center gap-2">
              {i > 0 && (
                <span className="hidden sm:inline h-1 w-1 rounded-full bg-zinc-700" />
              )}
              {indicator}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
