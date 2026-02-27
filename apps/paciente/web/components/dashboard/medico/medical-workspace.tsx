"use client";

import { useState } from "react";
import { Tabs, TabsContent } from "@red-salud/design-system";
import { StructuredTemplate } from "@/lib/templates/structured-templates";
import { WorkspaceHeader } from "./workspace/workspace-header";
import { TabsHeader } from "./workspace/tabs-header";
import { FreeNotesEditor } from "./workspace/free-notes-editor";
import { ICDSearchTab } from "./workspace/icd-search-tab";
import { HistorialPanel } from "./workspace/historial-panel";
import { AIRecommendationsPanel } from "./workspace/ai-recommendations-panel";
import { HistorialDetailDialog } from "./workspace/historial-detail-dialog";
import { StructuredTemplateEditor } from "./templates/structured-template-editor";
import { StructuredTemplateMarketplace } from "./templates/structured-template-marketplace";
import { useAutocomplete } from "./workspace/use-autocomplete";
import { useHistorial } from "./workspace/use-historial";
import { useAIAnalysis } from "./workspace/use-ai-analysis";


interface MedicalWorkspaceProps {
  paciente: {
    cedula: string;
    nombre_completo: string;
    edad: number | null;
    genero: string | null;
  };
  alergias: string[];
  setAlergias: (value: string[]) => void;
  condicionesCronicas: string[];
  setCondicionesCronicas: (value: string[]) => void;
  medicamentosActuales: string[];
  setMedicamentosActuales: (value: string[]) => void;
  notasMedicas: string;
  setNotasMedicas: (value: string) => void;
  diagnosticos: string[];
  setDiagnosticos: (value: string[]) => void;
  onSave: (freeNotesContent?: string, structuredContent?: string) => void;
  onBack: () => void;
  loading: boolean;
}

export function MedicalWorkspace({
  paciente,
  alergias,
  condicionesCronicas,
  medicamentosActuales,
  setMedicamentosActuales,
  notasMedicas,
  setNotasMedicas,
  diagnosticos,
  setDiagnosticos,
  onSave,
  onBack,
  loading,
}: MedicalWorkspaceProps) {
  const [activeTab, setActiveTab] = useState("notas");
  const [showHistorial, setShowHistorial] = useState(true);
  const [showStructuredMarketplace, setShowStructuredMarketplace] = useState(false);
  const [selectedStructuredTemplate, setSelectedStructuredTemplate] = useState<StructuredTemplate | null>(null);
  const [freeNotesContent, setFreeNotesContent] = useState(notasMedicas || "");
  const [structuredNotesContent, setStructuredNotesContent] = useState("");

  // Custom hooks
  const autocomplete = useAutocomplete({ notasMedicas: freeNotesContent });
  const historial = useHistorial(paciente.cedula);

  // Análisis de IA separado para cada editor
  const aiAnalysisFreeNotes = useAIAnalysis({
    notasMedicas: freeNotesContent,
    paciente,
    alergias,
    condicionesCronicas,
    medicamentosActuales,
    diagnosticos,
    setDiagnosticos,
  });

  const aiAnalysisStructured = useAIAnalysis({
    notasMedicas: structuredNotesContent,
    paciente,
    alergias,
    condicionesCronicas,
    medicamentosActuales,
    diagnosticos,
    setDiagnosticos,
  });

  // Usar el análisis de IA correspondiente a la pestaña activa
  const currentAIAnalysis = activeTab === "notas" ? aiAnalysisFreeNotes : aiAnalysisStructured;





  // Sincronizar con el estado externo solo cuando sea necesario
  // Removed useEffect for syncing state to prevent re-render loops

  // Eliminado: useEffect que copiaba contenido entre editores

  const handleFreeNotesChange = (value: string) => {
    setFreeNotesContent(value);

    if (activeTab === "notas") {
      setNotasMedicas(value);
    }
  };

  const handleStructuredNotesChange = (value: string) => {
    setStructuredNotesContent(value);

    if (activeTab === "estructurado") {
      setNotasMedicas(value);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "notas") {
      setNotasMedicas(freeNotesContent);
    } else if (value === "estructurado") {
      setNotasMedicas(structuredNotesContent);
    }
  };

  const handleSave = () => {
    // Guardar ambos contenidos por separado
    onSave(freeNotesContent, structuredNotesContent);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="h-[calc(100vh-3rem)] w-full flex flex-col bg-gray-50 overflow-hidden">
      <WorkspaceHeader
        paciente={paciente}
        loading={loading}
        onBack={onBack}
        onSave={handleSave}
        onPrint={handlePrint}
      />

      <div className="flex-1 flex min-h-0">
        <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-white">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col min-h-0">
            <TabsHeader
              activeTab={activeTab}
              selectedStructuredTemplate={selectedStructuredTemplate}
              notasMedicas={activeTab === "notas" ? freeNotesContent : structuredNotesContent}
              isAnalyzing={currentAIAnalysis.isAnalyzing}
              onShowStructuredMarketplace={() => setShowStructuredMarketplace(true)}
              onAnalyzeWithAI={currentAIAnalysis.handleAnalyzeWithAI}
            />

            {activeTab === "estructurado" && (
              <TabsContent value="estructurado" className="flex-1 m-0 flex flex-col min-h-0 overflow-hidden">
                <div className="flex-1 bg-white overflow-y-auto">
                  <StructuredTemplateEditor
                    template={selectedStructuredTemplate}
                    onChange={handleStructuredNotesChange}
                    paciente={{
                      ...paciente,
                      genero: paciente.genero || "Desconocido",
                      edad: paciente.edad || 0
                    }}
                    medications={medicamentosActuales}
                    onMedicationsChange={setMedicamentosActuales}
                  />
                </div>

                {currentAIAnalysis.showRecommendations && currentAIAnalysis.aiAnalysis && (
                  <AIRecommendationsPanel
                    aiAnalysis={currentAIAnalysis.aiAnalysis}
                    onClose={() => currentAIAnalysis.setShowRecommendations(false)}
                  />
                )}
              </TabsContent>
            )}

            {activeTab === "notas" && (
              <TabsContent value="notas" className="flex-1 m-0 flex flex-col overflow-hidden">
                <div className="flex-1 flex overflow-hidden">
                  <FreeNotesEditor
                    notasMedicas={freeNotesContent}
                    setNotasMedicas={handleFreeNotesChange}
                    autocomplete={autocomplete}
                  />

                  {currentAIAnalysis.showRecommendations && currentAIAnalysis.aiAnalysis && (
                    <AIRecommendationsPanel
                      aiAnalysis={currentAIAnalysis.aiAnalysis}
                      onClose={() => currentAIAnalysis.setShowRecommendations(false)}
                    />
                  )}
                </div>
              </TabsContent>
            )}

            {activeTab === "icd" && (
              <TabsContent value="icd" className="flex-1 m-0 overflow-hidden">
                <ICDSearchTab
                  diagnosticos={diagnosticos}
                  notasMedicas={notasMedicas}
                  onAddDiagnostico={(codigo, descripcion) => {
                    const diagnostico = `${codigo} - ${descripcion}`;
                    if (!diagnosticos.includes(diagnostico)) {
                      setDiagnosticos([...diagnosticos, diagnostico]);
                    }
                  }}
                  onRemoveDiagnostico={(index) => {
                    setDiagnosticos(diagnosticos.filter((_, i) => i !== index));
                  }}
                />
              </TabsContent>
            )}
          </Tabs>
        </div>

        <HistorialPanel
          historialClinico={historial.historialClinico}
          showHistorial={showHistorial}
          onToggle={() => setShowHistorial(!showHistorial)}
          onSelectItem={historial.setSelectedHistorial}
        />
      </div>

      <HistorialDetailDialog
        historial={historial.selectedHistorial}
        onClose={() => historial.setSelectedHistorial(null)}
      />

      <StructuredTemplateMarketplace
        open={showStructuredMarketplace}
        onClose={() => setShowStructuredMarketplace(false)}
        onSelectTemplate={(template) => {
          setSelectedStructuredTemplate(template);
          setShowStructuredMarketplace(false);
        }}
      />
    </div >
  );
}
