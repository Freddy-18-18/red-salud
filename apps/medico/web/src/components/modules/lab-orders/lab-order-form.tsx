'use client';

import { useState, useCallback, useMemo, type FormEvent } from 'react';
import {
  Save,
  X,
  AlertCircle,
  Plus,
  Trash2,
  Search,
  FlaskConical,
} from 'lucide-react';
import {
  Button,
  Input,
  Label,
  Badge,
} from '@red-salud/design-system';
import { cn } from '@red-salud/core/utils';
import type { CreateLabOrder } from './use-lab-orders';
import { getTestPanels, getAllTests, type TestPanel } from './lab-test-panels';

// ============================================================================
// TYPES
// ============================================================================

interface LabOrderFormProps {
  onSubmit: (data: CreateLabOrder) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  specialtySlug: string;
  themeColor?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function LabOrderForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
  specialtySlug,
  themeColor = '#3B82F6',
}: LabOrderFormProps) {
  // Form state
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [priority, setPriority] = useState<'routine' | 'urgent' | 'stat'>('routine');
  const [clinicalIndication, setClinicalIndication] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [panelName, setPanelName] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Panels for this specialty
  const panels = useMemo(() => getTestPanels(specialtySlug), [specialtySlug]);
  const allTests = useMemo(() => getAllTests(specialtySlug), [specialtySlug]);

  // Filtered tests for search
  const filteredTests = useMemo(() => {
    if (!searchQuery.trim()) return allTests;
    const q = searchQuery.toLowerCase();
    return allTests.filter((t) => t.toLowerCase().includes(q));
  }, [allTests, searchQuery]);

  // Toggle a single test
  const toggleTest = useCallback((test: string) => {
    setSelectedTests((prev) =>
      prev.includes(test) ? prev.filter((t) => t !== test) : [...prev, test],
    );
    setErrors((prev) => {
      if (!('tests' in prev)) return prev;
      const next = { ...prev };
      delete next.tests;
      return next;
    });
  }, []);

  // Apply an entire panel
  const applyPanel = useCallback(
    (panel: TestPanel) => {
      setSelectedTests((prev) => {
        const combined = new Set([...prev, ...panel.tests]);
        return Array.from(combined);
      });
      setPanelName(panel.name);
      setErrors((prev) => {
        if (!('tests' in prev)) return prev;
        const next = { ...prev };
        delete next.tests;
        return next;
      });
    },
    [],
  );

  // Remove a test
  const removeTest = useCallback((test: string) => {
    setSelectedTests((prev) => prev.filter((t) => t !== test));
  }, []);

  // Submit
  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const newErrors: Record<string, string> = {};

      if (selectedTests.length === 0) {
        newErrors.tests = 'Seleccione al menos una prueba';
      }
      if (!clinicalIndication.trim()) {
        newErrors.clinical_indication = 'La indicación clínica es requerida';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      onSubmit({
        tests: selectedTests,
        priority,
        clinical_indication: clinicalIndication,
        special_instructions: specialInstructions || null,
        panel_name: panelName,
      });
    },
    [selectedTests, priority, clinicalIndication, specialInstructions, panelName, onSubmit],
  );

  const priorityOptions = [
    { value: 'routine' as const, label: 'Rutina', color: 'bg-gray-100 text-gray-600' },
    { value: 'urgent' as const, label: 'Urgente', color: 'bg-amber-100 text-amber-700' },
    { value: 'stat' as const, label: 'STAT', color: 'bg-red-100 text-red-700' },
  ];

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* ── Quick panels ──────────────────────────────────────────── */}
      <div>
        <Label className="text-sm font-medium mb-2 block">
          Paneles predefinidos
        </Label>
        <div className="flex flex-wrap gap-2">
          {panels.map((panel) => (
            <button
              key={panel.name}
              type="button"
              onClick={() => applyPanel(panel)}
              className={cn(
                'inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors',
                'border-gray-200 text-gray-600 hover:bg-gray-50',
              )}
            >
              <FlaskConical className="h-3.5 w-3.5" />
              {panel.name}
              <span className="text-gray-400">({panel.tests.length})</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Search & add individual tests ─────────────────────────── */}
      <div>
        <Label className="text-sm font-medium mb-2 block">
          Buscar pruebas individuales
        </Label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder="Buscar prueba de laboratorio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-8"
          />
        </div>

        {searchQuery.trim() && (
          <div className="mt-2 max-h-32 overflow-y-auto border border-gray-100 rounded-lg">
            {filteredTests.length === 0 ? (
              <p className="text-xs text-gray-400 p-3 text-center">
                Sin resultados para &quot;{searchQuery}&quot;
              </p>
            ) : (
              filteredTests.map((test) => (
                <button
                  key={test}
                  type="button"
                  onClick={() => {
                    toggleTest(test);
                    setSearchQuery('');
                  }}
                  className={cn(
                    'w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b border-gray-50 last:border-0',
                    selectedTests.includes(test)
                      ? 'text-gray-400 line-through'
                      : 'text-gray-700',
                  )}
                >
                  {selectedTests.includes(test) ? '- ' : '+ '}
                  {test}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* ── Selected tests ────────────────────────────────────────── */}
      <div>
        <Label className="text-sm font-medium mb-2 block">
          Pruebas seleccionadas{' '}
          <span className="text-red-500">*</span>
          {selectedTests.length > 0 && (
            <Badge variant="secondary" className="ml-2 text-xs">
              {selectedTests.length}
            </Badge>
          )}
        </Label>

        {selectedTests.length === 0 ? (
          <p className="text-xs text-gray-400 py-3 text-center border border-dashed border-gray-200 rounded-lg">
            Seleccione pruebas de los paneles o busque individualmente
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {selectedTests.map((test) => (
              <span
                key={test}
                className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-700"
              >
                {test}
                <button
                  type="button"
                  onClick={() => removeTest(test)}
                  className="h-3.5 w-3.5 rounded-full hover:bg-gray-300 flex items-center justify-center"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            ))}
          </div>
        )}
        {errors.tests && (
          <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
            <AlertCircle className="h-3 w-3" />
            {errors.tests}
          </p>
        )}
      </div>

      {/* ── Priority ──────────────────────────────────────────────── */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Prioridad</Label>
        <div className="flex items-center gap-2">
          {priorityOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setPriority(opt.value)}
              className={cn(
                'text-xs font-medium px-3 py-1.5 rounded-full transition-colors',
                priority === opt.value
                  ? opt.color
                  : 'text-gray-400 bg-gray-50 hover:bg-gray-100',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Clinical indication ───────────────────────────────────── */}
      <div className="space-y-1.5">
        <Label htmlFor="lab_indication" className="text-sm font-medium">
          Indicación clínica <span className="text-red-500">*</span>
        </Label>
        <textarea
          id="lab_indication"
          placeholder="Motivo de la solicitud de laboratorio..."
          value={clinicalIndication}
          onChange={(e) => {
            setClinicalIndication(e.target.value);
            if (errors.clinical_indication) {
              setErrors((prev) => {
                const next = { ...prev };
                delete next.clinical_indication;
                return next;
              });
            }
          }}
          rows={3}
          className={cn(
            'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
            'ring-offset-background placeholder:text-muted-foreground resize-y min-h-[60px]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            errors.clinical_indication && 'border-red-500 focus-visible:ring-red-500',
          )}
        />
        {errors.clinical_indication && (
          <p className="flex items-center gap-1 text-xs text-red-500">
            <AlertCircle className="h-3 w-3" />
            {errors.clinical_indication}
          </p>
        )}
      </div>

      {/* ── Special instructions ──────────────────────────────────── */}
      <div className="space-y-1.5">
        <Label htmlFor="lab_instructions" className="text-sm font-medium">
          Instrucciones especiales
        </Label>
        <textarea
          id="lab_instructions"
          placeholder="Ej: Ayuno de 12 horas, muestra en frío..."
          value={specialInstructions}
          onChange={(e) => setSpecialInstructions(e.target.value)}
          rows={2}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground resize-y min-h-[50px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      {/* ── Actions ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-3 border-t pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          <X className="mr-1.5 h-4 w-4" />
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting} style={{ backgroundColor: themeColor }}>
          {isSubmitting ? (
            <span className="flex items-center gap-1.5">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Creando orden...
            </span>
          ) : (
            <>
              <Save className="mr-1.5 h-4 w-4" />
              Crear orden
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
