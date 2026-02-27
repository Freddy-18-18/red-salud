"use client";

import { useState, useCallback } from "react";
import { cn } from "@red-salud/core/utils";
import {
  FileText, Stethoscope, ClipboardList, Route, Save, Clock, CheckCircle2,
  AlertTriangle, ChevronDown, ChevronUp, Plus, Trash2, Tag
} from "lucide-react";
import {
  Button, Card, CardContent, CardHeader, CardTitle,
  Badge, Input
} from "@red-salud/design-system";
import type { SOAPNote, SOAPTemplate, VitalSigns } from "@/types/dental";

// ─── SOAP Templates ──────────────────────────────────────────────────────────
const DEFAULT_TEMPLATES: SOAPTemplate[] = [
  {
    id: "t1",
    name: "Examen General",
    specialty: "general",
    subjective: "Paciente acude a consulta para evaluación general. Refiere: ",
    objective: "Signos vitales dentro de límites normales. Exploración bucal: ",
    assessment: "Diagnóstico: ",
    plan: "Se indica: ",
    isDefault: true,
  },
  {
    id: "t2",
    name: "Dolor Dental Agudo",
    specialty: "general",
    subjective: "Paciente refiere dolor dental de inicio [agudo/gradual] en zona [  ], de intensidad [  ]/10, exacerbado por [frío/calor/masticación]. Duración: [  ]. Medicación previa: ",
    objective: "Inspección: [caries visible/fractura/edema/fístula]. Percusión: [positiva/negativa]. Palpación: [sensible/no sensible]. Prueba de vitalidad: [positiva/negativa/disminuida]. Radiografía: ",
    assessment: "Dx: [Pulpitis irreversible/Absceso periapical/Fractura dental] en diente #[  ]. CIE-10: ",
    plan: "1. [Tratamiento endodóntico/Extracción/Drenaje]\n2. Medicación: [Antibiótico/Analgésico]\n3. Control en [  ] días\n4. Referencia a [endodoncista/cirujano] si aplica",
    isDefault: false,
  },
  {
    id: "t3",
    name: "Control Periodontal",
    specialty: "periodoncia",
    subjective: "Paciente acude a control periodontal. Refiere [sangrado al cepillado/movilidad dental/halitosis]. Higiene oral: [buena/regular/deficiente]. Último control: ",
    objective: "Índice de placa: [  ]%. BOP: [  ]%. Sondaje: bolsas de [  ]mm en dientes [  ]. Movilidad: [  ]. Pérdida ósea radiográfica: ",
    assessment: "Dx: [Gingivitis/Periodontitis leve-moderada-severa]. Clasificación: Estadio [  ] Grado [  ]. CIE-10: K05.1",
    plan: "1. Raspado y alisado radicular en [cuadrantes  ]\n2. Instrucciones de higiene oral reforzadas\n3. [Clorhexidina 0.12% enjuague 2x/día por 14 días]\n4. Control en [  ] semanas",
    isDefault: false,
  },
  {
    id: "t4",
    name: "Restauración Dental",
    specialty: "operatoria",
    subjective: "Paciente acude para restauración programada. Sin dolor actual. Alergias: ",
    objective: "Diente #[  ]: Cavidad clase [I/II/III/IV/V] en caras [M/D/O/B/L]. Vitalidad: positiva. Sin signos periapicales. Radiografía: ",
    assessment: "Dx: Caries dental en diente #[  ] caras [  ]. CIE-10: K02.1",
    plan: "1. Anestesia: [  ]\n2. Aislamiento absoluto/relativo\n3. Remoción de caries con [fresa/cucharilla]\n4. Restauración con [Resina compuesta/Amalgama/Ionómero] color [  ]\n5. Ajuste oclusal y pulido\n6. Control en [  ] días",
    isDefault: false,
  },
];

// ─── SOAP Editor Component ──────────────────────────────────────────────────
interface SOAPEditorProps {
  initialData?: Partial<SOAPNote>;
  patientId?: string;
  consultationId?: string;
  onSave?: (note: Partial<SOAPNote>) => Promise<void>;
  readOnly?: boolean;
  className?: string;
}

export function SOAPEditor({
  initialData,
  patientId,
  consultationId,
  onSave,
  readOnly = false,
  className,
}: SOAPEditorProps) {
  const [note, setNote] = useState<Partial<SOAPNote>>({
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
    icdCodes: [],
    cptCodes: [],
    status: "draft",
    ...initialData,
  });

  const [expandedSections, setExpandedSections] = useState({
    subjective: true,
    objective: true,
    assessment: true,
    plan: true,
    vitals: false,
    codes: false,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [icdInput, setIcdInput] = useState("");
  const [cptInput, setCptInput] = useState("");

  const updateField = useCallback((field: keyof SOAPNote, value: unknown) => {
    setNote((prev) => ({ ...prev, [field]: value }));
  }, []);

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  const applyTemplate = (template: SOAPTemplate) => {
    setNote((prev) => ({
      ...prev,
      subjective: template.subjective,
      objective: template.objective,
      assessment: template.assessment,
      plan: template.plan,
      templateId: template.id,
    }));
    setShowTemplates(false);
  };

  const handleSave = async (status: "draft" | "signed") => {
    setIsSaving(true);
    const data = {
      ...note,
      patientId,
      consultationId,
      status,
      ...(status === "signed" ? { signedAt: new Date().toISOString() } : {}),
    };
    await onSave?.(data);
    setNote((prev) => ({ ...prev, status }));
    setIsSaving(false);
  };

  const addCode = (type: "icdCodes" | "cptCodes", value: string) => {
    if (!value.trim()) return;
    const current = (note[type] as string[]) || [];
    if (!current.includes(value.trim())) {
      updateField(type, [...current, value.trim()]);
    }
    if (type === "icdCodes") setIcdInput("");
    else setCptInput("");
  };

  const removeCode = (type: "icdCodes" | "cptCodes", idx: number) => {
    const current = [...((note[type] as string[]) || [])];
    current.splice(idx, 1);
    updateField(type, current);
  };

  const isSigned = note.status === "signed";

  const soapSections = [
    {
      key: "subjective",
      label: "S — Subjetivo",
      icon: <FileText className="w-4 h-4" />,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
      hint: "Quejas del paciente, síntomas, historia actual, antecedentes relevantes",
      field: "subjective" as const,
    },
    {
      key: "objective",
      label: "O — Objetivo",
      icon: <Stethoscope className="w-4 h-4" />,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800",
      hint: "Hallazgos del examen físico, radiográfico, pruebas diagnósticas",
      field: "objective" as const,
    },
    {
      key: "assessment",
      label: "A — Evaluación",
      icon: <ClipboardList className="w-4 h-4" />,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
      hint: "Diagnóstico principal, diagnósticos diferenciales, códigos ICD",
      field: "assessment" as const,
    },
    {
      key: "plan",
      label: "P — Plan",
      icon: <Route className="w-4 h-4" />,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800",
      hint: "Tratamiento propuesto, medicamentos, seguimiento, referencia",
      field: "plan" as const,
    },
  ];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowTemplates(!showTemplates)}
          disabled={isSigned}
        >
          <FileText className="w-4 h-4 mr-1" />
          Plantillas
        </Button>

        <div className="flex-1" />

        {note.status === "signed" && (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Firmada
          </Badge>
        )}

        {note.status === "amended" && (
          <Badge variant="default" className="bg-amber-600">
            <AlertTriangle className="w-3 h-3 mr-1" /> Enmendada
          </Badge>
        )}

        {!isSigned && (
          <>
            <Button variant="outline" size="sm" onClick={() => handleSave("draft")} disabled={isSaving}>
              <Save className="w-4 h-4 mr-1" />
              Borrador
            </Button>
            <Button size="sm" onClick={() => handleSave("signed")} disabled={isSaving}>
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Firmar Nota
            </Button>
          </>
        )}
      </div>

      {/* Templates Panel */}
      {showTemplates && (
        <Card className="border-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Seleccionar Plantilla SOAP</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {DEFAULT_TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => applyTemplate(t)}
                  className="text-left p-3 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.specialty}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* SOAP Sections */}
      {soapSections.map((section) => (
        <div key={section.key} className={cn("rounded-xl border", section.bgColor)}>
          <button
            onClick={() => toggleSection(section.key)}
            className="w-full flex items-center justify-between p-3"
          >
            <div className="flex items-center gap-2">
              <span className={section.color}>{section.icon}</span>
              <span className={cn("font-bold text-sm", section.color)}>{section.label}</span>
            </div>
            {expandedSections[section.key as keyof typeof expandedSections]
              ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
              : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>

          {expandedSections[section.key as keyof typeof expandedSections] && (
            <div className="px-3 pb-3">
              <p className="text-xs text-muted-foreground mb-2 italic">{section.hint}</p>
              <textarea
                value={(note[section.field] as string) || ""}
                onChange={(e) => updateField(section.field, e.target.value)}
                disabled={readOnly || isSigned}
                rows={4}
                className="w-full border rounded-lg p-3 text-sm bg-background/80 resize-y focus:outline-primary"
                placeholder={`Escribir ${section.label.toLowerCase()}...`}
              />
            </div>
          )}
        </div>
      ))}

      {/* Vital Signs */}
      <div className="rounded-xl border p-3 bg-card">
        <button
          onClick={() => toggleSection("vitals")}
          className="w-full flex items-center justify-between"
        >
          <span className="font-bold text-sm flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-red-500" /> Signos Vitales
          </span>
          {expandedSections.vitals
            ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
            : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>

        {expandedSections.vitals && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
            {[
              { key: "bloodPressureSystolic", label: "PA Sistólica", unit: "mmHg" },
              { key: "bloodPressureDiastolic", label: "PA Diastólica", unit: "mmHg" },
              { key: "heartRate", label: "FC", unit: "lpm" },
              { key: "temperature", label: "Temperatura", unit: "°C" },
              { key: "oxygenSaturation", label: "SpO₂", unit: "%" },
              { key: "weight", label: "Peso", unit: "kg" },
              { key: "height", label: "Talla", unit: "cm" },
            ].map(({ key, label, unit }) => (
              <div key={key} className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">{label} ({unit})</label>
                <Input
                  type="number"
                  value={(note.vitalSigns as VitalSigns)?.[key as keyof VitalSigns] || ""}
                  onChange={(e) =>
                    updateField("vitalSigns", {
                      ...((note.vitalSigns as VitalSigns) || {}),
                      [key]: parseFloat(e.target.value) || undefined,
                    })
                  }
                  disabled={readOnly || isSigned}
                  className="h-8 text-sm"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Codes (ICD / CPT) */}
      <div className="rounded-xl border p-3 bg-card">
        <button
          onClick={() => toggleSection("codes")}
          className="w-full flex items-center justify-between"
        >
          <span className="font-bold text-sm flex items-center gap-2">
            <Tag className="w-4 h-4 text-indigo-500" /> Códigos Diagnósticos
          </span>
          {expandedSections.codes
            ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
            : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>

        {expandedSections.codes && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            {/* ICD Codes */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">ICD-10 / ICD-11</label>
              <div className="flex gap-1">
                <Input
                  value={icdInput}
                  onChange={(e) => setIcdInput(e.target.value)}
                  placeholder="Ej: K02.1"
                  className="h-8 text-sm"
                  disabled={readOnly || isSigned}
                  onKeyDown={(e) => e.key === "Enter" && addCode("icdCodes", icdInput)}
                />
                <Button size="sm" variant="outline" onClick={() => addCode("icdCodes", icdInput)} disabled={readOnly || isSigned}>
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {(note.icdCodes || []).map((code, i) => (
                  <Badge key={i} variant="secondary" className="text-xs gap-1">
                    {code}
                    {!readOnly && !isSigned && (
                      <button onClick={() => removeCode("icdCodes", i)}>
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            {/* CPT Codes */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">CDT / CPT</label>
              <div className="flex gap-1">
                <Input
                  value={cptInput}
                  onChange={(e) => setCptInput(e.target.value)}
                  placeholder="Ej: D2391"
                  className="h-8 text-sm"
                  disabled={readOnly || isSigned}
                  onKeyDown={(e) => e.key === "Enter" && addCode("cptCodes", cptInput)}
                />
                <Button size="sm" variant="outline" onClick={() => addCode("cptCodes", cptInput)} disabled={readOnly || isSigned}>
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {(note.cptCodes || []).map((code, i) => (
                  <Badge key={i} variant="outline" className="text-xs gap-1">
                    {code}
                    {!readOnly && !isSigned && (
                      <button onClick={() => removeCode("cptCodes", i)}>
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Timestamps */}
      {note.createdAt && (
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> Creada: {new Date(note.createdAt).toLocaleString("es-ES")}
          </span>
          {note.signedAt && (
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-green-500" /> Firmada: {new Date(note.signedAt).toLocaleString("es-ES")}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default SOAPEditor;
