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
      className={`fixed bg-white/95 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-6 w-[360px] transition-all duration-500 ease-out z-[9999] ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
        }`}
      style={{
        left: coords.x,
        top: coords.y,
      }}
      role="dialog"
      aria-labelledby="tour-title"
      aria-describedby="tour-description"
    >
      {/* Decorative gradient orb */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-50 border border-purple-100 text-[10px] font-medium text-purple-600 mb-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-purple-500"></span>
            </span>
            PASO {step}/{totalSteps}
          </div>
          <h3 id="tour-title" className="text-lg font-bold text-slate-800 tracking-tight">
            {title}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-full transition-colors"
          aria-label="Cerrar tour"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Description */}
      <div className="relative mb-6">
        <p
          id="tour-description"
          className="text-slate-600 text-sm leading-relaxed whitespace-pre-line"
        >
          {description}
        </p>
      </div>

      {/* Progress bar */}
      <div className="relative mb-6">
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(168,85,247,0.4)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="relative flex items-center justify-between gap-3">
        <button
          onClick={onSkip}
          className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors px-2 py-1"
        >
          Saltar
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onPrev}
            disabled={step === 1}
            className="px-3 py-2 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Atrás
          </button>
          <button
            onClick={onNext}
            className="px-4 py-2 text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5"
          >
            {step === totalSteps ? 'Finalizar' : 'Siguiente'}
          </button>
        </div>
      </div>
    </div>
  );
}
