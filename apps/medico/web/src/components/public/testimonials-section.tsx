import { testimonials } from '@/lib/data/testimonials-data';
import { Quote, MapPin } from 'lucide-react';

export function TestimonialsSection() {
  return (
    <section className="py-24 sm:py-32 bg-zinc-900/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Médicos que ya transformaron su práctica
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            Profesionales de toda Venezuela confían en Red Salud para su consultorio digital.
          </p>
        </div>

        {/* Testimonial grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.slice(0, 3).map((testimonial) => (
            <div
              key={testimonial.doctorName}
              className="relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm hover:border-white/20 transition-colors duration-300"
            >
              {/* Quote decoration */}
              <Quote className="absolute top-4 right-4 h-8 w-8 text-teal-500/10" />

              {/* Quote text */}
              <p className="relative text-sm leading-relaxed text-zinc-300 mb-6">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 text-sm font-bold text-white shrink-0">
                  {testimonial.initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {testimonial.doctorName}
                  </p>
                  <p className="text-xs text-zinc-500">{testimonial.specialty}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3 text-zinc-600" />
                    <span className="text-xs text-zinc-600">{testimonial.city}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Second row for remaining testimonials (2 cards centered) */}
        <div className="mt-6 grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
          {testimonials.slice(3).map((testimonial) => (
            <div
              key={testimonial.doctorName}
              className="relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm hover:border-white/20 transition-colors duration-300"
            >
              <Quote className="absolute top-4 right-4 h-8 w-8 text-teal-500/10" />

              <p className="relative text-sm leading-relaxed text-zinc-300 mb-6">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 text-sm font-bold text-white shrink-0">
                  {testimonial.initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {testimonial.doctorName}
                  </p>
                  <p className="text-xs text-zinc-500">{testimonial.specialty}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3 text-zinc-600" />
                    <span className="text-xs text-zinc-600">{testimonial.city}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
