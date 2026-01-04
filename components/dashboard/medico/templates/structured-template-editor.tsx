"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { StructuredTemplate } from "@/lib/templates/structured-templates";
import { getAllTemplates } from "@/lib/templates/extended-templates";
import { MedicationInput } from "../inputs/medication-input";

interface VitalSign {
  value: string;
  unit: string;
  normalRange: { min: number; max: number };
  label: string;
}

interface StructuredTemplateEditorProps {
  template: StructuredTemplate | null;
  onChange: (content: string) => void;
  paciente: {
    edad: number | null;
    genero: string;
  };
  medications: string[];
  onMedicationsChange: (medications: string[]) => void;
}

export function StructuredTemplateEditor({
  template,
  onChange,
  paciente,
  medications,
  onMedicationsChange,
}: StructuredTemplateEditorProps) {
  // Usar template por defecto si no hay uno seleccionado
  const allTemplates = getAllTemplates();
  const activeTemplate = template || allTemplates[0];
  
  const [fields, setFields] = useState<Record<string, string>>({});

  // Si no hay template disponible, mostrar mensaje
  if (!activeTemplate) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">No hay templates disponibles. Por favor, selecciona un template.</p>
      </div>
    );
  }

  const [vitalSigns, setVitalSigns] = useState<Record<string, VitalSign>>({
    pa: {
      value: "",
      unit: "mmHg",
      normalRange: { min: 90, max: 140 },
      label: "PA",
    },
    fc: {
      value: "",
      unit: "lpm",
      normalRange: { min: 60, max: 100 },
      label: "FC",
    },
    fr: {
      value: "",
      unit: "rpm",
      normalRange: { min: 12, max: 20 },
      label: "FR",
    },
    temp: {
      value: "",
      unit: "°C",
      normalRange: { min: 36, max: 37.5 },
      label: "Temp",
    },
    satO2: {
      value: "",
      unit: "%",
      normalRange: { min: 95, max: 100 },
      label: "Sat O2",
    },
  });

  // Generar contenido del template dinámicamente
  useEffect(() => {
    let content = "";
    
    activeTemplate.fields.forEach((field) => {
      if (field.type === 'vitals') {
        content += `\n${field.label}:\n`;
        content += `- PA: ${vitalSigns.pa.value || "___"} mmHg\n`;
        content += `- FC: ${vitalSigns.fc.value || "___"} lpm\n`;
        content += `- FR: ${vitalSigns.fr.value || "___"} rpm\n`;
        content += `- Temp: ${vitalSigns.temp.value || "___"} °C\n`;
        content += `- Sat O2: ${vitalSigns.satO2.value || "___"} %\n`;
        if (fields.peso) content += `- Peso: ${fields.peso} kg\n`;
        if (fields.talla) content += `- Talla: ${fields.talla} cm\n`;
      } else if (field.type === 'medications') {
        content += `\n${field.label}:\n`;
        if (medications.length > 0) {
          medications.forEach((med, i) => {
            content += `${i + 1}. ${med}\n`;
          });
        } else {
          content += "[Sin medicamentos]\n";
        }
      } else {
        const value = fields[field.id] || "[Pendiente]";
        content += `\n${field.label}:\n${value}\n`;
      }
    });

    onChange(content.trim());
  }, [fields, vitalSigns, medications, activeTemplate, onChange]);

  const handleFieldChange = (field: string, value: string) => {
    setFields((prev) => ({ ...prev, [field]: value }));
  };

  const handleVitalSignChange = (key: string, value: string) => {
    // Solo permitir números y punto decimal
    const numericValue = value.replace(/[^0-9./]/g, "");
    
    setVitalSigns((prev) => ({
      ...prev,
      [key]: { ...prev[key], value: numericValue },
    }));
  };

  const getVitalSignStatus = (key: string): "normal" | "warning" | "danger" | null => {
    const vital = vitalSigns[key];
    if (!vital.value) return null;

    let numValue: number;
    
    // Para PA, tomar el valor sistólico (primer número)
    if (key === "pa") {
      const systolic = parseInt(vital.value.split("/")[0]);
      if (isNaN(systolic)) return null;
      numValue = systolic;
    } else {
      numValue = parseFloat(vital.value);
      if (isNaN(numValue)) return null;
    }

    if (numValue < vital.normalRange.min || numValue > vital.normalRange.max) {
      // Valores muy fuera de rango
      if (numValue < vital.normalRange.min * 0.8 || numValue > vital.normalRange.max * 1.2) {
        return "danger";
      }
      return "warning";
    }

    return "normal";
  };

  const getStatusIcon = (status: "normal" | "warning" | "danger" | null) => {
    if (!status) return null;
    
    switch (status) {
      case "normal":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "danger":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusColor = (status: "normal" | "warning" | "danger" | null) => {
    if (!status) return "border-gray-300";
    
    switch (status) {
      case "normal":
        return "border-green-500 bg-green-50";
      case "warning":
        return "border-yellow-500 bg-yellow-50";
      case "danger":
        return "border-red-500 bg-red-50";
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Template Info */}
      <div className="pb-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">{activeTemplate.name}</h2>
        <p className="text-sm text-gray-600">{activeTemplate.description}</p>
      </div>

      {/* Render fields dynamically */}
      {activeTemplate.fields.map((field) => {
        if (field.type === 'vitals') {
          return (
            <div key={field.id} className="space-y-4">
              <Label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* PA */}
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">Presión Arterial</Label>
                  <div className="relative">
                    <Input
                      value={vitalSigns.pa.value}
                      onChange={(e) => handleVitalSignChange("pa", e.target.value)}
                      placeholder="120/80"
                      className={`pr-16 ${getStatusColor(getVitalSignStatus("pa"))}`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      {getStatusIcon(getVitalSignStatus("pa"))}
                      <span className="text-xs text-gray-500">mmHg</span>
                    </div>
                  </div>
                  {getVitalSignStatus("pa") && (
                    <p className="text-xs text-gray-500">
                      Normal: {vitalSigns.pa.normalRange.min}-{vitalSigns.pa.normalRange.max} mmHg
                    </p>
                  )}
                </div>

                {/* FC */}
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">Frecuencia Cardíaca</Label>
                  <div className="relative">
                    <Input
                      value={vitalSigns.fc.value}
                      onChange={(e) => handleVitalSignChange("fc", e.target.value)}
                      placeholder="72"
                      type="number"
                      className={`pr-16 ${getStatusColor(getVitalSignStatus("fc"))}`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      {getStatusIcon(getVitalSignStatus("fc"))}
                      <span className="text-xs text-gray-500">lpm</span>
                    </div>
                  </div>
                  {getVitalSignStatus("fc") && (
                    <p className="text-xs text-gray-500">
                      Normal: {vitalSigns.fc.normalRange.min}-{vitalSigns.fc.normalRange.max} lpm
                    </p>
                  )}
                </div>

                {/* FR */}
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">Frecuencia Respiratoria</Label>
                  <div className="relative">
                    <Input
                      value={vitalSigns.fr.value}
                      onChange={(e) => handleVitalSignChange("fr", e.target.value)}
                      placeholder="16"
                      type="number"
                      className={`pr-16 ${getStatusColor(getVitalSignStatus("fr"))}`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      {getStatusIcon(getVitalSignStatus("fr"))}
                      <span className="text-xs text-gray-500">rpm</span>
                    </div>
                  </div>
                  {getVitalSignStatus("fr") && (
                    <p className="text-xs text-gray-500">
                      Normal: {vitalSigns.fr.normalRange.min}-{vitalSigns.fr.normalRange.max} rpm
                    </p>
                  )}
                </div>

                {/* Temperatura */}
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">Temperatura</Label>
                  <div className="relative">
                    <Input
                      value={vitalSigns.temp.value}
                      onChange={(e) => handleVitalSignChange("temp", e.target.value)}
                      placeholder="36.5"
                      type="number"
                      step="0.1"
                      className={`pr-16 ${getStatusColor(getVitalSignStatus("temp"))}`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      {getStatusIcon(getVitalSignStatus("temp"))}
                      <span className="text-xs text-gray-500">°C</span>
                    </div>
                  </div>
                  {getVitalSignStatus("temp") && (
                    <p className="text-xs text-gray-500">
                      Normal: {vitalSigns.temp.normalRange.min}-{vitalSigns.temp.normalRange.max} °C
                    </p>
                  )}
                </div>

                {/* Saturación O2 */}
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">Saturación O2</Label>
                  <div className="relative">
                    <Input
                      value={vitalSigns.satO2.value}
                      onChange={(e) => handleVitalSignChange("satO2", e.target.value)}
                      placeholder="98"
                      type="number"
                      className={`pr-16 ${getStatusColor(getVitalSignStatus("satO2"))}`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      {getStatusIcon(getVitalSignStatus("satO2"))}
                      <span className="text-xs text-gray-500">%</span>
                    </div>
                  </div>
                  {getVitalSignStatus("satO2") && (
                    <p className="text-xs text-gray-500">
                      Normal: {vitalSigns.satO2.normalRange.min}-{vitalSigns.satO2.normalRange.max} %
                    </p>
                  )}
                </div>

                {/* Peso y Talla (opcionales) */}
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">Peso (opcional)</Label>
                  <div className="relative">
                    <Input
                      value={fields.peso || ""}
                      onChange={(e) => handleFieldChange("peso", e.target.value.replace(/[^0-9.]/g, ""))}
                      placeholder="70"
                      type="number"
                      className="pr-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                      kg
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">Talla (opcional)</Label>
                  <div className="relative">
                    <Input
                      value={fields.talla || ""}
                      onChange={(e) => handleFieldChange("talla", e.target.value.replace(/[^0-9.]/g, ""))}
                      placeholder="170"
                      type="number"
                      className="pr-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                      cm
                    </span>
                  </div>
                </div>
              </div>

              {/* Alertas de signos vitales */}
              {Object.entries(vitalSigns).some(([key, _]) => getVitalSignStatus(key) === "danger") && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-900">Signos vitales fuera de rango</p>
                    <p className="text-xs text-red-700 mt-1">
                      Algunos signos vitales están significativamente fuera del rango normal. Considere evaluación inmediata.
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        }

        if (field.type === 'medications') {
          return (
            <div key={field.id} className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <MedicationInput
                medications={medications}
                onChange={onMedicationsChange}
              />
            </div>
          );
        }

        if (field.type === 'textarea') {
          return (
            <div key={field.id} className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <Textarea
                value={fields[field.id] || ""}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                className="resize-none border-0 border-b-2 border-gray-200 rounded-none focus:border-blue-500 focus:ring-0 bg-transparent"
                rows={field.rows || 3}
              />
            </div>
          );
        }

        if (field.type === 'input') {
          return (
            <div key={field.id} className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <Input
                value={fields[field.id] || ""}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                className="border-0 border-b-2 border-gray-200 rounded-none focus:border-blue-500 focus:ring-0 bg-transparent"
              />
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
