import Link from 'next/link';
import { ctaContent } from '@/lib/data/public-content';
import { ArrowRight } from 'lucide-react';

export function CtaSection() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-950/50 via-zinc-950 to-cyan-950/50" />
        <div className="absolute top-0 left-1/3 h-[400px] w-[400px] rounded-full bg-teal-500/10 blur-[120px]" />
        <div className="absolute bottom-0 right-1/3 h-[300px] w-[300px] rounded-full bg-cyan-500/10 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
          {ctaContent.headline}
        </h2>
        <p className="mt-6 text-lg text-zinc-400">{ctaContent.subtitle}</p>

        <div className="mt-10">
          <Link
            href="/auth/register"
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-10 py-4 text-lg font-semibold text-white shadow-xl shadow-teal-500/25 hover:from-teal-400 hover:to-cyan-400 hover:shadow-teal-400/30 transition-all duration-300"
          >
            {ctaContent.ctaText}
            <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        <p className="mt-6 text-sm text-zinc-500">{ctaContent.smallText}</p>
      </div>
    </section>
  );
}
