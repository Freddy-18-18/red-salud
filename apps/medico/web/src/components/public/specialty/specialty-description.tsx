import type { PublicSpecialty } from '@/lib/data/specialties-public';
import { getColors } from './specialty-icon-map';

interface SpecialtyDescriptionProps {
  specialty: PublicSpecialty;
}

export function SpecialtyDescription({ specialty }: SpecialtyDescriptionProps) {
  const colors = getColors(specialty.accentColor);
  const longDescription = specialty.longDescription;

  if (!longDescription) return null;

  const paragraphs = longDescription.split('\n\n').filter(Boolean);

  return (
    <section className="py-20 sm:py-28 bg-zinc-900/30">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className={`h-1 w-16 rounded-full bg-gradient-to-r ${colors.gradientFrom} ${colors.gradientTo} mx-auto mb-10`} />
        <div className="space-y-6">
          {paragraphs.map((paragraph, idx) => (
            <p
              key={idx}
              className={`text-base leading-relaxed ${idx === 0 ? 'text-zinc-300 text-lg' : 'text-zinc-400'}`}
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
