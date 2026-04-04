'use client';

import { useState } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Printer,
  Download,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@red-salud/design-system';
import { cn } from '@red-salud/core/utils';
import type { ImagingStudy } from './use-diagnostic-imaging';

// ============================================================================
// TYPES
// ============================================================================

interface ImagingViewerProps {
  study: ImagingStudy;
  onClose: () => void;
  themeColor?: string;
}

// ============================================================================
// STATUS MAP
// ============================================================================

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  ordered: { label: 'Solicitado', color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'En progreso', color: 'bg-amber-100 text-amber-700' },
  completed: { label: 'Completado', color: 'bg-emerald-100 text-emerald-700' },
  reviewed: { label: 'Revisado', color: 'bg-purple-100 text-purple-700' },
};

// ============================================================================
// COMPONENT
// ============================================================================

export function ImagingViewer({
  study,
  onClose,
  themeColor = '#3B82F6',
}: ImagingViewerProps) {
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const hasImages = study.image_urls.length > 0;
  const totalImages = study.image_urls.length;
  const currentImage = hasImages ? study.image_urls[currentImageIdx] : null;
  const statusCfg = STATUS_LABELS[study.status] ?? STATUS_LABELS.ordered;

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));
  const handlePrev = () => setCurrentImageIdx((i) => Math.max(0, i - 1));
  const handleNext = () => setCurrentImageIdx((i) => Math.min(totalImages - 1, i + 1));

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-gray-200 overflow-hidden',
        isFullscreen && 'fixed inset-0 z-50 rounded-none border-none',
      )}
    >
      {/* ── Top bar ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-3 min-w-0">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 truncate">
              {study.study_type.replace(/_/g, ' ')}
            </h3>
            {study.patient_name && (
              <p className="text-xs text-gray-400">{study.patient_name}</p>
            )}
          </div>
          <span
            className={cn(
              'inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full',
              statusCfg.color,
            )}
          >
            {statusCfg.label}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {hasImages && (
            <>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-xs text-gray-500 w-10 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <div className="w-px h-5 bg-gray-200 mx-1" />
            </>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleFullscreen}>
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ── Image area ────────────────────────────────────────────── */}
      <div className="flex">
        {/* Main image */}
        <div
          className={cn(
            'flex-1 flex items-center justify-center bg-gray-900 overflow-auto relative',
            isFullscreen ? 'min-h-[calc(100vh-180px)]' : 'min-h-[400px]',
          )}
        >
          {hasImages && currentImage ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentImage}
                alt={`Estudio ${study.study_type} - imagen ${currentImageIdx + 1}`}
                className="max-w-full object-contain transition-transform"
                style={{ transform: `scale(${zoom})` }}
              />
              {/* Navigation arrows */}
              {totalImages > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={currentImageIdx === 0}
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 disabled:opacity-30"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={currentImageIdx === totalImages - 1}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 disabled:opacity-30"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-white/80 bg-black/50 px-2 py-0.5 rounded-full">
                    {currentImageIdx + 1} / {totalImages}
                  </span>
                </>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <p className="text-sm">Sin imágenes adjuntas</p>
              <p className="text-xs text-gray-400 mt-1">
                Las imágenes se mostrarán aquí cuando estén disponibles
              </p>
            </div>
          )}
        </div>

        {/* ── Side panel: study info ─────────────────────────────── */}
        <div className="w-72 border-l border-gray-100 p-4 space-y-4 shrink-0 bg-white overflow-y-auto max-h-[500px]">
          {/* Date */}
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Fecha
            </p>
            <p className="text-sm text-gray-700 mt-1">
              {new Date(study.created_at).toLocaleDateString('es-VE', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>

          {/* Body region */}
          {study.body_region && (
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                Región
              </p>
              <p className="text-sm text-gray-700 mt-1">{study.body_region}</p>
            </div>
          )}

          {/* Equipment */}
          {study.equipment && (
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                Equipo
              </p>
              <p className="text-sm text-gray-700 mt-1">{study.equipment}</p>
            </div>
          )}

          {/* Technique */}
          {study.technique && (
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                Técnica
              </p>
              <p className="text-sm text-gray-700 mt-1">{study.technique}</p>
            </div>
          )}

          {/* Clinical indication */}
          {study.clinical_indication && (
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                Indicación clínica
              </p>
              <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                {study.clinical_indication}
              </p>
            </div>
          )}

          {/* Findings */}
          {study.findings && (
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                Hallazgos
              </p>
              <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                {study.findings}
              </p>
            </div>
          )}

          {/* Conclusion */}
          {study.conclusion && (
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                Conclusión
              </p>
              <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap font-medium">
                {study.conclusion}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
