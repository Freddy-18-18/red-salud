"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Badge,
  ScrollArea,
  Tabs,
  TabsList,
  TabsTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Input,
} from "@red-salud/ui";
import {
  FileText,
  Stethoscope,
  Activity,
  AlertCircle,
  Heart,
  Plus,
  Eye,
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
  Star,
  Info,
  Trash2,
  Search,
} from "lucide-react";
import { StructuredTemplate } from "@/lib/templates/structured-templates";
import { getAllTemplates } from "@/lib/templates/extended-templates";
import { cn } from "@red-salud/core/utils";

interface StructuredTemplateMarketplaceProps {
  open: boolean;
  onClose: () => void;
  onSelectTemplate: (template: StructuredTemplate) => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
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
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [previewTemplate, setPreviewTemplate] = useState<StructuredTemplate | null>(null);
  const [allTemplates, setAllTemplates] = useState<StructuredTemplate[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loadCustomTemplates = (): StructuredTemplate[] => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('customTemplates');
    return saved ? JSON.parse(saved) : [];
  };

  const toggleFavorite = (e: React.MouseEvent, templateId: string) => {
    e.stopPropagation();
    const newFavorites = favorites.includes(templateId)
      ? favorites.filter(id => id !== templateId)
      : [...favorites, templateId];
    setFavorites(newFavorites);
    localStorage.setItem('favoriteTemplates', JSON.stringify(newFavorites));
  };

  const handleDeleteClick = (e: React.MouseEvent, templateId: string) => {
    e.stopPropagation();
    setTemplateToDelete(templateId);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!templateToDelete) return;

    const saved = localStorage.getItem('customTemplates');
    const custom = saved ? JSON.parse(saved) : [];
    const updated = custom.filter((t: StructuredTemplate) => t.id !== templateToDelete);

    // Reload all templates to reflect system + remaining custom
    setAllTemplates([...getAllTemplates(), ...updated]);
    localStorage.setItem('customTemplates', JSON.stringify(updated));
    setDeleteConfirmOpen(false);
    setTemplateToDelete(null);
  };

  useEffect(() => {
    const loadAll = () => {
      const systemTemplates = getAllTemplates();
      const savedCustomTemplates = loadCustomTemplates();
      const savedFavorites = localStorage.getItem('favoriteTemplates');

      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }

      setAllTemplates([...systemTemplates, ...savedCustomTemplates]);
    };

    if (open) {
      loadAll();
    }
  }, [open]);

  const filteredTemplates = allTemplates.filter((template) => {
    const matchesSearch =
      searchQuery === "" ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (template.specialty && template.specialty.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "all" ||
      (selectedCategory === "favorites" ? favorites.includes(template.id) : template.category === selectedCategory);

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
        <DialogContent className="!max-w-6xl !w-full !h-[90vh] !p-0 !gap-0 !flex !flex-col !rounded-2xl !overflow-hidden !border-0 !shadow-2xl !fixed !top-[50%] !left-[50%] !translate-x-[-50%] !translate-y-[-50%] bg-white focus:outline-none">
          <DialogHeader className="px-8 py-6 border-b flex-shrink-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold flex items-center gap-3 text-white">
                  <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  Biblioteca de Plantillas Clínicas
                </DialogTitle>
                <DialogDescription className="text-blue-100 mt-2 text-base">
                  Explora y utiliza plantillas estructuradas validadas para tus consultas
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            <div className="px-6 py-4 border-b space-y-4 bg-gray-50/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar plantillas por nombre, descripción o etiquetas..."
                  className="pl-10 bg-white border-gray-200 focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
                <TabsList className="w-full justify-start h-auto p-1 bg-gray-200/50 flex flex-wrap gap-1">
                  <TabsTrigger value="all" className="flex-1 min-w-[100px] text-xs py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">Todos</TabsTrigger>
                  <TabsTrigger value="favorites" className="flex-1 min-w-[100px] text-xs py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <Star className="h-3 w-3 mr-1" />
                    Favoritos
                  </TabsTrigger>
                  <TabsTrigger value="general" className="flex-1 min-w-[100px] text-xs py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">General</TabsTrigger>
                  <TabsTrigger value="especialidad" className="flex-1 min-w-[100px] text-xs py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">Especialidad</TabsTrigger>
                  <TabsTrigger value="emergencia" className="flex-1 min-w-[100px] text-xs py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">Emergencia</TabsTrigger>
                  <TabsTrigger value="control" className="flex-1 min-w-[100px] text-xs py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">Control</TabsTrigger>
                  <TabsTrigger value="custom" className="flex-1 min-w-[100px] text-xs py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <User className="h-3 w-3 mr-1" />
                    Mis Templates
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredTemplates.map((template) => {
                    const Icon = IconComponent(template.icon);
                    const isFavorite = favorites.includes(template.id);
                    return (
                      <div key={template.id} className="group relative border border-gray-100 rounded-xl p-5 hover:shadow-xl transition-all duration-300 bg-white hover:-translate-y-1">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className={`h-14 w-14 rounded-xl flex items-center justify-center bg-${template.color}-50 group-hover:bg-${template.color}-100 transition-colors`}>
                              <Icon className={`h-7 w-7 text-${template.color}-600`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-base text-gray-900 group-hover:text-blue-700 transition-colors">{template.name}</h3>
                              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                <Badge variant="secondary" className="text-[10px] px-2 h-5 font-bold bg-blue-50 text-blue-700 border-blue-100/50 whitespace-nowrap">
                                  {template.fields.length} campos
                                </Badge>
                                {template.specialty && (
                                  <span className="text-[10px] text-gray-500 font-medium truncate uppercase tracking-wider">
                                    {template.specialty}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            {template.isCustom && <Badge className="text-[9px] px-1.5 h-4 bg-indigo-50 text-indigo-700 border-indigo-200">Personalizado</Badge>}
                            <div className="flex items-center gap-1">
                              {template.isCustom && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 rounded-full text-gray-300 hover:text-red-600 hover:bg-red-50 transition-all active:scale-90"
                                  onClick={(e) => handleDeleteClick(e, template.id)}
                                  title="Eliminar plantilla"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className={cn("h-7 w-7 rounded-full transition-colors", isFavorite ? "text-red-500 hover:text-red-600 hover:bg-red-50" : "text-gray-300 hover:text-gray-400 hover:bg-gray-100")}
                                onClick={(e) => toggleFavorite(e, template.id)}
                              >
                                <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[40px]">{template.description}</p>
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {template.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-[10px] bg-gray-50 border-gray-200 text-gray-600 font-normal">{tag}</Badge>
                          ))}
                        </div>
                        <div className="h-px w-full bg-gray-100 mb-4" />
                        <div className="flex gap-3">
                          <Button size="sm" variant="ghost" className="flex-1 h-9 text-gray-600 hover:text-blue-600 hover:bg-blue-50" onClick={() => setPreviewTemplate(template)}>
                            <Eye className="h-4 w-4 mr-2" />Ver Detalle
                          </Button>
                          <Button size="sm" className="flex-1 h-9 bg-gray-900 hover:bg-blue-600 text-white transition-colors shadow-sm" onClick={() => handleUseTemplate(template)}>
                            <Plus className="h-4 w-4 mr-2" />Usar
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </ScrollArea>

            <div className="px-8 py-5 border-t bg-gray-50/80 backdrop-blur-sm flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                <FileText className="h-4 w-4" />
                <span>{filteredTemplates.length} plantillas disponibles</span>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => window.location.href = '/dashboard/medico/templates/nuevo'} className="bg-white hover:bg-green-50 text-green-700 border-green-200 hover:border-green-300">
                  <Plus className="h-4 w-4 mr-2" />Crear Nueva Plantilla
                </Button>
                <Button variant="ghost" onClick={onClose} className="text-gray-500 hover:text-gray-900">Cerrar</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="!max-w-4xl !w-full !h-[85vh] !flex !flex-col !rounded-2xl !p-0 !gap-0 !overflow-hidden !fixed !top-[50%] !left-[50%] !translate-x-[-50%] !translate-y-[-50%] bg-white focus:outline-none">
          <DialogHeader className="px-6 py-5 border-b bg-gray-50/50">
            <DialogTitle className="flex items-center gap-4">
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
                    <div className="text-sm text-gray-500 font-normal">{previewTemplate.description}</div>
                  </div>
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {previewTemplate && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-100 grid grid-cols-3 gap-4 shrink-0">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{previewTemplate.fields.length}</p>
                  <p className="text-xs text-gray-600">Campos Totales</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{previewTemplate.fields.filter(f => f.required).length}</p>
                  <p className="text-xs text-gray-600">Campos Requeridos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{previewTemplate.fields.filter(f => f.type === 'vitals' || f.type === 'medications').length}</p>
                  <p className="text-xs text-gray-600">Campos Especiales</p>
                </div>
              </div>

              <ScrollArea className="flex-1 bg-gray-50/30">
                <div className="px-8 py-6 max-w-3xl mx-auto space-y-6">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {previewTemplate.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="bg-white border-blue-100 text-blue-700">{tag}</Badge>
                    ))}
                    {previewTemplate.specialty && <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50/50">{previewTemplate.specialty}</Badge>}
                  </div>

                  <div className="flex flex-wrap -mx-2">
                    {previewTemplate.fields.map((field) => {
                      const widthClass = field.width === 'half' ? 'w-1/2' : field.width === 'third' ? 'w-1/3' : 'w-full';
                      if (field.type === 'header') {
                        return (
                          <div key={field.id} className="w-full px-2 mt-4 mb-2 pb-2 border-b border-gray-100">
                            <h4 className="font-bold text-gray-800 text-lg">{field.label}</h4>
                            {field.placeholder && <p className="text-sm text-gray-400 font-normal">{field.placeholder}</p>}
                          </div>
                        );
                      }
                      if (field.type === 'info') {
                        return (
                          <div key={field.id} className="w-full px-2 mb-4">
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex gap-3">
                              <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                              <div className="text-sm text-blue-900">
                                <p className="font-semibold">{field.label}</p>
                                <p className="opacity-90">{field.placeholder}</p>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return (
                        <div key={field.id} className={`px-2 mb-4 ${widthClass}`}>
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">{field.label} {field.required && <span className="text-red-500">*</span>}</label>
                            <div className="border rounded-md bg-white h-9 px-3 flex items-center text-xs text-gray-400 italic">
                              {field.placeholder || "Texto..."}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </ScrollArea>

              <div className="px-8 py-4 border-t bg-white flex gap-3 justify-end shrink-0">
                <Button variant="outline" onClick={() => setPreviewTemplate(null)}>Cerrar</Button>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white min-w-[150px]" onClick={() => { handleUseTemplate(previewTemplate); setPreviewTemplate(null); }}>
                  <Plus className="h-4 w-4 mr-2" />Usar este Template
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="!rounded-2xl !border-0 !shadow-2xl !fixed !left-[50%] !top-[50%] !translate-x-[-50%] !translate-y-[-50%] !z-[9999] !m-0">
          <AlertDialogHeader>
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-center text-xl font-bold">¿Eliminar Plantilla?</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-gray-500">
              Esta acción eliminará permanentemente la plantilla <strong>&quot;{allTemplates.find(t => t.id === templateToDelete)?.name}&quot;</strong>.
              No podrás recuperarla ni usarla en futuras consultas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex gap-3 sm:justify-center">
            <AlertDialogCancel className="rounded-xl border-gray-200 text-gray-600 flex-1 sm:flex-none">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl border-0 flex-1 sm:flex-none"
            >
              Sí, eliminar plantilla
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
