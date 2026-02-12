"use client";

import { useState, useRef, useEffect } from "react";
import {
  Dialog, DialogContent, DialogTitle,
  DialogDescription, Button, Input, Label, Textarea,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Badge, ScrollArea, Tabs, TabsList, TabsTrigger, TabsContent,
  Switch
} from "@red-salud/ui";
import {
  Plus, GripVertical, Save, Trash2, Settings,
  Type, List, CheckSquare, Circle, Hash, Calendar,
  AlignLeft, Activity, Pill, Layout, Info, Eye,
  ArrowLeft, PanelsTopLeft
} from "lucide-react";
import { StructuredTemplate, StructuredTemplateField } from "@/lib/templates/structured-templates";
import { cn } from "@red-salud/core/utils";

interface CustomTemplateCreatorProps {
  open?: boolean;
  onClose: () => void;
  onSave: (template: StructuredTemplate) => void;
  isPage?: boolean;
}

type FieldType = StructuredTemplateField['type'];

interface FieldTypeConfig {
  type: FieldType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const FIELD_TYPES: FieldTypeConfig[] = [
  { type: 'header', label: 'Título de Sección', icon: Layout, description: 'Divisor de secciones' },
  { type: 'info', label: 'Texto Informativo', icon: Info, description: 'Instrucciones o notas estáticas' },
  { type: 'textarea', label: 'Área de Texto', icon: AlignLeft, description: 'Texto largo en varias líneas' },
  { type: 'input', label: 'Texto Corto', icon: Type, description: 'Una sola línea de texto' },
  { type: 'number', label: 'Número', icon: Hash, description: 'Valor numérico' },
  { type: 'date', label: 'Fecha', icon: Calendar, description: 'Selector de fecha' },
  { type: 'select', label: 'Selector', icon: List, description: 'Menú desplegable simple' },
  { type: 'radio', label: 'Selección Única', icon: Circle, description: 'Opciones de radio button' },
  { type: 'checkbox', label: 'Casillas', icon: CheckSquare, description: 'Selección múltiple' },
  { type: 'vitals', label: 'Signos Vitales', icon: Activity, description: 'Panel predefinido de signos' },
  { type: 'medications', label: 'Medicamentos', icon: Pill, description: 'Buscador de fármacos' },
];

export function CustomTemplateCreator({
  open,
  onClose,
  onSave,
  isPage = false,
}: CustomTemplateCreatorProps) {
  // Template Metadata
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [templateCategory, setTemplateCategory] = useState("custom");
  const [templateSpecialty, setTemplateSpecialty] = useState("");
  const [templateTags, setTemplateTags] = useState("");

  // Fields State
  const [fields, setFields] = useState<StructuredTemplateField[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("builder");

  const fieldCounterRef = useRef(0);
  const templateIdRef = useRef<string | null>(null);

  // Initialize template ID lazily on first access
  const getTemplateId = () => {
    if (!templateIdRef.current) {
      templateIdRef.current = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    return templateIdRef.current;
  };

  // Focus on new field when added
  useEffect(() => {
    if (selectedFieldId) {
      // Logic to scroll to field could go here
    }
  }, [selectedFieldId]);

  const addField = (type: FieldType) => {
    const id = `field_${++fieldCounterRef.current}`;
    const newField: StructuredTemplateField = {
      id,
      label: type === 'header' ? 'Nueva Sección' : type === 'info' ? 'Información' : 'Nuevo Campo',
      type,
      placeholder: '',
      required: false,
      width: 'full',
      rows: 3,
      options: ['Opción 1', 'Opción 2'], // Default for select/radio
    };

    setFields([...fields, newField]);
    setSelectedFieldId(id);
    setActiveTab('properties'); // Switch to properties tab immediately
  };

  const updateField = (id: string, overrides: Partial<StructuredTemplateField>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...overrides } : f));
  };

  const removeField = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFields(fields.filter(f => f.id !== id));
    if (selectedFieldId === id) setSelectedFieldId(null);
  };

  const moveField = (index: number, direction: 'up' | 'down', e?: React.MouseEvent) => {
    e?.stopPropagation();
    const newFields = [...fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= fields.length) return;
    const currentField = newFields[index];
    const targetField = newFields[targetIndex];

    if (!currentField || !targetField) return;

    newFields[index] = targetField;
    newFields[targetIndex] = currentField;
    setFields(newFields);
  };

  const handleSave = () => {
    if (!templateName || fields.length === 0) return;

    const template: StructuredTemplate = {
      id: getTemplateId(),
      name: templateName,
      description: templateDescription,
      category: templateCategory as StructuredTemplate['category'],
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
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setTemplateName("");
    setTemplateDescription("");
    setFields([]);
    setSelectedFieldId(null);
  };

  const selectedField = fields.find(f => f.id === selectedFieldId);

  const content = (
    <div className={cn(
      "flex-1 flex flex-col overflow-hidden bg-gray-50/50",
      isPage ? "h-screen" : "h-[92vh]"
    )}>
      {/* Top Professional Header (Only for Page Mode) */}
      {isPage && (
        <div className="bg-white border-b px-8 py-3 flex items-center justify-between sticky top-0 z-[60] shadow-sm shrink-0 h-16">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full hover:bg-gray-100 h-10 w-10 transition-all active:scale-90 shrink-0"
            >
              <ArrowLeft className="h-6 w-6 text-gray-600" />
            </Button>

            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 text-white p-1 rounded-md shadow-sm">
                  <PanelsTopLeft className="h-4 w-4" />
                </div>
                <h1 className="text-lg font-extrabold text-gray-900 tracking-tight">Nuevo Template Clínico</h1>
                <span className="text-gray-300 mx-1">|</span>
                <p className="text-sm text-gray-500 font-medium">Diseña una estructura personalizada para tus consultas</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl px-4 h-10 font-bold text-sm"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={!templateName || fields.length === 0}
              className="bg-gray-900 hover:bg-black text-white rounded-xl px-6 h-10 font-bold text-sm shadow-lg shadow-gray-200 transition-all active:scale-95"
            >
              <Save className="h-4 w-4 mr-2" />
              Guardar Template
            </Button>
          </div>
        </div>
      )}

      {/* Dialog Header (Modal only) */}
      {!isPage && (
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-gray-800">
              <span className="bg-blue-600 text-white p-1.5 rounded-lg">
                <Layout className="h-5 w-5" />
              </span>
              Constructor de Templates
            </DialogTitle>
            <DialogDescription className="text-gray-500 text-sm mt-1">
              Diseña plantillas clínicas personalizadas arrastrando y configurando campos.
            </DialogDescription>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose} className="border-gray-200 text-gray-600">
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={!templateName || fields.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              <Save className="h-4 w-4 mr-2" />
              Guardar Template
            </Button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR: Tools & Properties */}
        <div className="w-[380px] lg:w-[420px] bg-white border-r flex flex-col shrink-0 z-10 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b shrink-0">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="metadata" onClick={() => setSelectedFieldId(null)}>General</TabsTrigger>
                <TabsTrigger value="builder" onClick={() => setSelectedFieldId(null)}>Campos</TabsTrigger>
                <TabsTrigger value="properties" disabled={!selectedField}>Propiedades</TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-5">
                {/* TAB: GENERAL METADATA */}
                <TabsContent value="metadata" className="m-0 space-y-6 animate-in slide-in-from-left-2 duration-200">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Nombre del Template <span className="text-red-500">*</span></Label>
                      <Input
                        value={templateName}
                        onChange={e => setTemplateName(e.target.value)}
                        placeholder="Ej: Consulta Cardiología..."
                        className="font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Descripción</Label>
                      <Textarea
                        value={templateDescription}
                        onChange={e => setTemplateDescription(e.target.value)}
                        placeholder="Breve descripción del propósito..."
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Categoría</Label>
                        <Select value={templateCategory} onValueChange={setTemplateCategory}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="z-[200]">
                            <SelectItem value="custom">Personalizado</SelectItem>
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="especialidad">Especialidad</SelectItem>
                            <SelectItem value="emergencia">Emergencia</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Especialidad</Label>
                        <Input
                          value={templateSpecialty}
                          onChange={e => setTemplateSpecialty(e.target.value)}
                          placeholder="Opcional"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Etiquetas</Label>
                      <Input
                        value={templateTags}
                        onChange={e => setTemplateTags(e.target.value)}
                        placeholder="Separadas por coma..."
                      />
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-700">
                    <h4 className="font-semibold mb-1 flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Consejo
                    </h4>
                    Configura primero los datos generales y luego ve a la pestaña &quot;Campos&quot; para construir tu formulario.
                  </div>
                </TabsContent>

                {/* TAB: BUILDER (TOOLBOX) */}
                <TabsContent value="builder" className="m-0 space-y-5 animate-in slide-in-from-left-2 duration-200">
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Estructura</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {FIELD_TYPES.filter(t => ['header', 'info'].includes(t.type)).map(type => (
                        <button
                          key={type.type}
                          onClick={() => addField(type.type)}
                          className="flex flex-col items-center justify-center p-3 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center gap-2 group bg-white shadow-sm"
                        >
                          <type.icon className="h-6 w-6 text-gray-500 group-hover:text-blue-600" />
                          <span className="text-xs font-medium text-gray-700 group-hover:text-blue-700">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Campos de Texto</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {FIELD_TYPES.filter(t => ['input', 'textarea', 'number', 'date'].includes(t.type)).map(type => (
                        <button
                          key={type.type}
                          onClick={() => addField(type.type)}
                          className="flex flex-col items-center justify-center p-3 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center gap-2 group bg-white shadow-sm"
                        >
                          <type.icon className="h-6 w-6 text-gray-500 group-hover:text-blue-600" />
                          <span className="text-xs font-medium text-gray-700 group-hover:text-blue-700">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Selección</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {FIELD_TYPES.filter(t => ['select', 'radio', 'checkbox'].includes(t.type)).map(type => (
                        <button
                          key={type.type}
                          onClick={() => addField(type.type)}
                          className="flex flex-col items-center justify-center p-3 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center gap-2 group bg-white shadow-sm"
                        >
                          <type.icon className="h-6 w-6 text-gray-500 group-hover:text-blue-600" />
                          <span className="text-xs font-medium text-gray-700 group-hover:text-blue-700">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Clínico</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {FIELD_TYPES.filter(t => ['vitals', 'medications'].includes(t.type)).map(type => (
                        <button
                          key={type.type}
                          onClick={() => addField(type.type)}
                          className="flex flex-col items-center justify-center p-3 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center gap-2 group bg-white shadow-sm"
                        >
                          <type.icon className="h-6 w-6 text-gray-500 group-hover:text-blue-600" />
                          <span className="text-xs font-medium text-gray-700 group-hover:text-blue-700">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* TAB: PROPERTIES */}
                <TabsContent value="properties" className="m-0 space-y-5 animate-in slide-in-from-right-2 duration-200">
                  {selectedField ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between pb-2 border-b">
                        <span className="text-sm font-semibold text-gray-500">
                          Editando: {FIELD_TYPES.find(t => t.type === selectedField.type)?.label}
                        </span>
                        <Button
                          size="sm" variant="ghost" className="h-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={(e) => removeField(selectedField.id, e)}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" /> Eliminar
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <Label>Etiqueta del Campo</Label>
                        <Input
                          value={selectedField.label}
                          onChange={e => updateField(selectedField.id, { label: e.target.value })}
                        />
                      </div>

                      {['textarea', 'input', 'number'].includes(selectedField.type) && (
                        <div className="space-y-3">
                          <Label>Placeholder</Label>
                          <Input
                            value={selectedField.placeholder || ''}
                            onChange={e => updateField(selectedField.id, { placeholder: e.target.value })}
                            placeholder="Texto de ayuda..."
                          />
                        </div>
                      )}
                      {['header', 'info'].includes(selectedField.type) && (
                        <div className="space-y-3">
                          <Label>Contenido / Subtítulo</Label>
                          <Input
                            value={selectedField.placeholder || ''}
                            onChange={e => updateField(selectedField.id, { placeholder: e.target.value })}
                            placeholder="Texto adicional..."
                          />
                        </div>
                      )}

                      {['select', 'radio', 'checkbox'].includes(selectedField.type) && (
                        <div className="space-y-3">
                          <Label>Opciones (una por línea)</Label>
                          <Textarea
                            value={selectedField.options?.join('\n') || ''}
                            onChange={e => updateField(selectedField.id, { options: e.target.value.split('\n') })}
                            rows={5}
                          />
                        </div>
                      )}

                      {/* Layout Control */}
                      {!['header'].includes(selectedField.type) && (
                        <div className="space-y-3">
                          <Label>Ancho del Campo</Label>
                          <div className="flex bg-gray-100 p-1 rounded-lg">
                            {(['full', 'half', 'third'] as const).map((w) => (
                              <button
                                key={w}
                                onClick={() => updateField(selectedField.id, { width: w })}
                                className={cn(
                                  "flex-1 py-1.5 text-xs font-medium rounded-md transition-all",
                                  selectedField.width === w || (!selectedField.width && w === 'full')
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                                )}
                              >
                                {w === 'full' ? '100%' : w === 'half' ? '50%' : '33%'}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Toggles */}
                      {!['header', 'info'].includes(selectedField.type) && (
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-white">
                          <Label className="cursor-pointer">Campo Requerido</Label>
                          <Switch
                            checked={selectedField.required}
                            onCheckedChange={c => updateField(selectedField.id, { required: c })}
                          />
                        </div>
                      )}
                      {selectedField.type === 'textarea' && (
                        <div className="space-y-3">
                          <Label>Filas: {selectedField.rows || 3}</Label>
                          <input
                            type="range" min="1" max="10" step="1"
                            value={selectedField.rows || 3}
                            onChange={e => updateField(selectedField.id, { rows: parseInt(e.target.value) })}
                            className="w-full"
                          />
                        </div>
                      )}

                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Selecciona un campo para editar sus propiedades</p>
                    </div>
                  )}
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>
        </div>

        {/* RIGHT PREVIEW AREA */}
        <div className="flex-1 bg-gray-50/50 flex flex-col min-w-0 overflow-hidden">
          <div className="h-14 border-b bg-white flex items-center justify-between px-6 shrink-0">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Vista Previa del Formulario</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="bg-gray-100 px-2 py-0.5 rounded border">
                {fields.length} campos
              </span>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-8 lg:p-12">
              <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl shadow-blue-900/5 border border-gray-200 min-h-[600px] flex flex-col transition-all duration-300">
                {/* Form Header Preview */}
                <div className="px-8 py-10 border-b bg-gray-50/50 rounded-t-2xl">
                  <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{templateName || "Nombre del Template"}</h2>
                  <p className="text-gray-500 mt-2 text-lg">{templateDescription || "Describe el propósito de esta plantilla..."}</p>
                  {templateTags && (
                    <div className="flex gap-2 mt-5">
                      {templateTags.split(',').map((tag, i) => (
                        <Badge key={i} variant="secondary" className="px-3 py-1 bg-blue-50 text-blue-700 border-blue-100">{tag}</Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Fields Canvas */}
                <div className="p-8 lg:p-10 space-y-6">
                  {fields.length === 0 ? (
                    <div className="border-2 border-dashed border-gray-200 rounded-2xl p-20 text-center text-gray-400">
                      <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Layout className="h-10 w-10 opacity-30 text-gray-900" />
                      </div>
                      <p className="text-lg font-medium text-gray-600">El formulario está vacío.</p>
                      <p className="text-sm">Comienza agregando campos desde el panel izquierdo.</p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap -mx-3">
                      {fields.map((field, index) => {
                        const widthClass = field.width === 'half' ? 'w-1/2' : field.width === 'third' ? 'w-1/3' : 'w-full';
                        const isSelected = selectedFieldId === field.id;

                        return (
                          <div
                            key={field.id}
                            className={cn(
                              "px-3 mb-6 relative group transition-all duration-200",
                              widthClass
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFieldId(field.id);
                              setActiveTab('properties');
                            }}
                          >
                            <div className={cn(
                              "relative p-5 rounded-2xl border-2 transition-all cursor-pointer shadow-sm hover:shadow-md",
                              isSelected
                                ? "border-blue-500 bg-blue-50/40 ring-4 ring-blue-500/10"
                                : "border-transparent bg-white hover:border-gray-200"
                            )}>
                              {/* Edit Controls */}
                              <div className={cn(
                                "absolute -right-3 -top-3 flex gap-2 bg-white shadow-lg border border-gray-100 rounded-xl p-1 z-10 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100",
                                isSelected && "opacity-100 scale-100"
                              )}>
                                <button
                                  onClick={(e) => moveField(index, 'up', e)}
                                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                                >
                                  <GripVertical className="h-4 w-4 rotate-0" />
                                </button>
                                <button
                                  onClick={(e) => removeField(field.id, e)}
                                  className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg text-gray-500 transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>

                              {/* Field Renderer */}
                              {field.type === 'header' ? (
                                <div className="mt-2 mb-1 pb-3 border-b border-gray-100">
                                  <h3 className="text-xl font-bold text-gray-800 tracking-tight">{field.label}</h3>
                                  {field.placeholder && <p className="text-sm text-gray-500 mt-1">{field.placeholder}</p>}
                                </div>
                              ) : field.type === 'info' ? (
                                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800 flex gap-3">
                                  <Info className="h-5 w-5 shrink-0 mt-0.5 text-blue-600" />
                                  <div>
                                    <p className="font-bold">{field.label}</p>
                                    <p className="opacity-80 mt-1">{field.placeholder}</p>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-2 pointer-events-none">
                                  <Label className={cn("text-sm font-semibold text-gray-700 flex items-center gap-1", field.required && "after:content-['*'] after:text-red-500")}>
                                    {field.label}
                                  </Label>

                                  {field.type === 'textarea' && (
                                    <div className="border border-gray-200 rounded-xl bg-gray-50/50 w-full" style={{ height: `${(field.rows || 3) * 24}px` }} />
                                  )}
                                  {['input', 'number', 'date'].includes(field.type) && (
                                    <div className="border border-gray-200 rounded-xl bg-gray-50/50 h-11 w-full" />
                                  )}
                                  {field.type === 'select' && (
                                    <div className="border border-gray-200 rounded-xl bg-gray-50/50 h-11 w-full flex items-center justify-between px-4 text-gray-400 text-sm italic">
                                      <span>Seleccionar opción...</span>
                                      <Plus className="h-4 w-4 opacity-30" />
                                    </div>
                                  )}
                                  {(field.type === 'radio' || field.type === 'checkbox') && (
                                    <div className="space-y-2 pt-1">
                                      {field.options?.map((opt, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                          <div className={cn(
                                            "h-5 w-5 border-2 border-gray-200 rounded-md bg-white",
                                            field.type === 'radio' && "rounded-full"
                                          )} />
                                          <span className="text-sm text-gray-600">{opt}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  {field.type === 'vitals' && (
                                    <div className="grid grid-cols-2 gap-3 bg-gray-50/50 p-4 rounded-xl border border-gray-100 mt-2">
                                      <div className="text-xs font-medium text-gray-400 flex justify-between border-b pb-2"><span>Presión Arterial:</span> <span>---/---</span></div>
                                      <div className="text-xs font-medium text-gray-400 flex justify-between border-b pb-2"><span>Frc. Cardíaca:</span> <span>--- bpm</span></div>
                                      <div className="text-xs font-medium text-gray-400 flex justify-between"><span>Temperatura:</span> <span>--- °C</span></div>
                                      <div className="text-xs font-medium text-gray-400 flex justify-between"><span>Saturación:</span> <span>--- %</span></div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {field.helpText && !['info', 'header'].includes(field.type) && (
                                <p className="text-[11px] text-gray-400 mt-2 italic">{field.helpText}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );

  if (isPage) return <div className="fixed inset-0 z-[100] bg-white overflow-hidden">{content}</div>;

  return (
    <Dialog open={open ?? false} onOpenChange={onClose}>
      <DialogContent className="!max-w-[95vw] !w-full !h-[92vh] !p-0 !flex !flex-col !overflow-hidden bg-gray-50/50 !fixed !top-[50%] !left-[50%] !translate-x-[-50%] !translate-y-[-50%] !z-[9999] shadow-2xl border-0 rounded-2xl">
        {content}
      </DialogContent>
    </Dialog>
  );
}
