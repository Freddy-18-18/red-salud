'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const testimonials = [
  {
    content: "Increíble poder tener a mi médico en el bolsillo. La videoconsulta fue muy fluida y me enviaron la receta al instante.",
    author: "María González",
    role: "Paciente desde 2023",
    rating: 5
  },
  {
    content: "La facilidad para agendar citas es lo mejor. Ya no pierdo tiempo en salas de espera interminables.",
    author: "Carlos Rodríguez",
    role: "Usuario Verificado",
    rating: 5
  },
  {
    content: "Me encanta que todo mi historial médico esté organizado. Cuando cambié de ciudad, mi nuevo doctor pudo ver todo sin problemas.",
    author: "Ana Martínez",
    role: "Paciente Frecuente",
    rating: 5
  }
];

export function Testimonials({ data }: { data?: any[] }) {
  const testimonialsToDisplay = data && data.length > 0 ? data : testimonials;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % testimonialsToDisplay.length);
  }, [testimonialsToDisplay.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + testimonialsToDisplay.length) % testimonialsToDisplay.length);
  }, [testimonialsToDisplay.length]);

  // Auto-play logic (slower: 8s)
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      handleNext();
    }, 8000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, handleNext]);

  const currentTestimonial = testimonialsToDisplay[currentIndex];

  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
          Lo que dicen nuestros pacientes
        </h2>
        <div className="flex justify-center gap-1 text-yellow-400 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="w-5 h-5 fill-current" />
            ))}
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          Calificación promedio de 4.9/5 basada en usuarios reales
        </p>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex justify-center items-center gap-4 md:gap-8">
           {/* Prev Button (Desktop) */}
           <Button
             variant="outline"
             size="icon"
             className="hidden md:flex rounded-full h-12 w-12 border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 shadow-sm"
             onClick={() => {
               setIsAutoPlaying(false);
               handlePrev();
             }}
             aria-label="Anterior testimonio"
           >
             <ChevronLeft className="h-6 w-6" />
           </Button>

           {/* Card Display */}
           <div className="w-full max-w-2xl">
             <AnimatePresence mode="wait">
               <motion.div
                 key={currentIndex}
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 transition={{ duration: 0.4, ease: "easeInOut" }}
                 className="bg-white dark:bg-slate-950 p-8 md:p-12 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 relative min-h-[300px] flex flex-col items-center text-center"
               >
                 <Quote className="w-10 h-10 text-blue-100 dark:text-blue-900/30 mb-6" />
                 
                 <div className="flex gap-1 text-yellow-400 mb-6">
                   {[...Array(currentTestimonial.rating || 5)].map((_, i) => (
                     <Star key={i} className="w-5 h-5 fill-current" />
                   ))}
                 </div>
                 
                 <p className="text-xl text-slate-700 dark:text-slate-300 mb-8 italic leading-relaxed flex-grow">
                   "{currentTestimonial.content}"
                 </p>
                 
                 <div className="flex items-center gap-4 mt-auto">
                   <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                     {currentTestimonial.name ? currentTestimonial.name.charAt(0) : (currentTestimonial.author?.charAt(0) || 'A')}
                   </div>
                   <div className="text-left">
                     <div className="font-bold text-slate-900 dark:text-white text-lg">
                       {currentTestimonial.name || currentTestimonial.author}
                     </div>
                     <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                       {currentTestimonial.role}
                     </div>
                   </div>
                 </div>
               </motion.div>
             </AnimatePresence>
           </div>

           {/* Next Button (Desktop) */}
           <Button
             variant="outline"
             size="icon"
             className="hidden md:flex rounded-full h-12 w-12 border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 shadow-sm"
             onClick={() => {
               setIsAutoPlaying(false);
               handleNext();
             }}
             aria-label="Siguiente testimonio"
           >
             <ChevronRight className="h-6 w-6" />
           </Button>
        </div>

        {/* Mobile Controls */}
        <div className="flex md:hidden justify-center gap-6 mt-8">
           <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full h-10 w-10"
            onClick={() => { setIsAutoPlaying(false); handlePrev(); }}
            aria-label="Anterior testimonio"
           >
             <ChevronLeft className="h-5 w-5" />
           </Button>
           
           {/* Pagination Indicators */}
           <div className="flex items-center gap-2">
             {testimonialsToDisplay.map((_, idx) => (
               <button
                 key={idx}
                 onClick={() => {
                   setIsAutoPlaying(false);
                   setCurrentIndex(idx);
                 }}
                 className={`w-2 h-2 rounded-full transition-all duration-300 ${
                   idx === currentIndex 
                     ? "w-6 bg-blue-600" 
                     : "bg-slate-300 dark:bg-slate-700 hover:bg-blue-400"
                 }`}
                 aria-label={`Ir al testimonio ${idx + 1}`}
               />
             ))}
           </div>

           <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full h-10 w-10"
            onClick={() => { setIsAutoPlaying(false); handleNext(); }}
            aria-label="Siguiente testimonio"
           >
             <ChevronRight className="h-5 w-5" />
           </Button>
        </div>
      </div>
    </section>
  );
}
