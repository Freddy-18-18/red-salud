"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Save, Download, History, Plus, AlertCircle, AlertTriangle, Loader2, X, TrendingUp, TrendingDown, Calendar, User } from "lucide-react";
import Link from "next/link";
import { Button, Card, CardContent, CardHeader, CardTitle, Alert, AlertDescription, Badge, ScrollArea, Separator, Skeleton } from "@red-salud/ui";
import { cn } from "@red-salud/core/utils";
import { Periodontogram } from "@/components/dashboard/medico/odontologia/periodontogram/periodontogram";
import { PatientSelector } from "@/components/dashboard/medico/odontologia/patient-selector";
import type { PerioToothData, PerioExam } from "@/types/dental";
import { usePeriodontogramData } from "@/hooks/dental/use-periodontogram-data";
import { useSupabaseAuth } from "@/components/providers/supabase-auth-provider";
import { toast } from "sonner";
import { calculatePerioStats } from "@/lib/supabase/services/dental/perio-service";

export default function PeriodontogramPage() {
  const { user } = useSupabaseAuth();
  const [teeth, setTeeth] = useState<Record<number, PerioToothData>>({});
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedPatientName, setSelectedPatientName] = useState<string>("");
  const [showHistory, setShowHistory] = useState(false);
  const [currentExamId, setCurrentExamId] = useState<string | null>(null);
  const [selectedHistoryExamId, setSelectedHistoryExamId] = useState<string | null>(null);

  // Usar el hook personalizado
  const {
    currentExam,
    previousExams,
    latestExam,
    isLoading,
    isSaving,
    isLoadingHistory,
    error,
    saveExam,
    loadExam,
    loadPatientHistory,
    deleteCurrentExam,
    refresh,
  } = usePeriodontogramData(selectedPatientId, currentExamId);

  // Sincronizar estado local con el del hook
  useEffect(() => {
    if (currentExam?.teeth) {
      setTeeth(currentExam.teeth as Record<number, PerioToothData>);
    }
  }, [currentExam]);

  // Cargar historial cuando se selecciona un paciente
  useEffect(() => {
    if (selectedPatientId) {
      loadPatientHistory(selectedPatientId);
    }
  }, [selectedPatientId, loadPatientHistory]);

  const handlePatientSelect = (patientId: string, patientName: string) => {
    setSelectedPatientId(patientId);
    setSelectedPatientName(patientName);
    setCurrentExamId(null);
    setSelectedHistoryExamId(null);
    // Limpiar datos del examen anterior
    setTeeth({});
  };

  const handleSave = async () => {
    if (!selectedPatientId) {
      toast.error('Por favor selecciona un paciente primero');
      return;
    }

    if (!user?.id) {
      toast.error('Usuario no autenticado');
      return;
    }

    const dataToSave: any = {
      patient_id: selectedPatientId,
      doctor_id: user.id,
      exam_date: new Date().toISOString().split('T')[0],
      teeth: teeth,
      notes: '',
    };

    // Si estamos editando un examen existente, incluir el ID
    if (currentExamId) {
      dataToSave.id = currentExamId;
    }

    const result = await saveExam(dataToSave);

    if (result.success) {
      toast.success('Periodontograma guardado exitosamente');
      setCurrentExamId(result.data?.id || null);
      // Recargar historial
      if (selectedPatientId) {
        loadPatientHistory(selectedPatientId);
      }
    } else {
      toast.error(`Error al guardar: ${result.error}`);
    }
  };

  const handleDataChange = (newTeeth: Record<number, PerioToothData>) => {
    setTeeth(newTeeth);
  };

  const handleHistoryExamSelect = async (examId: string) => {
    setSelectedHistoryExamId(examId);
    await loadExam(examId);
    setCurrentExamId(examId);
  };

  const handleNewExam = () => {
    setCurrentExamId(null);
    setSelectedHistoryExamId(null);
    setTeeth({});
    toast.info('Nuevo examen iniciado');
  };

  const handleExportPDF = () => {
    toast.info('Función de exportación PDF en desarrollo');
    // TODO: Implementar exportación PDF con jsPDF + html2canvas
  };

  // Calcular estadísticas del examen actual
  const currentStats = teeth && Object.keys(teeth).length > 0 ? calculatePerioStats(teeth) : null;

  // Determinar el examen anterior para comparación
  const comparisonExam = selectedHistoryExamId 
    ? previousExams.find(e => e.id !== selectedHistoryExamId) 
    : previousExams.length > 1 
      ? previousExams[1] 
      : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/medico/odontologia">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Periodontograma</h1>
                <p className="text-sm text-muted-foreground">
                  Registro periodontal completo con sondaje y análisis
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                disabled={!selectedPatientId || !currentStats}
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                disabled={!selectedPatientId}
              >
                <History className="w-4 h-4 mr-2" />
                {showHistory ? 'Ocultar Historial' : 'Ver Historial'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNewExam}
                disabled={!selectedPatientId}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Examen
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || !selectedPatientId || !teeth || Object.keys(teeth).length === 0}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content */}
          <div className={cn("lg:col-span-12", showHistory && "lg:col-span-8")}>
            {/* Patient Selector - Compact */}
            <div className="mb-6 flex items-center gap-4">
              <div className="flex-shrink-0">
                <label className="text-sm font-medium mb-2 block">
                  Paciente
                </label>
                <PatientSelector
                  selectedPatientId={selectedPatientId}
                  onSelectPatient={handlePatientSelect}
                  limit={50}
                />
              </div>
              {selectedPatientName && currentStats && (
                <Card className="flex-1">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{selectedPatientName}</p>
                          {currentExamId && (
                            <p className="text-xs text-muted-foreground">
                              Examen: {new Date().toLocaleDateString('es-ES')}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="text-center">
                          <p className="text-lg font-bold text-red-500">
                            {currentStats.bopPercentage.toFixed(0)}%
                          </p>
                          <p className="text-xs text-muted-foreground">BOP</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-orange-500">
                            {currentStats.deepPockets}
                          </p>
                          <p className="text-xs text-muted-foreground">Bolsas</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-blue-500">
                            {currentStats.avgProbingDepth.toFixed(1)}
                          </p>
                          <p className="text-xs text-muted-foreground">Prof. Avg</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Clinical Alerts */}
            {currentStats && (
              <div className="mb-6 space-y-2">
                {currentStats.bopPercentage > 30 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>{currentStats.bopPercentage.toFixed(0)}% de sangrado</strong> - Enfermedad periodontal activa detectada
                    </AlertDescription>
                  </Alert>
                )}
                
                {currentStats.deepPockets >= 5 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>{currentStats.deepPockets} sitios con bolsas ≥5mm</strong> - Tratamiento activo recomendado
                    </AlertDescription>
                  </Alert>
                )}

                {currentStats.missingTeeth >= 4 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>{currentStats.missingTeeth} dientes ausentes</strong> - Considerar rehabilitación
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Additional Statistics - Only when data exists */}
            {currentStats && selectedPatientName && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-4 pb-4">
                    <div className="text-center">
                      <p className="text-xl font-bold text-purple-500">
                        {currentStats.missingTeeth}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Dientes Ausentes</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 pb-4">
                    <div className="text-center">
                      <p className="text-xl font-bold text-green-500">
                        {(100 - currentStats.bopPercentage).toFixed(0)}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Sitios Saludables</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 pb-4">
                    <div className="text-center">
                      <p className="text-xl font-bold text-amber-500">
                        {currentStats.maxProbingDepth}mm
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Prof. Máxima</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 pb-4">
                    <div className="text-center">
                      <p className="text-xl font-bold text-cyan-500">
                        {previousExams.length}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Exámenes Previos</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Main Periodontogram Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Gráfico Periodontal</CardTitle>
                {selectedPatientId && (
                  <p className="text-sm text-muted-foreground">
                    Use las teclas ← → para navegar entre dientes. Enter para editar.
                  </p>
                )}
              </CardHeader>
              <CardContent>
                {!selectedPatientId ? (
                  <div className="py-12 text-center">
                    <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Selecciona un paciente para comenzar
                    </p>
                  </div>
                ) : isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                  </div>
                ) : (
                  <Periodontogram
                    examData={currentExam || undefined}
                    onDataChange={handleDataChange}
                    readOnly={false}
                    comparisonData={comparisonExam || undefined}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* History Sidebar */}
          {showHistory && (
            <div className="lg:col-span-4">
              <Card className="sticky top-4">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Historial</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowHistory(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingHistory ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <Skeleton key={i} className="h-20 w-full" />
                      ))}
                    </div>
                  ) : previousExams.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                      <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No hay exámenes previos</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[600px] pr-4">
                      <div className="space-y-3">
                        {previousExams.map((exam, index) => {
                          const examStats = exam.teeth ? calculatePerioStats(exam.teeth as any) : null;
                          const isSelected = exam.id === selectedHistoryExamId;
                          const isLatest = index === 0;

                          return (
                            <Card
                              key={exam.id}
                              className={cn(
                                "cursor-pointer transition-all hover:shadow-md",
                                isSelected && "ring-2 ring-primary"
                              )}
                              onClick={() => handleHistoryExamSelect(exam.id)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <p className="text-sm font-medium">
                                      {new Date(exam.examDate).toLocaleDateString('es-ES', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric'
                                      })}
                                    </p>
                                  </div>
                                  {isLatest && (
                                    <Badge variant="default" className="text-xs">
                                      Más reciente
                                    </Badge>
                                  )}
                                </div>

                                {examStats && (
                                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                                    <div>
                                      <p className="text-muted-foreground">BOP</p>
                                      <p className="font-medium text-red-500">
                                        {examStats.bopPercentage.toFixed(0)}%
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">Bolsas ≥5mm</p>
                                      <p className="font-medium text-orange-500">
                                        {examStats.deepPockets}
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {exam.notes && (
                                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                    {exam.notes}
                                  </p>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
