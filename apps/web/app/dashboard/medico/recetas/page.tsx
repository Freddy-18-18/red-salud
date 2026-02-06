"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Input,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Avatar,
  AvatarImage,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@red-salud/ui";
import {
  Pill,
  Plus,
  Search,
  MoreVertical,
  Eye,
  Printer,
  Download,
  Filter,
  Calendar,
  User,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
  History,
} from "lucide-react";
import { VerificationGuard } from "@/components/dashboard/medico/features/verification-guard";
import { getDoctorPrescriptions } from "@/lib/supabase/services/medications-service";
import { supabase } from "@/lib/supabase/client";
import { Prescription } from "@/lib/supabase/types/medications";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@red-salud/core/utils";
import { RecipeViewerModal } from "@/components/dashboard/recetas/recipe-viewer-modal";
import {
  constructRecipeData,
  constructRecipeSettings,
  generateRecipeHtml,
  downloadRecipePdf
} from "@/lib/recipe-utils";
import { getDoctorRecipeSettings, DoctorRecipeSettings } from "@/lib/supabase/services/recipe-settings";
import { toast } from "sonner";
import { printContent } from "@/lib/print-utils";

export default function RecipesListPage() {
  const [recipes, setRecipes] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  // State for preview modal
  const [selectedRecipe, setSelectedRecipe] = useState<Prescription | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // State for Patient History Modal
  const [historyPatientId, setHistoryPatientId] = useState<string | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [patientHistory, setPatientHistory] = useState<Prescription[]>([]);
  const [selectedPatientName, setSelectedPatientName] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Cache for settings/profile to avoid refetching on every click
  const [recipeSettings, setRecipeSettings] = useState<DoctorRecipeSettings | null>(null);
  const [doctorProfile, setDoctorProfile] = useState<any>(null); // Simplified type for now
  const [isPreparingAction, setIsPreparingAction] = useState(false);

  useEffect(() => {
    async function getUserId() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        fetchSettingsAndProfile(user.id);
      }
    }
    getUserId();
  }, []);

  async function fetchSettingsAndProfile(uid: string) {
    try {
      // Parallel fetch for speed
      const [settingsRes, profileRes, detailsRes] = await Promise.all([
        getDoctorRecipeSettings(uid),
        supabase.from("profiles").select("*").eq("id", uid).single(),
        supabase.from("doctor_details").select("*").eq("profile_id", uid).maybeSingle()
      ]);

      if (settingsRes.success) setRecipeSettings(settingsRes.data as DoctorRecipeSettings);

      // Prepare doctor profile object similar to what RecipePreview expects
      if (profileRes.data) {
        const profile = profileRes.data;
        const details = detailsRes.data;
        let specialtyName = "";

        // If we have specialty ID, get name (simplified logic)
        if (details?.especialidad_id) {
          const { data: spec } = await supabase.from("specialties").select("name").eq("id", details.especialidad_id).maybeSingle();
          specialtyName = spec?.name || "";
        }

        setDoctorProfile({
          nombre: profile.nombre_completo || "Dr.",
          titulo: "Dr.",
          especialidad: profile.sacs_especialidad || profile.especialidad || specialtyName,
          cedulaProfesional: profile.cedula || details?.licencia_medica || profile.sacs_matricula || "",
          clinica: settingsRes.data?.clinic_name || "", // Will be merged with settings later
          direccion: settingsRes.data?.clinic_address || "",
          telefono: settingsRes.data?.clinic_phone || "",
          email: settingsRes.data?.clinic_email || profile.email || ""
        });
      }

    } catch (e) {
      console.error("Error loading settings:", e);
    }
  }

  useEffect(() => {
    if (!userId) return;

    async function fetchRecipes() {
      setIsLoading(true);
      try {
        const { success, data } = await getDoctorPrescriptions(userId!);
        if (success) {
          setRecipes(data);
        }
      } catch (error) {
        console.error("Error fetching recipes:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecipes();
  }, [userId]);

  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      // Handle both registered and offline patients for name search
      const patientName = (recipe.paciente?.nombre_completo || recipe.offline_patient?.nombre_completo || "").toLowerCase();
      const diagnosis = recipe.diagnostico?.toLowerCase() || "";
      const searchLower = searchQuery.toLowerCase();
      return patientName.includes(searchLower) || diagnosis.includes(searchLower);
    });
  }, [recipes, searchQuery]);

  // Deduplicate recipes to show only one per patient (the most recent one matching the filter)
  const uniqueRecipes = useMemo(() => {
    const seenPatients = new Set<string>();
    return filteredRecipes.filter(recipe => {
      const patientId = recipe.paciente?.id || recipe.offline_patient?.id;
      if (!patientId) return true; // Always show if we can't identify the patient
      if (seenPatients.has(patientId)) {
        return false;
      }
      seenPatients.add(patientId);
      return true;
    });
  }, [filteredRecipes]);

  // Pagination Logic
  const totalPages = Math.ceil(uniqueRecipes.length / itemsPerPage);
  const paginatedRecipes = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return uniqueRecipes.slice(start, start + itemsPerPage);
  }, [uniqueRecipes, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleOpenHistory = (recipe: Prescription) => {
    const pInfo = getPatientDisplayInfo(recipe);
    // Determine ID (either registered patient ID or offline patient ID)
    // We use a prefix or just string id to filter.
    // Easiest is to filter the 'recipes' list by the same patient reference.

    const patId = recipe.paciente?.id || recipe.offline_patient?.id;
    if (!patId) return;

    setSelectedPatientName(pInfo.name);

    // Filter history from all loaded recipes (client-side for now)
    const history = recipes.filter(r =>
      (r.paciente?.id === patId) || (r.offline_patient?.id === patId)
    );

    setPatientHistory(history);
    setIsHistoryModalOpen(true);
  };

  // Helper to get display data
  const getPatientDisplayInfo = (recipe: Prescription) => {
    if (recipe.paciente) {
      return {
        name: recipe.paciente.nombre_completo,
        identifier: recipe.paciente.cedula || "Sin cédula",
        avatar: recipe.paciente.avatar_url,
        initial: recipe.paciente.nombre_completo.charAt(0) || "P",
        age: recipe.paciente.fecha_nacimiento ?
          Math.floor((new Date().getTime() - new Date(recipe.paciente.fecha_nacimiento).getTime()) / 3.15576e+10) : undefined,
      };
    }
    if (recipe.offline_patient) {
      return {
        name: recipe.offline_patient.nombre_completo,
        identifier: recipe.offline_patient.numero_documento || "Sin cédula",
        avatar: null,
        initial: recipe.offline_patient.nombre_completo.charAt(0) || "P",
        age: recipe.offline_patient.fecha_nacimiento ?
          Math.floor((new Date().getTime() - new Date(recipe.offline_patient.fecha_nacimiento).getTime()) / 3.15576e+10) : undefined,
      };
    }
    return {
      name: "Paciente desconocido",
      identifier: "Sin datos",
      avatar: null,
      initial: "?",
      age: undefined,
    };
  };

  const prepareActionData = (recipe: Prescription) => {
    if (!recipeSettings || !doctorProfile) {
      toast.error("Cargando configuración...");
      return null;
    }
    const data = constructRecipeData(recipe, doctorProfile, recipeSettings);
    const settings = constructRecipeSettings(recipeSettings);
    return { data, settings };
  };

  const handleViewRecipe = (recipe: Prescription) => {
    setSelectedRecipe(recipe);
    setIsViewModalOpen(true);
  };

  const handlePrint = async (recipe: Prescription) => {
    const prep = prepareActionData(recipe);
    if (!prep) return;

    try {
      setIsPreparingAction(true);
      toast.info("Preparando impresión...");
      const html = await generateRecipeHtml(prep.data, prep.settings);
      printContent(html);
    } catch (e) {
      toast.error("Error al imprimir");
      console.error(e);
    } finally {
      setIsPreparingAction(false);
    }
  };

  const handleDownload = async (recipe: Prescription) => {
    const prep = prepareActionData(recipe);
    if (!prep) return;

    try {
      setIsPreparingAction(true);
      toast.info("Generando PDF...");
      const fileName = `Receta-${(prep.data.patientName || 'Paciente').replace(/[^a-z0-9]/gi, '_')}.pdf`;
      await downloadRecipePdf(prep.data, prep.settings, fileName);
      toast.success("PDF descargado");
    } catch (e) {
      toast.error("Error al descargar PDF");
      console.error(e);
    } finally {
      setIsPreparingAction(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "surtida":
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
            <CheckCircle2 className="h-3 w-3" /> Surtida
          </Badge>
        );
      case "activa":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1">
            <Clock className="h-3 w-3" /> Activa
          </Badge>
        );
      case "vencida":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1">
            <Clock className="h-3 w-3" /> Vencida
          </Badge>
        );
      case "cancelada":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1">
            <XCircle className="h-3 w-3" /> Cancelada
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <VerificationGuard>
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
              <div className="bg-emerald-500 p-2 rounded-lg shadow-emerald-500/20 shadow-lg">
                <Pill className="h-6 w-6 text-white" />
              </div>
              Recetas Médicas
            </h1>
            <p className="text-muted-foreground mt-1">
              Gestiona y realiza seguimiento a las prescripciones de tus pacientes
            </p>
          </div>
          <Link href="/dashboard/medico/recetas/nueva">
            <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 group">
              <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform" />
              Nueva Receta
            </Button>
          </Link>
          <Link href="/dashboard/medico/recetas/configuracion">
            <Button variant="outline" size="icon" title="Configurar Recetas">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Filters & Search */}
        {/* Quick Stats - Premium Touch */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-100 dark:border-blue-900 shadow-sm overflow-hidden relative group opacity-75">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
              <Clock className="h-24 w-24" />
            </div>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-blue-600 dark:text-blue-400 font-semibold text-sm uppercase tracking-wider">Recetas Activas</p>
                <Badge variant="secondary" className="text-[10px] h-5 bg-blue-100/50 text-blue-700 hover:bg-blue-100/50">BETA</Badge>
              </div>
              <h4 className="text-2xl font-bold mt-1 text-gray-500 dark:text-gray-400">Próximamente</h4>

            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-100 dark:border-emerald-900 shadow-sm overflow-hidden relative group opacity-75">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="h-24 w-24" />
            </div>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm uppercase tracking-wider">Recetas Surtidas</p>
                <Badge variant="secondary" className="text-[10px] h-5 bg-emerald-100/50 text-emerald-700 hover:bg-emerald-100/50">BETA</Badge>
              </div>
              <h4 className="text-2xl font-bold mt-1 text-gray-500 dark:text-gray-400">Próximamente</h4>

            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-100 dark:border-purple-900 shadow-sm overflow-hidden relative group">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
              <Plus className="h-24 w-24" />
            </div>
            <CardContent className="p-6">
              <p className="text-purple-600 dark:text-purple-400 font-semibold text-sm uppercase tracking-wider">Total Histórico</p>
              <h4 className="text-3xl font-bold mt-2">{recipes.length}</h4>
              <p className="text-xs text-muted-foreground mt-1">Prescripciones realizadas</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-md bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
          <CardContent className="p-4 flex flex-col gap-4">
            <div className="flex flex-col gap-4">

              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por paciente o diagnóstico..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1); // Reset to page 1 on search
                    }}
                  />
                </div>
              </div>

              <div className="text-sm text-gray-500">
                Mostrando {uniqueRecipes.length} de {filteredRecipes.length} recetas (agrupadas por paciente)
              </div>
            </div >

            {/* Recipes Table or Empty State */}
            {
              isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-4" />
                  <p className="text-gray-500">Cargando recetas...</p>
                </div>
              ) : filteredRecipes.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-dashed border-2">
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Pill className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No hay recetas encontradas</h3>
                  <p className="text-gray-500 mt-2">Prueba con otros términos de búsqueda o crea una nueva receta.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <Card className="overflow-hidden border-none shadow-xl">
                    <div className="relative w-full overflow-auto">
                      <Table>
                        <TableHeader className="bg-gray-50 dark:bg-gray-900">
                          <TableRow>
                            <TableHead className="w-[300px]">Paciente</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Diagnóstico</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedRecipes.map((recipe) => {
                            const patient = getPatientDisplayInfo(recipe);
                            return (
                              <TableRow key={recipe.id} className="group hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-colors">
                                <TableCell>
                                  <div
                                    className="flex items-center gap-3 cursor-pointer hover:opacity-80"
                                    onClick={() => handleOpenHistory(recipe)}
                                    title="Ver historial del paciente"
                                  >
                                    <Avatar className="h-9 w-9 border-2 border-white dark:border-gray-800 shadow-sm">
                                      <AvatarImage src={patient.avatar || ""} />
                                      <AvatarFallback className="bg-emerald-100 text-emerald-700 font-medium">
                                        {patient.initial}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                      <span className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-emerald-700 transition-colors">
                                        {patient.name}
                                      </span>
                                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <User className="h-3 w-3" />
                                        {patient.identifier}
                                      </span>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium">
                                      {recipe.fecha_prescripcion ? format(new Date(recipe.fecha_prescripcion), "d 'de' MMM, yyyy", { locale: es }) : "-"}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {recipe.fecha_prescripcion ? format(new Date(recipe.fecha_prescripcion), "HH:mm") : "-"}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm line-clamp-1 max-w-[200px]" title={recipe.diagnostico || ""}>
                                    {recipe.diagnostico || "Sin diagnóstico"}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  {getStatusBadge(recipe.estado || 'activa')}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Link href={`/dashboard/medico/recetas/historial/${patient.identifier.replace(/\./g, '')}-${recipe.paciente?.id || recipe.offline_patient?.id}`}>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-9 px-3 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                                        title="Ver Historial Completo"
                                      >
                                        <History className="h-4 w-4 mr-2" />
                                        Historial
                                      </Button>
                                    </Link>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-9 w-9 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                      onClick={() => handleViewRecipe(recipe)}
                                      title="Ver Detalle"
                                    >
                                      <Eye className="h-5 w-5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-9 w-9 text-gray-600 hover:text-gray-700 hover:bg-gray-100"
                                      onClick={() => handlePrint(recipe)}
                                      title="Imprimir Receta"
                                    >
                                      <Printer className="h-5 w-5" />
                                    </Button>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-9 w-9">
                                          <MoreVertical className="h-5 w-5" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleViewRecipe(recipe)}>
                                          <Eye className="mr-2 h-4 w-4" /> Ver detalles
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handlePrint(recipe)}>
                                          <Printer className="mr-2 h-4 w-4" /> Imprimir
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleDownload(recipe)}>
                                          <Download className="mr-2 h-4 w-4" /> Descargar PDF
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </Card>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-end gap-2 py-4">
                      <span className="text-sm text-gray-500 mr-2">
                        Página {currentPage} de {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Siguiente
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )
            }

            {/* Patient History Modal */}
            <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
              <DialogContent className="max-w-3xl">
                <DialogTitle>Historial de Recetas: {selectedPatientName}</DialogTitle>
                <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-1">
                  {patientHistory.map((recipe, idx) => (
                    <Card key={recipe.id} className="border bg-gray-50/50">
                      <CardHeader className="py-3 px-4 pb-2">
                        <div className="flex justify-between items-center">
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm">
                              Receta #{patientHistory.length - idx} &bull; {recipe.fecha_prescripcion ? format(new Date(recipe.fecha_prescripcion), "d MMM yyyy", { locale: es }) : ""}
                            </span>
                            <span className='text-xs text-muted-foreground'>
                              {recipe.diagnostico || "Sin diagnóstico"}
                            </span>
                          </div>
                          {getStatusBadge(recipe.estado || 'activa')}
                        </div>
                      </CardHeader>
                      <CardContent className="py-2 px-4 text-sm">
                        <ul className="list-disc pl-4 text-gray-600 space-y-1">
                          {recipe.medications?.slice(0, 3).map((m: any, i: number) => (
                            <li key={i}>
                              {(m.medication?.nombre_comercial || m.nombre_medicamento || "Medicamento") +
                                (m.medication?.concentracion ? ` ${m.medication.concentracion}` : "")}
                            </li>
                          ))}
                          {recipe.medications && recipe.medications.length > 3 && (
                            <li className="list-none text-xs text-gray-400 italic">
                              + {recipe.medications.length - 3} más...
                            </li>
                          )}
                        </ul>
                        <div className="mt-3 flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => {
                            setIsHistoryModalOpen(false);
                            handleViewRecipe(recipe);
                          }}>
                            <Eye className="h-3 w-3 mr-1" /> Ver Completa
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDownload(recipe)}>
                            <Download className="h-3 w-3 mr-1" /> PDF
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* New View/Print Modal */}
        <RecipeViewerModal
          open={isViewModalOpen}
          onOpenChange={setIsViewModalOpen}
          data={selectedRecipe && recipeSettings && doctorProfile ? constructRecipeData(selectedRecipe, doctorProfile, recipeSettings) : null}
          settings={recipeSettings ? constructRecipeSettings(recipeSettings) : null}
        />
      </div>
    </VerificationGuard>
  );
}
