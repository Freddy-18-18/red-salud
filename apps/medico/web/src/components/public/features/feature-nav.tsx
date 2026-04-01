'use client';

import { useState, useEffect, useRef } from 'react';
import {
  CalendarClock,
  Stethoscope,
  Pill,
  ClipboardList,
  BrainCircuit,
  Calendar,
  BarChart3,
  ShieldCheck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { FeatureDetailed } from '@/lib/data/features-data';

const featureIconMap: Record<string, LucideIcon> = {
  CalendarClock,
  Stethoscope,
  Pill,
  ClipboardList,
  BrainCircuit,
  Calendar,
  BarChart3,
  ShieldCheck,
};

const accentStyles: Record<string, { activeBg: string; activeText: string; ring: string }> = {
  teal: { activeBg: 'bg-teal-500/15', activeText: 'text-teal-300', ring: 'ring-teal-500/30' },
  cyan: { activeBg: 'bg-cyan-500/15', activeText: 'text-cyan-300', ring: 'ring-cyan-500/30' },
  violet: { activeBg: 'bg-violet-500/15', activeText: 'text-violet-300', ring: 'ring-violet-500/30' },
  blue: { activeBg: 'bg-blue-500/15', activeText: 'text-blue-300', ring: 'ring-blue-500/30' },
  purple: { activeBg: 'bg-purple-500/15', activeText: 'text-purple-300', ring: 'ring-purple-500/30' },
  orange: { activeBg: 'bg-orange-500/15', activeText: 'text-orange-300', ring: 'ring-orange-500/30' },
  sky: { activeBg: 'bg-sky-500/15', activeText: 'text-sky-300', ring: 'ring-sky-500/30' },
  emerald: { activeBg: 'bg-emerald-500/15', activeText: 'text-emerald-300', ring: 'ring-emerald-500/30' },
};

interface FeatureNavProps {
  features: FeatureDetailed[];
}

export function FeatureNav({ features }: FeatureNavProps) {
  const [activeSlug, setActiveSlug] = useState(features[0]?.slug ?? '');
  const [isSticky, setIsSticky] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the most visible section
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length > 0 && visible[0]) {
          setActiveSlug(visible[0].target.id);
        }
      },
      {
        rootMargin: '-160px 0px -50% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    features.forEach((f) => {
      const el = document.getElementById(f.slug);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [features]);

  // Sticky detection
  useEffect(() => {
    const onScroll = () => {
      if (navRef.current) {
        const rect = navRef.current.getBoundingClientRect();
        setIsSticky(rect.top <= 64);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Scroll active button into view
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeButton = scrollContainerRef.current.querySelector(
        `[data-slug="${activeSlug}"]`,
      ) as HTMLElement | null;
      if (activeButton) {
        activeButton.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest',
        });
      }
    }
  }, [activeSlug]);

  const handleClick = (slug: string) => {
    const el = document.getElementById(slug);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      ref={navRef}
      className={`sticky top-16 z-40 transition-all duration-300 ${
        isSticky
          ? 'border-b border-white/5 bg-zinc-950/90 backdrop-blur-xl shadow-lg shadow-black/20'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          ref={scrollContainerRef}
          className="flex gap-1.5 overflow-x-auto py-3 scrollbar-hide sm:gap-2 sm:justify-center"
        >
          {features.map((feature) => {
            const Icon = featureIconMap[feature.iconName] ?? CalendarClock;
            const isActive = activeSlug === feature.slug;
            const styles = accentStyles[feature.accentColor] ?? accentStyles.teal;

            return (
              <button
                key={feature.slug}
                data-slug={feature.slug}
                onClick={() => handleClick(feature.slug)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 sm:px-4 sm:py-2 sm:text-sm ${
                  isActive
                    ? `${styles.activeBg} ${styles.activeText} ring-1 ${styles.ring}`
                    : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'
                }`}
              >
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{feature.title}</span>
                <span className="sm:hidden">
                  {feature.title.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
