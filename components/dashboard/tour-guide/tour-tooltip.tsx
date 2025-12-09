/**
 * Tour Tooltip Component
 * Tooltip con navegación para los pasos del tour
 */

'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { TourPlacement } from '@/lib/tour-guide/types';

interface TourTooltipProps {
  title: string;
  description: string;
  step: number;
  totalSteps: number;
  placement?: TourPlacement;
  target?: string | HTMLElement;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onClose: () => void;
}

export function TourTooltip({
  title,
  description,
  step,
  totalSteps,
  placement = 'bottom',
  target,
  onNext,
  onPrev,
  onSkip,
  onClose,
}: TourTooltipProps) {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const calculatePosition = () => {
      const tooltipWidth = 360;
      const tooltipHeight = 250;
      const gap = 16;

      // Si es placement center o no hay target, centrar en pantalla
      if (placement === 'center' || !target) {
        setCoords({
          x: (window.innerWidth - tooltipWidth) / 2,
          y: (window.innerHeight - tooltipHeight) / 2,
        });
        setIsVisible(true);
        return;
      }

      // Obtener elemento target
      const element = typeof target === 'string' 
        ? document.querySelector(target) 
        : target;

      if (!(element instanceof HTMLElement)) {
        setCoords({ x: 50, y: 50 });
        setIsVisible(true);
        return;
      }

      const rect = element.getBoundingClientRect();
      let x = 0;
      let y = 0;

      // Calcular posición según placement
      switch (placement) {
        case 'top':
          x = rect.left + rect.width / 2 - tooltipWidth / 2;
          y = rect.top - tooltipHeight - gap;
          break;
        case 'bottom':
          x = rect.left + rect.width / 2 - tooltipWidth / 2;
          y = rect.bottom + gap;
          break;
        case 'left':
          x = rect.left - tooltipWidth - gap;
          y = rect.top + rect.height / 2 - tooltipHeight / 2;
          break;
        case 'right':
          x = rect.right + gap;
          y = rect.top + rect.height / 2 - tooltipHeight / 2;
          break;
      }

      // Ajustar si se sale de la pantalla
      const padding = 16;
      if (x < padding) x = padding;
      if (x + tooltipWidth > window.innerWidth - padding) {
        x = window.innerWidth - tooltipWidth - padding;
      }
      if (y < padding) y = padding;
      if (y + tooltipHeight > window.innerHeight - padding) {
        y = window.innerHeight - tooltipHeight - padding;
      }

      setCoords({ x, y });
      setIsVisible(true);
    };

    calculatePosition();
    window.addEventListener('resize', calculatePosition);
    window.addEventListener('scroll', calculatePosition, true);

    return () => {
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', calculatePosition, true);
    };
  }, [target, placement]);

  const progress = (step / totalSteps) * 100;

  return (
    <div
      className={`fixed bg-white rounded-xl shadow-2xl p-6 w-[360px] transition-all duration-300 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
      style={{ 
        left: coords.x, 
        top: coords.y,
        zIndex: 9999,
      }}
      role="dialog"
      aria-labelledby="tour-title"
      aria-describedby="tour-description"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="text-xs font-semibold text-purple-600 mb-1">
            Paso {step} de {totalSteps}
          </div>
          <h3 id="tour-title" className="text-lg font-bold text-gray-900">
            {title}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors ml-2"
          aria-label="Cerrar tour"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Description */}
      <p 
        id="tour-description"
        className="text-gray-600 text-sm mb-4 leading-relaxed whitespace-pre-line"
      >
        {description}
      </p>

      {/* Progress bar */}
      <div className="mb-5">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onSkip}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Omitir tour
        </button>

        <div className="flex gap-2">
          <button
            onClick={onPrev}
            disabled={step === 1}
            className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            ◀ Anterior
          </button>
          <button
            onClick={onNext}
            className="px-5 py-2 text-sm font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all"
          >
            {step === totalSteps ? '✓ Finalizar' : 'Siguiente ▶'}
          </button>
        </div>
      </div>
    </div>
  );
}
