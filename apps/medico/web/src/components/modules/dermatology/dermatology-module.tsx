'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Plus,
  Filter,
  AlertTriangle,
  Eye,
  Activity,
  Search as SearchIcon,
  Clock,
  X,
} from 'lucide-react';
import { cn } from '@red-salud/core/utils';
import type { ModuleComponentProps } from '../module-registry';
import { ModuleWrapper } from '../module-wrapper';
import {
  useDermatology,
  type LesionRecord,
  type CreateLesionRecord,
  type BodyRegion,
  type BodyView,
  type MalignancyRisk,
  type LesionType,
  type LesionStatus,
  BODY_REGION_LABELS,
  LESION_TYPE_LABELS,
} from './use-dermatology';
import { BodyMap, RISK_COLORS, RISK_LABELS } from './body-map';
import { LesionForm } from './lesion-form';
import { LesionTimeline } from './lesion-timeline';

// ============================================================================
// CONSTANTS
// ============================================================================

const STATUS_LABELS: Record<LesionStatus, string> = {
  active: 'Activa',
  monitoring: 'En seguimiento',
  resolved: 'Resuelta',
  biopsied: 'Biopsiada',
  excised: 'Extirpada',
};

type ViewState = 'map' | 'new-lesion' | 'detail' | 'timeline';

type FilterRegion = 'all' | BodyRegion;
type FilterType = 'all' | LesionType;
type FilterRisk = 'all' | MalignancyRisk;

// ============================================================================
// STATS BAR
// ============================================================================

function StatsBar({
  lesions,
  themeColor,
}: {
  lesions: LesionRecord[];
  themeColor: string;
}) {
  const stats = useMemo(() => {
    const total = lesions.filter((l) => l.status === 'active' || l.status === 'monitoring').length;
    const monitoring = lesions.filter((l) => l.status === 'monitoring').length;
    const biopsyPending = lesions.filter((l) => l.biopsy_recommended && l.status !== 'biopsied' && l.status !== 'excised').length;
    const highRisk = lesions.filter((l) => l.malignancy_risk === 'high' || l.malignancy_risk === 'confirmed').length;
    return { total, monitoring, biopsyPending, highRisk };
  }, [lesions]);

  const items = [
    { label: 'Activas', value: stats.total, color: themeColor },
    { label: 'Seguimiento', value: stats.monitoring, color: '#3B82F6' },
    { label: 'Biopsia pendiente', value: stats.biopsyPending, color: '#F59E0B' },
    { label: 'Alto riesgo', value: stats.highRisk, color: '#EF4444' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-100 bg-gray-50/50"
        >
          <span
            className="text-lg font-bold"
            style={{ color: item.value > 0 ? item.color : '#D1D5DB' }}
          >
            {item.value}
          </span>
          <span className="text-[10px] text-gray-500 leading-tight">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// LESION SIDEBAR LIST
// ============================================================================

function LesionSidebar({
  lesions,
  selectedId,
  onSelect,
  themeColor,
}: {
  lesions: LesionRecord[];
  selectedId: string | null;
  onSelect: (lesion: LesionRecord) => void;
  themeColor: string;
}) {
  if (lesions.length === 0) {
    return (
      <p className="text-xs text-gray-400 text-center py-4">
        Sin lesiones registradas
      </p>
    );
  }

  return (
    <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
      {lesions.map((lesion) => {
        const riskColor = RISK_COLORS[lesion.malignancy_risk];
        const isSelected = lesion.id === selectedId;

        return (
          <button
            key={lesion.id}
            type="button"
            onClick={() => onSelect(lesion)}
            className={cn(
              'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border text-left transition-colors',
              isSelected
                ? 'border-gray-300 bg-gray-50'
                : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50',
            )}
          >
            {/* Risk dot */}
            <span
              className="h-3 w-3 rounded-full shrink-0 border border-white shadow-sm"
              style={{ backgroundColor: riskColor }}
            />

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-700 truncate">
                {LESION_TYPE_LABELS[lesion.lesion_type]} &mdash;{' '}
                {BODY_REGION_LABELS[lesion.body_region]}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-gray-400">
                  {STATUS_LABELS[lesion.status]}
                </span>
                {lesion.size_mm != null && (
                  <span className="text-[10px] text-gray-400">
                    &middot; {lesion.size_mm} mm
                  </span>
                )}
                {lesion.biopsy_recommended && (
                  <AlertTriangle className="h-2.5 w-2.5 text-amber-500" />
                )}
              </div>
            </div>

            {/* Date */}
            <span className="text-[10px] text-gray-400 shrink-0">
              {new Date(lesion.created_at).toLocaleDateString('es-VE', {
                day: '2-digit',
                month: 'short',
              })}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function DermatologyModule({
  doctorId,
  patientId,
  specialtySlug,
  config,
  themeColor = '#8B5CF6',
}: ModuleComponentProps) {
  // State
  const [viewState, setViewState] = useState<ViewState>('map');
  const [bodyView, setBodyView] = useState<BodyView>('front');
  const [selectedLesion, setSelectedLesion] = useState<LesionRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [timelineData, setTimelineData] = useState<LesionRecord[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);

  // Filters
  const [filterRegion, setFilterRegion] = useState<FilterRegion>('all');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterRisk, setFilterRisk] = useState<FilterRisk>('all');

  // Position from body map click
  const [clickPosition, setClickPosition] = useState<{
    x: number;
    y: number;
    region: BodyRegion;
    view: BodyView;
  } | null>(null);

  // Data
  const { lesions, loading, error, create, update, remove, getTimeline, refresh } =
    useDermatology(doctorId, {
      patientId,
      bodyRegion: filterRegion === 'all' ? undefined : filterRegion,
      malignancyRisk: filterRisk === 'all' ? undefined : filterRisk,
      limit: 200,
    });

  // Filtered lesions (type filter applied client-side)
  const filteredLesions = useMemo(() => {
    let result = lesions;
    if (filterType !== 'all') {
      result = result.filter((l) => l.lesion_type === filterType);
    }
    return result;
  }, [lesions, filterType]);

  // ── Handlers ─────────────────────────────────────────────────────────

  const handleBodyClick = useCallback(
    (x: number, y: number, region: BodyRegion, view: BodyView) => {
      setClickPosition({ x, y, region, view });
      setViewState('new-lesion');
    },
    [],
  );

  const handleLesionClick = useCallback((lesion: LesionRecord) => {
    setSelectedLesion(lesion);
  }, []);

  const handleCreateLesion = useCallback(
    async (data: CreateLesionRecord) => {
      setIsSubmitting(true);
      const result = await create(data);
      setIsSubmitting(false);
      if (result) {
        setViewState('map');
        setClickPosition(null);
      }
    },
    [create],
  );

  const handleViewTimeline = useCallback(
    async (lesion: LesionRecord) => {
      setTimelineLoading(true);
      setViewState('timeline');
      setSelectedLesion(lesion);
      const data = await getTimeline(lesion.id);
      setTimelineData(data);
      setTimelineLoading(false);
    },
    [getTimeline],
  );

  const handleBackToMap = useCallback(() => {
    setViewState('map');
    setSelectedLesion(null);
    setClickPosition(null);
    setTimelineData([]);
    refresh();
  }, [refresh]);

  // Module actions
  const moduleActions = [
    {
      label: 'Nueva Lesión',
      onClick: () => {
        setClickPosition(null);
        setViewState('new-lesion');
      },
      icon: Plus,
    },
  ];

  // ── New lesion form view ──────────────────────────────────────────────

  if (viewState === 'new-lesion') {
    return (
      <ModuleWrapper
        moduleKey="dermatology-body-map"
        title="Nueva Lesión"
        icon="Scan"
        themeColor={themeColor}
      >
        <LesionForm
          onSubmit={handleCreateLesion}
          onCancel={handleBackToMap}
          position={clickPosition ?? undefined}
          linkableLesions={lesions.filter(
            (l) => l.status === 'active' || l.status === 'monitoring',
          )}
          initialData={patientId ? { patient_id: patientId } as Partial<LesionRecord> : undefined}
          isSubmitting={isSubmitting}
          themeColor={themeColor}
        />
      </ModuleWrapper>
    );
  }

  // ── Timeline view ─────────────────────────────────────────────────────

  if (viewState === 'timeline' && selectedLesion) {
    return (
      <ModuleWrapper
        moduleKey="dermatology-body-map"
        title="Evolución de Lesión"
        icon="Scan"
        themeColor={themeColor}
        actions={[
          {
            label: 'Volver',
            onClick: handleBackToMap,
            icon: X,
            variant: 'ghost',
          },
        ]}
      >
        <LesionTimeline
          timeline={timelineData}
          isLoading={timelineLoading}
          themeColor={themeColor}
          onLesionSelect={(l) => setSelectedLesion(l)}
        />
      </ModuleWrapper>
    );
  }

  // ── Main map view ─────────────────────────────────────────────────────

  return (
    <ModuleWrapper
      moduleKey="dermatology-body-map"
      title="Mapa Corporal — Dermatología"
      icon="Scan"
      description="Registro y seguimiento de lesiones"
      themeColor={themeColor}
      isEmpty={!loading && filteredLesions.length === 0}
      emptyMessage="Sin lesiones registradas. Haga clic en el cuerpo para añadir una."
      isLoading={loading}
      actions={moduleActions}
    >
      {/* ── Stats ──────────────────────────────────────────────── */}
      <StatsBar lesions={lesions} themeColor={themeColor} />

      {/* ── Filters ────────────────────────────────────────────── */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500 font-medium">
            {filteredLesions.length} lesión{filteredLesions.length !== 1 ? 'es' : ''}
          </p>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'h-7 w-7 flex items-center justify-center rounded transition-colors',
              showFilters
                ? 'bg-gray-100 text-gray-700'
                : 'text-gray-400 hover:text-gray-600',
            )}
          >
            <Filter className="h-3.5 w-3.5" />
          </button>
        </div>

        {showFilters && (
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-100 space-y-2">
            {/* Region filter */}
            <div>
              <p className="text-[10px] text-gray-400 font-medium mb-1">Región</p>
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => setFilterRegion('all')}
                  className={cn(
                    'text-[10px] px-2 py-0.5 rounded border transition-colors',
                    filterRegion === 'all'
                      ? 'text-white border-transparent'
                      : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-100',
                  )}
                  style={filterRegion === 'all' ? { backgroundColor: themeColor } : undefined}
                >
                  Todas
                </button>
                {(Object.entries(BODY_REGION_LABELS) as [BodyRegion, string][]).map(
                  ([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFilterRegion(key)}
                      className={cn(
                        'text-[10px] px-2 py-0.5 rounded border transition-colors',
                        filterRegion === key
                          ? 'text-white border-transparent'
                          : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-100',
                      )}
                      style={filterRegion === key ? { backgroundColor: themeColor } : undefined}
                    >
                      {label}
                    </button>
                  ),
                )}
              </div>
            </div>

            {/* Risk filter */}
            <div>
              <p className="text-[10px] text-gray-400 font-medium mb-1">Riesgo</p>
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => setFilterRisk('all')}
                  className={cn(
                    'text-[10px] px-2 py-0.5 rounded border transition-colors',
                    filterRisk === 'all'
                      ? 'text-white border-transparent'
                      : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-100',
                  )}
                  style={filterRisk === 'all' ? { backgroundColor: themeColor } : undefined}
                >
                  Todos
                </button>
                {(Object.keys(RISK_LABELS) as MalignancyRisk[]).map((risk) => (
                  <button
                    key={risk}
                    type="button"
                    onClick={() => setFilterRisk(risk)}
                    className={cn(
                      'text-[10px] px-2 py-0.5 rounded border transition-colors',
                      filterRisk === risk
                        ? 'text-white border-transparent'
                        : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-100',
                    )}
                    style={filterRisk === risk ? { backgroundColor: RISK_COLORS[risk] } : undefined}
                  >
                    {RISK_LABELS[risk]}
                  </button>
                ))}
              </div>
            </div>

            {/* Type filter */}
            <div>
              <p className="text-[10px] text-gray-400 font-medium mb-1">Tipo</p>
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => setFilterType('all')}
                  className={cn(
                    'text-[10px] px-2 py-0.5 rounded border transition-colors',
                    filterType === 'all'
                      ? 'text-white border-transparent'
                      : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-100',
                  )}
                  style={filterType === 'all' ? { backgroundColor: themeColor } : undefined}
                >
                  Todos
                </button>
                {(Object.entries(LESION_TYPE_LABELS) as [LesionType, string][]).map(
                  ([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFilterType(key)}
                      className={cn(
                        'text-[10px] px-2 py-0.5 rounded border transition-colors',
                        filterType === key
                          ? 'text-white border-transparent'
                          : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-100',
                      )}
                      style={filterType === key ? { backgroundColor: themeColor } : undefined}
                    >
                      {label}
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Body map + sidebar layout ──────────────────────────── */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Body map */}
        <div>
          <BodyMap
            lesions={filteredLesions}
            view={bodyView}
            onViewChange={setBodyView}
            onBodyClick={handleBodyClick}
            onLesionClick={handleLesionClick}
            selectedLesionId={selectedLesion?.id ?? null}
            themeColor={themeColor}
          />
        </div>

        {/* Active lesions sidebar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-gray-600">
              Lesiones Activas
            </h4>
          </div>
          <LesionSidebar
            lesions={filteredLesions}
            selectedId={selectedLesion?.id ?? null}
            onSelect={(lesion) => {
              setSelectedLesion(lesion);
            }}
            themeColor={themeColor}
          />

          {/* Selected lesion detail actions */}
          {selectedLesion && (
            <div className="mt-3 p-3 rounded-lg border border-gray-100 bg-gray-50">
              <p className="text-xs font-medium text-gray-700 mb-2">
                {LESION_TYPE_LABELS[selectedLesion.lesion_type]} &mdash;{' '}
                {BODY_REGION_LABELS[selectedLesion.body_region]}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleViewTimeline(selectedLesion)}
                  className="text-[10px] font-medium px-2.5 py-1 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1"
                >
                  <Clock className="h-3 w-3" />
                  Ver Evolución
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setClickPosition({
                      x: selectedLesion.position_x,
                      y: selectedLesion.position_y,
                      region: selectedLesion.body_region,
                      view: selectedLesion.body_view,
                    });
                    setViewState('new-lesion');
                  }}
                  className="text-[10px] font-medium px-2.5 py-1 rounded-lg text-white transition-colors flex items-center gap-1"
                  style={{ backgroundColor: themeColor }}
                >
                  <Plus className="h-3 w-3" />
                  Nuevo Control
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Error ───────────────────────────────────────────────── */}
      {error && (
        <div className="mt-3 p-3 rounded-lg bg-red-50 text-sm text-red-600">
          {error}
        </div>
      )}
    </ModuleWrapper>
  );
}
