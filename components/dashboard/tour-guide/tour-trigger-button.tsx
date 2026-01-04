/**
 * Tour Trigger Button
 * Botón flotante inteligente que detecta la página actual y lanza el tour correspondiente
 */

'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { HelpCircle } from 'lucide-react';
import { useTourGuide } from '@/hooks/use-tour-guide';
import { getTourForRoute } from '@/lib/tour-guide/tours';

export function TourTriggerButton() {
  const pathname = usePathname();
  const { startTour, isTourActive } = useTourGuide();

  // Detectar tour disponible para la ruta actual
  const availableTour = getTourForRoute(pathname);

  if (isTourActive || !availableTour) return null;

  useEffect(() => {
    const handleStart = () => {
      if (availableTour) startTour(availableTour.id);
    };
    document.addEventListener('start-tour', handleStart);
    return () => document.removeEventListener('start-tour', handleStart);
  }, [availableTour, startTour]);

  const handleClick = () => {
    startTour(availableTour.id);
  };

  return (
    <div className="fixed top-20 right-6 z-50 group" data-tour="tour-trigger">
      <button
        onClick={handleClick}
        className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center"
        aria-label={`Iniciar tour: ${availableTour.name}`}
      >
        <HelpCircle className="w-5 h-5" />
      </button>

      {/* Tooltip en hover */}
      <div className="absolute right-12 top-0 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="font-semibold">{availableTour.name}</div>
        <div className="text-gray-300 text-[10px] mt-0.5">{availableTour.description}</div>
        {/* Flecha */}
        <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-4 border-l-gray-900" />
      </div>
    </div>
  );
}
