"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Star,
  FileText,
  Stethoscope,
  Activity,
  AlertCircle,
  Heart,
  Plus,
  Eye,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { OFFICIAL_TEMPLATES, MedicalTemplate, getFavoriteTemplates, toggleFavorite } from "@/lib/templates/medical-templates";

interface TemplateMarketplaceProps {
  open: boolean;
  onClose: () => void;
  onSelectTemplate: (content: string) => void;
  userId: string;
}

const iconMap: Record<string, any> = {
  FileText,
  Stethoscope,
  Activity,
  AlertCircle,
  Heart,
};

export function TemplateMarketplace({
  open,
  onClose,
  onSelectTemplate,
  userId,
}: TemplateMarketplaceProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [previewTemplate, setPreviewTemplate] = useState<MedicalTemplate | null>(null);
  const [templates, setTemplates] = useState<MedicalTemplate[]>(OFFICIAL_TEMPLATES);

  useEffect(() => {
    if (open) {
      const userFavorites = getFavoriteTemplates(userId);
      setFavorites(userFavorites);
    }
  }, [open, userId]);

  const handleToggleFavorite = (templateId: string) => {
    toggleFavorite(userId, templateId);
    const userFavorites = getFavoriteTemplates(userId);
    setFavorites(userFavorites);
  };

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "all" ||
      selectedCategory === "favorites" && favorites.includes(template.id) ||
      template.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleUseTemplate = (template: MedicalTemplate) => {
    onSelectTemplate(template.content);
    onClose();
  };

  const IconComponent = (iconName: string) => {
    const Icon = iconMap[iconName] || FileText;
    return Icon;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl h-[85vh] p-0 gap-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="text-xl flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              Marketplace de Templates
            </DialogTitle>
            <DialogDescription>
              Explora y usa templates médicos creados por RED-SALUD y la comunidad
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search and Filters */}
            <div className="px-6 py-4 border-b space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar templates por nombre, descripción o etiquetas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="all" className="text-xs">
                    Todos
                  </TabsTrigger>
                  <TabsTrigger value="favorites" className="text-xs">
                    <Star className="h-3 w-3 mr-1" />
                    Favoritos
                  </TabsTrigger>
                  <TabsTrigger value="general" className="text-xs">
                    General
                  </TabsTrigger>
                  <TabsTrigger value="especialidad" className="text-xs">
                    Especialidad
                  </TabsTrigger>
                  <TabsTrigger value="emergencia" className="text-xs">
                    Emergencia
                  </TabsTrigger>
                  <TabsTrigger value="control" className="text-xs">
                    Control
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Templates Grid */}
            <ScrollArea className="flex-1 px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                {filteredTemplates.map((template) => {
                  const Icon = IconComponent(template.icon);
                  const isFavorite = favorites.includes(template.id);
                  
                  return (
                    <div
                      key={template.id}
                      className="group relative border rounded-lg p-4 hover:shadow-lg transition-all bg-white"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-10 w-10 rounded-lg flex items-center justify-center bg-${template.color}-100`}
                          >
                            <Icon className={`h-5 w-5 text-${template.color}-600`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm text-gray-900 truncate">
                              {template.name}
                            </h3>
                            <p className="text-xs text-gray-500">
                              {template.author === 'red-salud' ? 'RED-SALUD' : template.authorName}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleToggleFavorite(template.id)}
                        >
                          <Star
                            className={`h-4 w-4 ${
                              isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
                            }`}
                          />
                        </Button>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                        {template.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {template.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {template.aiEnabled && (
                          <Badge variant="outline" className="text-xs border-purple-300 text-purple-600">
                            <Sparkles className="h-3 w-3 mr-1" />
                            IA
                          </Badge>
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

                      {/* Stats */}
                      {template.usageCount && (
                        <div className="mt-2 pt-2 border-t flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            <span>{template.usageCount} usos</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {filteredTemplates.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-1">No se encontraron templates</p>
                  <p className="text-xs text-gray-500">
                    Intenta con otros términos de búsqueda o cambia el filtro
                  </p>
                </div>
              )}
            </ScrollArea>

            {/* Footer */}
            <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Users className="h-4 w-4" />
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
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
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
              <div className="flex-1 border rounded-lg bg-gray-50 overflow-hidden">
                <ScrollArea className="h-full">
                  <pre className="p-6 text-sm font-mono whitespace-pre-wrap text-gray-700">
                    {previewTemplate.content || "Template en blanco"}
                  </pre>
                </ScrollArea>
              </div>

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
