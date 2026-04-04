'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Plus,
  LayoutGrid,
  List,
  Eye,
  Scan,
  Image as ImageIcon,
} from 'lucide-react';
import { Button, Badge } from '@red-salud/design-system';
import { cn } from '@red-salud/core/utils';
import type { ModuleComponentProps } from '../module-registry';
import { ModuleWrapper } from '../module-wrapper';
import { useDiagnosticImaging, type ImagingStudy, type CreateImagingStudy } from './use-diagnostic-imaging';
import { ImagingForm, IMAGING_STUDY_TYPES } from './imaging-form';
import { ImagingViewer } from './imaging-viewer';

// ============================================================================
// STATUS MAP
// ============================================================================

const STATUS_CONFIG: Record<string, { label: string; color: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  ordered: { label: 'Solicitado', color: 'default' },
  in_progress: { label: 'En progreso', color: 'secondary' },
  completed: { label: 'Completado', color: 'outline' },
  reviewed: { label: 'Revisado', color: 'outline' },
};

// ============================================================================
// FILTERS
// ============================================================================

type ViewMode = 'list' | 'grid';
type FilterStatus = 'all' | 'ordered' | 'in_progress' | 'completed' | 'reviewed';

// ============================================================================
// COMPONENT
// ============================================================================

export default function DiagnosticImagingModule({
  doctorId,
  patientId,
  specialtySlug,
  config,
  themeColor = '#3B82F6',
}: ModuleComponentProps) {
  // State
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [showForm, setShowForm] = useState(false);
  const [viewingStudy, setViewingStudy] = useState<ImagingStudy | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data
  const { studies, loading, error, create, refresh } = useDiagnosticImaging(
    doctorId,
    {
      patientId,
      status: filterStatus === 'all' ? undefined : filterStatus,
      limit: 50,
    },
  );

  // Resolve study types based on specialty
  const studyTypes = useMemo(() => {
    const specialtyTypes = (config?.studyTypes as Array<{ value: string; label: string }>) ?? null;
    if (specialtyTypes) return specialtyTypes;
    return IMAGING_STUDY_TYPES[specialtySlug] ?? IMAGING_STUDY_TYPES.default;
  }, [specialtySlug, config?.studyTypes]);

  const defaultBodyRegion = (config?.bodyRegion as string) ?? undefined;

  // Filtered studies (already filtered by hook but status may be 'all')
  const filteredStudies = useMemo(() => {
    if (filterStatus === 'all') return studies;
    return studies.filter((s) => s.status === filterStatus);
  }, [studies, filterStatus]);

  // Handlers
  const handleCreate = useCallback(
    async (data: CreateImagingStudy) => {
      setIsSubmitting(true);
      const result = await create(data);
      setIsSubmitting(false);
      if (result) {
        setShowForm(false);
      }
    },
    [create],
  );

  const handleViewStudy = useCallback((study: ImagingStudy) => {
    setViewingStudy(study);
  }, []);

  // Actions for the module wrapper
  const moduleActions = [
    {
      label: 'Nuevo estudio',
      onClick: () => setShowForm(true),
      icon: Plus,
    },
  ];

  // If viewing a study, show the viewer
  if (viewingStudy) {
    return (
      <ImagingViewer
        study={viewingStudy}
        onClose={() => setViewingStudy(null)}
        themeColor={themeColor}
      />
    );
  }

  // If showing form, render it
  if (showForm) {
    return (
      <ModuleWrapper
        moduleKey="lab-imaging"
        title="Nuevo Estudio de Imagen"
        icon="Scan"
        themeColor={themeColor}
      >
        <ImagingForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
          isSubmitting={isSubmitting}
          studyTypes={studyTypes}
          defaultBodyRegion={defaultBodyRegion}
          themeColor={themeColor}
        />
      </ModuleWrapper>
    );
  }

  return (
    <ModuleWrapper
      moduleKey="lab-imaging"
      title="Imagenología"
      icon="Scan"
      description="Estudios de imagen diagnóstica"
      themeColor={themeColor}
      isEmpty={!loading && filteredStudies.length === 0}
      emptyMessage="Sin estudios de imagen registrados"
      isLoading={loading}
      actions={moduleActions}
    >
      {/* ── Filters & view toggle ─────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {(['all', 'ordered', 'in_progress', 'completed', 'reviewed'] as const).map(
            (status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilterStatus(status)}
                className={cn(
                  'text-xs font-medium px-2.5 py-1 rounded-full transition-colors',
                  filterStatus === status
                    ? 'text-white'
                    : 'text-gray-500 bg-gray-100 hover:bg-gray-200',
                )}
                style={
                  filterStatus === status
                    ? { backgroundColor: themeColor }
                    : undefined
                }
              >
                {status === 'all'
                  ? 'Todos'
                  : STATUS_CONFIG[status]?.label ?? status}
              </button>
            ),
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={cn(
              'h-8 w-8 flex items-center justify-center rounded transition-colors',
              viewMode === 'list'
                ? 'bg-gray-100 text-gray-700'
                : 'text-gray-400 hover:text-gray-600',
            )}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={cn(
              'h-8 w-8 flex items-center justify-center rounded transition-colors',
              viewMode === 'grid'
                ? 'bg-gray-100 text-gray-700'
                : 'text-gray-400 hover:text-gray-600',
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── List view ─────────────────────────────────────────────── */}
      {viewMode === 'list' && (
        <div className="space-y-2">
          {filteredStudies.map((study) => {
            const statusCfg = STATUS_CONFIG[study.status] ?? STATUS_CONFIG.ordered;
            const typeLabel = studyTypes.find((t) => t.value === study.study_type)?.label ?? study.study_type;

            return (
              <button
                key={study.id}
                type="button"
                onClick={() => handleViewStudy(study)}
                className="w-full flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors text-left"
              >
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${themeColor}10` }}
                >
                  {study.image_urls.length > 0 ? (
                    <ImageIcon className="h-5 w-5" style={{ color: themeColor }} />
                  ) : (
                    <Scan className="h-5 w-5" style={{ color: `${themeColor}60` }} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {typeLabel}
                    </p>
                    {study.image_urls.length > 0 && (
                      <span className="text-xs text-gray-400">
                        {study.image_urls.length} img
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {study.patient_name && (
                      <p className="text-xs text-gray-400 truncate">
                        {study.patient_name}
                      </p>
                    )}
                    {study.body_region && (
                      <p className="text-xs text-gray-400">
                        &middot; {study.body_region}
                      </p>
                    )}
                  </div>
                </div>

                <Badge variant={statusCfg.color} className="shrink-0 text-xs">
                  {statusCfg.label}
                </Badge>

                <p className="text-xs text-gray-400 shrink-0 hidden sm:block">
                  {new Date(study.created_at).toLocaleDateString('es-VE', {
                    day: '2-digit',
                    month: 'short',
                  })}
                </p>

                <Eye className="h-4 w-4 text-gray-300 shrink-0" />
              </button>
            );
          })}
        </div>
      )}

      {/* ── Grid view ─────────────────────────────────────────────── */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filteredStudies.map((study) => {
            const statusCfg = STATUS_CONFIG[study.status] ?? STATUS_CONFIG.ordered;
            const typeLabel = studyTypes.find((t) => t.value === study.study_type)?.label ?? study.study_type;
            const hasImage = study.image_urls.length > 0;

            return (
              <button
                key={study.id}
                type="button"
                onClick={() => handleViewStudy(study)}
                className="flex flex-col rounded-lg border border-gray-100 hover:border-gray-200 overflow-hidden transition-colors text-left"
              >
                {/* Thumbnail area */}
                <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
                  {hasImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={study.image_urls[0]}
                      alt={typeLabel}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Scan className="h-10 w-10 text-gray-300" />
                  )}
                  {study.image_urls.length > 1 && (
                    <span className="absolute top-2 right-2 text-xs bg-black/60 text-white px-1.5 py-0.5 rounded">
                      +{study.image_urls.length - 1}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-2.5">
                  <p className="text-xs font-medium text-gray-700 truncate">
                    {typeLabel}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <Badge variant={statusCfg.color} className="text-[10px] px-1.5 py-0">
                      {statusCfg.label}
                    </Badge>
                    <span className="text-[10px] text-gray-400">
                      {new Date(study.created_at).toLocaleDateString('es-VE', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Error message ─────────────────────────────────────────── */}
      {error && (
        <div className="mt-3 p-3 rounded-lg bg-red-50 text-sm text-red-600">
          {error}
        </div>
      )}
    </ModuleWrapper>
  );
}
