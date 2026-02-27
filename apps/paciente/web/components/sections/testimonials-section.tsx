'use client';

import { Heart, MapPin, Star } from 'lucide-react';

const testimonials = [
  {
    name: 'María González',
    location: 'Caracas',
    specialty: 'Cardiología',
    rating: 5,
    comment: 'Increíble servicio. Consulté con un cardiólogo en menos de 24 horas desde mi casa. La plataforma es muy intuitiva y el médico fue muy profesional.',
  },
  {
    name: 'Carlos Pérez',
    location: 'Valencia',
    specialty: 'Medicina General',
    rating: 5,
    comment: 'Llevo 3 meses usando Red Salud. Cambió mi forma de cuidar mi salud. Sin tiempos de espera, médicos realmente atentos. 100% recomendado.',
  },
  {
    name: 'Ana Rodríguez',
    location: 'Maracaibo',
    specialty: 'Dermatología',
    rating: 5,
    comment: 'Ahorro tiempo y dinero. Para consultas de rutina no necesito salir de casa. El historial médico digital es muy completo y fácil de usar.',
  },
  {
    name: 'Miguel Torres',
    location: 'Barquisimeto',
    specialty: 'Pediatría',
    rating: 5,
    comment: 'Como padre, esto me da paz mental. Puedo consultar dudas sobre la salud de mis hijos en cualquier momento. El seguimiento es excelente.',
  },
];


export function TestimonialsSection() {
  return (
    <section className="py-20 bg-white dark:bg-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-100 dark:bg-rose-900/40 border border-rose-200 dark:border-rose-800 mb-6">
            <Heart className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            <span className="text-sm font-medium text-rose-700 dark:text-rose-300">
              Lo dicen nuestros pacientes
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Historias de confianza
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Miles de pacientes confían en Red Salud para cuidar su salud
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={`${testimonial.name}-${testimonial.location}`}
              className="group bg-gradient-to-br from-gray-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-700 transition-all duration-300 hover:shadow-lg flex flex-col"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-700 dark:text-gray-300 mb-6 flex-grow leading-relaxed italic">
                &ldquo;{testimonial.comment}&rdquo;
              </p>

              {/* User info */}
              <div className="border-t border-gray-200 dark:border-slate-700 pt-4 space-y-2">
                <h4 className="font-bold text-gray-900 dark:text-white">
                  {testimonial.name}
                </h4>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="h-4 w-4" />
                  <span>{testimonial.location}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Consultó: {testimonial.specialty}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
