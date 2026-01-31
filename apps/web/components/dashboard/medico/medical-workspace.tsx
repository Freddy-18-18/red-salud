"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Tabs, TabsContent } from "@red-salud/ui";
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
import { ScrollArea } from "@red-salud/ui";

interface MedicalWorkspaceProps {
  paciente: {
    cedula: string;
    nombre_completo: string;
    edad: number | null;
    genero: string;
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
  onSave: () => void;
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
  const [freeNotesContent, setFreeNotesContent] = useState(notasMedicas);
  const [structuredNotesContent, setStructuredNotesContent] = useState("");

  // Custom hooks
  const autocomplete = useAutocomplete({ notasMedicas: freeNotesContent });
  const historial = useHistorial(paciente.cedula);
  const aiAnalysis = useAIAnalysis({
    notasMedicas,
    paciente,
    alergias,
    condicionesCronicas,
    medicamentosActuales,
    diagnosticos,
    setDiagnosticos,
  });





  useEffect(() => {
    if (activeTab === "notas" && freeNotesContent !== notasMedicas) {
      setFreeNotesContent(notasMedicas);
    }
  }, [activeTab, notasMedicas]);

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
    if (value === "notas") {
      setNotasMedicas(freeNotesContent);
    }
    if (value === "estructurado") {
      setNotasMedicas(structuredNotesContent);
    }
    setActiveTab(value);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50 overflow-hidden">
      <WorkspaceHeader
        paciente={paciente}
        loading={loading}
        onBack={onBack}
        onSave={onSave}
        onPrint={handlePrint}
      />

      <div className="flex-1 flex min-h-0">
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col">
            <TabsHeader
              activeTab={activeTab}
              selectedStructuredTemplate={selectedStructuredTemplate}
              notasMedicas={notasMedicas}
              isAnalyzing={aiAnalysis.isAnalyzing}
              onShowStructuredMarketplace={() => setShowStructuredMarketplace(true)}
              onAnalyzeWithAI={aiAnalysis.handleAnalyzeWithAI}
            />

            {activeTab === "estructurado" && (
              <TabsContent value="estructurado" className="flex-1 m-0 flex flex-col overflow-hidden">
                <div className="flex-1 flex overflow-hidden">
                  <ScrollArea className="flex-1 bg-white">
                    <StructuredTemplateEditor
                      template={selectedStructuredTemplate}
                      onChange={handleStructuredNotesChange}
                      paciente={paciente}
                      medications={medicamentosActuales}
                      onMedicationsChange={setMedicamentosActuales}
                    />
                  </ScrollArea>

                  {aiAnalysis.showRecommendations && aiAnalysis.aiAnalysis && (
                    <AIRecommendationsPanel
                      aiAnalysis={aiAnalysis.aiAnalysis}
                      onClose={() => aiAnalysis.setShowRecommendations(false)}
                    />
                  )}
                </div>
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

                  {aiAnalysis.showRecommendations && aiAnalysis.aiAnalysis && (
                    <AIRecommendationsPanel
                      aiAnalysis={aiAnalysis.aiAnalysis}
                      onClose={() => aiAnalysis.setShowRecommendations(false)}
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
    </div>
  );
}
