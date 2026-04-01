import type { Metadata } from 'next';
import { HeroSection } from '@/components/public/hero-section';
import { StatsSection } from '@/components/public/stats-section';
import { FeaturesSection } from '@/components/public/features-section';
import { SpecialtyShowcase } from '@/components/public/specialty-showcase';
import { HowItWorksSection } from '@/components/public/how-it-works-section';
import { TestimonialsSection } from '@/components/public/testimonials-section';
import { CtaSection } from '@/components/public/cta-section';

export const metadata: Metadata = {
  title: 'Red Salud — Consultorio Médico Digital',
  description:
    'La primera plataforma clínica que se adapta a tu especialidad. Agenda, consultas, recetas, historia clínica e inteligencia artificial para médicos venezolanos.',
};

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <SpecialtyShowcase />
      <HowItWorksSection />
      <TestimonialsSection />
      <CtaSection />
    </>
  );
}
