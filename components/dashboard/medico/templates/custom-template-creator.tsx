"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  X, 
  GripVertical, 
  Save, 
  Trash2
} from "lucide-react";
import { StructuredTemplate, StructuredTemplateField } from "@/lib/templates/structured-templates";

interface CustomTemplateCreatorProps {
  open: boolean;
  onClose: () => void;
  onSave: (template: StructuredTemplate) => void;
}

export function CustomTemplateCreator({
  open,
  onClose,
  onSave,
}: CustomTemplateCreatorProps) {
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [templateCategory, setTemplateCategory] = useState("custom");
  const [templateSpecialty, setTemplateSpecialty] = useState("");
  const [templateTags, setTemplateTags] = useState("");
  const [fields, setFields] = useState<StructuredTemplateField[]>([]);
  const [currentField, setCurrentField] = useState({
    label: "",
    type: "textarea" as const,
    placeholder: "",
    required: false,
    rows: 3,
  });

  const addField = () => {
    if (!currentField.label) return;

    const newField: StructuredTemplateField = {
      id: `field_${Date.now()}`,
      label: currentField.label,
      type: currentField.type,
      placeholder: currentField.placeholder,
      required: currentField.required || false,
      rows: currentField.rows || 3,
    };

    setFields([...fields, newField]);
    setCurrentField({
      label: "",
      type: "textarea",
      placeholder: "",
      required: false,
      rows: 3,
    });
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const newFields = [...fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= fields.length) return;
    
    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
    setFields(newFields);
  };

  const handleSave = () => {
    if (!templateName || fields.length === 0) return;

    const template: StructuredTemplate = {
      id: `custom_${Date.now()}`,
      name: templateName,
      description: templateDescription,
      category: templateCategory as any,
      icon: 'FileText',
      color: 'blue',
      author: 'custom',
      tags: templateTags.split(',').map(t => t.trim()).filter(Boolean),
      specialty: templateSpecialty || undefined,
      fields,
      isCustom: true,
      createdAt: new Date().toISOString(),
    };

    onSave(template);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setTemplateName("");
    setTemplateDescription("");
    setTemplateCategory("custom");
    setTemplateTags("");
    setFields([]);
    setCurrentField({
      label: "",
      type: "textarea",
      placeholder: "",
      required: false,
      rows: 3,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <Plus className="h-5 w-5 text-white" />
            </div>
            Crear Template Personalizado
          </DialogTitle>
          <DialogDescription>
            Diseña tu propio template con los campos que necesites
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Template Info & Field Creator */}
          <div className="w-1/2 border-r flex flex-col">
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6">
                {/* Template Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm">Información del Template</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="templateName">Nombre del Template *</Label>
                    <Input
                      id="templateName"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="Ej: Consulta de Medicina Familiar"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="templateDescription">Descripción</Label>
                    <Textarea
                      id="templateDescription"
                      value={templateDescription}
                      onChange={(e) => setTemplateDescription(e.target.value)}
                      placeholder="Describe para qué sirve este template..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="templateCategory">Categoría</Label>
                    <Select value={templateCategory} onValueChange={setTemplateCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="custom">Personalizado</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="especialidad">Especialidad</SelectItem>
                        <SelectItem value="control">Control</SelectItem>
                        <SelectItem value="emergencia">Emergencia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="templateTags">Etiquetas (separadas por comas)</Label>
                    <Input
                      id="templateTags"
                      value={templateTags}
                      onChange={(e) => setTemplateTags(e.target.value)}
                      placeholder="Ej: medicina-familiar, consulta-rapida"
                    />
                  </div>
                </div>

                {/* Field Creator */}
                <div className="space-y-4 pt-6 border-t">
                  <h3 className="font-semibold text-sm">Agregar Campo</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fieldLabel">Nombre del Campo *</Label>
                    <Input
                      id="fieldLabel"
                      value={currentField.label}
                      onChange={(e) => setCurrentField({ ...currentField, label: e.target.value })}
                      placeholder="Ej: MOTIVO DE CONSULTA"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fieldType">Tipo de Campo</Label>
                    <Select 
                      value={currentField.type} 
                      onValueChange={(value) => setCurrentField({ ...currentField, type: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="textarea">Área de Texto</SelectItem>
                        <SelectItem value="input">Texto Corto</SelectItem>
                        <SelectItem value="vitals">Signos Vitales</SelectItem>
                        <SelectItem value="medications">Medicamentos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fieldPlaceholder">Placeholder (opcional)</Label>
                    <Input
                      id="fieldPlaceholder"
                      value={currentField.placeholder}
                      onChange={(e) => setCurrentField({ ...currentField, placeholder: e.target.value })}
                      placeholder="Texto de ayuda para el campo..."
                    />
                  </div>

                  {currentField.type === 'textarea' && (
                    <div className="space-y-2">
                      <Label htmlFor="fieldRows">Filas</Label>
                      <Input
                        id="fieldRows"
                        type="number"
                        min="1"
                        max="10"
                        value={currentField.rows}
                        onChange={(e) => setCurrentField({ ...currentField, rows: parseInt(e.target.value) })}
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="fieldRequired"
                      checked={currentField.required}
                      onChange={(e) => setCurrentField({ ...currentField, required: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="fieldRequired" className="cursor-pointer">
                      Campo requerido
                    </Label>
                  </div>

                  <Button onClick={addField} className="w-full" disabled={!currentField.label}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Campo
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* Right Panel - Preview */}
          <div className="w-1/2 flex flex-col">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h3 className="font-semibold text-sm">Vista Previa ({fields.length} campos)</h3>
            </div>
            
            <ScrollArea className="flex-1 p-6">
              {fields.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-sm">Agrega campos para ver la vista previa</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div
                      key={index}
                      className="group border rounded-lg p-3 bg-white hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex flex-col gap-1 mt-1">
                          <button
                            onClick={() => moveField(index, 'up')}
                            disabled={index === 0}
                            className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                          >
                            <GripVertical className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => moveField(index, 'down')}
                            disabled={index === fields.length - 1}
                            className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                          >
                            <GripVertical className="h-3 w-3" />
                          </button>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-sm">{field.label}</p>
                            {field.required && (
                              <Badge variant="destructive" className="text-xs h-5">
                                Requerido
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs h-5">
                              {field.type === 'textarea' ? 'Área de texto' :
                               field.type === 'input' ? 'Texto corto' :
                               field.type === 'vitals' ? 'Signos vitales' :
                               'Medicamentos'}
                            </Badge>
                          </div>
                          {field.placeholder && (
                            <p className="text-xs text-gray-500 italic">{field.placeholder}</p>
                          )}
                        </div>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeField(index)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {fields.length} campo{fields.length !== 1 ? 's' : ''} agregado{fields.length !== 1 ? 's' : ''}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              <X className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!templateName || fields.length === 0}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Guardar Template
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
