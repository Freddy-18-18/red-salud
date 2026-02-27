"use client";

import { useState, useMemo } from "react";
import { cn } from "@red-salud/core/utils";
import {
  FileText, AlertTriangle, CheckCircle2, Clock, Send, Eye,
  ChevronRight, Shield, Heart, Pill, ArrowLeft
} from "lucide-react";
import {
  Button, Card, CardContent, CardHeader, CardTitle, Badge, Input
} from "@red-salud/design-system";
import Link from "next/link";
import type { IntakeFormTemplate, IntakeFormSection, IntakeFormField, IntakeFormSubmission } from "@/types/dental";

// ─── Default Intake Template ─────────────────────────────────────────────────
const DEFAULT_TEMPLATE: IntakeFormTemplate = {
  id: "t-medical-history",
  name: "Historia Médica y Consentimiento",
  description: "Formulario completo de admisión para nuevos pacientes",
  isActive: true,
  createdAt: new Date().toISOString(),
  sections: [
    {
      id: "s1",
      title: "Información Personal",
      description: "Datos básicos del paciente",
      fields: [
        { id: "f1", label: "Nombre completo", type: "text", required: true, placeholder: "Nombre y apellido" },
        { id: "f2", label: "Fecha de nacimiento", type: "date", required: true },
        { id: "f3", label: "Cédula de identidad", type: "text", required: true, placeholder: "V-12345678" },
        { id: "f4", label: "Teléfono", type: "text", required: true, placeholder: "+58 414-1234567" },
        { id: "f5", label: "Correo electrónico", type: "text", required: false, placeholder: "correo@ejemplo.com" },
        { id: "f6", label: "Dirección", type: "textarea", required: false },
        { id: "f7", label: "Contacto de emergencia", type: "text", required: true, placeholder: "Nombre y teléfono" },
      ],
    },
    {
      id: "s2",
      title: "Historia Médica",
      description: "Condiciones médicas relevantes",
      fields: [
        { id: "f8", label: "¿Padece alguna enfermedad crónica?", type: "checkbox", required: false,
          triggerAlert: { condition: "true", message: "Paciente con enfermedad crónica — revisar medicación", severity: "warning" } },
        { id: "f9", label: "Especifique enfermedades", type: "textarea", required: false, placeholder: "Diabetes, hipertensión, cardiopatía..." },
        { id: "f10", label: "¿Está tomando algún medicamento actualmente?", type: "checkbox", required: false },
        { id: "f11", label: "Lista de medicamentos", type: "textarea", required: false, placeholder: "Nombre, dosis y frecuencia" },
        { id: "f12", label: "¿Es alérgico al látex?", type: "checkbox", required: false,
          triggerAlert: { condition: "true", message: "ALERGIA AL LÁTEX — Usar guantes sin látex", severity: "critical" } },
        { id: "f13", label: "¿Es alérgico a algún medicamento?", type: "checkbox", required: false,
          triggerAlert: { condition: "true", message: "Alergias medicamentosas — Verificar antes de prescribir", severity: "critical" } },
        { id: "f14", label: "Especifique alergias", type: "textarea", required: false, placeholder: "Penicilina, anestésicos locales..." },
        { id: "f15", label: "¿Está embarazada o en período de lactancia?", type: "radio", required: false, options: ["No", "Sí, embarazada", "Sí, lactando"],
          triggerAlert: { condition: "Sí, embarazada", message: "EMBARAZO — Evitar radiografías y ciertos medicamentos", severity: "critical" } },
        { id: "f16", label: "¿Ha sido hospitalizado en los últimos 2 años?", type: "checkbox", required: false },
        { id: "f17", label: "¿Tiene problemas de coagulación?", type: "checkbox", required: false,
          triggerAlert: { condition: "true", message: "Problemas de coagulación — Precaución en procedimientos quirúrgicos", severity: "warning" } },
      ],
    },
    {
      id: "s3",
      title: "Historia Dental",
      fields: [
        { id: "f18", label: "Motivo de consulta", type: "textarea", required: true, placeholder: "¿Cuál es la razón principal de su visita?" },
        { id: "f19", label: "Última visita al dentista", type: "select", required: false, options: ["Menos de 6 meses", "6-12 meses", "1-2 años", "Más de 2 años", "Nunca"] },
        { id: "f20", label: "¿Ha tenido problemas con anestesia dental?", type: "checkbox", required: false,
          triggerAlert: { condition: "true", message: "Antecedente de reacción a anestesia dental", severity: "warning" } },
        { id: "f21", label: "¿Rechina los dientes (bruxismo)?", type: "checkbox", required: false },
        { id: "f22", label: "¿Tiene sangrado de encías?", type: "checkbox", required: false },
      ],
    },
    {
      id: "s4",
      title: "Consentimiento Informado",
      fields: [
        { id: "f23", label: "Autorizo el tratamiento dental y el uso de anestesia local necesaria", type: "checkbox", required: true },
        { id: "f24", label: "Autorizo la toma de radiografías y fotografías clínicas", type: "checkbox", required: true },
        { id: "f25", label: "He leído y acepto la política de privacidad", type: "checkbox", required: true },
        { id: "f26", label: "Firma del paciente", type: "signature", required: true },
      ],
    },
  ],
};

const SECTION_ICONS: Record<string, React.ReactNode> = {
  s1: <FileText className="w-4 h-4" />,
  s2: <Heart className="w-4 h-4 text-red-500" />,
  s3: <Pill className="w-4 h-4 text-blue-500" />,
  s4: <Shield className="w-4 h-4 text-green-500" />,
};

// ─── Patient Intake Form ─────────────────────────────────────────────────────
export default function IntakeFormsPage() {
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [alerts, setAlerts] = useState<Array<{ field: string; message: string; severity: string }>>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [signatureData, setSignatureData] = useState<string>("");

  const template = DEFAULT_TEMPLATE;
  const section = template.sections[currentSection];
  const isLast = currentSection === template.sections.length - 1;

  const updateField = (fieldId: string, value: unknown, field?: IntakeFormField) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));

    // Check for alerts
    if (field?.triggerAlert) {
      const triggers = String(value) === field.triggerAlert.condition ||
        (field.triggerAlert.condition === "true" && value === true);
      const existing = alerts.findIndex((a) => a.field === fieldId);

      if (triggers && existing === -1) {
        setAlerts((prev) => [...prev, { field: fieldId, message: field.triggerAlert!.message, severity: field.triggerAlert!.severity }]);
      } else if (!triggers && existing !== -1) {
        setAlerts((prev) => prev.filter((_, i) => i !== existing));
      }
    }
  };

  const canProceed = useMemo(() => {
    if (!section) return false;
    return section.fields.filter((f) => f.required).every((f) => {
      const val = formData[f.id];
      if (f.type === "checkbox") return val === true;
      if (f.type === "signature") return !!signatureData;
      return val !== undefined && val !== "";
    });
  }, [section, formData, signatureData]);

  const handleSubmit = async () => {
    setIsSubmitted(true);
    // TODO: Save to Supabase intake_form_submissions
  };

  if (isSubmitted) {
    return (
      <div className="container max-w-2xl mx-auto py-12 text-center space-y-4">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
        <h1 className="text-2xl font-bold">Formulario Enviado</h1>
        <p className="text-muted-foreground">
          Su formulario de admisión ha sido recibido exitosamente. El equipo médico lo revisará antes de su cita.
        </p>
        {alerts.length > 0 && (
          <Card className="border-amber-300 text-left">
            <CardContent className="pt-4">
              <p className="font-semibold text-sm mb-2">Alertas generadas ({alerts.length}):</p>
              {alerts.map((a, i) => (
                <div key={i} className={cn("text-sm p-2 rounded mb-1", a.severity === "critical" ? "bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-300" : "bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300")}>
                  <AlertTriangle className="w-3 h-3 inline mr-1" />
                  {a.message}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
        <Link href="/dashboard/paciente">
          <Button>Volver al Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/paciente">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{template.name}</h1>
          <p className="text-sm text-muted-foreground">{template.description}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        {template.sections.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setCurrentSection(i)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
              i === currentSection
                ? "bg-primary text-primary-foreground"
                : i < currentSection
                ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                : "bg-muted text-muted-foreground"
            )}
          >
            {SECTION_ICONS[s.id] || <FileText className="w-3 h-3" />}
            <span className="hidden md:inline">{s.title}</span>
            <span className="md:hidden">{i + 1}</span>
          </button>
        ))}
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-1">
          {alerts.map((a, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center gap-2 text-sm p-2 rounded-lg",
                a.severity === "critical"
                  ? "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300 border border-red-300"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300"
              )}
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {a.message}
            </div>
          ))}
        </div>
      )}

      {/* Form Section */}
      {section && <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {SECTION_ICONS[section.id]}
            {section.title}
          </CardTitle>
          {section.description && <p className="text-sm text-muted-foreground">{section.description}</p>}
        </CardHeader>
        <CardContent className="space-y-4">
          {section.fields.map((field) => (
            <FormField
              key={field.id}
              field={field}
              value={formData[field.id]}
              signatureData={signatureData}
              onChange={(val) => updateField(field.id, val, field)}
              onSignature={setSignatureData}
            />
          ))}
        </CardContent>
      </Card>}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentSection((p) => Math.max(0, p - 1))}
          disabled={currentSection === 0}
        >
          Anterior
        </Button>

        {isLast ? (
          <Button onClick={handleSubmit} disabled={!canProceed}>
            <Send className="w-4 h-4 mr-1" />
            Enviar Formulario
          </Button>
        ) : (
          <Button onClick={() => setCurrentSection((p) => p + 1)}>
            Siguiente <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Form Field Renderer ─────────────────────────────────────────────────────
function FormField({
  field,
  value,
  signatureData,
  onChange,
  onSignature,
}: {
  field: IntakeFormField;
  value: unknown;
  signatureData: string;
  onChange: (value: unknown) => void;
  onSignature: (data: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium flex items-center gap-1">
        {field.label}
        {field.required && <span className="text-red-500">*</span>}
        {field.triggerAlert && <AlertTriangle className="w-3 h-3 text-amber-500" />}
      </label>
      {field.helpText && <p className="text-xs text-muted-foreground">{field.helpText}</p>}

      {field.type === "text" && (
        <Input
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
        />
      )}

      {field.type === "textarea" && (
        <textarea
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={3}
          className="w-full border rounded-lg p-2 text-sm bg-background resize-y focus:outline-primary"
        />
      )}

      {field.type === "date" && (
        <Input
          type="date"
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {field.type === "checkbox" && (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-sm">Sí</span>
        </label>
      )}

      {field.type === "select" && field.options && (
        <select
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm bg-background"
        >
          <option value="">Seleccionar...</option>
          {field.options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )}

      {field.type === "radio" && field.options && (
        <div className="space-y-1">
          {field.options.map((opt) => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={field.id}
                checked={value === opt}
                onChange={() => onChange(opt)}
                className="w-4 h-4"
              />
              <span className="text-sm">{opt}</span>
            </label>
          ))}
        </div>
      )}

      {field.type === "signature" && (
        <div className="space-y-2">
          <div className="border-2 border-dashed rounded-lg p-4 h-32 flex items-center justify-center bg-muted/20 cursor-crosshair relative">
            {signatureData ? (
              <img src={signatureData} alt="Firma" className="max-h-full" />
            ) : (
              <p className="text-sm text-muted-foreground">Toque o haga clic aquí para firmar</p>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            La firma digital tiene validez legal equivalente a la firma manuscrita.
          </p>
        </div>
      )}
    </div>
  );
}
