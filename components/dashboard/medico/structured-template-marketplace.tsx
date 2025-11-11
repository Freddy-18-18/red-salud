"use client";

import { useState } from "react";
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
} from "lucide-react";
import { STRUCTURED_TEMPLATES, StructuredTemplate } from "@/lib/templates/structured-templates";

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
};

export function StructuredTemplateMarketplace({
  open,
  onClose,
  onSelectTemplate,
}: StructuredTemplateMarketplaceProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [previewTemplate, setPreviewTemplate] = useState<StructuredTemplate | null>(null);

  const filteredTemplates = STRUCTURED_TEMPLATES.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

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

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl h-[85vh] p-0 gap-0">
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

              <div className="flex gap-2">
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("all")}
                >
                  Todos
                </Button>
                <Button
                  variant={selectedCategory === "general" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("general")}
                >
                  General
                </Button>
                <Button
                  variant={selectedCategory === "especialidad" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("especialidad")}
                >
                  Especialidad
                </Button>
                <Button
                  variant={selectedCategory === "emergencia" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("emergencia")}
                >
                  Emergencia
                </Button>
                <Button
                  variant={selectedCategory === "control" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("control")}
                >
                  Control
                </Button>
              </div>
            </div>

            {/* Templates Grid */}
            <ScrollArea className="flex-1 px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
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
                            </p>
                          </div>
                        </div>
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
              <Button variant="outline" size="sm" onClick={onClose}>
                Cerrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
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
              <ScrollArea className="flex-1 border rounded-lg bg-gray-50 p-4">
                <div className="space-y-4">
                  {previewTemplate.fields.map((field) => (
                    <div key={field.id} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-700">
                          {field.label}
                        </p>
                        {field.required && (
                          <Badge variant="destructive" className="text-xs h-5">
                            Requerido
                          </Badge>
                        )}
                        {field.type === 'vitals' && (
                          <Badge variant="outline" className="text-xs h-5">
                            Con validación
                          </Badge>
                        )}
                        {field.type === 'medications' && (
                          <Badge variant="outline" className="text-xs h-5">
                            Autocompletado
                          </Badge>
                        )}
                      </div>
                      {field.placeholder && (
                        <p className="text-xs text-gray-500 italic">
                          {field.placeholder}
                        </p>
                      )}
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
    </>
  );
}
