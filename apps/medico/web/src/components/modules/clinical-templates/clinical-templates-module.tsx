'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Plus,
  FileText as FileTemplate,
  Eye,
  Copy,
  Pencil,
  Trash2,
  Search,
  Lock,
  Tag,
} from 'lucide-react';
import { Badge, Button, Input } from '@red-salud/design-system';
import { cn } from '@red-salud/core/utils';
import type { ModuleComponentProps } from '../module-registry';
import { ModuleWrapper } from '../module-wrapper';
import {
  useClinicalTemplates,
  type ClinicalTemplate,
  type CreateClinicalTemplate,
} from './use-clinical-templates';
import { TemplateEditor } from './template-editor';

// ============================================================================
// CATEGORY CONFIG
// ============================================================================

const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  soap: { label: 'SOAP', color: 'bg-blue-100 text-blue-700' },
  progress_note: { label: 'Evolución', color: 'bg-emerald-100 text-emerald-700' },
  referral: { label: 'Referencia', color: 'bg-purple-100 text-purple-700' },
  discharge: { label: 'Egreso', color: 'bg-amber-100 text-amber-700' },
  custom: { label: 'Personalizada', color: 'bg-gray-100 text-gray-600' },
};

// ============================================================================
// TEMPLATE PREVIEW
// ============================================================================

function TemplatePreview({
  template,
  onClose,
  onUse,
  themeColor,
}: {
  template: ClinicalTemplate;
  onClose: () => void;
  onUse?: () => void;
  themeColor: string;
}) {
  const catCfg = CATEGORY_CONFIG[template.category] ?? CATEGORY_CONFIG.custom;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-gray-700">
            {template.title}
          </h3>
          <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', catCfg.color)}>
            {catCfg.label}
          </span>
          {template.is_system && (
            <Lock className="h-3.5 w-3.5 text-gray-400" />
          )}
        </div>
        <div className="flex items-center gap-2">
          {onUse && (
            <Button size="sm" onClick={onUse} style={{ backgroundColor: themeColor }}>
              <Copy className="mr-1.5 h-3.5 w-3.5" />
              Usar plantilla
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>

      {template.description && (
        <p className="text-sm text-gray-500">{template.description}</p>
      )}

      {/* SOAP Sections */}
      {(template.subjective || template.objective || template.assessment || template.plan) && (
        <div className="space-y-3">
          {template.subjective && (
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
              <p className="text-xs font-semibold text-blue-600 mb-1">S — Subjetivo</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{template.subjective}</p>
            </div>
          )}
          {template.objective && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
              <p className="text-xs font-semibold text-emerald-600 mb-1">O — Objetivo</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{template.objective}</p>
            </div>
          )}
          {template.assessment && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
              <p className="text-xs font-semibold text-amber-600 mb-1">A — Evaluación</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{template.assessment}</p>
            </div>
          )}
          {template.plan && (
            <div className="p-3 rounded-lg bg-purple-50 border border-purple-100">
              <p className="text-xs font-semibold text-purple-600 mb-1">P — Plan</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{template.plan}</p>
            </div>
          )}
        </div>
      )}

      {/* Vital signs */}
      {template.vital_signs_checklist.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
            Signos vitales
          </p>
          <div className="flex flex-wrap gap-1.5">
            {template.vital_signs_checklist.map((sign) => (
              <span
                key={sign}
                className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
              >
                {sign}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ICD codes */}
      {template.default_icd_codes.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
            Códigos ICD-11 sugeridos
          </p>
          <div className="flex flex-wrap gap-1.5">
            {template.default_icd_codes.map((code) => (
              <span
                key={code}
                className="text-xs font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700"
              >
                {code}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {template.tags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {template.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 text-xs text-gray-400"
            >
              <Tag className="h-3 w-3" />
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function ClinicalTemplatesModule({
  doctorId,
  patientId,
  specialtySlug,
  config,
  themeColor = '#3B82F6',
}: ModuleComponentProps) {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ClinicalTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<ClinicalTemplate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data
  const { templates, loading, error, createTemplate, updateTemplate, deleteTemplate, refresh } =
    useClinicalTemplates(doctorId, specialtySlug);

  // Filtered templates
  const filteredTemplates = useMemo(() => {
    let result = templates;

    // Category filter
    if (filterCategory !== 'all') {
      result = result.filter((t) => t.category === filterCategory);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.includes(q)),
      );
    }

    return result;
  }, [templates, filterCategory, searchQuery]);

  // Separate system vs custom
  const systemTemplates = filteredTemplates.filter((t) => t.is_system);
  const customTemplates = filteredTemplates.filter((t) => !t.is_system);

  // Handlers
  const handleCreate = useCallback(
    async (data: CreateClinicalTemplate) => {
      setIsSubmitting(true);
      const result = await createTemplate(data);
      setIsSubmitting(false);
      if (result) {
        setShowEditor(false);
        setEditingTemplate(null);
      }
    },
    [createTemplate],
  );

  const handleUpdate = useCallback(
    async (data: CreateClinicalTemplate) => {
      if (!editingTemplate) return;
      setIsSubmitting(true);
      const result = await updateTemplate(editingTemplate.id, data);
      setIsSubmitting(false);
      if (result) {
        setShowEditor(false);
        setEditingTemplate(null);
      }
    },
    [editingTemplate, updateTemplate],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteTemplate(id);
    },
    [deleteTemplate],
  );

  // Module actions
  const moduleActions = [
    {
      label: 'Nueva plantilla',
      onClick: () => {
        setEditingTemplate(null);
        setShowEditor(true);
      },
      icon: Plus,
    },
  ];

  // If previewing a template
  if (previewTemplate) {
    return (
      <ModuleWrapper
        moduleKey="clinical-templates"
        title="Vista previa de plantilla"
        icon="FileTemplate"
        themeColor={themeColor}
      >
        <TemplatePreview
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          themeColor={themeColor}
        />
      </ModuleWrapper>
    );
  }

  // If showing editor
  if (showEditor) {
    return (
      <ModuleWrapper
        moduleKey="clinical-templates"
        title={editingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla Clínica'}
        icon="FileTemplate"
        themeColor={themeColor}
      >
        <TemplateEditor
          onSubmit={editingTemplate ? handleUpdate : handleCreate}
          onCancel={() => {
            setShowEditor(false);
            setEditingTemplate(null);
          }}
          initialData={editingTemplate ?? undefined}
          isEdit={!!editingTemplate}
          isSubmitting={isSubmitting}
          themeColor={themeColor}
        />
      </ModuleWrapper>
    );
  }

  return (
    <ModuleWrapper
      moduleKey="clinical-templates"
      title="Plantillas Clínicas"
      icon="FileTemplate"
      description="Plantillas para notas y formularios"
      themeColor={themeColor}
      isEmpty={!loading && filteredTemplates.length === 0}
      emptyMessage="Sin plantillas disponibles"
      isLoading={loading}
      actions={moduleActions}
    >
      {/* ── Search & category filter ──────────────────────────────── */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder="Buscar plantilla..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-8"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setFilterCategory('all')}
          className={cn(
            'text-xs font-medium px-2.5 py-1 rounded-full transition-colors whitespace-nowrap',
            filterCategory === 'all'
              ? 'text-white'
              : 'text-gray-500 bg-gray-100 hover:bg-gray-200',
          )}
          style={filterCategory === 'all' ? { backgroundColor: themeColor } : undefined}
        >
          Todas
        </button>
        {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilterCategory(key)}
            className={cn(
              'text-xs font-medium px-2.5 py-1 rounded-full transition-colors whitespace-nowrap',
              filterCategory === key
                ? 'text-white'
                : 'text-gray-500 bg-gray-100 hover:bg-gray-200',
            )}
            style={filterCategory === key ? { backgroundColor: themeColor } : undefined}
          >
            {cfg.label}
          </button>
        ))}
      </div>

      {/* ── Template list ─────────────────────────────────────────── */}
      <div className="space-y-4">
        {/* System templates */}
        {systemTemplates.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
              Plantillas del sistema
            </h4>
            <div className="space-y-1.5">
              {systemTemplates.map((tpl) => (
                <TemplateRow
                  key={tpl.id}
                  template={tpl}
                  themeColor={themeColor}
                  onPreview={() => setPreviewTemplate(tpl)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Custom templates */}
        {customTemplates.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
              Mis plantillas
            </h4>
            <div className="space-y-1.5">
              {customTemplates.map((tpl) => (
                <TemplateRow
                  key={tpl.id}
                  template={tpl}
                  themeColor={themeColor}
                  onPreview={() => setPreviewTemplate(tpl)}
                  onEdit={() => {
                    setEditingTemplate(tpl);
                    setShowEditor(true);
                  }}
                  onDelete={() => handleDelete(tpl.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-3 p-3 rounded-lg bg-red-50 text-sm text-red-600">
          {error}
        </div>
      )}
    </ModuleWrapper>
  );
}

// ============================================================================
// TEMPLATE ROW
// ============================================================================

function TemplateRow({
  template,
  themeColor,
  onPreview,
  onEdit,
  onDelete,
}: {
  template: ClinicalTemplate;
  themeColor: string;
  onPreview: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const catCfg = CATEGORY_CONFIG[template.category] ?? CATEGORY_CONFIG.custom;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors">
      {/* Icon */}
      <div
        className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${themeColor}10` }}
      >
        <FileTemplate className="h-4.5 w-4.5" style={{ color: themeColor }} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-700 truncate">
            {template.title}
          </p>
          {template.is_system && (
            <Lock className="h-3 w-3 text-gray-300 shrink-0" />
          )}
        </div>
        {template.description && (
          <p className="text-xs text-gray-400 truncate mt-0.5">
            {template.description}
          </p>
        )}
      </div>

      {/* Category badge */}
      <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0', catCfg.color)}>
        {catCfg.label}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={onPreview}
          className="h-7 w-7 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          title="Vista previa"
        >
          <Eye className="h-3.5 w-3.5" />
        </button>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="h-7 w-7 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            title="Editar"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="h-7 w-7 flex items-center justify-center rounded text-gray-400 hover:text-red-500 hover:bg-red-50"
            title="Eliminar"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
