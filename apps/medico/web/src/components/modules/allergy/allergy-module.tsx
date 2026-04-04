'use client';

import { useState, useCallback } from 'react';
import { Plus, FlaskConical, History } from 'lucide-react';
import { cn } from '@red-salud/core/utils';
import type { ModuleComponentProps } from '../module-registry';
import { ModuleWrapper } from '../module-wrapper';
import { useAllergy, type CreateAllergyTest } from './use-allergy';
import { SkinPrickTest } from './skin-prick-test';
import { IgEResults } from './ige-results';
import type { SkinPrickEntry, IgEEntry } from './allergy-panels-data';

// ============================================================================
// TABS
// ============================================================================

type TestTab = 'skin_prick' | 'ige_specific';

const TABS: Array<{ key: TestTab; label: string }> = [
  { key: 'skin_prick', label: 'Prick Test' },
  { key: 'ige_specific', label: 'IgE Específica' },
];

// ============================================================================
// COMPONENT
// ============================================================================

export default function AllergyModule({
  doctorId,
  patientId,
  config,
  themeColor = '#F97316',
}: ModuleComponentProps) {
  // State
  const [activeTab, setActiveTab] = useState<TestTab>('skin_prick');
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [skinPrickEntries, setSkinPrickEntries] = useState<SkinPrickEntry[]>([]);
  const [igeEntries, setIgEEntries] = useState<IgEEntry[]>([]);
  const [totalIgE, setTotalIgE] = useState<number | null>(null);
  const [clinicalIndication, setClinicalIndication] = useState('');

  // Data
  const { tests, loading, error, create } = useAllergy(doctorId, {
    patientId,
    limit: 20,
  });

  // Handlers
  const handleCreate = useCallback(async () => {
    setIsSubmitting(true);

    const resultsData: Record<string, unknown> = {};
    if (activeTab === 'skin_prick') {
      resultsData.skin_prick_entries = skinPrickEntries.map((e) => ({
        allergen_id: e.allergen.id,
        allergen_name: e.allergen.name,
        wheal_size: e.whealSize,
        flare_size: e.flareSize,
        result: e.result,
      }));
    } else {
      resultsData.ige_entries = igeEntries.map((e) => ({
        allergen_id: e.allergen.id,
        allergen_name: e.allergen.name,
        value: e.value,
        ige_class: e.igeClass,
      }));
      resultsData.total_ige = totalIgE;
    }

    const data: CreateAllergyTest = {
      patient_id: patientId,
      test_method: activeTab === 'skin_prick' ? 'skin_prick' : 'ige_specific',
      status: 'completed',
      clinical_indication: clinicalIndication || null,
      results_data: resultsData,
    };

    await create(data);
    setIsSubmitting(false);
    setShowForm(false);
    resetForm();
  }, [activeTab, skinPrickEntries, igeEntries, totalIgE, clinicalIndication, patientId, create]);

  const resetForm = useCallback(() => {
    setSkinPrickEntries([]);
    setIgEEntries([]);
    setTotalIgE(null);
    setClinicalIndication('');
  }, []);

  const moduleActions = [
    {
      label: 'Nueva prueba',
      onClick: () => setShowForm(true),
      icon: Plus,
    },
  ];

  // ── New test form ────────────────────────────────────────
  if (showForm) {
    return (
      <ModuleWrapper
        moduleKey="allergy-testing"
        title="Nueva Prueba de Alergia"
        icon="FlaskConical"
        themeColor={themeColor}
      >
        <div className="space-y-4">
          {/* Tab selector */}
          <div className="flex gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'text-xs font-medium px-3 py-1.5 rounded-full transition-colors',
                  activeTab === tab.key
                    ? 'text-white'
                    : 'text-gray-500 bg-gray-100 hover:bg-gray-200',
                )}
                style={
                  activeTab === tab.key
                    ? { backgroundColor: themeColor }
                    : undefined
                }
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Clinical indication */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Indicación clínica
            </label>
            <input
              type="text"
              value={clinicalIndication}
              onChange={(e) => setClinicalIndication(e.target.value)}
              placeholder="Ej: Rinitis alérgica, urticaria recurrente..."
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>

          {/* Test content */}
          {activeTab === 'skin_prick' && (
            <SkinPrickTest
              entries={skinPrickEntries}
              onChange={setSkinPrickEntries}
              themeColor={themeColor}
            />
          )}

          {activeTab === 'ige_specific' && (
            <IgEResults
              entries={igeEntries}
              onChange={setIgEEntries}
              totalIgE={totalIgE}
              onTotalIgEChange={setTotalIgE}
              themeColor={themeColor}
            />
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="text-xs font-medium px-4 py-2 text-gray-500 hover:text-gray-700"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={isSubmitting}
              className="text-xs font-medium px-4 py-2 text-white rounded-lg disabled:opacity-50"
              style={{ backgroundColor: themeColor }}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar prueba'}
            </button>
          </div>
        </div>
      </ModuleWrapper>
    );
  }

  // ── Main view ────────────────────────────────────────────
  return (
    <ModuleWrapper
      moduleKey="allergy-testing"
      title="Pruebas de Alergia"
      icon="FlaskConical"
      description="Perfil alérgico y pruebas diagnósticas"
      themeColor={themeColor}
      isEmpty={!loading && tests.length === 0}
      emptyMessage="Sin pruebas de alergia registradas"
      isLoading={loading}
      actions={moduleActions}
    >
      {/* Test history */}
      <div className="space-y-2">
        {tests.map((test) => {
          const methodLabel =
            test.test_method === 'skin_prick'
              ? 'Prick Test'
              : test.test_method === 'ige_specific'
                ? 'IgE Específica'
                : test.test_method === 'ige_total'
                  ? 'IgE Total'
                  : 'Parche';

          const statusColor =
            test.status === 'completed' ? '#22c55e' :
            test.status === 'reviewed' ? '#3b82f6' :
            '#f59e0b';

          return (
            <div
              key={test.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${themeColor}10` }}
              >
                <FlaskConical className="h-5 w-5" style={{ color: themeColor }} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700">{methodLabel}</p>
                {test.clinical_indication && (
                  <p className="text-xs text-gray-400 truncate">{test.clinical_indication}</p>
                )}
              </div>

              <span
                className="text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0"
                style={{ color: statusColor, backgroundColor: `${statusColor}15` }}
              >
                {test.status === 'completed' ? 'Completado' :
                 test.status === 'reviewed' ? 'Revisado' :
                 test.status === 'in_progress' ? 'En progreso' : 'Solicitado'}
              </span>

              <p className="text-xs text-gray-400 shrink-0">
                {new Date(test.created_at).toLocaleDateString('es-VE', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="mt-3 p-3 rounded-lg bg-red-50 text-sm text-red-600">
          {error}
        </div>
      )}
    </ModuleWrapper>
  );
}
