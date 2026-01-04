"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Search,
  FileText,
  Stethoscope,
  Activity,
  AlertCircle,
  Heart,
  Plus,
  Eye,
  Sparkles,
  CheckCircle,
  Zap,
  Baby,
  User,
  Scan,
  Ear,
  Bone,
  Brain,
  Wind,
  Droplet,
  Bug,
  Scissors,
  ClipboardCheck,
  UserPlus,
  AlertTriangle,
} from "lucide-react";
import { StructuredTemplate } from "@/lib/templates/structured-templates";
import { getAllTemplates } from "@/lib/templates/extended-templates";
import { CustomTemplateCreator } from "./custom-template-creator";

interface StructuredTemplateMarketplaceProps {
  open: boolean;
  onClose: () => void;
  onSelectTemplate: (template: StructuredTemplate) => void;
}

const iconMap: Record<string, any> = {
  FileText,
  Stethoscope,
  Activity,
  AlertCircle,
  Heart,
  Zap,
  Baby,
  User,
  Scan,
  Eye,
  Ear,
  Bone,
  Brain,
  Wind,
  Droplet,
  Bug,
  Scissors,
  ClipboardCheck,
  UserPlus,
  AlertTriangle,
};

export function StructuredTemplateMarketplace({
  open,
  onClose,
  onSelectTemplate,
}: StructuredTemplateMarketplaceProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [previewTemplate, setPreviewTemplate] = useState<StructuredTemplate | null>(null);
  const [showCustomCreator, setShowCustomCreator] = useState(false);
  const [customTemplates, setCustomTemplates] = useState<StructuredTemplate[]>([]);
  const [allTemplates, setAllTemplates] = useState<StructuredTemplate[]>([]);

  useEffect(() => {
    // Cargar templates del sistema y personalizados
    const systemTemplates = getAllTemplates();
    const savedCustomTemplates = loadCustomTemplates();
    setCustomTemplates(savedCustomTemplates);
    setAllTemplates([...systemTemplates, ...savedCustomTemplates]);
  }, []);

  const loadCustomTemplates = (): StructuredTemplate[] => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('customTemplates');
    return saved ? JSON.parse(saved) : [];
  };

  const saveCustomTemplate = (template: StructuredTemplate) => {
    const updated = [...customTemplates, template];
    setCustomTemplates(updated);
    setAllTemplates([...getAllTemplates(), ...updated]);
    localStorage.setItem('customTemplates', JSON.stringify(updated));
  };

  const filteredTemplates = allTemplates.filter((template) => {
    const matchesSearch =
      searchQuery === "" ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (template.specialty && template.specialty.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "all" || template.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleUseTemplate = (template: StructuredTemplate) => {
    onSelectTemplate(template);
    onClose();
  };

  const IconComponent = (iconName: string) => {
    const Icon = iconMap[iconName] || FileText;
    return Icon;
  };

  const categories = [
    { value: 'all', label: 'Todos' },
    { value: 'general', label: 'General' },
    { value: 'especialidad', label: 'Especialidad' },
    { value: 'emergencia', label: 'Emergencia' },
    { value: 'control', label: 'Control' },
    { value: 'pediatria', label: 'Pediatría' },
    { value: 'ginecologia', label: 'Ginecología' },
    { value: 'quirurgico', label: 'Quirúrgico' },
    { value: 'custom', label: 'Personalizados' },
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="w-[98vw] max-w-[98vw] h-[95vh] p-0 gap-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="text-xl flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              Templates Estructurados
            </DialogTitle>
            <DialogDescription>
              Selecciona un template con campos organizados para tu consulta
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search and Filters */}
            <div className="px-6 py-4 border-b space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                {categories.map((cat) => (
                  <Button
                    key={cat.value}
                    variant={selectedCategory === cat.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat.value)}
                  >
                    {cat.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Templates Grid */}
            <ScrollArea className="flex-1 px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                {filteredTemplates.map((template) => {
                  const Icon = IconComponent(template.icon);
                  
                  return (
                    <div
                      key={template.id}
                      className="group relative border rounded-lg p-4 hover:shadow-lg transition-all bg-white"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`h-12 w-12 rounded-lg flex items-center justify-center bg-${template.color}-100`}>
                            <Icon className={`h-6 w-6 text-${template.color}-600`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm text-gray-900">
                              {template.name}
                            </h3>
                            <p className="text-xs text-gray-500">
                              {template.fields.length} campos
                              {template.specialty && ` • ${template.specialty}`}
                            </p>
                          </div>
                        </div>
                        {template.isCustom && (
                          <Badge variant="secondary" className="text-xs">
                            Personalizado
                          </Badge>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-xs text-gray-600 mb-3">
                        {template.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {template.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        <Badge variant="outline" className="text-xs border-purple-300 text-purple-600">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Estructurado
                        </Badge>
                      </div>

                      {/* Fields Preview */}
                      <div className="mb-3 p-2 bg-gray-50 rounded text-xs space-y-1">
                        <p className="font-semibold text-gray-700">Campos incluidos:</p>
                        {template.fields.slice(0, 3).map((field) => (
                          <div key={field.id} className="flex items-center gap-1 text-gray-600">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span>{field.label}</span>
                            {field.required && <span className="text-red-500">*</span>}
                          </div>
                        ))}
                        {template.fields.length > 3 && (
                          <p className="text-gray-500">
                            +{template.fields.length - 3} campos más...
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 h-8"
                          onClick={() => setPreviewTemplate(template)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Vista Previa
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 h-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          onClick={() => handleUseTemplate(template)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Usar
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredTemplates.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-1">No se encontraron templates</p>
                  <p className="text-xs text-gray-500">
                    Intenta con otros términos de búsqueda
                  </p>
                </div>
              )}
            </ScrollArea>

            {/* Footer */}
            <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <FileText className="h-4 w-4" />
                <span>{filteredTemplates.length} templates disponibles</span>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowCustomCreator(true)}
                  className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:from-green-100 hover:to-emerald-100"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Template
                </Button>
                <Button variant="outline" size="sm" onClick={onClose}>
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="w-[90vw] max-w-[90vw] h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {previewTemplate && (
                <>
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center bg-${previewTemplate.color}-100`}>
                    {(() => {
                      const Icon = IconComponent(previewTemplate.icon);
                      return <Icon className={`h-5 w-5 text-${previewTemplate.color}-600`} />;
                    })()}
                  </div>
                  <div>
                    <div className="font-semibold">{previewTemplate.name}</div>
                    <div className="text-sm text-gray-500 font-normal">
                      {previewTemplate.description}
                    </div>
                  </div>
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {previewTemplate && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Template Info */}
              <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{previewTemplate.fields.length}</p>
                  <p className="text-xs text-gray-600">Campos Totales</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {previewTemplate.fields.filter(f => f.required).length}
                  </p>
                  <p className="text-xs text-gray-600">Campos Requeridos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {previewTemplate.fields.filter(f => f.type === 'vitals' || f.type === 'medications').length}
                  </p>
                  <p className="text-xs text-gray-600">Campos Especiales</p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {previewTemplate.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
                {previewTemplate.specialty && (
                  <Badge variant="outline" className="border-blue-300 text-blue-700">
                    {previewTemplate.specialty}
                  </Badge>
                )}
              </div>

              {/* Fields Preview */}
              <ScrollArea className="flex-1 border rounded-lg bg-white">
                <div className="p-6 space-y-6">
                  {previewTemplate.fields.map((field, index) => (
                    <div key={field.id} className="space-y-2 pb-4 border-b last:border-b-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold">
                              {index + 1}
                            </span>
                            <p className="text-sm font-semibold text-gray-900">
                              {field.label}
                            </p>
                            {field.required && (
                              <Badge variant="destructive" className="text-xs h-5">
                                Requerido
                              </Badge>
                            )}
                          </div>
                          {field.placeholder && (
                            <p className="text-xs text-gray-500 italic ml-8">
                              Ejemplo: {field.placeholder}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          {field.type === 'vitals' && (
                            <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                              <Activity className="h-3 w-3 mr-1" />
                              Signos Vitales
                            </Badge>
                          )}
                          {field.type === 'medications' && (
                            <Badge variant="outline" className="text-xs border-purple-300 text-purple-700">
                              <Sparkles className="h-3 w-3 mr-1" />
                              Autocompletado
                            </Badge>
                          )}
                          {field.type === 'textarea' && (
                            <Badge variant="outline" className="text-xs border-gray-300 text-gray-700">
                              Texto Largo
                            </Badge>
                          )}
                          {field.type === 'input' && (
                            <Badge variant="outline" className="text-xs border-gray-300 text-gray-700">
                              Texto Corto
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Visual representation */}
                      <div className="ml-8 mt-2">
                        {field.type === 'textarea' && (
                          <div className="border rounded-md p-3 bg-gray-50 min-h-[80px] text-xs text-gray-400">
                            {field.placeholder || 'Área de texto...'}
                          </div>
                        )}
                        {field.type === 'input' && (
                          <div className="border rounded-md p-2 bg-gray-50 text-xs text-gray-400">
                            {field.placeholder || 'Campo de texto...'}
                          </div>
                        )}
                        {field.type === 'select' && (
                          <div className="border rounded-md p-2 bg-gray-50 text-xs text-gray-400">
                            Selector de opciones
                          </div>
                        )}
                        {field.type === 'checkbox' && (
                          <div className="border rounded-md p-2 bg-gray-50 text-xs text-gray-400">
                            Casilla de verificación
                          </div>
                        )}
                        {field.type === 'vitals' && (
                          <div className="grid grid-cols-3 gap-2">
                            <div className="border rounded-md p-2 bg-green-50 text-xs">
                              <p className="font-semibold text-green-700">PA</p>
                              <p className="text-gray-500">120/80 mmHg</p>
                            </div>
                            <div className="border rounded-md p-2 bg-green-50 text-xs">
                              <p className="font-semibold text-green-700">FC</p>
                              <p className="text-gray-500">72 lpm</p>
                            </div>
                            <div className="border rounded-md p-2 bg-green-50 text-xs">
                              <p className="font-semibold text-green-700">Temp</p>
                              <p className="text-gray-500">36.5°C</p>
                            </div>
                          </div>
                        )}
                        {field.type === 'medications' && (
                          <div className="border rounded-md p-2 bg-purple-50 text-xs">
                            <div className="flex items-center gap-2 text-purple-700">
                              <Sparkles className="h-3 w-3" />
                              <span>Búsqueda inteligente de medicamentos</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setPreviewTemplate(null)}
                >
                  Cerrar
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={() => {
                    handleUseTemplate(previewTemplate);
                    setPreviewTemplate(null);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Usar este Template
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Custom Template Creator */}
      <CustomTemplateCreator
        open={showCustomCreator}
        onClose={() => setShowCustomCreator(false)}
        onSave={saveCustomTemplate}
      />
    </>
  );
}
