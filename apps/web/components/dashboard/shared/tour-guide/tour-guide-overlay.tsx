/**
 * Tour Guide Overlay Component
 * Componente principal que combina Spotlight y Tooltip
 */

'use client';

import { useEffect } from 'react';
import { Spotlight } from './spotlight';
import { TourTooltip } from './tour-tooltip';
import type { TourDefinition } from '@/lib/tour-guide/types';

interface TourGuideOverlayProps {
  tour: TourDefinition;
  currentStep: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onClose: () => void;
}

export function TourGuideOverlay({
  tour,
  currentStep,
  onNext,
  onPrev,
  onSkip,
  onClose,
}: TourGuideOverlayProps) {
  const step = tour.steps[currentStep];
  const shouldSkip = step?.condition ? !step.condition() : false;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevenir acciones si hay inputs enfocados
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
        case 'Enter':
          e.preventDefault();
          onNext();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          onPrev();
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onPrev, onClose]);

  // Ejecutar acción del paso si existe
  useEffect(() => {
    if (!step || shouldSkip) return;

    if (step.action) {
      const executeAction = async () => {
        try {
          await step.action?.();
        } catch (error) {
          console.error('Error ejecutando acción del tour:', error);
        }
      };

      if (step.delay) {
        setTimeout(executeAction, step.delay);
      } else {
        executeAction();
      }
    }
  }, [step, shouldSkip]);

  // Verificar condición del paso y saltar automáticamente
  useEffect(() => {
    if (!shouldSkip) return;

    const timeoutId = setTimeout(onNext, 100);
    return () => clearTimeout(timeoutId);
  }, [shouldSkip, onNext]);

  if (!step || shouldSkip) return null;

  return (
    <>
      {/* Global Backdrop - solo si NO hay target (si hay target, Spotlight maneja el backdrop) */}
      {!step.target && (
        <div className="fixed inset-0 z-[9998] bg-gray-900/40 backdrop-blur-[2px] transition-all duration-500" onClick={(e) => e.stopPropagation()} />
      )}

      {/* Spotlight - solo si hay target */}
      {step.target && (
        <Spotlight
          target={step.target}
          padding={12}
          radius={8}
          animate={step.highlight !== 'none'}
        />
      )}

      {/* Tooltip */}
      <TourTooltip
        title={step.title}
        description={step.description}
        step={currentStep + 1}
        totalSteps={tour.steps.length}
        placement={step.placement}
        target={step.target}
        onNext={onNext}
        onPrev={onPrev}
        onSkip={onSkip}
        onClose={onClose}
      />
    </>
  );
}
